import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatOptionModule} from '@angular/material/core';
import {MatLegacyProgressBarModule} from '@angular/material/legacy-progress-bar';
import {MatSidenavModule} from '@angular/material/sidenav';
import {DiagnosticsViewModule} from 'org_xprof/frontend/app/components/diagnostics_view/diagnostics_view_module';
import {GraphConfigModule} from 'org_xprof/frontend/app/components/graph_viewer/graph_config/graph_config_module';
import {PipesModule} from 'org_xprof/frontend/app/pipes/pipes_module';

import {GraphViewer} from './graph_viewer';

@NgModule({
  imports: [
    CommonModule,
    DiagnosticsViewModule,
    MatOptionModule,
    MatLegacyProgressBarModule,
    MatSidenavModule,
    PipesModule,
    GraphConfigModule,
  ],
  declarations: [GraphViewer],
  exports: [GraphViewer]
})
export class GraphViewerModule {
}
