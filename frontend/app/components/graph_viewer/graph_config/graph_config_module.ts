import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyCheckboxModule} from '@angular/material/legacy-checkbox';
import {MatOptionModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';
import {MatSidenavModule} from '@angular/material/sidenav';

import {GraphConfig} from './graph_config';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatLegacyCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatSidenavModule,
    MatLegacyTooltipModule,
  ],
  declarations: [GraphConfig],
  exports: [GraphConfig]
})
export class GraphConfigModule {
}
