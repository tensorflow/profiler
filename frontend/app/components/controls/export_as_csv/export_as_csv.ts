import {Component, Input} from '@angular/core';
import {Store} from '@ngrx/store';
import * as actions from 'org_xprof/frontend/app/store/actions';

/**
 * A 'Export as CSV' button component.
 */
@Component({
  selector: 'export-as-csv',
  templateUrl: './export_as_csv.ng.html',
  styleUrls: ['./export_as_csv.scss']
})
export class ExportAsCsv {
  /** The name of tool. */
  @Input() tool: string = '';

  constructor(protected readonly store: Store<{}>) {}

  exportDataAsCSV() {
    this.store.dispatch(actions.clearExportAsCsvStateAction());
    this.store.dispatch(
        actions.setExportAsCsvStateAction({exportAsCsv: this.tool}));
  }
}
