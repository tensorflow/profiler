import {Component, OnDestroy, ViewChild} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {DIAGNOSTICS_DEFAULT, GRAPHVIZ_QUERY_PARAM_MAP} from 'org_xprof/frontend/app/common/constants/constants';
import {Diagnostics} from 'org_xprof/frontend/app/common/interfaces/diagnostics';
import {GraphConfigInput} from 'org_xprof/frontend/app/common/interfaces/graph_viewer';
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
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  @ViewChild(GraphConfig) config!: GraphConfig;

  run = '';
  tag = 'graph_viewer';
  host = '';
  /** The hlo module list. */
  moduleList: string[] = [];
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
                this.selectedModule = this.moduleList[0];
              }
            }
          },
          error: (err) => {
            this.loading = false;
            this.diagnostics.errors.push(err.error);
          }
        });
  }

  onPlot(inputs: GraphConfigInput) {
    console.log('updating config', inputs);
    if (inputs.selectedModule !== this.selectedModule) {
      this.selectedModule = inputs.selectedModule;
    }
    if (inputs.opName !== this.opName) {
      this.opName = inputs.opName;
    }
    if (inputs.graphWidth !== this.graphWidth) {
      this.graphWidth = inputs.graphWidth;
    }
    if (inputs.showMetadata !== this.showMetadata) {
      this.showMetadata = inputs.showMetadata;
    }
    if (inputs.mergeFusion !== this.mergeFusion) {
      this.mergeFusion = inputs.mergeFusion;
    }

    this.renderGraphvizHtml(inputs);
  }

  renderGraphvizHtml(inputs: GraphConfigInput) {
    const searchParams = new URLSearchParams();
    // Replace session_id with run
    searchParams.set('run', this.run);
    for (const [key, value] of Object.entries(inputs)) {
      if (!(key in GRAPHVIZ_QUERY_PARAM_MAP)) continue;
      if (Array.isArray(value)) {
        searchParams.set(GRAPHVIZ_QUERY_PARAM_MAP[key], value.join(','));
      } else {
        searchParams.set(GRAPHVIZ_QUERY_PARAM_MAP[key], value.toString());
      }
    }
    searchParams.set('format', 'html');
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
