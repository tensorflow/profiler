import {inject, Injectable, InjectionToken} from '@angular/core';
import {type TraceDataCache} from 'org_xprof/frontend/app/components/trace_viewer_v2/main';
import {
  type SourceCodeServiceInterface,
  type SourceCodeVersion,
} from 'org_xprof/frontend/app/services/source_code_service/source_code_service_interface';
import {firstValueFrom} from 'rxjs';

/** Options of the cache of the Static Kernel Viewer. */
export interface KernelViewerCacheOptions {
  /**
   * Whether to keep the data in IndexedDB across page loads, rather than only
   * in memory for the life of the page.
   */
  readonly persist: boolean;
  /** Name of the IndexedDB database. */
  readonly dbName?: string;
  /** Total size of the data that the cache keeps, in bytes. */
  readonly maxBytes?: number;
  /** How long the cache keeps data after it was last used, in ms. */
  readonly maxAgeMs?: number;
}

/** Injection token for the options of `KernelViewerCache`. */
export const KERNEL_VIEWER_CACHE_OPTIONS =
  new InjectionToken<KernelViewerCacheOptions>('KernelViewerCacheOptions');

/**
 * Version of the format of the cached data. Bump it when the backend changes
 * what it sends, so that pages stop using data that older servers sent.
 */
export const KERNEL_VIEWER_CACHE_VERSION = 1;

const DEFAULT_DB_NAME = 'XprofKernelViewerCache';
const DEFAULT_MAX_BYTES = 512 * 1024 * 1024;
const DEFAULT_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

/** Size of the data that the memory of the page keeps, in bytes. */
const MAX_MEMORY_BYTES = 128 * 1024 * 1024;

/** Object stores of the database: the data, and its size and last use. */
const DATA_STORE = 'data';
const META_STORE = 'meta';

/** Size and last use of a cached entry. */
interface EntryMeta {
  readonly bytes: number;
  readonly lastUsed: number;
}

/** A cached entry in the memory of the page. */
interface MemoryEntry extends EntryMeta {
  readonly value: unknown;
}

/** Returns the approximate size of `value` in memory, in bytes. */
export function approximateBytes(value: unknown): number {
  if (value instanceof ArrayBuffer) {
    return value.byteLength;
  }
  if (typeof value === 'string') {
    return value.length * 2;
  }
  try {
    return (JSON.stringify(value)?.length ?? 0) * 2;
  } catch {
    return 0;
  }
}

/** Waits for an IndexedDB request. */
function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

/** Waits for an IndexedDB transaction to finish. */
function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => {
      resolve();
    };
    transaction.onerror = () => {
      reject(transaction.error);
    };
    transaction.onabort = () => {
      reject(transaction.error);
    };
  });
}

/**
 * Caches what the Static Kernel Viewer loads from the backend: the kernel
 * list, the trace of each kernel that the user opens, its source attribution,
 * and its source files. A profile does not change once it is captured, so the
 * viewer shows cached data instead of loading it again, also after a reload.
 *
 * The cache keeps the data in the memory of the page and, unless disabled, in
 * IndexedDB. It drops the data that was used least recently once the data
 * exceeds a size limit, and data that was not used for a week. If IndexedDB
 * is unavailable, e.g. in private windows, the cache keeps the data in memory
 * only.
 */
@Injectable({providedIn: 'root'})
export class KernelViewerCache implements TraceDataCache {
  private readonly options: Required<KernelViewerCacheOptions>;
  /** Entries in the memory of the page, least recently used first. */
  private readonly memory = new Map<string, MemoryEntry>();
  private memoryBytes = 0;
  private dbPromise?: Promise<IDBDatabase | undefined>;

  constructor() {
    const options = inject(KERNEL_VIEWER_CACHE_OPTIONS, {optional: true});
    this.options = {
      persist: options?.persist ?? true,
      dbName: options?.dbName ?? DEFAULT_DB_NAME,
      maxBytes: options?.maxBytes ?? DEFAULT_MAX_BYTES,
      maxAgeMs: options?.maxAgeMs ?? DEFAULT_MAX_AGE_MS,
    };
  }

