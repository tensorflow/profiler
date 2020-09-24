import 'org_xprof/frontend/app/common/typing/google_visualization/google_visualization';

import {EventEmitter} from '@angular/core';
import {ChartClass, ChartDataInfo, ChartDataProvider, ChartOptions, DataTableOrDataViewOrNull, DataType} from 'org_xprof/frontend/app/common/interfaces/chart';

/** A default chart data provider. */
export class DefaultDataProvider implements ChartDataProvider {
  protected chart?: ChartClass;
  protected dataTable?: google.visualization.DataTable;
  protected filters?: google.visualization.DataTableCellFilter[];
  protected sortColumns?: google.visualization.SortByColumn[];
  protected readonly update = new EventEmitter();

  setChart(chart: ChartClass) {
    this.chart = chart;
  }

  setData(dataInfo: ChartDataInfo) {
    if (!dataInfo || !dataInfo.data || !dataInfo.type) {
      return;
    }

    switch (dataInfo.type) {
      case DataType.ARRAY:
        /* tslint:disable no-any */
        this.dataTable =
            google.visualization.arrayToDataTable(dataInfo.data as any[]);
        /* tslint:enable */
        break;
      case DataType.DATA_TABLE:
        this.dataTable = new google.visualization.DataTable(dataInfo.data);
        break;
      default:
        this.dataTable = undefined;
        break;
    }
  }

  setFilters(filters: google.visualization.DataTableCellFilter[]) {
    this.filters = filters;
  }

  setSortColumns(sortColumns: google.visualization.SortByColumn[]) {
    this.sortColumns = sortColumns;
  }

  process(): DataTableOrDataViewOrNull {
    if (!this.dataTable) {
      return null;
    }

    if (this.sortColumns && this.sortColumns.length > 0) {
      this.dataTable.sort(this.sortColumns);
    }

    let dataView: google.visualization.DataView|null = null;

    if (this.filters && this.filters.length > 0) {
      dataView = new google.visualization.DataView(this.dataTable);
      dataView.setRows(this.dataTable.getFilteredRows(this.filters));
    }

    return dataView || this.dataTable || null;
  }

  getChart(): ChartClass|null {
    return this.chart || null;
  }

  getDataTable(): google.visualization.DataTable|null {
    return this.dataTable || null;
  }

  getOptions(): ChartOptions|null {
    return null;
  }

  setUpdateEventListener(callback: Function) {
    this.update.subscribe(callback);
  }

  notifyCharts() {
    this.update.emit();
  }
}
