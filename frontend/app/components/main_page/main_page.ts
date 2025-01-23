import {Component, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {CommunicationService} from 'org_xprof/frontend/app/services/communication_service/communication_service';
import {getLoadingState} from 'org_xprof/frontend/app/store/selectors';
import {LoadingState} from 'org_xprof/frontend/app/store/state';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** A main page component. */
@Component({
  standalone: false,
  selector: 'main-page',
  templateUrl: './main_page.ng.html',
  styleUrls: ['./main_page.scss']
})
export class MainPage implements OnDestroy {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  loading = true;
  loadingMessage = '';
  isSideNavOpen = true;
  navigationReady = false;

  constructor(
      store: Store<{}>,
      private readonly communicationService: CommunicationService,
  ) {
    store.select(getLoadingState)
        .pipe(takeUntil(this.destroyed))
        .subscribe((loadingState: LoadingState) => {
          this.loading = loadingState.loading;
          this.loadingMessage = loadingState.message;
        });
    this.communicationService.navigationReady.subscribe(
        (navigationEvent: NavigationEvent) => {
          this.navigationReady = true;
          // TODO(fe-unification): Remove this constraint once the sidepanel
          // content of the 3 tools are moved out from sidenav with consolidated
          // templates.
          const toolsWithSideNav =
              ['op_profile', 'memory_viewer', 'pod_viewer'];
          this.isSideNavOpen =
              (navigationEvent.firstLoad ||
               toolsWithSideNav
                       .filter(tool => navigationEvent?.tag?.startsWith(tool))
                       .length > 0);
        });
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
