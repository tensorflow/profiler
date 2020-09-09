import {Component, Input, OnChanges, OnInit, SimpleChanges} from '@angular/core';
import {ChartDataInfo, DataType} from 'org_xprof/frontend/app/common/interfaces/chart';
import {TensorflowStatsDataOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';

import {StatsTableDataProvider} from './stats_table_data_provider';

declare interface SortEvent {
  column: number;
  ascending: boolean;
}

const DATA_TABLE_RANK_INDEX = 1;
const DATA_TABLE_EXECUTOR_INDEX = 2;
const DATA_TABLE_TYPE_INDEX = 3;
const DATA_TABLE_OPERATION_INDEX = 4;
const DATA_TABLE_DEVICE_PERCENT_INDEX = 10;
const DATA_TABLE_CUMULATIVE_DEVICE_PERCENT_INDEX = 11;
const DATA_TABLE_HOST_PERCENT_INDEX = 12;
const DATA_TABLE_CUMULATIVE_HOST_PERCENT_INDEX = 13;
const DATA_VIEW_CUMULATIVE_DEVICE_PERCENT_INDEX = 10;
const DATA_VIEW_CUMULATIVE_HOST_PERCENT_INDEX = 12;
const MAXIMUM_ROWS = 1000;

/** A stats table view component. */
@Component({
  selector: 'stats-table',
  templateUrl: './stats_table.ng.html',
  styleUrls: ['./stats_table.scss']
})
export class StatsTable implements OnChanges, OnInit {
  /** The tensorflow stats data. */
  @Input() tensorflowStatsData: TensorflowStatsDataOrNull = null;

  /** The tensorflow stats data for diff. */
  @Input() diffData: TensorflowStatsDataOrNull = null;

  /** Whether to use diff. */
  @Input() hasDiff = false;

  filterExecutor = '';
  filterType = '';
  filterOperation = '';
  totalOperations = '';
  dataProvider = new StatsTableDataProvider();
  dataInfo: ChartDataInfo = {
    data: null,
    type: DataType.DATA_TABLE,
    dataProvider: this.dataProvider,
  };

  ngOnInit() {
    this.dataProvider.setTotalOperationsChangedEventListener(
        (totalOperations: string) => {
          this.totalOperations = totalOperations;
        });
  }

  ngOnChanges(changes: SimpleChanges) {
    this.dataProvider.hasDiff = this.hasDiff;
    if (this.hasDiff && this.diffData) {
      this.dataProvider.setDiffData(this.diffData);
    }
    this.dataInfo = {
      ...this.dataInfo,
      data: this.tensorflowStatsData,
    };
  }

  updateFilters() {
    const filters: google.visualization.DataTableCellFilter[] = [];
    if (this.filterExecutor.trim()) {
      const filter = this.filterExecutor.trim().toLowerCase();
      filters.push({
        'column': DATA_TABLE_EXECUTOR_INDEX,
        'test': (value: string) => value.toLowerCase().indexOf(filter) >= 0,
      });
    }
    if (this.filterType.trim()) {
      const filter = this.filterType.trim().toLowerCase();
      filters.push({
        'column': DATA_TABLE_TYPE_INDEX,
        'test': (value: string) => value.toLowerCase().indexOf(filter) >= 0,
      });
    }
    if (this.filterOperation.trim()) {
      const filter = this.filterOperation.trim().toLowerCase();
      filters.push({
        'column': DATA_TABLE_OPERATION_INDEX,
        'test': (value: string) => value.toLowerCase().indexOf(filter) >= 0,
      });
    }

    this.dataProvider.setFilters(filters);
  }
}
