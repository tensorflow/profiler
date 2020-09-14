import 'org_xprof/frontend/app/common/typing/google_visualization/google_visualization';

import {SimpleDataTableOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {DefaultDataProvider} from 'org_xprof/frontend/app/components/chart/default_data_provider';
import {computeCategoryDiffTable} from 'org_xprof/frontend/app/components/chart/table_utils';

/** A pie chart data provider. */
export class PieChartDataProvider extends DefaultDataProvider {
  diffTable?: google.visualization.DataTable;
  hasDiff = false;
  /** The column index to group the data. */
  gColumn: number = 0;
  /** The column index that has data value. */
  vColumn: number = 0;

  setDiffData(diffData: SimpleDataTableOrNull) {
    this.diffTable =
        diffData ? new google.visualization.DataTable(diffData) : undefined;
  }

  process(): google.visualization.DataTable|google.visualization.DataView|null {
    if (!this.dataTable || !this.chart) {
      return null;
    }

    if (!this.hasDiff || !this.diffTable) {
      return this.makeGroupView(this.dataTable);
    }

    return computeCategoryDiffTable(
        this.makeGroupView(this.dataTable), this.makeGroupView(this.diffTable),
        this.chart);
  }

  makeGroupView(dataTable: google.visualization.DataTable):
      google.visualization.DataView {
    const numberFormatter =
        new google.visualization.NumberFormat({'fractionDigits': 0});
    const dataView = new google.visualization.DataView(dataTable);

    if (this.filters && this.filters.length > 0) {
      dataView.setRows(dataView.getFilteredRows(this.filters));
    }

    const dataGroup = new google.visualization.data.group(
        dataView, [this.gColumn], [{
          'column': this.vColumn,
          'aggregation': google.visualization.data.sum,
          'type': 'number',
        }]);
    dataGroup.sort({column: 1, desc: true});
    numberFormatter.format(dataGroup, 1);
    return new google.visualization.DataView(dataGroup);
  }
}
