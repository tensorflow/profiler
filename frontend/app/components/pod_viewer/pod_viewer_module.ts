import {NgModule} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatSliderModule} from '@angular/material/slider';

import {ErrorMsgModule} from 'org_xprof/frontend/app/components/error_msg/error_msg_module';
import {PodViewer} from './pod_viewer';
import {StackBarChartModule} from './stack_bar_chart/stack_bar_chart_module';
import {TopologyGraphModule} from './topology_graph/topology_graph_module';

/** A pod viewer module. */
@NgModule({
  declarations: [PodViewer],
  imports: [
    ErrorMsgModule,
    MatDividerModule,
    MatSliderModule,
    StackBarChartModule,
    TopologyGraphModule,
  ],
  exports: [PodViewer]
})
export class PodViewerModule {
}
