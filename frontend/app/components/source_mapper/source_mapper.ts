import {AsyncPipe, NgFor, NgIf} from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatOption} from '@angular/material/core';
import {
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
} from '@angular/material/expansion';
import {MatFormField, MatLabel} from '@angular/material/form-field';
import {MatIcon} from '@angular/material/icon';
import {MatProgressBar} from '@angular/material/progress-bar';
import {MatSelect} from '@angular/material/select';
import {MatTooltip} from '@angular/material/tooltip';
import {Store} from '@ngrx/store';
import {Observable, ReplaySubject} from 'rxjs';
import {map, takeUntil} from 'rxjs/operators';
import {
  GRAPH_TYPE_DEFAULT,
  GRAPH_TYPE_ORIGINAL_HLO,
} from 'org_xprof/frontend/app/common/constants/constants';
import {FileExtensionType} from 'org_xprof/frontend/app/common/constants/enums';
import {ProfilerConfig} from 'org_xprof/frontend/app/common/interfaces/capture_profile';
import {
  DATA_SERVICE_INTERFACE_TOKEN,
  DataServiceV2Interface,
} from 'org_xprof/frontend/app/services/data_service_v2/data_service_v2_interface';
import {
  Address,
  Content,
} from 'org_xprof/frontend/app/services/source_code_service/source_code_service_interface';
import {
  getProfilerConfig,
  getTagsState,
} from 'org_xprof/frontend/app/store/selectors';

import {Message} from '../stack_trace_snippet/message';
import {StackTraceSnippet} from '../stack_trace_snippet/stack_trace_snippet';

import {CompilerPass, IrText} from './ir_text';

export {CompilerPass, IrText};

const CUSTOM_CALL_CATEGORY = 'custom-call';

/**
 * A source mapper component.
 *
 * We use this component to map TPU operations to python source code.
 * TPU operations can be HLO or LLO.
 */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  selector: 'source-mapper',
  templateUrl: './source_mapper.ng.html',
  styleUrls: ['./source_mapper.scss'],
  imports: [
    AsyncPipe,
    FormsModule,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatFormField,
    MatIcon,
    MatLabel,
    MatOption,
    MatProgressBar,
    MatSelect,
    MatTooltip,
    Message,
    NgFor,
    NgIf,
    StackTraceSnippet,
  ],
})
export class SourceMapper implements OnDestroy, OnChanges {
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyed = new ReplaySubject<void>(1);
  private readonly dataService: DataServiceV2Interface = inject(
      DATA_SERVICE_INTERFACE_TOKEN,
  );

  /**
   * The source file and line number of the HLO op.
   * This is used to find the source code snippet.
   * Processed from xla source info.
   */
  readonly sourceFileAndLineNumber = input<string>();
  /**
   * The stack trace of the HLO op.
   * Processed from xla stack frame info.
   */
  readonly stackTrace = input<string>();
  // The number of lines to show around the stack frame.
  readonly sourceContextWindow = input(40);
  readonly sessionId = input('');
  // The program id of the HLO op.
  readonly programId = input('');
  // The name of the HLO op.
  readonly opName = input('');
  // The category of the HLO op.
  readonly opCategory = input('');

  sourceCodeSnippetAddresses: readonly Address[] = [];
  hloTextByProgramId = new Map<string, IrText>();
  hloUnoptimizedTextByProgramId = new Map<string, IrText>();
  mosaicTextByKernelName = new Map<string, IrText>();
  mosaicSourceFileAndLineNumberByKernelName = new Map<string, string>();
  selectedCompilerPass = CompilerPass.HLO_OPTIMIZED;
  sourceFileNames: string[] = [];
  selectedSourceFileName = '';
  // The prefix of the source file path if specified by users.
  srcPathPrefix = '';

  protected readonly tags$: Observable<string[]>;
  protected readonly srcPathPrefix$: Observable<string>;
  protected readonly compilerPasses$: Observable<CompilerPass[]>;

