import {Component, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {DEFAULT_HOST, HLO_TOOLS} from 'org_xprof/frontend/app/common/constants/constants';
import {RunToolsMap} from 'org_xprof/frontend/app/common/interfaces/tool';
import {setLoadingState} from 'org_xprof/frontend/app/common/utils/utils';
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
export class SideNav implements OnDestroy {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);
  runToolsMap$: Observable<RunToolsMap> =
      this.store.select(getRunToolsMap).pipe(takeUntil(this.destroyed));
  currentRun$: Observable<string> =
      this.store.select(getCurrentRun).pipe(takeUntil(this.destroyed));

  runToolsMap: RunToolsMap = {};
  runs: string[] = [];
  tags: string[] = [];
  hosts: string[] = [];
  selectedRun = '';
  selectedTag = '';
  selectedHost = '';
  // The text to display on host selector.
  hostSelectorDisplayName = 'Hosts';

  constructor(
      private readonly router: Router,
      private readonly dataService: DataService,
      private readonly store: Store<{}>) {
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
    setLoadingState(true, this.store, 'Loading tools data for run');
    const tools =
        await firstValueFrom(this.dataService.getRunTools(this.selectedRun)
                                 .pipe(takeUntil(this.destroyed)));
    setLoadingState(false, this.store);

    this.store.dispatch(updateRunToolsMapAction({
      run: this.selectedRun,
      tools,
    }));
    return tools;
  }

  async getHostsForSelectedTag() {
    setLoadingState(true, this.store, 'Loading hosts data for tag');
    const response = await firstValueFrom(
        this.dataService.getHosts(this.selectedRun, this.selectedTag)
            .pipe(takeUntil(this.destroyed)));
    setLoadingState(false, this.store);

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
    this.resetHost();
    this.hosts = await this.getHostsForSelectedTag();
    this.selectedHost = this.hosts[0];
    this.afterUpdateHost();
  }

  afterUpdateHost() {
    this.navigateTools();
  }

  navigateTools() {
    this.router.navigate([
      this.selectedTag || 'empty', {
        run: this.selectedRun,
        tag: this.selectedTag,
        host: this.selectedHost === DEFAULT_HOST ? '' : this.selectedHost,
      }
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

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
