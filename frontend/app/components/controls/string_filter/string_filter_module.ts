import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/input';

import {StringFilter} from './string_filter';

/** A string filter module. */
@NgModule({
  declarations: [StringFilter],
  imports: [
    CommonModule,
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
  ],
  exports: [StringFilter],
})
export class StringFilterModule {
}
