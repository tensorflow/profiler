import {NgModule} from '@angular/core';
import {ChartModule} from 'org_xprof/frontend/app/components/chart/chart';

import {DeviceSideAnalysisDetail} from './device_side_analysis_detail';

@NgModule({
  declarations: [DeviceSideAnalysisDetail],
  imports: [ChartModule],
  exports: [DeviceSideAnalysisDetail],
})
export class DeviceSideAnalysisDetailModule {
}
