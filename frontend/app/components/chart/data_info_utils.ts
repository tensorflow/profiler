import 'org_xprof/frontend/app/common/typing/google_visualization/google_visualization';

import {ChartDataInfo, ChartDataProvider, CustomChartDataProcessor} from 'org_xprof/frontend/app/common/interfaces/chart';
import {SimpleDataTableOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';

import {CategoryDiffTableDataProcessor} from './category_diff_table_data_processor';
import {CategoryTableDataProcessor} from './category_table_data_processor';
import {PIE_CHART_OPTIONS} from './chart_options';
import {DefaultDataProvider} from './default_data_provider';

function createDataProcessor(
    gColumn: number, vColumn: number,
    filters: google.visualization.DataTableCellFilter[],
    diffData: SimpleDataTableOrNull): CustomChartDataProcessor {
  return diffData ?
      new CategoryDiffTableDataProcessor(diffData, filters, gColumn, vColumn) :
      new CategoryTableDataProcessor(filters, gColumn, vColumn);
}

/** Create default data info for pie chart. */
export function createPieChartDataInfo(
    gColumn: number, vColumn: number,
    filters: google.visualization.DataTableCellFilter[],
    diffData: SimpleDataTableOrNull,
    dataProvider: ChartDataProvider|null): ChartDataInfo {
  return {
    data: null,
    dataProvider: dataProvider || new DefaultDataProvider(),
    options: PIE_CHART_OPTIONS,
    customChartDataProcessor:
        createDataProcessor(gColumn, vColumn, filters, diffData),
  };
}

/** Create default data info for pie chart. */
export function updatePieChartDataInfo(
    info: ChartDataInfo, gColumn: number, vColumn: number,
    filters: google.visualization.DataTableCellFilter[],
    diffData: SimpleDataTableOrNull) {
  if (!info) {
    return;
  }
  info.customChartDataProcessor =
      createDataProcessor(gColumn, vColumn, filters, diffData);
}
