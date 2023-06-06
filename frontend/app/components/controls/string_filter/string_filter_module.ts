import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';

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
