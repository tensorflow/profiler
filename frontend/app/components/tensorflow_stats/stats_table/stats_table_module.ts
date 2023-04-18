import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {ChartModule} from 'org_xprof/frontend/app/components/chart/chart';

import {StatsTable} from './stats_table';

@NgModule({
  declarations: [StatsTable],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    ChartModule,
  ],
  exports: [StatsTable],
})
export class StatsTableModule {
}