  /** Returns the value saved under `key`, if any. */
  async get<T = ArrayBuffer>(key: string): Promise<T | undefined> {
    const now = Date.now();
    const entry = this.memory.get(key);
    if (entry && now - entry.lastUsed <= this.options.maxAgeMs) {
      this.remember(key, entry.value, entry.bytes, now);
      void this.touch(key, entry.bytes, now);
      return entry.value as T;
    }
    const db = await this.db();
    if (!db) {
      return undefined;
    }
    try {
      const transaction = db.transaction([DATA_STORE, META_STORE], 'readonly');
      const [value, meta] = await Promise.all([
        requestResult(transaction.objectStore(DATA_STORE).get(key)),
        requestResult(
          transaction.objectStore(META_STORE).get(key) as IDBRequest<
            EntryMeta | undefined
          >,
        ),
      ]);
      if (value === undefined || !meta) {
        return undefined;
      }
      if (now - meta.lastUsed > this.options.maxAgeMs) {
        void this.delete(key);
        return undefined;
      }
      this.remember(key, value, meta.bytes, now);
      void this.touch(key, meta.bytes, now);
      return value as T;
    } catch (error) {
      console.warn('Failed to read the kernel viewer cache:', error);
      return undefined;
    }
  }

  /**
   * Saves `value` under `key`. Returns once IndexedDB has saved it, but the
   * value is available from `get` right away.
   */
  set(
    key: string,
    value: unknown,
    bytes = approximateBytes(value),
  ): Promise<void> {
    if (bytes > this.options.maxBytes) {
      return Promise.resolve();
    }
    const now = Date.now();
    this.remember(key, value, bytes, now);
    return this.persist(key, value, {bytes, lastUsed: now});
  }

  /** Drops everything that the cache keeps. */
  async clear(): Promise<void> {
    this.memory.clear();
    this.memoryBytes = 0;
    const db = await this.db();
    if (!db) {
      return;
    }
    const transaction = db.transaction([DATA_STORE, META_STORE], 'readwrite');
    transaction.objectStore(DATA_STORE).clear();
    transaction.objectStore(META_STORE).clear();
    await transactionDone(transaction);
  }

  /** Keeps `value` in memory, as the most recently used entry. */
  private remember(
    key: string,
    value: unknown,
    bytes: number,
    lastUsed: number,
  ): void {
    const previous = this.memory.get(key);
    if (previous) {
      this.memoryBytes -= previous.bytes;
      this.memory.delete(key);
    }
    this.memory.set(key, {value, bytes, lastUsed});
    this.memoryBytes += bytes;
    for (const [oldKey, entry] of this.memory) {
      if (this.memoryBytes <= MAX_MEMORY_BYTES || oldKey === key) {
        break;
      }
      this.memory.delete(oldKey);
      this.memoryBytes -= entry.bytes;
    }
  }

  private async persist(
    key: string,
    value: unknown,
    meta: EntryMeta,
  ): Promise<void> {
    const db = await this.db();
    if (!db) {
      return;
    }
    try {
      const transaction = db.transaction([DATA_STORE, META_STORE], 'readwrite');
      transaction.objectStore(DATA_STORE).put(value, key);
      transaction.objectStore(META_STORE).put(meta, key);
      await transactionDone(transaction);
      await this.evict(db);
    } catch (error) {
      // E.g. the origin ran out of storage; the value stays in memory.
      console.warn('Failed to save to the kernel viewer cache:', error);
    }
  }

  /** Marks an entry as used now, so that it is evicted last. */
  private async touch(
    key: string,
    bytes: number,
    lastUsed: number,
  ): Promise<void> {
    const db = await this.db();
    if (!db) {
      return;
    }
    try {
      const transaction = db.transaction(META_STORE, 'readwrite');
      transaction.objectStore(META_STORE).put({bytes, lastUsed}, key);
      await transactionDone(transaction);
    } catch {
      // The entry is evicted a bit earlier than it would have been.
    }
  }

