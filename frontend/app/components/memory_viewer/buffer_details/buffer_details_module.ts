import {NgModule} from '@angular/core';
import {MatLegacyCardModule} from '@angular/material/card';

import {BufferDetails} from './buffer_details';

/** A buffer details view module. */
@NgModule({
  declarations: [BufferDetails],
  imports: [MatLegacyCardModule],
  exports: [BufferDetails]
})
export class BufferDetailsModule {
}
