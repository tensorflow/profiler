import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {Overview} from 'org_xprof/frontend/app/components/overview/overview';
import {OverviewModule} from 'org_xprof/frontend/app/components/overview/overview_module';
import {SideNavModule} from 'org_xprof/frontend/app/components/sidenav/sidenav_module';
import {TraceViewer} from 'org_xprof/frontend/app/components/trace_viewer/trace_viewer';
import {TraceViewerModule} from 'org_xprof/frontend/app/components/trace_viewer/trace_viewer_module';

import {MainPage} from './main_page';

/** The list of all routes available int the application. */
export const routes: Routes = [
  {path: 'overview', component: Overview},
  {path: 'trace-viewer', component: TraceViewer},
  {path: '**', component: Overview},
];

/** A main page module. */
@NgModule({
  declarations: [MainPage],
  imports: [
    SideNavModule,
    TraceViewerModule,
    OverviewModule,
    RouterModule.forRoot(routes),
  ],
  exports: [MainPage]
})
export class MainPageModule {
}
