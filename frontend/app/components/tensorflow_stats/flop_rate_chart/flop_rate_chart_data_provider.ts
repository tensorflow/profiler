import {DefaultDataProvider} from 'org_xprof/frontend/app/components/chart/default_data_provider';

/** A flop rate chart data provider. */
export class FlopRateChartDataProvider extends DefaultDataProvider {
  process(): google.visualization.DataTable|google.visualization.DataView|null {
    if (!this.dataTable) {
      return null;
    }

    const numberFormatter =
        new google.visualization.NumberFormat({'fractionDigits': 1});
    numberFormatter.format(this.dataTable, 13);

    const dataView = new google.visualization.DataView(this.dataTable);
    dataView.setRows(dataView.getFilteredRows([{
      column: 13,
      minValue: 0.0000,
    }]));
    dataView.setColumns([3, 13]);

    return dataView;
  }
}
