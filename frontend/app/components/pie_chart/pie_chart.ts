import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ChartDataInfo, DataType} from 'org_xprof/frontend/app/common/interfaces/chart';
import {SimpleDataTableOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';

import {PieChartDataProvider} from './pie_chart_data_provider';

/** A pie chart view component. */
@Component({
  selector: 'pie-chart',
  templateUrl: './pie_chart.ng.html',
  styleUrls: ['./pie_chart.scss']
})
export class PieChart implements OnChanges {
  /** The input data. */
  @Input() data: SimpleDataTableOrNull = null;

  /** The data as diff base. */
  @Input() diffData: SimpleDataTableOrNull = null;

  /** Whether to use diff. */
  @Input() hasDiff = false;

  /** The title of the chart. */
  @Input() title: string = '';

  /** The description of the chart. */
  @Input() description: string = '';

  /** The column index to group the data. */
  @Input() gColumn: number = 0;

  /** The column index that has data value. */
  @Input() vColumn: number = 0;

  /** The filter to apply on the data table. */
  @Input() filters: google.visualization.DataTableCellFilter[] = [];

  dataProvider = new PieChartDataProvider();
  dataInfo: ChartDataInfo = {
    data: null,
    type: DataType.DATA_TABLE,
    dataProvider: this.dataProvider,
    options: {
      backgroundColor: 'transparent',
      width: 400,
      height: 200,
      chartArea: {
        left: 0,
        width: '100%',
        height: '80%',
      },
      legend: {textStyle: {fontSize: 10}},
      sliceVisibilityThreshold: 0.01,
    },
  };

  ngOnChanges(changes: SimpleChanges) {
    if (this.gColumn < 0 || this.vColumn < 0) {
      return;
    }
    this.dataProvider.hasDiff = this.hasDiff;
    if (this.hasDiff && this.diffData) {
      this.dataProvider.setDiffData(this.diffData);
    }
    this.dataProvider.gColumn = this.gColumn;
    this.dataProvider.vColumn = this.vColumn;
    this.dataInfo.filters = this.filters;
    this.dataInfo = {
      ...this.dataInfo,
      data: this.data,
    };
  }
}
