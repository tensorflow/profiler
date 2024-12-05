import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSelectModule} from '@angular/material/select';
import {MatTooltipModule} from '@angular/material/tooltip';
import {ChartModule} from 'org_xprof/frontend/app/components/chart/chart';
import {CategoryFilterModule} from 'org_xprof/frontend/app/components/controls/category_filter/category_filter_module';
import {StringFilterModule} from 'org_xprof/frontend/app/components/controls/string_filter/string_filter_module';
import {FlopRateChartModule} from 'org_xprof/frontend/app/components/framework_op_stats/flop_rate_chart/flop_rate_chart_module';

import {HloStats} from './hlo_stats';

/** An HLO stats module. */
@NgModule({
  declarations: [HloStats],
  imports: [
    ChartModule,
    CommonModule,
    FlopRateChartModule,
    CategoryFilterModule,
    StringFilterModule,
    MatDividerModule,
    MatSelectModule,
    MatExpansionModule,
    MatTooltipModule,
  ],
  exports: [HloStats],
})
export class HloStatsModule {
}
