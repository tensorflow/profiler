import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {DiagnosticsViewModule} from 'org_xprof/frontend/app/components/diagnostics_view/diagnostics_view_module';
import {InferenceLatencyChartModule} from 'org_xprof/frontend/app/components/overview_page/inference_latency_chart/inference_latency_chart_module';
import {NormalizedAcceleratorPerformanceViewModule} from 'org_xprof/frontend/app/components/overview_page/normalized_accelerator_performance_view/normalized_accelerator_performance_view_module';
import {PerformanceSummaryModule} from 'org_xprof/frontend/app/components/overview_page/performance_summary/performance_summary_module';
import {RecommendationResultViewModule} from 'org_xprof/frontend/app/components/overview_page/recommendation_result_view/recommendation_result_view_module';
import {RunEnvironmentViewModule} from 'org_xprof/frontend/app/components/overview_page/run_environment_view/run_environment_view_module';
import {StepTimeGraphModule} from 'org_xprof/frontend/app/components/overview_page/step_time_graph/step_time_graph_module';
import {TopOpsTableModule} from 'org_xprof/frontend/app/components/overview_page/top_ops_table/top_ops_table_module';

import {OverviewPage} from './overview_page';

/** An overview page module. */
@NgModule({
  declarations: [OverviewPage],
  imports: [
    CommonModule,
    DiagnosticsViewModule,
    PerformanceSummaryModule,
    RecommendationResultViewModule,
    RunEnvironmentViewModule,
    StepTimeGraphModule,
    TopOpsTableModule,
    NormalizedAcceleratorPerformanceViewModule,
    InferenceLatencyChartModule,
  ],
  exports: [OverviewPage]
})
export class OverviewPageModule {
}
