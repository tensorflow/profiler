import 'org_xprof/frontend/app/common/typing/google_visualization/google_visualization';

import {EventEmitter} from '@angular/core';
import {ChartClass, ChartDataProvider, ChartOptions, DataTableOrDataViewOrNull} from 'org_xprof/frontend/app/common/interfaces/chart';
import {SimpleDataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';

/** A default chart data provider. */
export class DefaultDataProvider implements ChartDataProvider {
  protected chart?: ChartClass;
  protected dataTable?: google.visualization.DataTable;
  protected sortColumns?: google.visualization.SortByColumn[];
  protected visibleColumns?: number[];
  protected filters?: google.visualization.DataTableCellFilter[];
  protected readonly update = new EventEmitter();

  setChart(chart: ChartClass) {
    this.chart = chart;
  }

  parseData(data: SimpleDataTable|Array<Array<(string | number)>>|null) {
    if (data) {
      this.dataTable =
          new google.visualization.DataTable(data as SimpleDataTable);
    }
  }

  setSortColumns(sortColumns: google.visualization.SortByColumn[]) {
    this.sortColumns = sortColumns;
  }

  setVisibleColumns(visibleColumns: number[]) {
    this.visibleColumns = visibleColumns;
  }

  setFilters(filters: google.visualization.DataTableCellFilter[]) {
    this.filters = filters;
  }

  process(): DataTableOrDataViewOrNull {
    if (!this.dataTable) {
      return null;
    }

    if (this.sortColumns && this.sortColumns.length > 0) {
      this.dataTable.sort(this.sortColumns);
    }

    const dataView = new google.visualization.DataView(this.dataTable);

    if (this.visibleColumns && this.visibleColumns.length > 0) {
      dataView.setColumns(this.visibleColumns);
    }

    if (this.filters && this.filters.length > 0) {
      dataView.setRows(this.dataTable.getFilteredRows(this.filters));
    }

    return dataView;
  }

  getChart(): ChartClass|null {
    return this.chart || null;
  }

  getDataTable(): google.visualization.DataTableExt|null {
    return this.dataTable ?
        (this.dataTable as google.visualization.DataTableExt) :
        null;
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

/** A chart data provider that accepts array data. */
export class ArrayDataProvider extends DefaultDataProvider {
  parseData(data: SimpleDataTable|Array<Array<(string | number)>>|null) {
    if (data) {
      /* tslint:disable no-any */
      this.dataTable = google.visualization.arrayToDataTable(data as any[]);
      /* tslint:enable */
    }
  }
}
