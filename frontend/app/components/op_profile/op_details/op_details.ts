import {Component, Input} from '@angular/core';
import {Store} from '@ngrx/store';
import {Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import * as utils from 'org_xprof/frontend/app/common/utils/utils';
import {getActiveOpProfileNodeState, getOpProfileRootNode, getSelectedOpNodeChainState} from 'org_xprof/frontend/app/store/selectors';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** An op details view component. */
@Component({
  selector: 'op-details',
  templateUrl: './op_details.ng.html',
  styleUrls: ['./op_details.scss']
})
export class OpDetails {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  /** the session id */
  @Input() sessionId = '';
  /** the list of modules */
  @Input() moduleList: string[] = [];

  rootNode?: Node;
  node?: Node;
  color: string = '';
  name: string = '';
  subheader: string = '';
  flopsRate: string = '';
  flopsUtilization: string = '';
  flopsColor: string = '';
  bandwidths: string[] =
      Array.from<string>({length: utils.MemBwType.MEM_BW_TYPE_MAX + 1})
          .fill('');
  bandwidthUtilizations: string[] =
      Array.from<string>({length: utils.MemBwType.MEM_BW_TYPE_MAX + 1})
          .fill('');
  bwColors: string[] =
      Array.from<string>({length: utils.MemBwType.MEM_BW_TYPE_MAX + 1})
          .fill('');
  expression: string = '';
  provenance: string = '';
  rawTimeMs = '';
  avgTimeMs = '';
  fused: boolean = false;
  hasCategory: boolean = false;
  hasLayout: boolean = false;
  dimensions: Node.XLAInstruction.LayoutAnalysis.Dimension[] = [];
  computationPrimitiveSize: string = '';
  selectedOpNodeChain: string[] = [];
  memBwType = utils.MemBwType;

  constructor(private readonly store: Store<{}>) {
    this.store.select(getActiveOpProfileNodeState)
        .pipe(takeUntil(this.destroyed))
        .subscribe((node: Node|null) => {
          this.update(node);
        });
    this.store.select(getSelectedOpNodeChainState)
        .pipe(takeUntil(this.destroyed))
        .subscribe((nodeChain: string[]) => {
          this.selectedOpNodeChain = nodeChain;
        });
    this.store.select(getOpProfileRootNode)
        .pipe(takeUntil(this.destroyed))
        .subscribe((node: Node|null) => {
          this.rootNode = node || undefined;
        });
  }

  hasValidGraphViewerLink() {
    const aggregatedBy = this.selectedOpNodeChain[0];
    if (aggregatedBy === 'by_category' && this.moduleList.length > 1) {
      return false;
    }
    // Condition for both 'by_program' and 'by_category'
    return this.selectedOpNodeChain.length >= 2 && this.expression;
  }

  getGraphViewerLink() {
    const aggregatedBy = this.selectedOpNodeChain[0];
    // expression format assumption: '%<op_name> = ...'
    const opName = this.expression.split('=')[0].trim().slice(1);
    if (aggregatedBy === 'by_program') {
      return `/graph_viewer/${this.sessionId}?module_name=${
          this.selectedOpNodeChain[1]}&node_name=${opName}`;
    } else if (aggregatedBy === 'by_category') {
      return `/graph_viewer/${this.sessionId}?module_name=${
          this.moduleList[0]}&node_name=${opName}`;
    }
    return '';
  }

  dimensionColor(dimension?: Node.XLAInstruction.LayoutAnalysis.Dimension):
      string {
    if (!dimension || !dimension.alignment) {
      return '';
    }
    const ratio = (dimension.size || 0) / dimension.alignment;
    // Colors should grade harshly: 50% in a dimension is already very bad.
    const harshCurve = (x: number) => 1 - Math.sqrt(1 - x);
    return utils.flameColor(ratio / Math.ceil(ratio), 1, 0.25, harshCurve);
  }

  dimensionHint(dimension?: Node.XLAInstruction.LayoutAnalysis.Dimension):
      string {
    if (!dimension || !dimension.alignment) {
      return '';
    }
    const size = dimension.size || 0;
    const mul = Math.ceil(size / dimension.alignment);
    const mulSuffix = (mul === 1) ?
        '' :
        ': ' + mul.toString() + ' x ' + dimension.alignment.toString();
    if (size % dimension.alignment === 0) {
      return 'Exact fit' + mulSuffix;
    }
    return 'Pad to ' + (mul * dimension.alignment).toString() + mulSuffix;
  }

  private getSubheader(): string {
    if (!this.node) {
      return '';
    }
    if (this.node.xla && this.node.xla.category) {
      return this.node.xla.category + ' operation';
    }
    if (this.node.category) {
      return 'Operation category';
    }
    return 'Unknown';
  }

  update(node: Node|null) {
    this.node = node || undefined;
    if (!this.node || !this.rootNode) {
      return;
    }
    this.color = utils.flameColor(
        utils.flopsUtilization(this.node, this.rootNode), 0.7, 1, Math.sqrt);
    this.name = this.node.name || '';
    this.subheader = this.getSubheader();

    if (utils.hasFlopsUtilization(this.node)) {
      const flopsUtilization = utils.flopsUtilization(this.node, this.rootNode);
      this.flopsUtilization = utils.percent(flopsUtilization, '');
      this.flopsColor = utils.flopsColor(flopsUtilization);
    } else {
      this.flopsUtilization = '';
    }

    const flopsRate = utils.flopsRate(this.node);
    // Flops rate shouldn't be higher than 1EFLOPS.
    if (isNaN(flopsRate) || flopsRate > 1E18) {
      this.flopsRate = '';
    } else {
      this.flopsRate = utils.humanReadableText(
          flopsRate, {si: true, dp: 2, suffix: 'FLOP/s'});
    }

    for (let i = utils.MemBwType.MEM_BW_TYPE_FIRST;
         i <= utils.MemBwType.MEM_BW_TYPE_MAX; i++) {
      if (utils.hasBandwidthUtilization(this.node, i)) {
        const utilization = utils.memoryBandwidthUtilization(this.node, i);
        this.bandwidthUtilizations[i] = utils.percent(utilization, '');
        this.bwColors[i] = utils.bwColor(utilization);
      } else {
        this.bandwidthUtilizations[i] = '';
      }
      const memoryBW = utils.memoryBandwidth(this.node, i);
      // Memory bandwidth shouldn't be higher than 10TiB/s.
      if (isNaN(memoryBW) || memoryBW > 1E13) {
        this.bandwidths[i] = '';
      } else {
        this.bandwidths[i] =
            utils.humanReadableText(memoryBW, {si: true, dp: 2, suffix: 'B/s'});
      }
    }

    if (this.node.xla && this.node.xla.expression) {
      this.expression = this.node.xla.expression;
    } else {
      this.expression = '';
    }

    if (this.node.xla && this.node.xla.provenance) {
      this.provenance = this.node.xla.provenance;
    } else {
      this.provenance = '';
    }

    if (this.node.metrics && this.node.metrics.rawTime) {
      this.rawTimeMs = utils.humanReadableText(
          this.node.metrics.rawTime / 1e9, {si: true, dp: 2, suffix: ' ms'});
    } else {
      this.rawTimeMs = '';
    }

    if (this.node.metrics && this.node.metrics.avgTimePs) {
      this.avgTimeMs = utils.humanReadableText(
          this.node.metrics.avgTimePs / 1e9, {si: true, dp: 2, suffix: ' ms'});
    } else {
      this.avgTimeMs = '';
    }

    this.fused = !!this.node.xla && !this.node.metrics;
    this.hasCategory = !!this.node.category;
    this.hasLayout = !!this.node.xla && !!this.node.xla.layout &&
        !!this.node.xla.layout.dimensions &&
        this.node.xla.layout.dimensions.length > 0;
    if (this.node.xla && this.node.xla.layout) {
      this.dimensions = this.node.xla.layout.dimensions || [];
    }

    this.computationPrimitiveSize =
        ((this.node?.xla?.computationPrimitiveSize) ?
             `${this.node.xla.computationPrimitiveSize} bits` :
             '');
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
