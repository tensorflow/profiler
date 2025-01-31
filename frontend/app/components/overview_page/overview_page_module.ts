import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {OverviewPageBaseModule} from 'org_xprof/frontend/app/components/overview_page/overview_page_base_module';
import {RecommendationResultViewModule} from 'org_xprof/frontend/app/components/overview_page/recommendation_result_view/recommendation_result_view_module';

import {OverviewPage} from './overview_page';

/** An overview page module. */
@NgModule({
  declarations: [OverviewPage],
  imports: [
    CommonModule,
    RecommendationResultViewModule,
    OverviewPageBaseModule,
  ],
  exports: [OverviewPage]
})
export class OverviewPageModule {
}
