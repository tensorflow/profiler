import {NgModule} from '@angular/core';
import {ChartModule} from 'org_xprof/frontend/app/components/chart/chart';

import {FlopRateChart} from './flop_rate_chart';

@NgModule({
  declarations: [FlopRateChart],
  imports: [ChartModule],
  exports: [FlopRateChart],
})
export class FlopRateChartModule {
}
