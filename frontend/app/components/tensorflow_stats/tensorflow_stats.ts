import 'org_xprof/frontend/app/common/typing/google_visualization/google_visualization';
import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {IdleOption, OpExecutor, OpKind, OpType} from 'org_xprof/frontend/app/common/constants/enums';
import {TensorflowStatsData} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {createPieChartDataInfo, updatePieChartDataInfo} from 'org_xprof/frontend/app/components/chart/data_info_utils';
import {DefaultDataProvider} from 'org_xprof/frontend/app/components/chart/default_data_provider';
import * as selectors from 'org_xprof/frontend/app/store/tensorflow_stats/selectors';

const OP_EXECUTOR_ID = 'host_or_device';
const OP_TYPE_ID = 'type';
const OP_NAME_ID = 'operation';
const SELF_TIME_ID = 'total_self_time';
const MEASURED_FLOP_RATE_ID = 'measured_flop_rate';

/** A TensorFlow Stats component. */
@Component({
  selector: 'tensorflow-stats',
  templateUrl: './tensorflow_stats.ng.html',
  styleUrls: ['./tensorflow_stats.css']
})
export class TensorflowStats {
  data: TensorflowStatsData[]|null = null;
  diffData: TensorflowStatsData[]|null = null;
  selectedData: TensorflowStatsData|null = null;
  selectedDiffData: TensorflowStatsData|null = null;
  idleMenuButtonLabel = IdleOption.NO;
  idleOptionItems = [IdleOption.YES, IdleOption.NO];
  opExecutorDevice = OpExecutor.DEVICE;
  opExecutorHost = OpExecutor.HOST;
  opKindName = OpKind.NAME;
  opKindType = OpKind.TYPE;
  opType = OpType.TENSORFLOW;
  title = '';
  architecture = '';
  task = '';
  devicePprofLink = '';
  hostPprofLink = '';
  hasDeviceData = false;
  hasDiff = false;
  showFlopRateChart = false;
  flopRateChartXColumn = -1;
  flopRateChartYColumn = -1;
  showModelProperties = false;
  showPprofLink = false;
  dataProvider = new DefaultDataProvider();
  dataInfoDeviceByType =
      createPieChartDataInfo(-1, -1, [], null, this.dataProvider);
  dataInfoDeviceByName =
      createPieChartDataInfo(-1, -1, [], null, this.dataProvider);
  dataInfoHostByType =
      createPieChartDataInfo(-1, -1, [], null, this.dataProvider);
  dataInfoHostByName =
      createPieChartDataInfo(-1, -1, [], null, this.dataProvider);

  constructor(private readonly store: Store<{}>) {
    this.store.select(selectors.getTitleState).subscribe((title: string) => {
      this.title = title || '';
    });
    this.store.select(selectors.getHasDiffState).subscribe(hasDiff => {
      this.hasDiff = Boolean(hasDiff);
    });
    this.store.select(selectors.getShowFlopRateChartState)
        .subscribe(showFlopRateChart => {
          this.showFlopRateChart = Boolean(showFlopRateChart);
        });
    this.store.select(selectors.getShowModelPropertiesState)
        .subscribe(showModelProperties => {
          this.showModelProperties = Boolean(showModelProperties);
        });
    this.store.select(selectors.getShowPprofLinkState)
        .subscribe(showPprofLink => {
          this.showPprofLink = Boolean(showPprofLink);
        });
    this.store.select(selectors.getDiffDataState)
        .subscribe((diffData: TensorflowStatsData[]) => {
          this.diffData = (diffData || []);
          this.setIdleOption();
        });
    this.store.select(selectors.getDataState)
        .subscribe((data: TensorflowStatsData[]) => {
          this.data = (data || []);
          this.setIdleOption();
        });
  }

  setIdleOption(option: IdleOption = IdleOption.NO) {
    this.idleMenuButtonLabel = option;
    if ((!this.data || this.data.length === 0) ||
        (this.hasDiff && (!this.diffData || this.diffData.length === 0))) {
      this.selectedData = null;
      this.selectedDiffData = null;
      return;
    }

    if (option === IdleOption.YES) {
      this.selectedData = this.data[0] || null;
      if (this.hasDiff && this.diffData) {
        this.selectedDiffData = this.diffData[0] || null;
      }
    } else {
      this.selectedData = this.data[1] || null;
      if (this.hasDiff && this.diffData) {
        this.selectedDiffData = this.diffData[1] || null;
      }
    }

    // Four charts share one DataProvider. In order to prevent DataTable from
    // being created 4 times, it calls DataProvider function directly.
    this.dataProvider.setData({
      ...this.dataInfoDeviceByType,
      data: this.selectedData,
    });

    const dataTableExt =
        this.dataProvider.getDataTable() as google.visualization.DataTableExt;
    let opTypeIndex = -1;
    let opNameIndex = -1;
    let selfTimeIndex = -1;
    let opExecutorIndex = -1;
    if (dataTableExt && dataTableExt.getColumnIndex) {
      this.flopRateChartXColumn = dataTableExt.getColumnIndex(OP_NAME_ID);
      this.flopRateChartYColumn =
          dataTableExt.getColumnIndex(MEASURED_FLOP_RATE_ID);
      opTypeIndex = dataTableExt.getColumnIndex(OP_TYPE_ID);
      opNameIndex = dataTableExt.getColumnIndex(OP_NAME_ID);
      selfTimeIndex = dataTableExt.getColumnIndex(SELF_TIME_ID);
      opExecutorIndex = dataTableExt.getColumnIndex(OP_EXECUTOR_ID);
    }

    const filtersForDevice =
        [{column: opExecutorIndex, value: OpExecutor.DEVICE}];
    const filtersForHost = [{column: opExecutorIndex, value: OpExecutor.HOST}];

    updatePieChartDataInfo(
        this.dataInfoDeviceByType, opTypeIndex, selfTimeIndex, filtersForDevice,
        this.selectedDiffData);
    updatePieChartDataInfo(
        this.dataInfoDeviceByName, opNameIndex, selfTimeIndex, filtersForDevice,
        null);
    updatePieChartDataInfo(
        this.dataInfoHostByType, opTypeIndex, selfTimeIndex, filtersForHost,
        this.selectedDiffData);
    updatePieChartDataInfo(
        this.dataInfoHostByName, opNameIndex, selfTimeIndex, filtersForHost,
        null);

    // Since the DataInfo has not been updated, the notifyCharts function is
    // called to redraw the graph.
    this.dataProvider.notifyCharts();

    if (this.selectedData && this.selectedData.p) {
      this.architecture = this.selectedData.p.architecture_type || '';
      this.task = this.selectedData.p.task_type || '';
      this.devicePprofLink = this.selectedData.p.device_tf_pprof_link || '';
      this.hostPprofLink = this.selectedData.p.host_tf_pprof_link || '';
    }
    this.hasDeviceData = false;
    if (this.selectedData && this.selectedData.rows) {
      this.hasDeviceData = !!this.selectedData.rows.find(row => {
        return row && row.c && row.c[1] && row.c[1].v === OpExecutor.DEVICE;
      });
    }
  }
}
