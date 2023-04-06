import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyButtonModule} from '@angular/material/button';
import {MatLegacyFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/input';
import {MatLegacyMenuModule} from '@angular/material/menu';
import {MatLegacySliderModule} from '@angular/material/slider';

import {TopologyGraph} from './topology_graph';

/** A topology graph view module. */
@NgModule({
  declarations: [TopologyGraph],
  imports: [
    CommonModule,
    MatLegacyButtonModule,
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
