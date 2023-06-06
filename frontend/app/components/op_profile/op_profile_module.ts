import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatLegacyFormFieldModule} from '@angular/material/legacy-form-field';
import {MatLegacyInputModule} from '@angular/material/legacy-input';
import {MatLegacySlideToggleModule} from '@angular/material/legacy-slide-toggle';
import {MatLegacySliderModule} from '@angular/material/legacy-slider';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';

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
    MatLegacyTooltipModule,
  ],
  exports: [OpProfile]
})
export class OpProfileModule {
}
