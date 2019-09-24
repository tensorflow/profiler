import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

import {PodViewer} from './pod_viewer';

/** A pod viewer module. */
@NgModule(
    {declarations: [PodViewer], imports: [MatCardModule], exports: [PodViewer]})
export class PodViewerModule {
}
