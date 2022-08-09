import * as proto from 'org_xprof/frontend/app/common/interfaces/xla_data.jsonpb_decls';
import {toNumber} from 'org_xprof/frontend/app/common/utils/utils';

/** The Dimension interface. */
interface Dimension {
  size?: number;
  alignment?: number;
}

/**
 * A layout describes how the array is placed in (1D) memory space. This
 * includes the minor-to-major ordering of dimensions within a shape, as well
 * as size, alignment and semantics.
 * @final
 */
export class Layout {
  dimensions: Dimension[];
  minorToMajor: number[];
  dimLevelTypes: string[];

  constructor(
      layout?: proto.LayoutProto, dimensions: number[] = [],
      elementType: string = '') {
    layout = layout || {};
    this.minorToMajor = [];
    this.dimensions = [];
    this.dimLevelTypes = [];
    if (layout.minorToMajor) {
      this.minorToMajor = layout.minorToMajor.map(item => Number(item));
      this.dimensions =
          this.analyzeLayout(dimensions, this.minorToMajor, elementType);
    }
    if (layout.dimLevelTypes) {
      this.dimLevelTypes = layout.dimLevelTypes;
    }
  }

  private analyzeLayout(
      dimensions: number[], minorToMajor: number[],
      elementType: string): Dimension[] {
    const result = [];
    for (const index of minorToMajor) {
      const size = dimensions[index];
      let alignment = 0;
      if (result.length === 0) {
        alignment = 128;
      } else if (result.length === 1) {
        if (size <= 2) {
          if (elementType === 'BF16') {
            alignment = 4;
          } else {
            alignment = 2;
          }
        } else if (size <= 4) {
          alignment = 4;
        } else {
          alignment = 8;
        }
      }
      result.push({'size': size, 'alignment': alignment});
    }
    return result;
  }

  /**
   * Returns a human-readable string that represents the given layout.
   * @return {string}
   */
  humanLayoutString(): string {
    if (this.minorToMajor.length > 0) {
      return '{' + this.minorToMajor.join() + '}';
    }
    return '';
  }

  /**
   * Returns true iff the layout represents a dense array.
   * @return {boolean}
   */
  isDense(): boolean {
    for (const dimLevelType of this.dimLevelTypes) {
      if (dimLevelType !== 'DIM_DENSE') {
        return false;
      }
    }
    return true;
  }
}
