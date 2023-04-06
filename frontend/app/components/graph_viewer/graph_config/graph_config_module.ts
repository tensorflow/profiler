import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatLegacyButtonModule} from '@angular/material/button';
import {MatLegacyCheckboxModule} from '@angular/material/checkbox';
import {MatLegacyOptionModule} from '@angular/material/core';
import {MatLegacyFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/input';
import {MatLegacySelectModule} from '@angular/material/select';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatTooltipModule} from '@angular/material/tooltip';

import {GraphConfig} from './graph_config';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatLegacyButtonModule,
    MatLegacyCheckboxModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
    MatLegacyOptionModule,
    MatLegacySelectModule,
    MatSidenavModule,
    MatTooltipModule,
  ],
  declarations: [GraphConfig],
  exports: [GraphConfig]
})
export class GraphConfigModule {
}
