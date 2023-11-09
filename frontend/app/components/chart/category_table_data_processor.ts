import {ChartDataProvider, CustomChartDataProcessor, DataTableOrDataView} from 'org_xprof/frontend/app/common/interfaces/chart';

import {computeGroupView} from './table_utils';

/** A category table data processor. */
export class CategoryTableDataProcessor implements CustomChartDataProcessor {
  constructor(
      private readonly filters: google.visualization.DataTableCellFilter[],
      private readonly gColumn: number, private readonly vColumn: number,
      private readonly showSingleCategory: boolean = true) {}

  process(dataProvider: ChartDataProvider): DataTableOrDataView|null {
    if (!dataProvider) {
      return null;
    }

    const dataTable = dataProvider.getDataTable();
    if (!dataTable) {
      return null;
    }

    return computeGroupView(
        dataTable, this.filters, this.gColumn, this.vColumn,
        this.showSingleCategory);
  }
}
