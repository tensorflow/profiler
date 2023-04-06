import {NgModule} from '@angular/core';
import {MatLegacyCardModule} from '@angular/material/card';

import {MemoryTimelineGraph} from './memory_timeline_graph';

@NgModule({
  declarations: [MemoryTimelineGraph],
  imports: [MatLegacyCardModule],
  exports: [MemoryTimelineGraph]
})
export class MemoryTimelineGraphModule {
}
