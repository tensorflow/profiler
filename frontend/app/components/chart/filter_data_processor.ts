import {ChartDataProvider, CustomChartDataProcessor, DataTableOrDataView} from 'org_xprof/frontend/app/common/interfaces/chart';

/** A custom chart data processor with support for extra filters. */
export class FilterDataProcessor implements CustomChartDataProcessor {
  private extraFilters: google.visualization.DataTableCellFilter[] = [];

  constructor(
      private readonly visibleColumns:
          Array<number|google.visualization.ColumnSpec>,
      private readonly filters: google.visualization.DataTableCellFilter[]) {}


  setFilters(filters: google.visualization.DataTableCellFilter[]) {
    this.extraFilters = filters;
  }

  process(dataProvider: ChartDataProvider): DataTableOrDataView|null {
    if (!dataProvider) {
      return null;
    }

    const dataTable = dataProvider.getDataTable();
    if (!dataTable) {
      return null;
    }

    const dataView = new google.visualization.DataView(dataTable);

    if (this.visibleColumns.length > 0) {
      dataView.setColumns(this.visibleColumns);
    }

    const filters = this.filters.concat(this.extraFilters);
    if (filters.length > 0) {
      dataView.setRows(dataTable.getFilteredRows(filters));
    }

    return dataView;
  }
}
