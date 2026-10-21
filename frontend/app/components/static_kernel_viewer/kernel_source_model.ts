/**
 * @fileoverview Pure helpers behind the source panel of the Static Kernel
 * Viewer: parsing the per-line source attribution of a kernel's static
 * schedule and formatting it for display.
 */

import {
  FUNCTIONAL_UNITS_BY_LANE,
  type FunctionalUnit,
} from 'org_xprof/frontend/app/components/static_kernel_viewer/kernel_event_tooltip';

/** Number of slices of a line's schedule footprint, unless reported. */
export const DEFAULT_HISTOGRAM_BINS = 64;

/** Number of heat levels that shade the lines of the source. */
export const HEAT_LEVELS = 5;

/** Unit of instructions that the backend reports under an unknown lane. */
const OTHER_UNIT: FunctionalUnit = {label: 'Other', color: '#5f6368'};

/** Instructions of one functional unit among the instructions of a line. */
export interface UnitShare {
  readonly unit: FunctionalUnit;
  readonly instructions: number;
  /** Fraction of the line's instructions, between 0 and 1. */
  readonly fraction: number;
}

/** How one source line contributes to the static schedule of a kernel. */
export interface SourceLineStats {
  /** 1-based line number. */
  readonly line: number;
  /** Scheduled instructions lowered from the line. */
  readonly instructions: number;
  /** Bundles that hold at least one of the line's instructions. */
  readonly bundles: number;
  /**
   * Fraction of the schedule attributed to the line, between 0 and 1. Each
   * bundle is split evenly across the instructions it holds, so the shares of
   * all lines add up to at most 1.
   */
  readonly share: number;
  readonly firstBundle: number;
  readonly lastBundle: number;
  /** Functional units of the line's instructions, busiest first. */
  readonly units: readonly UnitShare[];
  /** Pallas primitives lowered from the line, most instructions first. */
  readonly primitives: readonly string[];
  /** Call stack that reaches the line, outermost frame first. */
  readonly stack: readonly string[];
  /** Timeline search query that matches exactly the line's instructions. */
  readonly query: string;
  /** Instructions of the line in each equal slice of the schedule. */
  readonly histogram: readonly number[];
  /** Vector register spill stores among the line's instructions. */
  readonly spills: number;
  /** Vector register fill loads among the line's instructions. */
  readonly fills: number;
}

/** The lines of one source file that a kernel was lowered from. */
export interface SourceFileStats {
  /** Path as recorded in the source map. */
  readonly path: string;
  /** `path`, relative to the root of the repository, to fetch the file. */
  readonly depotPath: string;
  /** File name, e.g. `flash_attention.py`. */
  readonly name: string;
  /** Directory of the file, without a trailing slash, or ''. */
  readonly directory: string;
  readonly instructions: number;
  readonly share: number;
  /** Attributed lines, in line order. */
  readonly lines: readonly SourceLineStats[];
  /** Largest share of any line of the file. */
  readonly maxShare: number;
}

/** Instructions that the source map does not attribute to any line. */
export interface UnattributedStats {
  readonly instructions: number;
  readonly share: number;
  readonly units: readonly UnitShare[];
  readonly spills: number;
  readonly fills: number;
}

/** Per-line source attribution of the static schedule of a kernel. */
export interface KernelSourceSummary {
  /** Length of the schedule. */
  readonly bundles: number;
  /** Scheduled instructions. */
  readonly instructions: number;
  /** Instructions with a source line. */
  readonly attributedInstructions: number;
  /** Number of slices of the schedule in each line's `histogram`. */
  readonly histogramBins: number;
  /** Files with attributed lines, most instructions first. */
  readonly files: readonly SourceFileStats[];
  readonly unattributed?: UnattributedStats;
}

/** A source line that a timeline event or call stack frame points at. */
export interface SourceLocation {
  readonly path: string;
  readonly line: number;
  readonly column?: number;
}

