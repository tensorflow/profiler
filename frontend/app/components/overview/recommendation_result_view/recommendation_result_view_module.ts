import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyCardModule} from '@angular/material/legacy-card';

import {RecommendationResultView} from './recommendation_result_view';

@NgModule({
  declarations: [RecommendationResultView],
  imports: [
    CommonModule,
    MatLegacyCardModule,
  ],
  exports: [RecommendationResultView]
})
export class RecommendationResultViewModule {
}
