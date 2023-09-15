import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';

import {MemoryProfileSummary} from './memory_profile_summary';

@NgModule({
  declarations: [MemoryProfileSummary],
  imports: [
    CommonModule,
    MatCardModule,
    MatLegacyTooltipModule,
  ],
  exports: [MemoryProfileSummary]
})
export class MemoryProfileSummaryModule {
}