  private async delete(key: string): Promise<void> {
    const db = await this.db();
    if (!db) {
      return;
    }
    try {
      const transaction = db.transaction([DATA_STORE, META_STORE], 'readwrite');
      transaction.objectStore(DATA_STORE).delete(key);
      transaction.objectStore(META_STORE).delete(key);
      await transactionDone(transaction);
    } catch {
      // A later eviction drops it.
    }
  }

  /**
   * Drops the entries that were not used for `maxAgeMs`, and then the least
   * recently used ones until the rest fits into `maxBytes`. Reads only the
   * small metadata store.
   */
  private async evict(db: IDBDatabase): Promise<void> {
    const transaction = db.transaction([DATA_STORE, META_STORE], 'readwrite');
    const metaStore = transaction.objectStore(META_STORE);
    const [keys, metas] = await Promise.all([
      requestResult(metaStore.getAllKeys()),
      requestResult(metaStore.getAll() as IDBRequest<EntryMeta[]>),
    ]);
    const now = Date.now();
    const entries = keys
      .map((key, index) => ({key, meta: metas[index]}))
      .sort((a, b) => a.meta.lastUsed - b.meta.lastUsed);
    let total = entries.reduce((sum, entry) => sum + entry.meta.bytes, 0);
    for (const {key, meta} of entries) {
      if (
        now - meta.lastUsed <= this.options.maxAgeMs &&
        total <= this.options.maxBytes
      ) {
        break;
      }
      transaction.objectStore(DATA_STORE).delete(key);
      metaStore.delete(key);
      total -= meta.bytes;
    }
    await transactionDone(transaction);
  }

  /** Opens the database, or resolves to undefined without IndexedDB. */
  private db(): Promise<IDBDatabase | undefined> {
    if (!this.dbPromise) {
      this.dbPromise = this.openDb();
    }
    return this.dbPromise;
  }

  private async openDb(): Promise<IDBDatabase | undefined> {
    if (!this.options.persist || typeof indexedDB === 'undefined') {
      return undefined;
    }
    try {
      const request = indexedDB.open(this.options.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(DATA_STORE)) {
          db.createObjectStore(DATA_STORE);
        }
        if (!db.objectStoreNames.contains(META_STORE)) {
          db.createObjectStore(META_STORE);
        }
      };
      const db = await requestResult(request);
      // Lets other tabs upgrade the database.
      db.onversionchange = () => {
        db.close();
        this.dbPromise = Promise.resolve(undefined);
      };
      // Drops stale data when the page starts.
      void this.evict(db).catch((error: unknown) => {
        console.warn('Failed to evict from the kernel viewer cache:', error);
      });
      return db;
    } catch (error) {
      console.warn('The kernel viewer cache is in memory only:', error);
      return undefined;
    }
  }
}

/** Joins the parts of a cache key, e.g. the session and the kernel. */
export function cacheKey(
  kind: string,
  ...parts: ReadonlyArray<string | number | undefined>
): string {
  return [KERNEL_VIEWER_CACHE_VERSION, kind, ...parts.map((p) => p ?? '')].join(
    '\u0000',
  );
}

/**
 * Returns the plain text of a source file at `version` from `cache`, or loads
 * it with `service.loadText` and saves it into `cache`.
 */
export async function loadCachedSourceText(
  cache: KernelViewerCache,
  service: SourceCodeServiceInterface,
  sessionId: string,
  fileName: string,
  version?: SourceCodeVersion,
): Promise<string> {
  const key = cacheKey(
    'file',
    sessionId,
    fileName,
    version?.changeList,
    version?.workspaceId,
    version?.snapshot,
  );
  const cached = await cache.get<string>(key);
  if (typeof cached === 'string') {
    return cached;
  }
  if (!service.loadText) {
    throw new Error('The source code service cannot load plain text.');
  }
  const text = await firstValueFrom(
    service.loadText(sessionId, fileName, version),
  );
  void cache.set(key, text);
  return text;
}
