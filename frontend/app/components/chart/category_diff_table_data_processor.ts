import {ChartDataProvider, CustomChartDataProcessor, DataTableOrDataView} from 'org_xprof/frontend/app/common/interfaces/chart';
import {SimpleDataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';

import {computeCategoryDiffTable, computeGroupView} from './table_utils';

/** A category diff table data processor. */
export class CategoryDiffTableDataProcessor implements
    CustomChartDataProcessor {
  constructor(
      private readonly diffData: SimpleDataTable|null,
      private readonly filters: google.visualization.DataTableCellFilter[],
      private readonly gColumn: number, private readonly vColumn: number) {}

  process(dataProvider: ChartDataProvider): DataTableOrDataView|null {
    if (!dataProvider) {
      return null;
    }

    const dataTable = dataProvider.getDataTable();
    if (!dataTable) {
      return null;
    }

    const diffTable = new google.visualization.DataTable(this.diffData);
    if (!diffTable) {
      return null;
    }

    const chart = dataProvider.getChart();
    if (!chart) {
      return null;
    }

    return computeCategoryDiffTable(
        computeGroupView(dataTable, this.filters, this.gColumn, this.vColumn),
        computeGroupView(diffTable, this.filters, this.gColumn, this.vColumn),
        chart);
  }
}