/** Which version of the code a profile was built from, if it recorded it. */
export interface RunEnvironment {
  /** Changelist that the binary was built at. */
  readonly changeList?: number;
  /** CitC workspace that the binary was built in, e.g. `user/workspace`. */
  readonly workspaceId?: string;
  /** Snapshot of `workspaceId` that the binary was built at. */
  readonly snapshot?: number;
}

/** The version of the source code that a profile was built from. */
export interface SourceVersion {
  readonly kind: 'workspace' | 'changelist';
  /** Short label, e.g. `cl/123456` or `workspace @ 12`. */
  readonly label: string;
  /** Longer description for a tooltip. */
  readonly description: string;
}

/** How a line looks in the gutter of the source. */
export interface LineGutter {
  /** Share of the schedule, e.g. `8.6%`. */
  readonly shareLabel: string;
  /** Length of the share bar, relative to the busiest line, in percent. */
  readonly barPercent: number;
  /** Heat level of the line, from 1 (coolest) to `HEAT_LEVELS`. */
  readonly heat: number;
  /** Color of the busiest functional unit of the line. */
  readonly color: string;
  /** Whether the line spills or fills vector registers. */
  readonly hasSpills: boolean;
}

const COUNT_FORMAT = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});
const PERCENT_FORMAT = new Intl.NumberFormat(undefined, {
  style: 'percent',
  maximumFractionDigits: 0,
});
const PRECISE_PERCENT_FORMAT = new Intl.NumberFormat(undefined, {
  style: 'percent',
  maximumFractionDigits: 1,
});

/** Placeholder workspace IDs of builds that are not in a CitC workspace. */
const PLACEHOLDER_WORKSPACES = new Set([
  'unknown',
  'redacted',
  '<unknown>',
  'none',
  'null',
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function readNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value)
    ? value
    : undefined;
}

function readCount(value: unknown): number {
  const number = readNumber(value);
  return number !== undefined && number > 0 ? Math.round(number) : 0;
}

function readFraction(value: unknown): number {
  const number = readNumber(value);
  return number !== undefined ? Math.min(Math.max(number, 0), 1) : 0;
}

function readString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() !== ''
    ? value.trim()
    : undefined;
}

function readStrings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

/** Returns the color and label of the functional unit of a timeline lane. */
export function functionalUnit(lane: string): FunctionalUnit {
  return FUNCTIONAL_UNITS_BY_LANE.get(lane) ?? {...OTHER_UNIT, label: lane};
}

function readUnits(value: unknown): UnitShare[] {
  if (!isRecord(value)) {
    return [];
  }
  const counts: Array<[string, number]> = [];
  let total = 0;
  for (const [lane, count] of Object.entries(value)) {
    const instructions = readCount(count);
    if (instructions > 0) {
      counts.push([lane, instructions]);
      total += instructions;
    }
  }
  counts.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return counts.map(([lane, instructions]) => ({
    unit: functionalUnit(lane),
    instructions,
    fraction: instructions / total,
  }));
}

function readHistogram(value: unknown, bins: number): number[] {
  const histogram = new Array<number>(bins).fill(0);
  if (Array.isArray(value)) {
    for (let bin = 0; bin < Math.min(bins, value.length); bin++) {
      histogram[bin] = readCount(value[bin]);
    }
  }
  return histogram;
}

function readLine(
  value: unknown,
  path: string,
  bins: number,
): SourceLineStats | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const line = readCount(value['line']);
  if (line <= 0) {
    return undefined;
  }
  const firstBundle = readCount(value['first_bundle']);
  return {
    line,
    instructions: readCount(value['instructions']),
    bundles: readCount(value['bundles']),
    share: readFraction(value['share']),
    firstBundle,
    lastBundle: Math.max(firstBundle, readCount(value['last_bundle'])),
    units: readUnits(value['units']),
    primitives: readStrings(value['primitives']),
    stack: readStrings(value['stack']),
    query: readString(value['query']) ?? `${path}:${line}`,
    histogram: readHistogram(value['histogram'], bins),
    spills: readCount(value['spills']),
    fills: readCount(value['fills']),
  };
}

