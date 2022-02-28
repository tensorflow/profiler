import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatOptionModule} from '@angular/material/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatSelectModule} from '@angular/material/select';

import {Table} from './table';

/** A table view module. */
@NgModule({
  declarations: [Table],
  imports: [
    CommonModule,
    MatOptionModule,
    MatSelectModule,
    MatFormFieldModule,
  ],
  exports: [Table],
})
export class TableModule {
}
