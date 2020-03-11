import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

import {NormalizedAcceleratorPerformanceView} from './normalized_accelerator_performance_view';

/** A normalized accelerator performance view module. */
@NgModule({
  declarations: [NormalizedAcceleratorPerformanceView],
  imports: [
    CommonModule,
    MatCardModule,
  ],
  exports: [NormalizedAcceleratorPerformanceView]
})
export class NormalizedAcceleratorPerformanceViewModule {
}