function readFile(value: unknown, bins: number): SourceFileStats | undefined {
  if (!isRecord(value)) {
    return undefined;
  }
  const path = readString(value['path']);
  if (!path) {
    return undefined;
  }
  const lines = (Array.isArray(value['lines']) ? value['lines'] : [])
    .map((line) => readLine(line, path, bins))
    .filter((line): line is SourceLineStats => line !== undefined)
    .sort((a, b) => a.line - b.line);
  const {name, directory} = splitPath(path);
  return {
    path,
    depotPath: toDepotPath(path),
    name,
    directory,
    instructions: readCount(value['instructions']),
    share: readFraction(value['share']),
    lines,
    maxShare: lines.reduce((max, line) => Math.max(max, line.share), 0),
  };
}

/**
 * Parses the response of a `request_type=source` request of the Static Kernel
 * Viewer. Returns undefined if the response has no `files`, e.g. because the
 * backend does not support source attribution yet.
 */
export function parseKernelSourceSummary(
  response: unknown,
): KernelSourceSummary | undefined {
  if (!isRecord(response) || !Array.isArray(response['files'])) {
    return undefined;
  }
  const bins = readCount(response['histogram_bins']) || DEFAULT_HISTOGRAM_BINS;
  const files = response['files']
    .map((file) => readFile(file, bins))
    .filter((file): file is SourceFileStats => file !== undefined)
    .sort(
      (a, b) => b.instructions - a.instructions || (a.path < b.path ? -1 : 1),
    );
  const unattributed = isRecord(response['unattributed'])
    ? response['unattributed']
    : undefined;
  const unattributedInstructions = readCount(unattributed?.['instructions']);
  return {
    bundles: readCount(response['bundles']),
    instructions: readCount(response['instructions']),
    attributedInstructions: readCount(response['attributed_instructions']),
    histogramBins: bins,
    files,
    ...(unattributed && unattributedInstructions > 0
      ? {
          unattributed: {
            instructions: unattributedInstructions,
            share: readFraction(unattributed['share']),
            units: readUnits(unattributed['units']),
            spills: readCount(unattributed['spills']),
            fills: readCount(unattributed['fills']),
          },
        }
      : {}),
  };
}

/**
 * Parses the version of the code from the `run_environment` of a
 * `request_type=list` response of the Static Kernel Viewer.
 */
export function parseRunEnvironment(
  listResponse: unknown,
): RunEnvironment | undefined {
  const raw = isRecord(listResponse)
    ? listResponse['run_environment']
    : undefined;
  if (!isRecord(raw)) {
    return undefined;
  }
  const changeList = readCount(raw['change_list']);
  const workspace = readString(raw['workspace_id']);
  const workspaceId =
    workspace && !PLACEHOLDER_WORKSPACES.has(workspace.toLowerCase())
      ? workspace
      : undefined;
  const snapshot = readNumber(raw['snapshot']);
  const environment: RunEnvironment = {
    ...(changeList > 0 ? {changeList} : {}),
    ...(workspaceId ? {workspaceId} : {}),
    ...(workspaceId && snapshot !== undefined && snapshot >= 0
      ? {snapshot: Math.round(snapshot)}
      : {}),
  };
  return Object.keys(environment).length > 0 ? environment : undefined;
}

