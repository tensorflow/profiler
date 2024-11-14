import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
import {MatSelectChange} from '@angular/material/select';
import {type GraphConfigInput} from 'org_xprof/frontend/app/common/interfaces/graph_viewer';
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
  @Input() useProgramId = false;

  inputsInited = false;
  params: GraphConfigInput = {
    selectedModule: '',
    opName: '',
    graphWidth: 3,
    showMetadata: false,
    mergeFusion: false,
  };

  ngOnChanges(changes: SimpleChanges) {
    // Initiate the first time loading (read from url query parameters)
    // or, update params given refreshed initialInputs (for graph navigating)
    if (changes.hasOwnProperty('initialInputs') &&
        Object.entries(changes['initialInputs'].currentValue || {}).length) {
      this.params = {...this.initialInputs as GraphConfigInput};
      this.inputsInited = true;
    }

    // Update default module name once moduleList is updated
    if (changes.hasOwnProperty('moduleList') &&
        changes['moduleList'].currentValue.length > 0 &&
        !this.params.selectedModule) {
      this.params.selectedModule =
          this.params.selectedModule || changes['moduleList'].currentValue[0];
    }
  }

  validToSubmit() {
    return this.params.opName && this.params.selectedModule;
  }

  getModuleList() {
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
