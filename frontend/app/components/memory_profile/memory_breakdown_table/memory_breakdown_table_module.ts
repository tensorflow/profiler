import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';

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
