import {InjectionToken} from '@angular/core';

/**
 * The trace of a kernel. A failed download has no `data`, and the HTTP status
 * of the failure.
 */
export declare interface KernelTrace {
  readonly status: number;
  readonly data?: Blob;
  /** Whether the trace was read from the cache instead of downloaded. */
  readonly fromCache: boolean;
}

/**
 * Keeps the kernel lists and the opened kernel traces of profiles in the
 * browser, so that revisiting a profile or reopening a kernel skips the
 * backend. Profile data does not change once captured, so cached data stays
 * valid until it expires. Every method copes with an unavailable or failing
 * storage, which only disables the cache.
 */
export declare interface KernelViewerCache {
  /** Returns the cached kernel list response of a profile, if any. */
  readList(profileKey: string): Promise<unknown>;
  /** Caches the kernel list response of a profile. */
  writeList(profileKey: string, response: unknown): Promise<void>;
  /**
   * Returns the trace of a kernel from the cache, or downloads it from `url`.
   * Downloaded traces are only cached by `writeTrace`. Rejects on network
   * errors.
   */
  loadTrace(traceKey: string, url: string): Promise<KernelTrace>;
  /** Caches the trace of a kernel of a profile. */
  writeTrace(profileKey: string, traceKey: string, data: Blob): Promise<void>;
  /**
   * Removes the cached list and traces of a profile, e.g. once its list
   * changed or the backend no longer serves it.
   */
  clearProfile(profileKey: string): Promise<void>;
}

/** Name of the IndexedDB database of the cache. */
export const KERNEL_VIEWER_CACHE_DB_NAME = 'xprof_kernel_viewer_cache';
// Bump to drop all cached data, e.g. when the backend responses change.
const DB_VERSION = 1;
const LIST_STORE = 'lists';
// Trace blobs, apart from their metadata so that bookkeeping never reads or
// rewrites them.
const TRACE_STORE = 'traces';
const TRACE_INFO_STORE = 'trace_info';
const PROFILE_INDEX = 'profileKey';
const AGE_INDEX = 'storedAt';

/** Cached data expires after a week, in case the backend changed since. */
export const CACHE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
/** Most kernel lists to keep, of the most recently cached profiles. */
export const MAX_CACHED_LISTS = 50;
/** Total size of the cached traces, beyond which the least recent go. */
export const MAX_CACHED_TRACE_BYTES = 512 * 1024 * 1024;
/** Size of the largest trace to cache. */
export const MAX_TRACE_BYTES = 128 * 1024 * 1024;
// The backend answers with an empty trace when it cannot read the profile,
// which could be temporary. Traces this small are checked for that.
const EMPTY_TRACE_CHECK_BYTES = 1024;

declare interface ListRecord {
  key: string;
  response: unknown;
  storedAt: number;
}

declare interface TraceRecord {
  key: string;
  data: Blob;
}

declare interface TraceInfoRecord {
  key: string;
  profileKey: string;
  size: number;
  storedAt: number;
  lastUsed: number;
}

/** Options of `IndexedDbKernelViewerCache`, for tests. */
export declare interface IndexedDbKernelViewerCacheOptions {
  databaseName?: string;
  /** Downloads traces, `fetch` by default. */
  fetchData?: (url: string) => Promise<Response>;
  /** Returns the current time in milliseconds, `Date.now` by default. */
  now?: () => number;
  /** The IndexedDB factory, if the browser offers one. */
  indexedDb?: IDBFactory;
  /** Size of the largest trace to cache, `MAX_TRACE_BYTES` by default. */
  maxTraceBytes?: number;
  /** Total size of the cached traces, `MAX_CACHED_TRACE_BYTES` by default. */
  maxCachedTraceBytes?: number;
}

function requestResult<T>(request: IDBRequest<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result);
    };
    request.onerror = () => {
      reject(request.error);
    };
  });
}

