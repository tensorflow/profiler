import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatCardModule} from '@angular/material/card';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';

import {PerformanceSummary} from './performance_summary';

@NgModule({
  declarations: [PerformanceSummary],
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatLegacyTooltipModule,
  ],
  exports: [PerformanceSummary]
})
export class PerformanceSummaryModule {
}
