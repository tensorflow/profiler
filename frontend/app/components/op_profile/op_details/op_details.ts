import {Component, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';

import {Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.proto';
import * as utils from 'org_xprof/frontend/app/common/utils/utils';
import {getActiveOpProfileNodeState} from 'org_xprof/frontend/app/store/selectors';
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

  node?: Node;
  color: string = '';
  name: string = '';
  subheader: string = '';
  flopsRate: string = '';
  flopsUtilization: string = '';
  flopsColor: string = '';
  memoryBandwidth: string = '';
  memoryBandwidthUtilization: string = '';
  bwColor: string = '';
  expression: string = '';
  provenance: string = '';
  fused: boolean = false;
  hasCategory: boolean = false;
  hasLayout: boolean = false;
  dimensions: Node.XLAInstruction.LayoutAnalysis.Dimension[] = [];

  constructor(private readonly store: Store<{}>) {
    this.store.select(getActiveOpProfileNodeState)
        .pipe(takeUntil(this.destroyed))
        .subscribe((node: Node|null) => {
          this.update(node);
        });
  }

  dimensionColor(dimension?: Node.XLAInstruction.LayoutAnalysis.Dimension):
      string {
    if (!dimension || !dimension.alignment) {
      return '';
    }
    const ratio = (dimension.size || 0) / dimension.alignment;
    // COlors should grade harshly: 50% in a dimension is already very bad.
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
    if (!this.node) {
      return;
    }
    this.color =
        utils.flameColor(utils.flopsUtilization(this.node), 0.7, 1, Math.sqrt);
    this.name = this.node.name || '';
    this.subheader = this.getSubheader();

    if (utils.hasFlopsUtilization(this.node)) {
      const flopsUtilization = utils.flopsUtilization(this.node);
      this.flopsUtilization = utils.percent(flopsUtilization);
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

    if (utils.hasMemoryBandwidthUtilization(this.node)) {
      const utilization = utils.memoryBandwidthUtilization(this.node);
      this.memoryBandwidthUtilization = utils.percent(utilization);
      this.bwColor = utils.bwColor(utilization);
    } else {
      this.memoryBandwidthUtilization = '';
    }

    const memoryBW = utils.memoryBandwidth(this.node);
    // Memory bandwidth shouldn't be higher than 10TiB/s.
    if (isNaN(memoryBW) || memoryBW > 1E13) {
      this.memoryBandwidth = '';
    } else {
      this.memoryBandwidth =
          utils.humanReadableText(memoryBW, {si: true, dp: 2, suffix: 'B/s'});
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

    this.fused = !!this.node.xla && !this.node.metrics;
    this.hasCategory = !!this.node.category;
    this.hasLayout = !!this.node.xla && !!this.node.xla.layout &&
        !!this.node.xla.layout.dimensions &&
        this.node.xla.layout.dimensions.length > 0;
    if (this.node.xla && this.node.xla.layout) {
      this.dimensions = this.node.xla.layout.dimensions || [];
    }
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
