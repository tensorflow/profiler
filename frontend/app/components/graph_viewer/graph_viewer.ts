import {Component, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {DIAGNOSTICS_DEFAULT, GRAPH_CONFIG_KEYS} from 'org_xprof/frontend/app/common/constants/constants';
import {Diagnostics} from 'org_xprof/frontend/app/common/interfaces/diagnostics';
import {GraphConfigInput, GraphViewerQueryParams} from 'org_xprof/frontend/app/common/interfaces/graph_viewer';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {GraphConfig} from 'org_xprof/frontend/app/components/graph_viewer/graph_config/graph_config';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setCurrentToolStateAction} from 'org_xprof/frontend/app/store/actions';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** A graph viewer component. */
@Component({
  selector: 'graph-viewer',
  templateUrl: './graph_viewer.ng.html',
  styleUrls: ['./graph_viewer.scss'],
})
export class GraphViewer implements OnDestroy {
  readonly tool = 'graph_viewer';
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  @ViewChild(GraphConfig) config!: GraphConfig;

  run = '';
  tag = 'graph_viewer';
  host = '';
  /** The hlo module list. */
  moduleList: string[] = [];
  initialParams: GraphConfigInput|undefined = undefined;
  selectedModule = '';
  opName = '';
  graphWidth = 3;
  showMetadata = false;
  mergeFusion = false;
  /** The graphviz url. */
  url = '';
  diagnostics: Diagnostics = {...DIAGNOSTICS_DEFAULT};
  loading = false;
  graphvizUri = '';

  constructor(
      private readonly route: ActivatedRoute,
      private readonly dataService: DataService,
      private readonly store: Store<{}>,
  ) {
    this.route.params.pipe(takeUntil(this.destroyed)).subscribe((params) => {
      this.update(params as NavigationEvent);
    });
    this.store.dispatch(setCurrentToolStateAction({currentTool: this.tag}));
  }

  update(event: NavigationEvent) {
    this.run = event.run || '';
    this.tag = event.tag || 'graph_viewer';
    this.host = event.host || '';

    this.loadModuleList();
  }

  setParamsFromUrl() {
    // Plot the graph if node_name (op name) is provided in URL.
    this.opName = this.dataService.searchParams?.get('node_name') || '';
    this.selectedModule =
        this.dataService.searchParams?.get('module_name') || '';
    this.graphWidth =
        Number(this.dataService.searchParams?.get('graph_width')) ||
        this.graphWidth;
    this.showMetadata =
        this.dataService.searchParams?.get('show_metadata') === 'true' ||
        this.showMetadata;
    this.mergeFusion =
        this.dataService.searchParams?.get('merge_fusion') === 'true' ||
        this.mergeFusion;
    this.initialParams = {
      opName: this.opName,
      selectedModule: this.selectedModule,
      graphWidth: this.graphWidth,
      showMetadata: this.showMetadata,
      mergeFusion: this.mergeFusion,
    };
  }

  loadModuleList() {
    // Graph viewer does not use the central loading progress bar since it only
    // refreshes partial page - the graph area
    this.setLoadingStatus(true);
    this.dataService.getModuleList(this.tag, this.run)
        .pipe(takeUntil(this.destroyed))
        .subscribe({
          next: (moduleList: string) => {
            this.loading = false;
            if (moduleList) {
              this.moduleList = moduleList.split(',');
              if (!this.selectedModule) {
                // If moduleName not set in url, use default and try plot again
                this.selectedModule = this.moduleList[0];
                this.onPlot();
              }
            }
          },
          error: (err) => {
            this.loading = false;
            this.diagnostics.errors.push(err.error);
          }
        });
  }

  // Update single param value
  onUpdateParam(param: Partial<GraphConfigInput>) {
    Object.entries(param).forEach(([key, value]) => {
      if (GRAPH_CONFIG_KEYS.includes(key)) {
        Object.assign(this, {[key]: value});
      }
    });
  }

  validToPlot() {
    return this.opName && this.selectedModule;
  }

  onPlot() {
    if (!this.validToPlot()) return;

    // Update the query parameters in url after form updates
    const queryParams: GraphViewerQueryParams = {
      'node_name': this.opName,
      'module_name': this.selectedModule,
      'graph_width': this.graphWidth,
      'show_metadata': this.showMetadata,
      'merge_fusion': this.mergeFusion,
    };

    this.renderGraphvizHtml(queryParams);
  }

  renderGraphvizHtml(queryParams: GraphViewerQueryParams) {
    const searchParams = new URLSearchParams();
    // Replace session_id with run
    searchParams.set('run', this.run);
    for (const [key, value] of Object.entries(queryParams)) {
      searchParams.set(key, value.toString());
    }
    searchParams.set('format', 'html');
    searchParams.set('type', 'graph');
    this.graphvizUri =
        `${location.origin}/${this.tag}.json?${searchParams.toString()}`;
    console.log('getting graph viz url: ', this.graphvizUri);
  }

  setLoadingStatus(loading: boolean, diagnostics?: Diagnostics) {
    this.loading = loading;
    this.diagnostics = diagnostics || {...DIAGNOSTICS_DEFAULT};
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
