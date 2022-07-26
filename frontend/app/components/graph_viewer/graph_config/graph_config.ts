import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output} from '@angular/core';
import {GraphConfigInput} from 'org_xprof/frontend/app/common/interfaces/graph_viewer';
import {ReplaySubject} from 'rxjs';

/** A graph viewer component. */
@Component({
  selector: 'graph-config',
  templateUrl: './graph_config.ng.html',
  styleUrls: ['./graph_config.scss'],
})
export class GraphConfig implements OnDestroy, OnChanges {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  @Output() readonly plot = new EventEmitter<GraphConfigInput>();

  /** Form inputs properties */
  @Input() params: GraphConfigInput|undefined;

  // Initiate with property values (read from url query parameters)
  // once onPlot triggered, emit to parent and update the url
  moduleList: string[] = [];
  selectedModule = '';
  opName = '';
  graphWidth = 3;
  showMetadata = false;
  mergeFusion = false;

  ngOnChanges() {
    this.moduleList = this.params?.moduleList || this.moduleList;
    this.selectedModule = this.params?.selectedModule || this.selectedModule;
    this.opName = this.params?.opName || this.opName;
    this.graphWidth = this.params?.graphWidth || this.graphWidth;
    this.showMetadata = this.params?.showMetadata || this.showMetadata;
    this.mergeFusion = this.params?.mergeFusion || this.mergeFusion;
  }

  updateOpName(value: string) {
    this.opName = value.trim();
  }

  validToSubmit() {
    return this.opName && this.selectedModule;
  }

  onSubmit() {
    if (!this.validToSubmit()) return;
    this.plot.emit({
      moduleList: this.moduleList,
      selectedModule: this.selectedModule,
      opName: this.opName,
      graphWidth: this.graphWidth,
      showMetadata: this.showMetadata,
      mergeFusion: this.mergeFusion,
    });
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
