import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {ChartModule} from 'org_xprof/frontend/app/components/chart/chart';

import {StatsTable} from './stats_table';

@NgModule({
  declarations: [StatsTable],
  imports: [
    CommonModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
    ChartModule,
  ],
  exports: [StatsTable],
})
export class StatsTableModule {
}