/** Describes the version of the code that a profile was built from. */
export function describeSourceVersion(
  environment: RunEnvironment | undefined,
): SourceVersion | undefined {
  if (environment?.workspaceId) {
    const workspace = environment.workspaceId.split('/').pop() ?? '';
    const snapshot =
      environment.snapshot !== undefined ? ` @ ${environment.snapshot}` : '';
    return {
      kind: 'workspace',
      label: `${workspace}${snapshot}`,
      description:
        `Built in CitC workspace ${environment.workspaceId}` +
        (environment.snapshot !== undefined
          ? ` at snapshot ${environment.snapshot}`
          : '') +
        (environment.changeList
          ? `, synced to cl/${environment.changeList}`
          : ''),
    };
  }
  if (environment?.changeList) {
    return {
      kind: 'changelist',
      label: `cl/${environment.changeList}`,
      description: `Built at cl/${environment.changeList}`,
    };
  }
  return undefined;
}

/**
 * Returns `path` relative to the root of the repository, which is how the
 * source code service looks files up, e.g.
 * `/build/work/x/google3/runfiles/google3/foo/bar.py` -> `foo/bar.py`. Paths
 * outside of a `google3` directory are returned unchanged.
 */
export function toDepotPath(path: string): string {
  const normalized = path.trim().replace(/\\/g, '/');
  const marker = '/google3/';
  const index = normalized.lastIndexOf(marker);
  if (index >= 0) {
    return normalized.slice(index + marker.length);
  }
  if (normalized.startsWith('google3/')) {
    return normalized.slice('google3/'.length);
  }
  return normalized;
}

/** Splits a path into its file name and its directory. */
export function splitPath(path: string): {name: string; directory: string} {
  const normalized = toDepotPath(path);
  const slash = normalized.lastIndexOf('/');
  return slash < 0
    ? {name: normalized, directory: ''}
    : {
        name: normalized.slice(slash + 1),
        directory: normalized.slice(0, slash),
      };
}

/** Whether two source paths name the same file. */
export function isSamePath(a: string, b: string): boolean {
  return a === b || toDepotPath(a) === toDepotPath(b);
}

/**
 * Parses a source location formatted like the `source` argument of timeline
 * events, e.g. `foo/bar.py:51`, `foo/bar.py:51:9` or `foo/bar.py:51:9-30`.
 */
export function parseSourceLocation(raw: string): SourceLocation | undefined {
  const match = raw.trim().match(/^(.+?):(\d+)(?::(\d+)(?:-\d+(?::\d+)?)?)?$/);
  if (!match) {
    return undefined;
  }
  const line = Number(match[2]);
  if (!(line > 0)) {
    return undefined;
  }
  const column = match[3] !== undefined ? Number(match[3]) : undefined;
  return {
    path: match[1],
    line,
    ...(column !== undefined && column > 0 ? {column} : {}),
  };
}

/** Finds the file of `summary` with the path of `location`. */
export function findSourceFile(
  summary: KernelSourceSummary | undefined,
  path: string,
): SourceFileStats | undefined {
  return summary?.files.find((file) => isSamePath(file.path, path));
}

/** Finds the attribution of a line in `file`, by binary search. */
export function findSourceLine(
  file: SourceFileStats | undefined,
  line: number,
): SourceLineStats | undefined {
  const lines = file?.lines ?? [];
  let low = 0;
  let high = lines.length - 1;
  while (low <= high) {
    const middle = (low + high) >> 1;
    const candidate = lines[middle];
    if (candidate.line === line) {
      return candidate;
    }
    if (candidate.line < line) {
      low = middle + 1;
    } else {
      high = middle - 1;
    }
  }
  return undefined;
}

/**
 * Returns the lines of `summary` with the largest shares of the schedule,
 * largest first.
 */
export function hotspots(
  summary: KernelSourceSummary | undefined,
  limit: number,
): Array<{file: SourceFileStats; line: SourceLineStats}> {
  const all: Array<{file: SourceFileStats; line: SourceLineStats}> = [];
  for (const file of summary?.files ?? []) {
    for (const line of file.lines) {
      all.push({file, line});
    }
  }
  all.sort(
    (a, b) =>
      b.line.share - a.line.share || b.line.instructions - a.line.instructions,
  );
  return all.slice(0, limit);
}

