import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatTooltipModule} from '@angular/material/tooltip';
import {
  formatBundleRange,
  formatCount,
  formatCountOf,
  formatFraction,
  formatShare,
  parseSourceLocation,
  type SourceLineStats,
  splitPath,
} from 'org_xprof/frontend/app/components/static_kernel_viewer/kernel_source_model';

/** A frame of the call stack that reaches a line. */
export interface StackFrameView {
  /** The frame as recorded, e.g. `foo/bar.py:51:9`. */
  readonly raw: string;
  /** Short label, e.g. `bar.py:51`. */
  readonly label: string;
  readonly path?: string;
  readonly line?: number;
  /** Whether the frame is the line itself. */
  readonly isCurrent: boolean;
}

/** Explains how the share of the schedule of a line is computed. */
export const SHARE_DESCRIPTION =
  'Share of the bundles of the schedule. Each bundle is split evenly ' +
  'across the instructions it holds.';

/**
 * The stats of a source line of a kernel.
 *
 * In `hover` mode it is the compact card that follows the pointer over the
 * source: the share of the schedule, the instruction count, the functional
 * units, and where in the schedule the line runs. The code and the file are
 * left out, since they are right next to the card.
 *
 * In `details` mode it is the body of the details of the selected line, which
 * adds the bundle range, the Pallas primitives, and the call stack. Its
 * footprint and call stack can be clicked.
 */
@Component({
  standalone: true,
  selector: 'kernel-line-card',
  templateUrl: './kernel_line_card.ng.html',
  styleUrls: ['./kernel_line_card.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, MatTooltipModule],
  host: {
    '[class.hover-mode]': "mode() === 'hover'",
    '[class.details-mode]': "mode() === 'details'",
  },
})
export class KernelLineCard {
  readonly stats = input.required<SourceLineStats>();
  /** Length of the schedule, in bundles. */
  readonly scheduleLength = input(0);
  readonly mode = input<'hover' | 'details'>('hover');
  /** Whether the line is currently selected. */
  readonly selected = input(false);
  /** Whether the location of the line was just copied. */
  readonly copied = input(false);

  /** Emits to select the line, or clear it if it is already selected. */
  readonly selectLine = output<void>();
  /** Emits to zoom the timeline to the bundle range of the line. */
  readonly zoomToLine = output<void>();
  /** Emits to copy `path:line` of the line. */
  readonly copyLocation = output<void>();
  /** Emits the index of a slice of the footprint to zoom the timeline to. */
  readonly zoomToBin = output<number>();
  /** Emits a frame of the call stack to show. */
  readonly frame = output<StackFrameView>();

  protected readonly formatCount = formatCount;
  protected readonly formatFraction = formatFraction;
  protected readonly shareDescription = SHARE_DESCRIPTION;

  protected readonly shareLabel = computed(
    () => formatShare(this.stats().share) || '<1%',
  );
  protected readonly instructionsLabel = computed(() =>
    formatCount(this.stats().instructions),
  );
  protected readonly bundlesLabel = computed(() =>
    formatCount(this.stats().bundles),
  );
  protected readonly rangeLabel = computed(() =>
    formatBundleRange(this.stats().firstBundle, this.stats().lastBundle),
  );

  /** One-line summary of the counts, e.g. `20 instructions · 12 bundles`. */
  protected readonly countsLabel = computed(() => {
    const {instructions, bundles} = this.stats();
    return (
      `${formatCountOf(instructions, 'instruction')} · ` +
      formatCountOf(bundles, 'bundle')
    );
  });

  /** Pallas primitives of the line, e.g. `exp, sub`. */
  protected readonly primitivesLabel = computed(() =>
    this.stats().primitives.join(', '),
  );

  /** Heights of the bars of the footprint, in percent, and their counts. */
  protected readonly footprint = computed(() => {
    const histogram = this.stats().histogram;
    const max = histogram.reduce((a, b) => Math.max(a, b), 0);
    return histogram.map((count, index) => ({
      index,
      count,
      height: count === 0 || max === 0 ? 0 : 18 + (82 * count) / max,
    }));
  });

  protected readonly spillNote = computed(() => {
    const {spills, fills} = this.stats();
    if (spills + fills === 0) {
      return '';
    }
    const parts = [];
    if (spills > 0) {
      parts.push(formatCountOf(spills, 'spill store'));
    }
    if (fills > 0) {
      parts.push(formatCountOf(fills, 'fill load'));
    }
    return `${parts.join(' · ')} of vector registers`;
  });

  protected readonly stack = computed<readonly StackFrameView[]>(() => {
    const frames = this.stats().stack;
    return frames.map((raw, index) => {
      const location = parseSourceLocation(raw);
      return {
        raw,
        label: location
          ? `${splitPath(location.path).name}:${location.line}`
          : raw,
        ...(location ? {path: location.path, line: location.line} : {}),
        isCurrent: index === frames.length - 1,
      };
    });
  });

  protected binLabel(count: number, index: number): string {
    return `${formatCountOf(count, 'instruction')} in slice ${index + 1} of ${
      this.stats().histogram.length
    }`;
  }

  protected onBinClick(index: number, count: number): void {
    if (count > 0) {
      this.zoomToBin.emit(index);
    }
  }

  protected onFrameClick(frame: StackFrameView): void {
    if (!frame.isCurrent && frame.line) {
      this.frame.emit(frame);
    }
  }
}
