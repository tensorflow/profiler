import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {type GraphConfigInput, type GraphTypeObject} from 'org_xprof/frontend/app/common/interfaces/graph_viewer';
import {ReplaySubject} from 'rxjs';

/** A graph viewer component. */
@Component({
  standalone: false,
  selector: 'graph-config',
  templateUrl: './graph_config.ng.html',
  styleUrls: ['./graph_config.scss'],
})
export class GraphConfig implements OnDestroy, OnChanges {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  @Output() readonly plot = new EventEmitter<Partial<GraphConfigInput>>();
  @Output() readonly updateSelectedModule = new EventEmitter<string>();

  /** Form inputs properties */
  @Input() initialInputs: GraphConfigInput|undefined = undefined;
  @Input() moduleList: string[] = [];
  // Temparary indicator to hide the module name selection for 1vm graph viewer
  @Input() isHloOssTool = false;
  @Input() graphTypes: GraphTypeObject[] = [];

  selectedModule =
      this.initialInputs?.selectedModule || this.moduleList[0] || '';
  opName = this.initialInputs?.opName || '';
  graphWidth = this.initialInputs?.graphWidth || 3;
  showMetadata = this.initialInputs?.showMetadata || false;
  mergeFusion = this.initialInputs?.mergeFusion || false;
  programId = this.initialInputs?.programId || '';
  graphType = this.graphTypes.length ? this.graphTypes[0].value : '';

  get params() {
    const params: GraphConfigInput = {
      selectedModule: this.selectedModule,
      opName: this.opName,
      graphWidth: this.graphWidth,
      showMetadata: this.showMetadata,
      mergeFusion: this.mergeFusion,
    };
    if (this.programId) {
      params.programId = this.programId;
    }
    if (this.graphType) {
      params.graphType = this.graphType;
    }
    return params;
  }

  ngOnChanges(changes: SimpleChanges) {
    // Initiate the first time loading (read from url query parameters)
    // or, update params given refreshed initialInputs (for graph navigating)
    if (changes.hasOwnProperty('initialInputs') &&
        Object.entries(changes['initialInputs'].currentValue || {}).length) {
      this.selectedModule = this.initialInputs?.selectedModule || '';
      this.opName = this.initialInputs?.opName || '';
      this.graphWidth = this.initialInputs?.graphWidth || 3;
      this.showMetadata = this.initialInputs?.showMetadata || false;
      this.mergeFusion = this.initialInputs?.mergeFusion || false;
      this.programId = this.initialInputs?.programId || '';
    }

    // Update default module name once moduleList is updated
    if (changes.hasOwnProperty('moduleList') &&
        changes['moduleList'].currentValue.length > 0 &&
        !this.params.selectedModule) {
      this.selectedModule = this.programId ?
          changes['moduleList'].currentValue.find(
              (module: string) => module.includes(this.programId),
              ) ||
              this.moduleList[0] :
          this.moduleList[0];
    }

    if (changes.hasOwnProperty('graphTypes') &&
        changes['graphTypes'].currentValue.length > 0 && !this.graphType) {
      this.graphType = this.graphTypes[0].value;
    }
  }

  validToSubmit() {
    return this.params.opName && this.params.selectedModule;
  }

  get moduleListOptions() {
    if (this.moduleList.length > 0) {
      return this.moduleList;
    } else if (this.params.selectedModule) {
      return [this.params.selectedModule];
    } else {
      return [];
    }
  }

  onSubmit() {
    if (!this.validToSubmit()) return;
    this.plot.emit(this.params);
  }

  onModuleSelectionChange(e: MatSelectChange) {
    this.updateSelectedModule.emit(e.value);
  }

  isNewGraphViewer() {
    return false;
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
