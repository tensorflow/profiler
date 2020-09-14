import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatExpansionModule} from '@angular/material/expansion';
import {ChartModule} from 'org_xprof/frontend/app/components/chart/chart';

import {HostSideAnalysisDetail} from './host_side_analysis_detail';

@NgModule({
  declarations: [HostSideAnalysisDetail],
  imports: [
    CommonModule,
    MatExpansionModule,
    ChartModule,
  ],
  exports: [HostSideAnalysisDetail]
})
export class HostSideAnalysisDetailModule {
}
