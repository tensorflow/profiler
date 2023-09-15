import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import {KernelStatsTable} from './kernel_stats_table';

@NgModule({
  declarations: [KernelStatsTable],
  imports: [
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  exports: [KernelStatsTable]
})
export class KernelStatsTableModule {
}
