import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacyMenuModule} from '@angular/material/legacy-menu';
import {MatLegacySliderModule} from '@angular/material/legacy-slider';

import {TopologyGraph} from './topology_graph';

/** A topology graph view module. */
@NgModule({
  declarations: [TopologyGraph],
  imports: [
    CommonModule,
    MatButtonModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
    MatLegacyMenuModule,
    MatLegacySliderModule,
  ],
  exports: [TopologyGraph]
})
export class TopologyGraphModule {
}
