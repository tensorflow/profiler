import {NgModule} from '@angular/core';
import {MatLegacySliderModule} from '@angular/material/legacy-slider';

import {RangeSlider} from './range_slider';

/** A range slider component module. */
@NgModule({
  declarations: [RangeSlider],
  imports: [MatLegacySliderModule],
  exports: [RangeSlider]
})
export class RangeSliderModule {
}
