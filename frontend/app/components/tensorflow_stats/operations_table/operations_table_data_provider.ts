import {OpExecutor} from 'org_xprof/frontend/app/common/constants/enums';
import {ChartOptions} from 'org_xprof/frontend/app/common/interfaces/chart';
import {DefaultDataProvider} from 'org_xprof/frontend/app/components/chart/default_data_provider';

const MINIMUM_ROWS = 20;

/** A operations table data provider. */
export class OperationsTableDataProvider extends DefaultDataProvider {
  opExecutor = OpExecutor.NONE;
  options = {
    allowHtml: true,
    alternatingRowStyle: false,
    showRowNumber: false,
    width: '100%',
    height: '600px',
    cssClassNames: {
      'headerCell': 'google-chart-table-header-cell',
      'tableCell': 'google-chart-table-table-cell',
    },
  };

  process(): google.visualization.DataTable|google.visualization.DataView|null {
    if (!this.dataTable ||
        (this.opExecutor !== OpExecutor.DEVICE &&
         this.opExecutor !== OpExecutor.HOST)) {
      return null;
    }


    const dataView = this.opExecutor === OpExecutor.DEVICE ?
        this.makeDataViewForDevice() :
        this.makeDataViewForHost();

    if (!dataView) {
      return null;
    }

    this.options.height =
        dataView.getNumberOfRows() < MINIMUM_ROWS ? '' : '600px';

    return dataView;
  }

  getOptions(): ChartOptions|null {
    return this.options;
  }

  makeDataViewForDevice(): google.visualization.DataView|null {
    if (!this.dataTable || this.opExecutor !== OpExecutor.DEVICE) {
      return null;
    }

    let dataView = new google.visualization.DataView(this.dataTable);
    dataView.setRows(dataView.getFilteredRows([{
      'column': 1,
      'value': 'Device',
    }]));

    /**
     * column 0: type
     * column 1: occurrences
     * column 2: self_time
     * column 3: self_time_on_device
     */
    dataView.setColumns([
      2,
      4,
      7,
      9,
    ]);

    /**
     * column 0: type
     * column 1: sum of occurrences
     * column 2: sum of self_time
     * column 3: sum of self_time_on_device
     */
    const dataTable = new google.visualization.data.group(dataView, [0], [
      {
        'column': 1,
        'aggregation': google.visualization.data.sum,
        'type': 'number',
      },
      {
        'column': 2,
        'aggregation': google.visualization.data.sum,
        'type': 'number',
      },
      {
        'column': 3,
        'aggregation': google.visualization.data.sum,
        'type': 'number',
      },
    ]);
    dataTable.sort({
      'column': 2,
      'desc': true,
    });
    const decimalFormatter =
        new google.visualization.NumberFormat({'fractionDigits': 0});
    decimalFormatter.format(dataTable, 2);
    const percentFormatter =
        new google.visualization.NumberFormat({pattern: '##.#%'});
    percentFormatter.format(dataTable, 3);

    dataView = new google.visualization.DataView(dataTable);
    /**
     * column 0: type
     * column 1: sum of occurrences
     * column 2: sum of self_time
     * column 3: sum of self_time_on_device
     */
    dataView.setColumns([
      0,
      1,
      2,
      3,
    ]);

    return dataView;
  }

  makeDataViewForHost(): google.visualization.DataView|null {
    if (!this.dataTable || this.opExecutor !== OpExecutor.HOST) {
      return null;
    }

    const dataView = new google.visualization.DataView(this.dataTable);
    dataView.setRows(dataView.getFilteredRows([{
      'column': 1,
      'value': 'Host',
    }]));

    /**
     * column 0: type
     * column 1: occurrences
     * column 2: self_time
     * column 3: self_time_on_host
     */
    dataView.setColumns([2, 4, 7, 11]);

    /**
     * column 0: type
     * column 1: sum of occurrences
     * column 2: sum of self_time
     * column 3: sum of self_time_on_host
     */
    const dataTable = new google.visualization.data.group(dataView, [0], [
      {
        'column': 1,
        'aggregation': google.visualization.data.sum,
        'type': 'number',
      },
      {
        'column': 2,
        'aggregation': google.visualization.data.sum,
        'type': 'number',
      },
      {
        'column': 3,
        'aggregation': google.visualization.data.sum,
        'type': 'number',
      },
    ]);
    dataTable.sort({
      'column': 2,
      'desc': true,
    });
    const decimalFormatter =
        new google.visualization.NumberFormat({'fractionDigits': 0});
    decimalFormatter.format(dataTable, 2);
    const percentFormatter =
        new google.visualization.NumberFormat({pattern: '##.#%'});
    percentFormatter.format(dataTable, 3);

    return new google.visualization.DataView(dataTable);
  }
}
