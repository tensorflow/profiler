import {NgModule} from '@angular/core';
import {MatCardModule} from '@angular/material/card';

import {MemoryViewer} from './memory_viewer';

/** A memory viewer module. */
@NgModule({
  declarations: [MemoryViewer],
  imports: [MatCardModule],
  exports: [MemoryViewer]
})
export class MemoryViewerModule {
}
