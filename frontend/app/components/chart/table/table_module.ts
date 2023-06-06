import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyOptionModule} from '@angular/material/legacy-core';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacySelectModule} from '@angular/material/legacy-select';

import {Table} from './table';

/** A table view module. */
@NgModule({
  declarations: [Table],
  imports: [
    CommonModule,
    MatLegacyOptionModule,
    MatLegacySelectModule,
    MatLegacyFormFieldModule,
  ],
  exports: [Table],
})
export class TableModule {
}
