import {NgModule} from '@angular/core';
import {ChartModule} from 'org_xprof/frontend/app/components/chart/chart';

import {PieChart} from './pie_chart';

@NgModule({
  declarations: [PieChart],
  imports: [ChartModule],
  exports: [PieChart],
})
export class PieChartModule {
}
