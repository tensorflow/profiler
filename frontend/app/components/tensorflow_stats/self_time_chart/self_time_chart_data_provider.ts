import 'org_xprof/frontend/app/common/typing/google_visualization/google_visualization';
import {OpExecutor, OpKind} from 'org_xprof/frontend/app/common/constants/enums';
import {TensorflowStatsDataOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {DefaultDataProvider} from 'org_xprof/frontend/app/components/chart/default_data_provider';
import {computeCategoryDiffTable} from 'org_xprof/frontend/app/components/chart/table_utils';

/** A self time chart data provider. */
export class SelfTimeChartDataProvider extends DefaultDataProvider {
  diffTable?: google.visualization.DataTable;
  hasDiff = false;
  opExecutor = OpExecutor.NONE;
  opKind = OpKind.NONE;

  setDiffData(diffData: TensorflowStatsDataOrNull) {
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
    let dataView = new google.visualization.DataView(dataTable);
    dataView.setRows(dataView.getFilteredRows([{
      column: 1,
      value: this.opExecutor,
    }]));

    if (this.opKind === OpKind.TYPE) {
      const dataGroup = new google.visualization.data.group(
          dataView, [2], [{
            'column': 7,
            'aggregation': google.visualization.data.sum,
            'type': 'number',
          }]);
      dataGroup.sort({column: 1, desc: true});
      numberFormatter.format(dataGroup, 1);
      dataView = new google.visualization.DataView(dataGroup);
    } else {
      numberFormatter.format(dataTable, 7);
      dataView.setColumns([3, 7]);
    }

    return dataView;
  }
}
