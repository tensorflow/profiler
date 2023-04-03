import {NgModule} from '@angular/core';
import {MatLegacyFormFieldModule} from '@angular/material/form-field';
import {MatLegacyInputModule} from '@angular/material/input';
import {MatLegacySliderModule} from '@angular/material/slider';

import {KernelStatsChart} from './kernel_stats_chart';

@NgModule({
  declarations: [KernelStatsChart],
  imports: [
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacySliderModule,
  ],
  exports: [KernelStatsChart]
})
export class KernelStatsChartModule {
}
