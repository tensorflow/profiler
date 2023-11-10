import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatToolbarModule} from '@angular/material/toolbar';
import {RouterModule, Routes} from '@angular/router';
import {DcnCollectiveStats} from 'org_xprof/frontend/app/components/dcn_collective_stats/dcn_collective_stats';
import {DcnCollectiveStatsModule} from 'org_xprof/frontend/app/components/dcn_collective_stats/dcn_collective_stats_module';
import {EmptyPage} from 'org_xprof/frontend/app/components/empty_page/empty_page';
import {EmptyPageModule} from 'org_xprof/frontend/app/components/empty_page/empty_page_module';
import {GraphViewer} from 'org_xprof/frontend/app/components/graph_viewer/graph_viewer';
import {GraphViewerModule} from 'org_xprof/frontend/app/components/graph_viewer/graph_viewer_module';
import {InputPipeline} from 'org_xprof/frontend/app/components/input_pipeline/input_pipeline';
import {InputPipelineModule} from 'org_xprof/frontend/app/components/input_pipeline/input_pipeline_module';
import {KernelStatsAdapter, KernelStatsAdapterModule} from 'org_xprof/frontend/app/components/kernel_stats/kernel_stats_adapter';
import {MemoryProfile} from 'org_xprof/frontend/app/components/memory_profile/memory_profile';
import {MemoryProfileModule} from 'org_xprof/frontend/app/components/memory_profile/memory_profile_module';
import {MemoryViewer} from 'org_xprof/frontend/app/components/memory_viewer/memory_viewer';
import {MemoryViewerModule} from 'org_xprof/frontend/app/components/memory_viewer/memory_viewer_module';
import {OpProfile} from 'org_xprof/frontend/app/components/op_profile/op_profile';
import {OpProfileModule} from 'org_xprof/frontend/app/components/op_profile/op_profile_module';
import {Overview} from 'org_xprof/frontend/app/components/overview/overview';
import {OverviewModule} from 'org_xprof/frontend/app/components/overview/overview_module';
import {PodViewer} from 'org_xprof/frontend/app/components/pod_viewer/pod_viewer';
import {PodViewerModule} from 'org_xprof/frontend/app/components/pod_viewer/pod_viewer_module';
import {SideNavModule} from 'org_xprof/frontend/app/components/sidenav/sidenav_module';
import {TensorflowStatsAdapter, TensorflowStatsAdapterModule} from 'org_xprof/frontend/app/components/tensorflow_stats/tensorflow_stats_adapter';
import {TfDataBottleneckAnalysis} from 'org_xprof/frontend/app/components/tf_data_bottleneck_analysis/tf_data_bottleneck_analysis';
import {TfDataBottleneckAnalysisModule} from 'org_xprof/frontend/app/components/tf_data_bottleneck_analysis/tf_data_bottleneck_analysis_module';
import {TraceViewer} from 'org_xprof/frontend/app/components/trace_viewer/trace_viewer';
import {TraceViewerModule} from 'org_xprof/frontend/app/components/trace_viewer/trace_viewer_module';

import {MainPage} from './main_page';

/** The list of all routes available in the application. */
export const routes: Routes = [
  {path: 'empty', component: EmptyPage},
  {path: 'overview_page', component: Overview},
  {path: 'overview_page@', component: Overview},
  {path: 'overview_page^', component: Overview},
  {path: 'input_pipeline_analyzer', component: InputPipeline},
  {path: 'input_pipeline_analyzer@', component: InputPipeline},
  {path: 'input_pipeline_analyzer^', component: InputPipeline},
  {path: 'kernel_stats', component: KernelStatsAdapter},
  {path: 'kernel_stats^', component: KernelStatsAdapter},
  {path: 'memory_profile#', component: MemoryProfile},
  {path: 'memory_profile^', component: MemoryProfile},
  {path: 'memory_viewer', component: MemoryViewer},
  {path: 'memory_viewer^', component: MemoryViewer},
  {path: 'op_profile', component: OpProfile},
  {path: 'op_profile^', component: OpProfile},
  {path: 'pod_viewer', component: PodViewer},
  {path: 'pod_viewer^', component: PodViewer},
  {path: 'tf_data_bottleneck_analysis^', component: TfDataBottleneckAnalysis},
  {path: 'tensorflow_stats', component: TensorflowStatsAdapter},
  {path: 'tensorflow_stats^', component: TensorflowStatsAdapter},
  {path: 'trace_viewer', component: TraceViewer},
  {path: 'trace_viewer#', component: TraceViewer},
  {path: 'trace_viewer@^', component: TraceViewer},
  {path: 'trace_viewer^', component: TraceViewer},
  {path: 'graph_viewer^', component: GraphViewer},
  {path: 'dcn_collective_stats^', component: DcnCollectiveStats},
  {path: '**', component: EmptyPage},
];

/** A main page module. */
@NgModule({
  declarations: [MainPage],
  imports: [
    CommonModule,
    MatProgressBarModule,
    MatSidenavModule,
    MatToolbarModule,
    MatIconModule,
    EmptyPageModule,
    SideNavModule,
    TraceViewerModule,
    OverviewModule,
    InputPipelineModule,
    KernelStatsAdapterModule,
    MemoryProfileModule,
    MemoryViewerModule,
    OpProfileModule,
    PodViewerModule,
    GraphViewerModule,
    TfDataBottleneckAnalysisModule,
    TensorflowStatsAdapterModule,
    DcnCollectiveStatsModule,
    RouterModule.forRoot(routes),
  ],
  exports: [MainPage]
})
export class MainPageModule {
}
