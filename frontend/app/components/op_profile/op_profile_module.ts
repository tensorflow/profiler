import {NgModule} from '@angular/core';
import {MatIconModule} from '@angular/material/icon';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatSlideToggleModule} from '@angular/material/slide-toggle';
import {MatLegacySliderModule} from '@angular/material/legacy-slider';
import {MatLegacyTooltipModule} from '@angular/material/legacy-tooltip';

import {OpProfile} from './op_profile';
import {OpTableModule} from './op_table/op_table_module';

/** An op profile module. */
@NgModule({
  declarations: [OpProfile],
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatLegacySliderModule,
    MatSlideToggleModule,
    OpTableModule,
    MatIconModule,
    MatLegacyTooltipModule,
  ],
  exports: [OpProfile]
})
export class OpProfileModule {
}
