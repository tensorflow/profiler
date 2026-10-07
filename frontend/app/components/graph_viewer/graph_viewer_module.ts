import {NgModule} from '@angular/core';
import {GraphViewer} from './graph_viewer';

/** @deprecated Import the standalone GraphViewer component directly instead. */
@NgModule({
  imports: [GraphViewer],
  exports: [GraphViewer],
})
export class GraphViewerModule {}
