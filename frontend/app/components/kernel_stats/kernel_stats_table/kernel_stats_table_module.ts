import {NgModule} from '@angular/core';
import {MatLegacyFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/input';

import {KernelStatsTable} from './kernel_stats_table';

@NgModule({
  declarations: [KernelStatsTable],
  imports: [
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
  ],
  exports: [KernelStatsTable]
})
export class KernelStatsTableModule {
}
