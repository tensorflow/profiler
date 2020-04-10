import {Component, Input} from '@angular/core';

import {GeneralAnalysis, InputPipelineAnalysis} from 'org_xprof/frontend/app/common/interfaces/data_table';

/** A performance summary view component. */
@Component({
  selector: 'performance-summary',
  templateUrl: './performance_summary.ng.html',
  styleUrls: ['./performance_summary.scss']
})
export class PerformanceSummary {
  /** The general anaysis data. */
  @Input()
  set generalAnalysis(analysis: GeneralAnalysis|null) {
    analysis = analysis || {};
    analysis.p = analysis.p || {};
    this.deviceIdleTimePercent = analysis.p.device_idle_time_percent || '';
    this.hostIdleTimePercent = analysis.p.host_idle_time_percent || '';
    this.mxuUtilizationPercent = analysis.p.mxu_utilization_percent || '';
    this.flopRateUtilizationRelativeToRoofline =
        analysis.p.flop_rate_utilization_relative_to_roofline || '';
    this.memoryBwUtilizationRelativeToHwLimit =
        analysis.p.memory_bw_utilization_relative_to_hw_limit || '';
    this.deviceCompute16bitPercent =
        analysis.p.device_compute_16bit_percent || '';
    this.deviceCompute32bitPercent =
        analysis.p.device_compute_32bit_percent || '';
    this.remarkText = analysis.p.remark_text || '';
    this.remarkColor = analysis.p.remark_color || '';
  }

  /** The input pipeline analyis data. */
  @Input()
  set inputPipelineAnalysis(analysis: InputPipelineAnalysis|null) {
    analysis = analysis || {};
    analysis.p = analysis.p || {};
    this.isTpu = (analysis.p.hardware_type || 'TPU') === 'TPU';
    this.computeMsAverage = analysis.p.compute_ms_average || '';
    this.idleMsAverage = analysis.p.idle_ms_average || '';
    this.inputMsAverage = analysis.p.input_ms_average || '';
    this.steptimeMsAverage = analysis.p.steptime_ms_average || '';
    this.steptimeMsStddev = analysis.p.steptime_ms_standard_deviation || '';
    this.otherTimeMsAvg = analysis.p.other_time_ms_avg || '';
    this.otherTimeMsSdv = analysis.p.other_time_ms_sdv || '';
    this.compileTimeMsAvg = analysis.p.compile_time_ms_avg || '';
    this.compileTimeMsSdv = analysis.p.compile_time_ms_sdv || '';
    this.outfeedTimeMsAvg = analysis.p.outfeed_time_ms_avg || '';
    this.outfeedTimeMsSdv = analysis.p.outfeed_time_ms_sdv || '';
    this.infeedTimeMsAvg = analysis.p.infeed_time_ms_avg || '';
    this.infeedTimeMsSdv = analysis.p.infeed_time_ms_sdv || '';
    this.kernelLaunchTimeMsAvg = analysis.p.kernel_launch_time_ms_avg || '';
    this.kernelLaunchTimeMsSdv = analysis.p.kernel_launch_time_ms_sdv || '';
    this.hostComputeTimeMsAvg = analysis.p.host_compute_time_ms_avg || '';
    this.hostComputeTimeMsSdv = analysis.p.host_compute_time_ms_sdv || '';
    this.deviceToDeviceTimeMsAvg =
        analysis.p.device_to_device_time_ms_avg || '';
    this.deviceToDeviceTimeMsSdv =
        analysis.p.device_to_device_time_ms_sdv || '';
    this.deviceComputeTimeMsAvg = analysis.p.device_compute_time_ms_avg || '';
    this.deviceComputeTimeMsSdv = analysis.p.device_compute_time_ms_sdv || '';
  }

  title = 'Performance Summary';
  isTpu = true;
  computeMsAverage = '';
  idleMsAverage = '';
  inputMsAverage = '';
  deviceIdleTimePercent = '';
  hostIdleTimePercent = '';
  mxuUtilizationPercent = '';
  flopRateUtilizationRelativeToRoofline = '';
  memoryBwUtilizationRelativeToHwLimit = '';
  deviceCompute16bitPercent = '';
  deviceCompute32bitPercent = '';
  remarkText = '';
  remarkColor = '';
  steptimeMsAverage = '';
  steptimeMsStddev = '';
  otherTimeMsAvg = '';
  otherTimeMsSdv = '';
  compileTimeMsAvg = '';
  compileTimeMsSdv = '';
  outfeedTimeMsAvg = '';
  outfeedTimeMsSdv = '';
  infeedTimeMsAvg = '';
  infeedTimeMsSdv = '';
  kernelLaunchTimeMsAvg = '';
  kernelLaunchTimeMsSdv = '';
  hostComputeTimeMsAvg = '';
  hostComputeTimeMsSdv = '';
  deviceToDeviceTimeMsAvg = '';
  deviceToDeviceTimeMsSdv = '';
  deviceComputeTimeMsAvg = '';
  deviceComputeTimeMsSdv = '';
  flopsUtilizationTooltipMessage =
      'The first number shows the hardware utilization based on the hardware performance counter. The second one shows the performance compared to the program\'s optimal performance considering the instruction mix (i.e., the ratio of floating-point operations and memory operations).';
}
