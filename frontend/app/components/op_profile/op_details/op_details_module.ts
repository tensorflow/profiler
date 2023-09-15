import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatButtonModule} from '@angular/material/button';
import {MatCardModule} from '@angular/material/card';

import {OpDetails} from './op_details';

/** An op details view module. */
@NgModule({
  declarations: [OpDetails],
  imports:
      [CommonModule, MatCardModule, MatIconModule, MatButtonModule],
  exports: [OpDetails]
})
export class OpDetailsModule {
}
