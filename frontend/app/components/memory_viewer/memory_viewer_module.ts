import {NgModule} from '@angular/core';
import {MatDividerModule} from '@angular/material/divider';
import {MaxHeapChartModule} from 'org_xprof/frontend/app/components/memory_viewer/max_heap_chart/max_heap_chart_module';
import {ProgramOrderChartModule} from 'org_xprof/frontend/app/components/memory_viewer/program_order_chart/program_order_chart_module';

import {MemoryViewer} from './memory_viewer';

/** A memory viewer module. */
@NgModule({
  declarations: [MemoryViewer],
  imports: [
    MatDividerModule,
    MaxHeapChartModule,
    ProgramOrderChartModule,
  ],
  exports: [MemoryViewer]
})
export class MemoryViewerModule {
}
