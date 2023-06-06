import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyCardModule} from '@angular/material/legacy-card';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';

import {MemoryProfileSummary} from './memory_profile_summary';

@NgModule({
  declarations: [MemoryProfileSummary],
  imports: [
    CommonModule,
    MatLegacyCardModule,
    MatLegacyTooltipModule,
  ],
  exports: [MemoryProfileSummary]
})
export class MemoryProfileSummaryModule {
}
