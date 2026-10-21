import {CommonModule} from '@angular/common';
import {NgModule} from '@angular/core';
import {MatButtonModule} from '@angular/material/button';
import {MatButtonToggleModule} from '@angular/material/button-toggle';
import {MatChipsModule} from '@angular/material/chips';
import {MatIconModule} from '@angular/material/icon';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatTooltipModule} from '@angular/material/tooltip';
import {KernelEventTooltip} from 'org_xprof/frontend/app/components/static_kernel_viewer/kernel_event_tooltip';
import {KernelMinimap} from 'org_xprof/frontend/app/components/static_kernel_viewer/kernel_minimap';
import {KernelSelectionPanel} from 'org_xprof/frontend/app/components/static_kernel_viewer/kernel_selection_panel';
import {KernelSourcePanel} from 'org_xprof/frontend/app/components/static_kernel_viewer/kernel_source_panel';
import {KernelViewerTour} from 'org_xprof/frontend/app/components/static_kernel_viewer/kernel_viewer_tour';
import {TraceViewerContainer} from 'org_xprof/frontend/app/components/trace_viewer_container/trace_viewer_container';
import {StaticKernelViewer} from './static_kernel_viewer';

@NgModule({
  declarations: [StaticKernelViewer],
  imports: [
    CommonModule,
    KernelEventTooltip,
    KernelMinimap,
    KernelSelectionPanel,
    KernelSourcePanel,
    KernelViewerTour,
    MatButtonModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    TraceViewerContainer,
  ],
  exports: [StaticKernelViewer],
})
export class StaticKernelViewerModule {}
