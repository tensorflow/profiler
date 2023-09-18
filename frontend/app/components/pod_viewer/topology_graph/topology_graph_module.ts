import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatMenuModule} from '@angular/material/menu';
import {MatLegacySliderModule} from '@angular/material/legacy-slider';

import {TopologyGraph} from './topology_graph';

/** A topology graph view module. */
@NgModule({
  declarations: [TopologyGraph],
  imports: [
    CommonModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatMenuModule,
    MatLegacySliderModule,
  ],
  exports: [TopologyGraph]
})
export class TopologyGraphModule {
}