/** Returns how a line with `stats` looks in the gutter of `file`. */
export function lineGutter(
  stats: SourceLineStats,
  file: SourceFileStats,
): LineGutter {
  const relative = file.maxShare > 0 ? stats.share / file.maxShare : 0;
  return {
    shareLabel: formatShare(stats.share) || '<1%',
    // Keeps a sliver of a bar for lines with a tiny share.
    barPercent: Math.max(6, Math.round(relative * 100)),
    heat: Math.min(HEAT_LEVELS, Math.max(1, Math.ceil(relative * HEAT_LEVELS))),
    color: stats.units[0]?.unit.color ?? OTHER_UNIT.color,
    hasSpills: stats.spills + stats.fills > 0,
  };
}

/** Returns the gutter of each attributed line of `file`, by line number. */
export function fileGutters(
  file: SourceFileStats | undefined,
): ReadonlyMap<number, LineGutter> {
  if (!file) {
    return new Map();
  }
  return new Map(
    file.lines.map((stats) => [stats.line, lineGutter(stats, file)]),
  );
}

/**
 * Removes the markup of a syntax highlighted line, e.g.
 * `<span class="hljs-keyword">def</span> f` -> `def f`.
 */
export function stripMarkup(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#10;/g, '\n')
    .replace(/&amp;/g, '&');
}

/**
 * Splits syntax highlighted HTML into lines, closing the tags that are open
 * at the end of a line and reopening them on the next line, so that each line
 * is valid HTML on its own.
 */
export function splitHighlightedLines(html: string): string[] {
  const lines: string[] = [];
  // Opening tags that are open at the current position, and their names.
  const open: string[] = [];
  const names: string[] = [];
  let current = '';
  const pattern = /(<\/?([a-zA-Z][\w-]*)[^>]*>)|([^<]+)|(<)/g;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(html)) !== null) {
    const [, tag, name, text, lessThan] = match;
    if (tag) {
      current += tag;
      if (tag.startsWith('</')) {
        open.pop();
        names.pop();
      } else if (!tag.endsWith('/>')) {
        open.push(tag);
        names.push(name);
      }
      continue;
    }
    const parts = (text ?? lessThan ?? '').split('\n');
    current += parts[0];
    for (const part of parts.slice(1)) {
      const closing = [...names]
        .reverse()
        .map((tagName) => `</${tagName}>`)
        .join('');
      lines.push(current + closing);
      current = open.join('') + part;
    }
  }
  lines.push(current);
  if (html.endsWith('\n')) {
    lines.pop();
  }
  return lines;
}

/** Escapes text for use as HTML. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Formats a fraction of the schedule, e.g. `17%`, `8.6%` or `<1%`. */
export function formatShare(share: number): string {
  if (share <= 0) {
    return '';
  }
  if (share < 0.005) {
    return `<${PERCENT_FORMAT.format(0.01)}`;
  }
  return share < 0.1
    ? PRECISE_PERCENT_FORMAT.format(share)
    : PERCENT_FORMAT.format(share);
}

/** Formats a fraction as a whole percentage, e.g. `76%`. */
export function formatFraction(fraction: number): string {
  return PERCENT_FORMAT.format(fraction);
}

/** Formats a count, e.g. `1,548`. */
export function formatCount(count: number): string {
  return COUNT_FORMAT.format(count);
}

/** Formats a count with a noun, e.g. `1 bundle` or `1,548 bundles`. */
export function formatCountOf(count: number, noun: string): string {
  return `${formatCount(count)} ${noun}${count === 1 ? '' : 's'}`;
}

/** Formats an inclusive range of bundles, e.g. `222–1,367`. */
export function formatBundleRange(first: number, last: number): string {
  return first === last
    ? formatCount(first)
    : `${formatCount(first)}\u2013${formatCount(last)}`;
}
