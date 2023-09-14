import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatLegacyOptionModule} from '@angular/material/legacy-core';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacySelectModule} from '@angular/material/legacy-select';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';
import {MatSidenavModule} from '@angular/material/sidenav';

import {GraphConfig} from './graph_config';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatLegacyCheckboxModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
    MatLegacyOptionModule,
    MatLegacySelectModule,
    MatSidenavModule,
    MatLegacyTooltipModule,
  ],
  declarations: [GraphConfig],
  exports: [GraphConfig]
})
export class GraphConfigModule {
}
