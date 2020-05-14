import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MatIconModule} from '@angular/material/icon';
import {MemoryTimelineGraphModule} from 'org_xprof/frontend/app/components/memory_profile/memory_timeline_graph/memory_timeline_graph_module';

import {MemoryProfile} from './memory_profile';

/** A memory profile module. */
@NgModule({
  declarations: [MemoryProfile],
  imports: [
    CommonModule,
    MatDividerModule,
    MatIconModule,
    MemoryTimelineGraphModule,
  ],
  exports: [MemoryProfile]
})
export class MemoryProfileModule {
}
