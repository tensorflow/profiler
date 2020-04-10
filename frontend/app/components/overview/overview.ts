import {Component, ElementRef} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {GeneralAnalysisOrNull, InputPipelineAnalysisOrNull, NormalizedAcceleratorPerformanceOrNull, OverviewDataTable, RecommendationResultOrNull, RunEnvironmentOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setLoadingStateAction} from 'org_xprof/frontend/app/store/actions';

const GENERAL_ANALYSIS_INDEX = 0;
const INPUT_PIPELINE_ANALYSIS_INDEX = 1;
const RUN_ENVIRONMENT_INDEX = 2;
const RECOMMENDATION_RESULT_INDEX = 3;
const NORMALIZED_ACCELERATOR_PERFORMANCE_INDEX = 5;

/** An overview page component. */
@Component({
  selector: 'overview',
  templateUrl: './overview.ng.html',
  styleUrls: ['./overview.css']
})
export class Overview {
  errorMessage: string = '';
  generalAnalysis: GeneralAnalysisOrNull = null;
  inputPipelineAnalysis: InputPipelineAnalysisOrNull = null;
  recommendationResult: RecommendationResultOrNull = null;
  runEnvironment: RunEnvironmentOrNull = null;
  normalizedAcceleratorPerformance: NormalizedAcceleratorPerformanceOrNull =
      null;

  constructor(
      route: ActivatedRoute, private readonly dataService: DataService,
      private readonly store: Store<{}>,
      private readonly elementRef: ElementRef) {
    route.params.subscribe(params => {
      this.update(params as NavigationEvent);
    });
  }

  update(event: NavigationEvent) {
    const run = event.run || '';
    const tag = event.tag || 'overview_page';
    const host = event.host || '';

    this.store.dispatch(setLoadingStateAction({
      loadingState: {
        loading: true,
        message: 'Loading data',
      }
    }));

    this.errorMessage = '';
    this.dataService.getData(run, tag, host).subscribe(data => {
      this.store.dispatch(setLoadingStateAction({
        loadingState: {
          loading: false,
          message: '',
        }
      }));

      data = (data || []) as OverviewDataTable[];
      this.generalAnalysis =
          data[GENERAL_ANALYSIS_INDEX] as GeneralAnalysisOrNull;
      this.inputPipelineAnalysis =
          data[INPUT_PIPELINE_ANALYSIS_INDEX] as InputPipelineAnalysisOrNull;
      this.runEnvironment = data[RUN_ENVIRONMENT_INDEX] as RunEnvironmentOrNull;
      if (this.runEnvironment && this.runEnvironment.p) {
        this.errorMessage = this.runEnvironment.p.error_message || '';
      }
      this.recommendationResult =
          data[RECOMMENDATION_RESULT_INDEX] as RecommendationResultOrNull;
      this.normalizedAcceleratorPerformance =
          data[NORMALIZED_ACCELERATOR_PERFORMANCE_INDEX] as
          NormalizedAcceleratorPerformanceOrNull;
      this.updateStyle();
    });
  }

  updateStyle() {
    if (!this.elementRef) {
      setTimeout(() => {
        this.updateStyle();
      }, 100);
      return;
    }

    this.recommendationResult = this.recommendationResult || {};
    this.recommendationResult.p = this.recommendationResult.p || {};
    const statement = this.recommendationResult.p.statement || '';
    let color = 'green';
    if (statement.includes('HIGHLY')) {
      color = 'red';
    } else if (statement.includes('MODERATE')) {
      color = 'orange';
    }
    this.elementRef.nativeElement.style.setProperty('--summary-color', color);
  }
}

