import {EventEmitter} from '@angular/core';
import {ChartClass, ChartDataInfo, ChartOptions} from 'org_xprof/frontend/app/common/interfaces/chart';
import {DefaultDataProvider} from 'org_xprof/frontend/app/components/chart/default_data_provider';

declare interface SortEvent {
  column: number;
  ascending: boolean;
}

const DATA_TABLE_RANK_INDEX = 1;
const DATA_TABLE_DEVICE_PERCENT_INDEX = 10;
const DATA_TABLE_CUMULATIVE_DEVICE_PERCENT_INDEX = 11;
const DATA_TABLE_HOST_PERCENT_INDEX = 12;
const DATA_TABLE_CUMULATIVE_HOST_PERCENT_INDEX = 13;
const DATA_VIEW_CUMULATIVE_DEVICE_PERCENT_INDEX = 10;
const DATA_VIEW_CUMULATIVE_HOST_PERCENT_INDEX = 12;
const MAXIMUM_ROWS = 1000;
const MINIMUM_ROWS = 20;

/** A stats table data provider. */
export class StatsTableDataProvider extends DefaultDataProvider {
  sortAscending = true;
  sortColumn = -1;
  options = {
    allowHtml: true,
    alternatingRowStyle: false,
    showRowNumber: false,
    width: '100%',
    height: '600px',
    cssClassNames: {
      'headerCell': 'google-chart-table-header-cell',
      'tableCell': 'google-chart-table-table-cell',
    },
    sort: 'event',
    sortAscending: true,
    sortColumn: -1,
  };

  private readonly updated = new EventEmitter();
  private readonly totalOperationsChanged = new EventEmitter<string>();

  setChart(chart: ChartClass) {
    this.chart = chart;
    google.visualization.events.addListener(
        this.chart, 'sort', (event: SortEvent) => {
          this.sortColumn = event.column;
          this.sortAscending = event.ascending;
          this.updated.emit();
        });
  }

  setData(dataInfo: ChartDataInfo) {
    if (!dataInfo || !dataInfo.data || !dataInfo.type) {
      return;
    }

    const dataTable = new google.visualization.DataTable(dataInfo.data);
    this.preProcessDataTable(dataTable);
  }

  setFilters(filters: google.visualization.DataTableCellFilter[]) {
    this.filters = filters;
    if (this.dataTable) {
      this.updated.emit();
    }
  }

  process(): google.visualization.DataTable|google.visualization.DataView|null {
    if (!this.dataTable) {
      return null;
    }

    let dataTable = this.dataTable;
    let dataView: google.visualization.DataView|null = null;

    if (this.filters && this.filters.length > 0) {
      dataView = new google.visualization.DataView(this.dataTable);
      dataView.setRows(this.dataTable.getFilteredRows(this.filters));
      dataTable = dataView.toDataTable();
    }

    dataView = this.formatDataTable(dataTable);

    this.options.height =
        dataView.getNumberOfRows() < MINIMUM_ROWS ? '' : '600px';

    return dataView;
  }

  getOptions(): ChartOptions|null {
    this.options.sortAscending = this.sortAscending;
    this.options.sortColumn = this.sortColumn;
    return this.options;
  }

  setUpdateEventListener(callback: Function) {
    this.updated.subscribe(callback);
  }

  setTotalOperationsChangedEventListener(callback: Function) {
    this.totalOperationsChanged.subscribe(callback);
  }

  preProcessDataTable(dataTable: google.visualization.DataTable) {
    this.dataTable = dataTable.clone();
    this.updateTotalOperations(this.dataTable);

    const zeroDecimalPtFormatter =
        new google.visualization.NumberFormat({'fractionDigits': 0});
    zeroDecimalPtFormatter.format(this.dataTable, 5); /** total_time */
    zeroDecimalPtFormatter.format(this.dataTable, 6); /** avg_time */
    zeroDecimalPtFormatter.format(this.dataTable, 7); /** total_self_time */
    zeroDecimalPtFormatter.format(this.dataTable, 8); /** avg_self_time */

    const percentFormatter =
        new google.visualization.NumberFormat({pattern: '##.#%'});
    percentFormatter.format(
        this.dataTable, 9); /** device_total_self_time_percent */
    percentFormatter.format(
        this.dataTable, 11); /** host_total_self_time_percent */

    /**
     * Format tensorcore utilization column if it exists in dataTable.
     * This column does not exist in dataTable if the device is not GPU.
     */
    for (let i = 0; i < dataTable.getNumberOfColumns(); i++) {
      if (this.dataTable.getColumnId(i) === 'gpu_tensorcore_utilization') {
        percentFormatter.format(this.dataTable, i);
        break;
      }
    }

    this.dataTable.insertColumn(1, 'number', 'Rank');
  }