function transactionDone(transaction: IDBTransaction): Promise<void> {
  return new Promise<void>((resolve, reject) => {
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isListRecord(value: unknown): value is ListRecord {
  return (
    isRecord(value) &&
    typeof value['key'] === 'string' &&
    typeof value['storedAt'] === 'number'
  );
}

function isTraceRecord(value: unknown): value is TraceRecord {
  return isRecord(value) && value['data'] instanceof Blob;
}

function isTraceInfoRecord(value: unknown): value is TraceInfoRecord {
  return (
    isRecord(value) &&
    typeof value['key'] === 'string' &&
    typeof value['size'] === 'number' &&
    typeof value['storedAt'] === 'number' &&
    typeof value['lastUsed'] === 'number'
  );
}

/** Whether `data` is a trace without events, which is not worth caching. */
async function isEmptyTrace(data: Blob): Promise<boolean> {
  if (data.size > EMPTY_TRACE_CHECK_BYTES) {
    return false;
  }
  try {
    const trace: unknown = JSON.parse(await data.text());
    const events = isRecord(trace) ? trace['traceEvents'] : undefined;
    return !Array.isArray(events) || events.length === 0;
  } catch {
    return true;
  }
}

/** Caches kernel lists and kernel traces in IndexedDB. */
export class IndexedDbKernelViewerCache implements KernelViewerCache {
  private readonly databaseName: string;
  private readonly fetchData: (url: string) => Promise<Response>;
  private readonly now: () => number;
  private readonly indexedDb: IDBFactory | undefined;
  private readonly maxTraceBytes: number;
  private readonly maxCachedTraceBytes: number;
  private database: Promise<IDBDatabase | undefined> | undefined = undefined;

  constructor(options: IndexedDbKernelViewerCacheOptions = {}) {
    this.databaseName = options.databaseName ?? KERNEL_VIEWER_CACHE_DB_NAME;
    this.fetchData = options.fetchData ?? ((url: string) => fetch(url));
    this.now = options.now ?? (() => Date.now());
    this.indexedDb =
      options.indexedDb ??
      (typeof indexedDB === 'undefined' ? undefined : indexedDB);
    this.maxTraceBytes = options.maxTraceBytes ?? MAX_TRACE_BYTES;
    this.maxCachedTraceBytes =
      options.maxCachedTraceBytes ?? MAX_CACHED_TRACE_BYTES;
  }

  async readList(profileKey: string): Promise<unknown> {
    try {
      const database = await this.open();
      if (!database) {
        return undefined;
      }
      const record: unknown = await requestResult(
        database
          .transaction(LIST_STORE, 'readonly')
          .objectStore(LIST_STORE)
          .get(profileKey),
      );
      if (!isListRecord(record) || this.isExpired(record.storedAt)) {
        return undefined;
      }
      return record.response;
    } catch (error) {
      console.warn('Failed to read the cached kernel list:', error);
      return undefined;
    }
  }

  async writeList(profileKey: string, response: unknown): Promise<void> {
    try {
      const database = await this.open();
      if (!database) {
        return;
      }
      const transaction = database.transaction(LIST_STORE, 'readwrite');
      const store = transaction.objectStore(LIST_STORE);
      const record: ListRecord = {
        key: profileKey,
        response,
        storedAt: this.now(),
      };
      store.put(record);
      // Keeps the lists of the most recently cached profiles. The index lists
      // the keys from the least recently cached, without reading the lists.
      const keys = await requestResult(store.index(AGE_INDEX).getAllKeys());
      const evictedCount = Math.max(0, keys.length - MAX_CACHED_LISTS);
      for (const key of keys.slice(0, evictedCount)) {
        store.delete(key);
      }
      await transactionDone(transaction);
    } catch (error) {
      console.warn('Failed to cache the kernel list:', error);
    }
  }

  async loadTrace(traceKey: string, url: string): Promise<KernelTrace> {
    const cached = await this.readTrace(traceKey);
    if (cached) {
      return {status: 200, data: cached, fromCache: true};
    }
    const response = await this.fetchData(url);
    if (!response.ok) {
      return {status: response.status, fromCache: false};
    }
    const data = await response.blob();
    return {status: response.status, data, fromCache: false};
  }

  async writeTrace(
    profileKey: string,
    traceKey: string,
    data: Blob,
  ): Promise<void> {
    if (data.size > this.maxTraceBytes || (await isEmptyTrace(data))) {
      return;
    }
    try {
      const database = await this.open();
      if (!database) {
        return;
      }
      // Makes room first, in its own transaction, so that a write that fails
      // for lack of space still frees it for the next one.
      await this.evictTraces(database, traceKey, data.size);
      const transaction = database.transaction(
        [TRACE_STORE, TRACE_INFO_STORE],
        'readwrite',
      );
      const now = this.now();
      const trace: TraceRecord = {key: traceKey, data};
      const info: TraceInfoRecord = {
        key: traceKey,
        profileKey,
        size: data.size,
        storedAt: now,
        lastUsed: now,
      };
      transaction.objectStore(TRACE_STORE).put(trace);
      transaction.objectStore(TRACE_INFO_STORE).put(info);
      await transactionDone(transaction);
    } catch (error) {
      console.warn('Failed to cache the kernel trace:', error);
    }
  }

  async clearProfile(profileKey: string): Promise<void> {
    try {
      const database = await this.open();
      if (!database) {
        return;
      }
      const transaction = database.transaction(
        [LIST_STORE, TRACE_STORE, TRACE_INFO_STORE],
        'readwrite',
      );
      transaction.objectStore(LIST_STORE).delete(profileKey);
      const traces = transaction.objectStore(TRACE_STORE);
      const infos = transaction.objectStore(TRACE_INFO_STORE);
      const keys = await requestResult(
        infos.index(PROFILE_INDEX).getAllKeys(IDBKeyRange.only(profileKey)),
      );
      for (const key of keys) {
        traces.delete(key);
        infos.delete(key);
      }
      await transactionDone(transaction);
    } catch (error) {
      console.warn('Failed to clear the cached kernel data:', error);
    }
  }

  /** Returns the cached trace of a kernel, and marks it as recently used. */
  private async readTrace(traceKey: string): Promise<Blob | undefined> {
    try {
      const database = await this.open();
      if (!database) {
        return undefined;
      }
      // Reads in a read-only transaction, which does not wait for trace
      // writes to commit.
      const transaction = database.transaction(
        [TRACE_STORE, TRACE_INFO_STORE],
        'readonly',
      );
      const [info, trace] = await Promise.all([
        requestResult<unknown>(
          transaction.objectStore(TRACE_INFO_STORE).get(traceKey),
        ),
        requestResult<unknown>(
          transaction.objectStore(TRACE_STORE).get(traceKey),
        ),
      ]);
      if (
        !isTraceInfoRecord(info) ||
        !isTraceRecord(trace) ||
        this.isExpired(info.storedAt)
      ) {
        return undefined;
      }
      void this.touchTrace(database, {...info, lastUsed: this.now()});
      return trace.data;
    } catch (error) {
      console.warn('Failed to read the cached kernel trace:', error);
      return undefined;
    }
  }

  /** Records when a cached trace was last used, for eviction. */
  private async touchTrace(
    database: IDBDatabase,
    info: TraceInfoRecord,
  ): Promise<void> {
    try {
      const transaction = database.transaction(TRACE_INFO_STORE, 'readwrite');
      transaction.objectStore(TRACE_INFO_STORE).put(info);
      await transactionDone(transaction);
    } catch (error) {
      console.warn('Failed to update the cached kernel trace:', error);
    }
  }

  /**
   * Removes expired traces, and the least recently used ones until a trace of
   * `addedSize` bytes fits in the size budget. Leaves `addedKey`, which is
   * about to be replaced, out of the count.
   */
  private async evictTraces(
    database: IDBDatabase,
    addedKey: string,
    addedSize: number,
  ): Promise<void> {
    const transaction = database.transaction(
      [TRACE_STORE, TRACE_INFO_STORE],
      'readwrite',
    );
    const traces = transaction.objectStore(TRACE_STORE);
    const infos = transaction.objectStore(TRACE_INFO_STORE);
    const records: unknown[] = await requestResult(infos.getAll());
    const live: TraceInfoRecord[] = [];
    for (const record of records) {
      if (!isTraceInfoRecord(record) || record.key === addedKey) {
        continue;
      }
      if (this.isExpired(record.storedAt)) {
        traces.delete(record.key);
        infos.delete(record.key);
      } else {
        live.push(record);
      }
    }
    live.sort((a, b) => b.lastUsed - a.lastUsed);
    let total = addedSize;
    for (const record of live) {
      total += record.size;
      if (total > this.maxCachedTraceBytes) {
        traces.delete(record.key);
        infos.delete(record.key);
      }
    }
    await transactionDone(transaction);
  }

  private isExpired(storedAt: number): boolean {
    const age = this.now() - storedAt;
    return age < 0 || age > CACHE_MAX_AGE_MS;
  }

  /** Opens the database once, or resolves undefined without IndexedDB. */
  private open(): Promise<IDBDatabase | undefined> {
    this.database ??= this.openDatabase();
    return this.database;
  }

  private async openDatabase(): Promise<IDBDatabase | undefined> {
    if (!this.indexedDb) {
      return undefined;
    }
    try {
      const request = this.indexedDb.open(this.databaseName, DB_VERSION);
      request.onupgradeneeded = () => {
        const database = request.result;
        for (const name of Array.from(database.objectStoreNames)) {
          database.deleteObjectStore(name);
        }
        database
          .createObjectStore(LIST_STORE, {keyPath: 'key'})
          .createIndex(AGE_INDEX, 'storedAt');
        database.createObjectStore(TRACE_STORE, {keyPath: 'key'});
        database
          .createObjectStore(TRACE_INFO_STORE, {keyPath: 'key'})
          .createIndex(PROFILE_INDEX, 'profileKey');
      };
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        let isBlocked = false;
        request.onsuccess = () => {
          if (isBlocked) {
            // The cache gave up on this connection while it was blocked.
            request.result.close();
          } else {
            resolve(request.result);
          }
        };
        request.onerror = () => {
          reject(request.error);
        };
        // Another tab holds an older version open. Loads go to the backend
        // rather than waiting for it.
        request.onblocked = () => {
          isBlocked = true;
          reject(new Error('The cache database is open in another tab.'));
        };
      });
      // Lets other tabs upgrade the database.
      database.onversionchange = () => {
        database.close();
        this.database = undefined;
      };
      return database;
    } catch (error) {
      console.warn('The kernel viewer cache is unavailable:', error);
      return undefined;
    }
  }
}

/** The cache of the Static Kernel Viewer, which tests replace. */
export const KERNEL_VIEWER_CACHE_TOKEN = new InjectionToken<KernelViewerCache>(
  'KernelViewerCache',
  {
    providedIn: 'root',
    factory: () => new IndexedDbKernelViewerCache(),
  },
);
