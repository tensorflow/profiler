import {Component, OnDestroy, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {DEFAULT_HOST, HLO_TOOLS} from 'org_xprof/frontend/app/common/constants/constants';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {RunToolsMap} from 'org_xprof/frontend/app/common/interfaces/tool';
import {CommunicationService} from 'org_xprof/frontend/app/services/communication_service/communication_service';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setCurrentRunAction, updateRunToolsMapAction} from 'org_xprof/frontend/app/store/actions';
import {getCurrentRun, getRunToolsMap} from 'org_xprof/frontend/app/store/selectors';
import {firstValueFrom, Observable, ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** A side navigation component. */
@Component({
  selector: 'sidenav',
  templateUrl: './sidenav.ng.html',
  styleUrls: ['./sidenav.scss']
})
export class SideNav implements OnInit, OnDestroy {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);
  runToolsMap$: Observable<RunToolsMap>;
  currentRun$: Observable<string>;

  runToolsMap: RunToolsMap = {};
  runs: string[] = [];
  tags: string[] = [];
  hosts: string[] = [];
  selectedRun = '';
  selectedTag = '';
  selectedHost = '';
  navigationParams: {[key: string]: string} = {};
  // The text to display on host selector.
  hostSelectorDisplayName = 'Hosts';

  constructor(
      private readonly router: Router,
      private readonly dataService: DataService,
      private readonly communicationService: CommunicationService,
      private readonly store: Store<{}>) {
    this.runToolsMap$ =
        this.store.select(getRunToolsMap).pipe(takeUntil(this.destroyed));
    this.currentRun$ =
        this.store.select(getCurrentRun).pipe(takeUntil(this.destroyed));
    // TODO(b/241842487): stream is not updated when the state change, should
    // trigger subscribe reactively
    this.runToolsMap$.subscribe((runTools: RunToolsMap) => {
      this.runToolsMap = runTools;
      this.runs = Object.keys(this.runToolsMap);
    });
    this.currentRun$.subscribe(run => {
      if (run && !this.selectedRun) {
        this.selectedRun = run;
        this.afterUpdateRun();
      }
    });
    this.communicationService.navigationChange.subscribe(
        (navigationEvent: NavigationEvent) => {
          this.onUpdateRoute(navigationEvent);
        });
  }

  navigateWithUrl() {
    const params = new URLSearchParams(window.parent.location.search);
    const navigationEvent: NavigationEvent = {
      run: params.get('run') || '',
      tag: params.get('tool') || '',
      host: params.get('host') || '',
    };
    if (params.has('opName')) {
      navigationEvent.paramsOpName = params.get('opName') || '';
    }
    this.communicationService.onNavigate(navigationEvent);
  }

  ngOnInit() {
    this.navigateWithUrl();
  }

  getNavigationEvent(): NavigationEvent {
    return {
      run: this.selectedRun,
      tag: this.selectedTag,
      host: this.selectedHost === DEFAULT_HOST ? '' : this.selectedHost,
      ...this.navigationParams,
    };
  }

  getDisplayTagName(tag: string): string {
    return (tag && tag.length &&
            (tag[tag.length - 1] === '@' || tag[tag.length - 1] === '#' ||
             tag[tag.length - 1] === '^')) ?
        tag.slice(0, -1) :
        tag || '';
  }

  resetTag() {
    this.tags = [];
    this.selectedTag = '';
    this.updateHostSelectorDisplayName();
  }

  resetHost() {
    this.hosts = [];
    this.selectedHost = '';
  }

  async getToolsForSelectedRun() {
    const tools =
        await firstValueFrom(this.dataService.getRunTools(this.selectedRun)
                                 .pipe(takeUntil(this.destroyed)));

    this.store.dispatch(updateRunToolsMapAction({
      run: this.selectedRun,
      tools,
    }));
    return tools;
  }

  async getHostsForSelectedTag() {
    const response = await firstValueFrom(
        this.dataService.getHosts(this.selectedRun, this.selectedTag)
            .pipe(takeUntil(this.destroyed)));

    let hosts = (response as string[]) || [];
    if (hosts.length === 0) {
      hosts.push('');
    }
    hosts = hosts.map(host => {
      if (host === null) {
        return '';
      } else if (host === '') {
        return DEFAULT_HOST;
      }
      return host;
    });
    return hosts;
  }

  afterUpdateRun() {
    this.store.dispatch(setCurrentRunAction({
      currentRun: this.selectedRun,
    }));
    this.updateTags();
  }

  async updateTags() {
    this.tags = this.runToolsMap[this.selectedRun] || [];
    if (!this.tags.length) {
      this.tags = (await this.getToolsForSelectedRun() || []) as string[];
    }
    if (this.tags.length > 0) {
      // Try to match the same tag when tags changes, use default if no match
      this.selectedTag = this.tags.find(
                             tag => tag === this.selectedTag ||
                                 tag === this.selectedTag + '@' ||
                                 tag === this.selectedTag + '#' ||
                                 tag === this.selectedTag + '^' ||
                                 tag.slice(0, -1) === this.selectedTag) ||
          this.tags[0];
      this.afterUpdateTag();
    } else {
      this.resetTag();
      this.resetHost();
      this.navigateTools();
    }
  }

  afterUpdateTag() {
    this.updateHostSelectorDisplayName();
    this.updateHosts();
  }

  async updateHosts() {
    this.hosts = await this.getHostsForSelectedTag();
    this.selectedHost =
        this.hosts.find(host => host === this.selectedHost) || this.hosts[0];
    this.afterUpdateHost();
  }

  afterUpdateHost() {
    this.navigateTools();
  }

  navigateTools() {
    const navigationEvent = this.getNavigationEvent();
    this.router.navigate([
      this.selectedTag || 'empty',
      navigationEvent,
    ]);
  }

  updateHostSelectorDisplayName() {
    // For HLO tools, user selects HLO modules instead of hosts.
    let isHloTool = false;
    for (const hloTool of HLO_TOOLS) {
      if (this.selectedTag.startsWith(hloTool)) {
        this.hostSelectorDisplayName = 'Modules';
        isHloTool = true;
        break;
      }
    }
    if (!isHloTool) {
      this.hostSelectorDisplayName = 'Hosts';
    }
  }

  onUpdateRoute(event: NavigationEvent) {
    let {run = '', tag = '', host = ''} = event;
    tag =
        this.tags.find(validTag => validTag.includes(tag)) || this.selectedTag;
    run =
        this.runs.find(validRun => validRun.includes(run)) || this.selectedRun;
    host = this.hosts.find(validHost => validHost.includes(host)) ||
        this.selectedHost;
    this.navigationParams = {
      ...this.navigationParams,
      ...event,
    };
    delete this.navigationParams['run'];
    delete this.navigationParams['tag'];
    delete this.navigationParams['host'];
    let routeUpdateFrom = 0;
    if (this.selectedRun !== run) {
      this.selectedRun = run;
      routeUpdateFrom = 1;
    }
    if (this.selectedTag !== tag) {
      this.selectedTag = tag;
      routeUpdateFrom = routeUpdateFrom ? routeUpdateFrom : 2;
    }
    if (this.selectedHost !== host) {
      this.selectedHost = host;
      routeUpdateFrom = routeUpdateFrom ? routeUpdateFrom : 3;
    }
    switch (routeUpdateFrom) {
      case 1:
        this.afterUpdateRun();
        break;
      case 2:
        this.afterUpdateTag();
        break;
      case 3:
        this.afterUpdateHost();
        break;
      default:
        break;
    }
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