  constructor(private readonly store: Store<{}>) {
    this.tags$ = this.store.select(getTagsState);
    this.srcPathPrefix$ =
        this.store.select(getProfilerConfig)
            .pipe(map((config: ProfilerConfig) => config?.srcPathPrefix || ''));
    this.compilerPasses$ = this.tags$.pipe(
        map((tags: string[]) => this.getCompilerPasses(tags || [])),
    );
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['sessionId'] &&
        changes['sessionId'].currentValue !==
            changes['sessionId'].previousValue) {
      this.hloTextByProgramId.clear();
      this.hloUnoptimizedTextByProgramId.clear();
      this.mosaicTextByKernelName.clear();
      this.mosaicSourceFileAndLineNumberByKernelName.clear();
    }
    if (changes['programId']) {
      this.update();
    }
    if (changes['opName'] &&
        changes['opName'].currentValue !== changes['opName'].previousValue) {
      if (this.selectedCompilerPass === CompilerPass.MOSAIC_ORIGINAL &&
          !this.isCustomCall) {
        this.selectedCompilerPass = CompilerPass.HLO_OPTIMIZED;
      }
      this.update();
    }
    if (changes['sourceFileAndLineNumber'] || changes['stackTrace']) {
      this.parseSourceFileNames();
    }
  }

  update() {
    this.maybeUpdateHloTextCache();

    this.maybeUpdateMosaicTextCache();
    this.maybeUpdateMosaicSourceFileAndLineNumberCache();
  }

  get adaptedStackTrace(): string {
    switch (this.selectedCompilerPass) {
      case CompilerPass.HLO_OPTIMIZED:
      case CompilerPass.HLO_UNOPTIMIZED:
        return this.stackTrace() || '';
      case CompilerPass.MOSAIC_ORIGINAL:
        return this.getPallasKernelStackTrace();
      default:
        return '';
    }
  }

  get adaptedSourceFileAndLineNumber(): string {
    switch (this.selectedCompilerPass) {
      case CompilerPass.HLO_OPTIMIZED:
      case CompilerPass.HLO_UNOPTIMIZED:
        return this.sourceFileAndLineNumber() || '';
      case CompilerPass.MOSAIC_ORIGINAL:
        return this.pallasKernelSourceFileAndLineNumber;
      default:
        return '';
    }
  }

  getCompilerPasses(tags: string[]): CompilerPass[] {
    const basePasses = [CompilerPass.HLO_OPTIMIZED];
    if (tags.includes('has_original_hlo_proto')) {
      basePasses.push(CompilerPass.HLO_UNOPTIMIZED);
    }
    // llo_debug tag is identifier for llo debug proto captured.
    // the proto contains llo bundles for kernels, and source info for mosaic
    // passes.
    if (tags.includes('llo_debug') && this.isCustomCall) {
      // CustomCall op category is identifier for a pallas kernel.
      basePasses.push(CompilerPass.MOSAIC_ORIGINAL);
    }
    return basePasses;
  }

  get irFileName(): string {
    switch (this.selectedCompilerPass) {
      case CompilerPass.HLO_OPTIMIZED:
      case CompilerPass.HLO_UNOPTIMIZED:
        return 'source.hlo';
      case CompilerPass.MOSAIC_ORIGINAL:
        return 'source.mlir';
      default:
        return 'source.txt';
    }
  }

  get irTextLink(): string {
    return '';
  }

  get irTextLinkTooltip(): string {
    return 'The IR text is truncated, click to view entire text in a new tab.';
  }

  get currentIrText(): IrText | undefined {
    switch (this.selectedCompilerPass) {
      case CompilerPass.HLO_OPTIMIZED:
        return this.hloTextByProgramId.get(this.programId());
      case CompilerPass.HLO_UNOPTIMIZED:
        return this.hloUnoptimizedTextByProgramId.get(this.programId());
      case CompilerPass.MOSAIC_ORIGINAL:
        return this.mosaicTextByKernelName.get(this.opName());
      default:
        return undefined;
    }
  }

  get irText(): string {
    return this.currentIrText?.text || '';
  }

  get irTextLines(): string[] {
    return this.currentIrText?.lines || [''];
  }

  get isCustomCall() {
    return this.opCategory().includes(CUSTOM_CALL_CATEGORY);
  }

  get pallasKernelSourceFileAndLineNumber() {
    return (
      this.mosaicSourceFileAndLineNumberByKernelName.get(this.opName()) || ''
    );
  }

  // Not implemented yet.
  getPallasKernelStackTrace() {
    return '';
  }

  isFocusLine(line: string): boolean {
    switch (this.selectedCompilerPass) {
      case CompilerPass.HLO_OPTIMIZED:
        return line.includes(`${this.opName()} =`);
      default:
        return false;
    }
  }

  get irTextFocusLineIndex(): number {
    return this.currentIrText?.getFocusLineIndex(this.opName()) ?? 0;
  }

  get irTextLinesForDisplay(): string[] {
    return (
      this.currentIrText?.getLinesForDisplay(
        this.opName(),
        this.sourceContextWindow(),
      ) || ['']
    );
  }

  get irTextFrame(): Content | undefined {
    return this.currentIrText?.getDisplayFrame(
      this.opName(),
      this.sourceContextWindow(),
    );
  }

  get focusLineIndexForDisplay(): number | undefined {
    return this.currentIrText?.getFocusLineNumberForDisplay(
      this.opName(),
      this.sourceContextWindow(),
    );
  }

  trackByIndex(index: number, item: string): number {
    return index;
  }

  parseSourceFileNames() {
    const sourceFileName = this.sourceFileAndLineNumber()?.split(':')[0] || '';
    this.sourceFileNames = [sourceFileName];
    if (this.sourceFileNames.length > 0) {
      this.selectedSourceFileName = this.sourceFileNames[0];
    }
  }

  get loaded() {
    return this.irText !== '';
  }

  maybeUpdateHloTextCache() {
    const programId = this.programId();
    const sessionId = this.sessionId();
    if (!programId || programId === '0' || sessionId === '') {
      return;
    }
    const compilerPass = this.selectedCompilerPass;
    let hloTextCache = null;
    let hloGraphType = GRAPH_TYPE_DEFAULT;
    switch (compilerPass) {
      case CompilerPass.HLO_OPTIMIZED:
        hloTextCache = this.hloTextByProgramId;
        hloGraphType = GRAPH_TYPE_DEFAULT;
        break;
      case CompilerPass.HLO_UNOPTIMIZED:
        hloTextCache = this.hloUnoptimizedTextByProgramId;
        hloGraphType = GRAPH_TYPE_ORIGINAL_HLO;
        break;
      default:
        return;
    }
    // Selected compiler pass is not for hlo.
    if (!hloTextCache) {
      return;
    }
    // Cache hit, early return.
    const hloText = hloTextCache.get(programId);
    if (hloText) {
      return;
    }
    this.dataService
      .downloadHloProto(
        sessionId,
        hloGraphType,
        '',
        FileExtensionType.LONG_TEXT,
        false,
        programId,
      )
      .pipe(takeUntil(this.destroyed))
      .subscribe((data) => {
        if (data) {
          // TODO: b/573298011 - Consolidate HLO caches using a combined
          // (programId, compilerPass) key and capture programId before the
          // async request.
          hloTextCache.set(
            programId,
            new IrText(data as string, compilerPass),
          );
          this.cdr.markForCheck();
        }
      });
  }

  maybeUpdateMosaicTextCache() {
    const opName = this.opName();
    const sessionId = this.sessionId();
    if (
      !opName ||
      sessionId === '' ||
      this.selectedCompilerPass !== CompilerPass.MOSAIC_ORIGINAL
    ) {
      return;
    }
    const text = this.mosaicTextByKernelName.get(opName);
    if (text) {
      return;
    }
    this.dataService
      .getCustomCallText(sessionId, '', opName, this.programId())
      .pipe(takeUntil(this.destroyed))
      .subscribe((data: string) => {
        if (data) {
          this.mosaicTextByKernelName.set(
            opName,
            new IrText(data, CompilerPass.MOSAIC_ORIGINAL),
          );
          this.cdr.markForCheck();
        }
      });
  }

  maybeUpdateMosaicSourceFileAndLineNumberCache() {
    const opName = this.opName();
    const sessionId = this.sessionId();
    if (
      !opName ||
      sessionId === '' ||
      this.selectedCompilerPass !== CompilerPass.MOSAIC_ORIGINAL
    ) {
      return;
    }
    const sourceFileAndLineNumber =
      this.mosaicSourceFileAndLineNumberByKernelName.get(opName);
    if (sourceFileAndLineNumber) {
      return;
    }
    this.dataService
      .getLloSourceInfo(sessionId, opName)
      .pipe(takeUntil(this.destroyed))
      .subscribe((sourceInfo) => {
        if (sourceInfo) {
          this.mosaicSourceFileAndLineNumberByKernelName.set(
            opName,
            sourceInfo,
          );
          this.cdr.markForCheck();
        }
      });
  }

  onCompilerPassChange(newCompilerPass: CompilerPass) {
    this.selectedCompilerPass = newCompilerPass;
    switch (this.selectedCompilerPass) {
      case CompilerPass.HLO_OPTIMIZED:
      case CompilerPass.HLO_UNOPTIMIZED:
        this.maybeUpdateHloTextCache();
        break;
      case CompilerPass.MOSAIC_ORIGINAL:
        this.maybeUpdateMosaicTextCache();
        this.maybeUpdateMosaicSourceFileAndLineNumberCache();
        break;
      default:
        break;
    }
  }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }
}
