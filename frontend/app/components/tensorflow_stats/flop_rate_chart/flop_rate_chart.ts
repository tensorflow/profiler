import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ChartDataInfo, DataType} from 'org_xprof/frontend/app/common/interfaces/chart';
import {SimpleDataTableOrNull, TensorflowStatsDataOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';

import {FlopRateChartDataProvider} from './flop_rate_chart_data_provider';

/** A flop rate chart view component. */
@Component({
  selector: 'flop-rate-chart',
  templateUrl: './flop_rate_chart.ng.html',
  styleUrls: ['./flop_rate_chart.scss']
})
export class FlopRateChart implements OnChanges {
  /** The input data. */
  @Input() data: SimpleDataTableOrNull|TensorflowStatsDataOrNull = null;
  /** Index of the Column that corresponds to the x-axis. */
  @Input() xColumn: number = 0;
  /** Index of the Column that corresponds to the y-axis. */
  @Input() yColumn: number = 0;
  /** The type of the OP, e.g. TensorFlow. */
  @Input() opType: string = '';

  dataProvider = new FlopRateChartDataProvider();
  dataOptions: google.visualization.HistogramOptions = {
    backgroundColor: 'transparent',
    width: 550,
    height: 200,
    chartArea: {
      left: 70,
      top: 10,
      width: '80%',
      height: '80%',
    },
    hAxis: {textPosition: 'none'},
    vAxis: {title: 'GFLOPs/sec'},
    legend: {position: 'none'},
    tooltip: {
      isHtml: true,
      ignoreBounds: true,
    },
  };

  dataInfo: ChartDataInfo = {
    data: null,
    type: DataType.DATA_TABLE,
    dataProvider: this.dataProvider,
    options: this.dataOptions,
  };

  ngOnChanges(changes: SimpleChanges) {
    if (this.xColumn < 0 || this.yColumn < 0) {
      return;
    }
    this.dataProvider.xColumn = this.xColumn;
    this.dataProvider.yColumn = this.yColumn;
    this.dataOptions.hAxis!.title =
        this.opType + 'Op on Device (in decreasing total self-time)';
    this.dataInfo = {
      ...this.dataInfo,
      data: this.data,
    };
  }
}
