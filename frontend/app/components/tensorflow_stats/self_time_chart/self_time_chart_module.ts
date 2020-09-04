import {NgModule} from '@angular/core';
import {ChartModule} from 'org_xprof/frontend/app/components/chart/chart';

import {SelfTimeChart} from './self_time_chart';

@NgModule({
  declarations: [SelfTimeChart],
  imports: [ChartModule],
  exports: [SelfTimeChart],
})
export class SelfTimeChartModule {
}
