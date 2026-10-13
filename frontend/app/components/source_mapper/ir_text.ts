import {Address, Content} from 'org_xprof/frontend/app/services/source_code_service/source_code_service_interface';

/** Definitions for the current compiler pass used to generate IR. */
export enum CompilerPass {
  HLO_OPTIMIZED = 'HLO(optimized)',
  HLO_UNOPTIMIZED = 'HLO(original)',
  MOSAIC_ORIGINAL = 'Mosaic(original)',
}

/**
 * Encapsulates an IR text document (HLO or Mosaic MLIR) for a specific compiler
 * pass, providing focus line and display frame helpers.
 */
export class IrText {
  private lastFrameFocusIndex?: number;
  private lastContextWindow?: number;
  private cachedFrame?: Content;

  constructor(
    readonly text: string,
    readonly compilerPass: CompilerPass = CompilerPass.HLO_OPTIMIZED,
  ) {}

  get length(): number {
    return this.text.length;
  }

  get lines(): string[] {
    return this.text.split('\n');
  }

  /**
   * Returns the 0-based focus line index for the given op name, or 0 if not
   * found.
   */
  getFocusLineIndex(opName: string): number {
    let index = 0;
    switch (this.compilerPass) {
      case CompilerPass.HLO_OPTIMIZED:
        index = this.lines.findIndex((line) => line.includes(`${opName} =`));
        break;
      case CompilerPass.MOSAIC_ORIGINAL:
        // Assumptions: the MLIR text contains the keyword 'kernel' in the
        // kernel definition line.
        index = this.lines.findIndex((line) => line.includes('kernel'));
        break;
      case CompilerPass.HLO_UNOPTIMIZED:
      default:
        index = 0;
        break;
    }
    return index !== -1 ? index : 0;
  }

  /**
   * Returns the windowed lines around the focus line for display.
   */
  getLinesForDisplay(opName: string, contextWindow: number): string[] {
    // Return the entire HLO text for HLO unoptimized pass, as the mapping from
    // the selected HLO op to its original text line is not implemented yet.
    if (this.compilerPass === CompilerPass.HLO_UNOPTIMIZED) {
      return this.lines;
    }
    const focusIndex = this.getFocusLineIndex(opName);
    const minLineIndex = Math.max(0, focusIndex - contextWindow / 2);
    const maxLineIndex = Math.min(
      this.lines.length - 1,
      focusIndex + contextWindow / 2,
    );
    return this.lines.slice(minLineIndex, maxLineIndex + 1);
  }

  /**
   * Returns the 1-based focus line number within the displayed window.
   */
  getFocusLineNumberForDisplay(opName: string, contextWindow: number): number {
    const focusIndex = this.getFocusLineIndex(opName);
    const minLineIndex = Math.max(0, focusIndex - contextWindow / 2);
    return focusIndex - minLineIndex + 1;
  }

  /**
   * Returns the cached `Content` frame for `<source-code-editor>`, preserving
   * object identity across Angular change detection cycles.
   */
  getDisplayFrame(opName: string, contextWindow: number): Content | undefined {
    const focusIndex = this.getFocusLineIndex(opName);
    if (
      this.lastFrameFocusIndex !== focusIndex ||
      this.lastContextWindow !== contextWindow ||
      !this.cachedFrame
    ) {
      this.lastFrameFocusIndex = focusIndex;
      this.lastContextWindow = contextWindow;
      const lines = this.getLinesForDisplay(opName, contextWindow);
      const focusLineNumber = this.getFocusLineNumberForDisplay(
        opName,
        contextWindow,
      );
      const address = new Address(
        'ir_text',
        focusLineNumber,
        focusLineNumber - 1,
        Math.max(0, lines.length - focusLineNumber),
      );
      this.cachedFrame = new Content(address, lines, []);
    }
    return this.cachedFrame;
  }
}
