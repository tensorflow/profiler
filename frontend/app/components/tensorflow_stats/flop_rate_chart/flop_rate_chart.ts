import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {ChartDataInfo, DataType} from 'org_xprof/frontend/app/common/interfaces/chart';
import {TensorflowStatsDataOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';

import {FlopRateChartDataProvider} from './flop_rate_chart_data_provider';

/** A flop rate chart view component. */
@Component({
  selector: 'flop-rate-chart',
  templateUrl: './flop_rate_chart.ng.html',
  styleUrls: ['./flop_rate_chart.scss']
})
export class FlopRateChart implements OnChanges {
  /** The tensorflow stats data. */
  @Input() tensorflowStatsData: TensorflowStatsDataOrNull = null;

  dataInfo: ChartDataInfo = {
    data: null,
    type: DataType.DATA_TABLE,
    dataProvider: new FlopRateChartDataProvider(),
    options: {
      backgroundColor: 'transparent',
      width: 550,
      height: 200,
      chartArea: {
        left: 70,
        top: 10,
        width: '80%',
        height: '80%',
      },
      hAxis: {
        textPosition: 'none',
        title: 'TensorFlow Op on Device (in decreasing total self-time)',
      },
      vAxis: {title: 'GFLOPs/sec'},
      legend: {position: 'none'},
      tooltip: {
        isHtml: true,
        ignoreBounds: true,
      },
    },
  };

  ngOnChanges(changes: SimpleChanges) {
    this.dataInfo = {
      ...this.dataInfo,
      data: this.tensorflowStatsData,
    };
  }
}
