import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {InputPipelineDataTable, InputPipelineDeviceAnalysisOrNull, InputPipelineHostAnalysisOrNull, SimpleDataTableOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setLoadingStateAction} from 'org_xprof/frontend/app/store/actions';

const COLUMN_ID_DEVICE_ANALYSIS = 'stepnum';
const COLUMN_ID_HOST_ANALYSIS = 'opName';
const COLUMN_ID_RECOMMENDATION = 'link';
const PROPERTIES_DEVICE_ANALYSIS = [
  'infeed_percent_average',
  'infeed_percent_maximum',
  'infeed_percent_minimum',
  'infeed_percent_standard_deviation',
  'steptime_ms_average',
  'steptime_ms_maximum',
  'steptime_ms_minimum',
  'steptime_ms_standard_deviation',
  'summary_conclusion',
  'summary_nextstep',
];
const PROPERTIES_HOST_ANALYSIS = [
  'advanced_file_read_us',
  'demanded_file_read_us',
  'enqueue_us',
  'preprocessing_us',
  'unclassified_nonequeue_us',
];

/** An input pipeline component. */
@Component({
  selector: 'input-pipeline',
  templateUrl: './input_pipeline.ng.html',
  styleUrls: ['./input_pipeline.css']
})
export class InputPipeline {
  deviceAnalysis: InputPipelineDeviceAnalysisOrNull = null;
  hostAnalysis: InputPipelineHostAnalysisOrNull = null;
  recommendation: SimpleDataTableOrNull = null;
  hasDiviceAanlysisRows = true;

  constructor(
      route: ActivatedRoute, private readonly dataService: DataService,
      private readonly store: Store<{}>) {
    route.params.subscribe(params => {
      this.update(params as NavigationEvent);
    });
  }

  private findAnalysisData(
      data: InputPipelineDataTable[], columnId: string,
      properties: string[] = []): InputPipelineDeviceAnalysisOrNull
      |InputPipelineHostAnalysisOrNull|SimpleDataTableOrNull {
    if (!data) {
      return {};
    }
    for (let i = 0; i < data.length; i++) {
      const analysis = data[i];
      if (!analysis) {
        continue;
      }
      if (analysis.cols) {
        const foundCols = analysis.cols.find(column => column.id === columnId);
        if (!!foundCols) {
          return analysis;
        }
      }
      if (analysis['p']) {
        const foundProperties =
            Object.keys(analysis['p'])
                .find(property => properties.includes(property));
        if (!!foundProperties) {
          return analysis;
        }
      }
    }
    return {};
  }

  update(event: NavigationEvent) {
    const run = event.run || '';
    const tag = event.tag || 'input_pipeline_analyzer';
    const host = event.host || '';

    this.store.dispatch(setLoadingStateAction({
      loadingState: {
        loading: true,
        message: 'Loading data',
      }
    }));

    this.dataService.getData(run, tag, host)
        .subscribe(data => {
          this.store.dispatch(setLoadingStateAction({
            loadingState: {
              loading: false,
              message: '',
            }
          }));

          data = (data || []) as InputPipelineDataTable[];
          this.deviceAnalysis = this.findAnalysisData(
                                    data, COLUMN_ID_DEVICE_ANALYSIS,
                                    PROPERTIES_DEVICE_ANALYSIS) as
              InputPipelineDeviceAnalysisOrNull;
          this.hostAnalysis =
              this.findAnalysisData(
                  data, COLUMN_ID_HOST_ANALYSIS, PROPERTIES_HOST_ANALYSIS) as
              InputPipelineHostAnalysisOrNull;
          this.recommendation =
              this.findAnalysisData(data, COLUMN_ID_RECOMMENDATION) as
              SimpleDataTableOrNull;
          this.updateHasDeviceAanlysisRows();
        });
  }

  updateHasDeviceAanlysisRows() {
    const analysis = this.deviceAnalysis || {};
    analysis.p = analysis.p || {};
    this.hasDiviceAanlysisRows = !!analysis.rows && analysis.rows.length > 0;
  }
}
