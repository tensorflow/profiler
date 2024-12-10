import {NgModule} from '@angular/core';
import {ChartModule} from 'org_xprof/frontend/app/components/chart/chart';
import {TableModule} from 'org_xprof/frontend/app/components/chart/table/table_module';
import {CategoryFilterModule} from 'org_xprof/frontend/app/components/controls/category_filter/category_filter_module';
import {StringFilterModule} from 'org_xprof/frontend/app/components/controls/string_filter/string_filter_module';

import {OperationLevelAnalysis} from './operation_level_analysis';

@NgModule({
  declarations: [OperationLevelAnalysis],
  imports: [CategoryFilterModule, TableModule, StringFilterModule, ChartModule],
  exports: [OperationLevelAnalysis],
})
export class OperationLevelAnalysisModule {}
