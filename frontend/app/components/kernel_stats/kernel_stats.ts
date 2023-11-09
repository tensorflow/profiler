import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {SimpleDataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {getKernelStatsDataState} from 'org_xprof/frontend/app/store/common_data_store/selectors';

/** A Kernel Stats component. */
@Component({
  selector: 'kernel-stats',
  templateUrl: './kernel_stats.ng.html',
  styleUrls: ['./kernel_stats.css']
})
export class KernelStats {
  data: SimpleDataTable|null = null;
  hasDataRow = false;

  constructor(store: Store<{}>) {
    store.select(getKernelStatsDataState)
        .subscribe((data: SimpleDataTable|null) => {
          this.update(data);
        });
  }

  update(data: SimpleDataTable|null) {
    this.data = data;
    this.hasDataRow = !!(data) && !!(data.rows) && data.rows.length > 0;
  }
}
