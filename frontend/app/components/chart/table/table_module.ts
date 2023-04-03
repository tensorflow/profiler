import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyOptionModule} from '@angular/material/core';
import {MatLegacyFormFieldModule} from '@angular/material/form-field';
import {MatLegacySelectModule} from '@angular/material/select';

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
