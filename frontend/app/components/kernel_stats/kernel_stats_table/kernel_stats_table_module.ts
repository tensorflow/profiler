import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';

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
