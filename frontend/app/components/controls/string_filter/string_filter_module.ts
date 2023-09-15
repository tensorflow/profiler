import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';

import {StringFilter} from './string_filter';

/** A string filter module. */
@NgModule({
  declarations: [StringFilter],
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
  ],
  exports: [StringFilter],
})
export class StringFilterModule {
}
