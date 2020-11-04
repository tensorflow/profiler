import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {OrgChartModule} from 'org_xprof/frontend/app/components/chart/org_chart/org_chart_module';
import {TableModule} from 'org_xprof/frontend/app/components/chart/table/table_module';
import {CategoryFilterModule} from 'org_xprof/frontend/app/components/controls/category_filter/category_filter_module';

import {TfDataBottleneckAnalysis} from './tf_data_bottleneck_analysis';

/** A tf data stats module. */
@NgModule({
  declarations: [TfDataBottleneckAnalysis],
  imports: [
    CategoryFilterModule,
    OrgChartModule,
    TableModule,
    MatDividerModule,
    CommonModule,
  ],
  exports: [TfDataBottleneckAnalysis],
})
export class TfDataBottleneckAnalysisModule {
}
