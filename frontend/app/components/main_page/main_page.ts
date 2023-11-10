import {Component, OnDestroy} from '@angular/core';
import {Store} from '@ngrx/store';
import {getLoadingState} from 'org_xprof/frontend/app/store/selectors';
import {LoadingState} from 'org_xprof/frontend/app/store/state';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

/** A main page component. */
@Component({
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

  constructor(store: Store<{}>) {
    store.select(getLoadingState)
        .pipe(takeUntil(this.destroyed))
        .subscribe((loadingState: LoadingState) => {
          this.loading = loadingState.loading;
          this.loadingMessage = loadingState.message;
        });
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
