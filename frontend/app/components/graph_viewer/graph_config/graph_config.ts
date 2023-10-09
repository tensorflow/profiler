import {Component, EventEmitter, Input, OnChanges, OnDestroy, Output, SimpleChanges} from '@angular/core';
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

  @Output() readonly plot = new EventEmitter<void>();
  @Output()
  readonly update =
      new EventEmitter<{[key: string]: string | number | boolean}>();

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
    // Initiate once with property values (read from url query parameters)
    if (!this.inputsInited && changes.hasOwnProperty('initialInputs') &&
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

  onUpdateParam(update: Partial<GraphConfigInput>) {
    // Doing this instead of this.params[key]=value due to "type cannot be
    // assigned to never" error
    this.params = {
      ...this.params,
      ...update,
    };
    this.update.emit(update);
  }

  onSubmit() {
    if (!this.validToSubmit()) return;
    this.plot.emit();
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
