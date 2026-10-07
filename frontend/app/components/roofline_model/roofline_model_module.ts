import {NgModule} from '@angular/core';
import {RooflineModel} from './roofline_model';

/** @deprecated Import the standalone RooflineModel component directly instead. */
@NgModule({
  imports: [RooflineModel],
  exports: [RooflineModel],
})
export class RooflineModelModule {}
