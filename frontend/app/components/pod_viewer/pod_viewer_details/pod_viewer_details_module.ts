import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatLegacyCardModule} from '@angular/material/card';

import {PodViewerDetails} from './pod_viewer_details';

/** A pod viewer details view module. */
@NgModule({
  declarations: [PodViewerDetails],
  imports: [
    CommonModule,
    MatLegacyCardModule,
  ],
  exports: [PodViewerDetails]
})
export class PodViewerDetailsModule {
}
