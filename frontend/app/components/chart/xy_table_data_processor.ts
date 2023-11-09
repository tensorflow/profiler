import {ChartDataProvider, CustomChartDataProcessor, DataTableOrDataView} from 'org_xprof/frontend/app/common/interfaces/chart';

/** A xy table data processor. */
export class XyTableDataProcessor implements CustomChartDataProcessor {
  constructor(
      private readonly numberFormatOptions:
          google.visualization.NumberFormatOptions|null,
      private readonly filters: google.visualization.DataTableCellFilter[],
      private readonly xColumn: number, private readonly yColumn: number) {}

  process(dataProvider: ChartDataProvider): DataTableOrDataView|null {
    if (!dataProvider) {
      return null;
    }

    const dataTable = dataProvider.getDataTable();
    if (!dataTable) {
      return null;
    }

    if (this.numberFormatOptions) {
      const numberFormatter =
          new google.visualization.NumberFormat(this.numberFormatOptions);
      numberFormatter.format(dataTable, this.yColumn);
    }

    const dataView = new google.visualization.DataView(dataTable);
    if (this.filters && this.filters.length > 0) {
      dataView.setRows(dataView.getFilteredRows(this.filters));
    }
    dataView.setColumns([this.xColumn, this.yColumn]);

    return dataView;
  }
}
