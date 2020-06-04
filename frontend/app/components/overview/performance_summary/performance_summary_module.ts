import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatTooltipModule} from '@angular/material/tooltip';

import {PerformanceSummary} from './performance_summary';

@NgModule({
  declarations: [PerformanceSummary],
  imports: [
    CommonModule,
    MatCardModule,
    MatTooltipModule,
  ],
  exports: [PerformanceSummary]
})
export class PerformanceSummaryModule {
}
