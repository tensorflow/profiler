import 'org_xprof/frontend/app/common/typing/google_visualization/google_visualization';
import {ChartDataInfo} from 'org_xprof/frontend/app/common/interfaces/chart';
import {DefaultDataProvider} from 'org_xprof/frontend/app/components/chart/default_data_provider';

/** A device side analysis detail data provider. */
export class DeviceSideAnalysisDetailDataProvider extends DefaultDataProvider {
  columnIds: string[] = [];

  setColumnIds(columnIds: string[]) {
    this.columnIds = columnIds;
  }

  setData(dataInfo: ChartDataInfo) {
    if (!dataInfo || !dataInfo.data || !dataInfo.type) {
      return;
    }

    const dataTable = new google.visualization.DataTable(dataInfo.data).clone();

    let i = 0;
    while (i < dataTable.getNumberOfColumns()) {
      if (!this.columnIds.includes(dataTable.getColumnId(i))) {
        dataTable.removeColumn(i);
        continue;
      }
      i++;
    }

    this.dataTable = dataTable;
  }
}
