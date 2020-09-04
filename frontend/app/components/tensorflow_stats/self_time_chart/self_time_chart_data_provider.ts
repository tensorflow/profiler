import {OpExecutor, OpKind} from 'org_xprof/frontend/app/common/constants/enums';
import {DefaultDataProvider} from 'org_xprof/frontend/app/components/chart/default_data_provider';

/** A self time chart data provider. */
export class SelfTimeChartDataProvider extends DefaultDataProvider {
  opExecutor = OpExecutor.NONE;
  opKind = OpKind.NONE;

  process(): google.visualization.DataTable|google.visualization.DataView|null {
    if (!this.dataTable) {
      return null;
    }

    const numberFormatter =
        new google.visualization.NumberFormat({'fractionDigits': 0});
    let dataView = new google.visualization.DataView(this.dataTable);
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
      numberFormatter.format(this.dataTable, 7);
      dataView.setColumns([3, 7]);
    }

    return dataView;
  }
}
