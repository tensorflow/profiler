import {NgModule} from '@angular/core';
import {MatLegacyFormFieldModule} from '@angular/material/form-field';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyInputModule} from '@angular/material/input';
import {MatLegacySlideToggleModule} from '@angular/material/slide-toggle';
import {MatLegacySliderModule} from '@angular/material/slider';
import {MatTooltipModule} from '@angular/material/tooltip';

import {OpProfile} from './op_profile';
import {OpTableModule} from './op_table/op_table_module';

/** An op profile module. */
@NgModule({
  declarations: [OpProfile],
  imports: [
    MatLegacyFormFieldModule,
    MatLegacyInputModule,
    MatLegacySliderModule,
    MatLegacySlideToggleModule,
    OpTableModule,
    MatIconModule,
    MatTooltipModule,
  ],
  exports: [OpProfile]
})
export class OpProfileModule {
}
