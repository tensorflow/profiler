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
  standalone: false,
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
  selectedRunInternal = '';
  selectedTagInternal = '';
  selectedHostInternal = '';
  navigationParams: {[key: string]: string} = {};

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
      if (run && !this.selectedRunInternal) {
        this.selectedRunInternal = run;
      }
    });
    this.communicationService.navigationChange.subscribe(
        (navigationEvent: NavigationEvent) => {
          this.onUpdateRoute(navigationEvent);
        });
  }

  // Getter for the text to display on host selector.
  get hostSelectorDisplayName() {
    // For HLO tools, user selects HLO modules instead of hosts.
    for (const hloTool of HLO_TOOLS) {
      if (this.selectedTag.startsWith(hloTool)) {
        return 'Modules';
      }
    }
    return 'Hosts';
  }

  // Getter for valid run given url router or user selection.
  get selectedRun() {
    return this.runs.find(validRun => validRun === this.selectedRunInternal) ||
        this.runs[0] || '';
  }

  // Getter for valid tag given url router or user selection.
  get selectedTag() {
    return this.tags.find(
               validTag => validTag.startsWith(this.selectedTagInternal)) ||
        this.tags[0] || '';
  }

  // Getter for valid host given url router or user selection.
  get selectedHost() {
    if (this.selectedHostInternal === DEFAULT_HOST) return '';
    return this.hosts.find(host => host === this.selectedHostInternal) ||
        this.hosts[0] || '';
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
    this.onUpdateRoute(navigationEvent);
  }

  ngOnInit() {
    this.navigateWithUrl();
  }

  getNavigationEvent(): NavigationEvent {
    return {
      run: this.selectedRun,
      tag: this.selectedTag,
      host: this.selectedHost,
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
    if (!this.selectedRun || !this.selectedTag) return [];
    const response = await firstValueFrom(
        this.dataService.getHosts(this.selectedRun, this.selectedTag)
            .pipe(takeUntil(this.destroyed)));

    let hosts = response.map(host => host.hostname) || [];
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

  onRunSelectionChange(run: string) {
    this.selectedRunInternal = run;
    this.afterUpdateRun();
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
    this.afterUpdateTag();
  }

  onTagSelectionChange(tag: string) {
    this.selectedTagInternal = tag;
    this.afterUpdateTag();
  }

  afterUpdateTag() {
    this.updateHosts();
  }

  async updateHosts() {
    this.hosts = await this.getHostsForSelectedTag();
    this.afterUpdateHost();
  }

  onHostSelectionChange(host: string) {
    this.selectedHostInternal = host;
    this.navigateTools();
  }

  afterUpdateHost() {
    this.navigateTools();
  }

  navigateTools() {
    this.communicationService.onNavigateReady();
    const navigationEvent = this.getNavigationEvent();
    this.router.navigate([
      this.selectedTag || 'empty',
      navigationEvent,
    ]);
  }

  onUpdateRoute(event: NavigationEvent) {
    const {run = '', tag = '', host = ''} = event;
    this.selectedRunInternal = run;
    this.selectedTagInternal = tag;
    this.selectedHostInternal = host;
    this.navigationParams = {
      ...this.navigationParams,
      ...event,
    };
    delete this.navigationParams['run'];
    delete this.navigationParams['tag'];
    delete this.navigationParams['host'];
    this.update();
  }

  update() {
    this.afterUpdateRun();
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