  formatDataTable(dataTable: google.visualization.DataTable):
      google.visualization.DataView {
    let sortColumn = this.sortColumn + 1;
    if (this.sortColumn === 0 ||
        this.sortColumn === DATA_VIEW_CUMULATIVE_DEVICE_PERCENT_INDEX ||
        this.sortColumn === DATA_VIEW_CUMULATIVE_HOST_PERCENT_INDEX) {
      sortColumn = this.sortColumn;
    }

    const sortedIndex = dataTable.getSortedRows({
      column: sortColumn,
      desc: !this.sortAscending,
    });
    let sumOfDevice = 0;
    let sumOfHost = 0;
    if (sortColumn === 0 && !this.sortAscending) {
      let n = sortedIndex.length;
      for (const v of sortedIndex) {
        dataTable.setCell(v, DATA_TABLE_RANK_INDEX, n--);
        sumOfDevice += dataTable.getValue(v, DATA_TABLE_DEVICE_PERCENT_INDEX);
        dataTable.setCell(
            v, DATA_TABLE_CUMULATIVE_DEVICE_PERCENT_INDEX, sumOfDevice);
        sumOfHost += dataTable.getValue(v, DATA_TABLE_HOST_PERCENT_INDEX);
        dataTable.setCell(
            v, DATA_TABLE_CUMULATIVE_HOST_PERCENT_INDEX, sumOfHost);
      }
    } else {
      for (const [index, v] of sortedIndex.entries()) {
        dataTable.setCell(v, DATA_TABLE_RANK_INDEX, index + 1);
        sumOfDevice += dataTable.getValue(v, DATA_TABLE_DEVICE_PERCENT_INDEX);
        if (sumOfDevice > 100) {
          sumOfDevice = 100;
        }
        dataTable.setCell(
            v, DATA_TABLE_CUMULATIVE_DEVICE_PERCENT_INDEX, sumOfDevice);
        sumOfHost += dataTable.getValue(v, DATA_TABLE_HOST_PERCENT_INDEX);
        if (sumOfHost > 100) {
          sumOfHost = 100;
        }
        dataTable.setCell(
            v, DATA_TABLE_CUMULATIVE_HOST_PERCENT_INDEX, sumOfHost);
      }
      if (!this.sortAscending &&
          (this.sortColumn === DATA_VIEW_CUMULATIVE_DEVICE_PERCENT_INDEX ||
           this.sortColumn === DATA_VIEW_CUMULATIVE_HOST_PERCENT_INDEX)) {
        let sumOfPercent =
            this.sortColumn === DATA_VIEW_CUMULATIVE_DEVICE_PERCENT_INDEX ?
            sumOfDevice :
            sumOfHost;
        const index =
            this.sortColumn === DATA_VIEW_CUMULATIVE_DEVICE_PERCENT_INDEX ?
            DATA_TABLE_CUMULATIVE_DEVICE_PERCENT_INDEX :
            DATA_TABLE_CUMULATIVE_HOST_PERCENT_INDEX;
        for (const v of sortedIndex) {
          dataTable.setCell(v, index, sumOfPercent);
          sumOfPercent -= dataTable.getValue(v, index - 1);
          if (sumOfPercent < 0) {
            sumOfPercent = 0;
          }
        }
      }
    }
    const percentFormatter =
        new google.visualization.NumberFormat({pattern: '##.#%'});
    percentFormatter.format(
        dataTable, DATA_TABLE_CUMULATIVE_DEVICE_PERCENT_INDEX);
    percentFormatter.format(
        dataTable, DATA_TABLE_CUMULATIVE_HOST_PERCENT_INDEX);

    const dataView = new google.visualization.DataView(dataTable);
    dataView.setRows(sortedIndex);

    dataView.hideColumns([0]);

    return dataView;
  }

  updateTotalOperations(dataTable: google.visualization.DataTable) {
    const totalOperations = dataTable.getNumberOfRows();
    if (totalOperations > MAXIMUM_ROWS) {
      this.totalOperationsChanged.emit(String(totalOperations));
      dataTable.removeRows(MAXIMUM_ROWS, totalOperations - MAXIMUM_ROWS);
    } else {
      this.totalOperationsChanged.emit('');
    }
  }
}
