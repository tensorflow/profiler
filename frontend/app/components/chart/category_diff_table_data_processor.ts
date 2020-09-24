import 'org_xprof/frontend/app/common/typing/google_visualization/google_visualization';
import {ChartDataProvider, CustomChartDataProcessor, DataTableOrDataViewOrNull} from 'org_xprof/frontend/app/common/interfaces/chart';
import {SimpleDataTableOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';

import {computeCategoryDiffTable, computeGroupView} from './table_utils';

/** A category diff table data processor. */
export class CategoryDiffTableDataProcessor implements
    CustomChartDataProcessor {
  constructor(
      private readonly diffData: SimpleDataTableOrNull,
      private readonly filters: google.visualization.DataTableCellFilter[],
      private readonly gColumn: number, private readonly vColumn: number) {}

  process(dataProvider: ChartDataProvider): DataTableOrDataViewOrNull {
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
