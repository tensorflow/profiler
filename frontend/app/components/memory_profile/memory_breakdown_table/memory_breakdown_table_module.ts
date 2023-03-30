import {NgModule} from '@angular/core';
import {MatLegacyFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/input';

import {MemoryBreakdownTable} from './memory_breakdown_table';

@NgModule({
  declarations: [MemoryBreakdownTable],
  imports: [
    MatLegacyFormFieldModule,
    MatIconModule,
    MatLegacyInputModule,
  ],
  exports: [MemoryBreakdownTable]
})
export class MemoryBreakdownTableModule {
}
