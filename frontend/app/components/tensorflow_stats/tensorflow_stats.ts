import {Component} from '@angular/core';
import {Store} from '@ngrx/store';
import {IdleOption, OpExecutor, OpKind, OpType} from 'org_xprof/frontend/app/common/constants/enums';
import {TensorflowStatsData} from 'org_xprof/frontend/app/common/interfaces/data_table';
import * as selectors from 'org_xprof/frontend/app/store/tensorflow_stats/selectors';

const OP_NAME_INDEX = 3;
const MEASURED_FLOP_RATE_INDEX = 13;

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
  flopRateChartXColumn = OP_NAME_INDEX;
  flopRateChartYColumn = MEASURED_FLOP_RATE_INDEX;
  showModelProperties = false;
  showPprofLink = false;

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
