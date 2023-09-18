import {NgModule} from '@angular/core';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatInputModule} from '@angular/material/input';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';

import {OpProfile} from './op_profile';
import {OpTableModule} from './op_table/op_table_module';

/** An op profile module. */
@NgModule({
  declarations: [OpProfile],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    OpTableModule,
    MatIconModule,
    MatLegacyTooltipModule,
  ],
  exports: [OpProfile]
})
export class OpProfileModule {
}
