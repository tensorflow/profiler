import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

import {MemoryProfileSummary} from './memory_profile_summary';

@NgModule({
  declarations: [MemoryProfileSummary],
  imports: [
    CommonModule,
    MatCardModule,
  ],
  exports: [MemoryProfileSummary]
})
export class MemoryProfileSummaryModule {
}
