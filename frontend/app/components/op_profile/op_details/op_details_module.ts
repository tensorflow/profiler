import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyButtonModule} from '@angular/material/button';
import {MatLegacyCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';

import {OpDetails} from './op_details';

/** An op details view module. */
@NgModule({
  declarations: [OpDetails],
  imports:
      [CommonModule, MatLegacyCardModule, MatIconModule, MatLegacyButtonModule],
  exports: [OpDetails]
})
export class OpDetailsModule {
}
