import {Component, Input, OnChanges, SimpleChanges} from '@angular/core';
import {OpExecutor, OpKind} from 'org_xprof/frontend/app/common/constants/enums';
import {ChartDataInfo, DataType} from 'org_xprof/frontend/app/common/interfaces/chart';
import {TensorflowStatsDataOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';

import {SelfTimeChartDataProvider} from './self_time_chart_data_provider';

/** A self-time chart view component. */
@Component({
  selector: 'self-time-chart',
  templateUrl: './self_time_chart.ng.html',
  styleUrls: ['./self_time_chart.scss']
})
export class SelfTimeChart implements OnChanges {
  /** The tensorflow stats data. */
  @Input() tensorflowStatsData: TensorflowStatsDataOrNull = null;

  /** The tensorflow stats data for diff. */
  @Input() diffData: TensorflowStatsDataOrNull = null;

  /** Whether to use diff. */
  @Input() hasDiff = false;

  /** The Op executor. */
  @Input() opExecutor: OpExecutor = OpExecutor.NONE;

  /** The Op kind. */
  @Input() opKind: OpKind = OpKind.NONE;

  title = '';
  dataProvider = new SelfTimeChartDataProvider();
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
    this.title =
        'ON ' + String(this.opExecutor).toUpperCase() + ': TOTAL SELF-TIME';
    if (this.opKind === OpKind.TYPE) {
      this.title += ' (GROUPED BY TYPE)';
    }
    this.dataProvider.hasDiff = this.hasDiff;
    if (this.hasDiff && this.diffData) {
      this.dataProvider.setDiffData(this.diffData);
    }
    this.dataProvider.opExecutor = this.opExecutor;
    this.dataProvider.opKind = this.opKind;
    this.dataInfo = {
      ...this.dataInfo,
      data: this.tensorflowStatsData,
    };
  }
}
