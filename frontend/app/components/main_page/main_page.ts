import {Component, Input, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {Store} from '@ngrx/store';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {Tool} from 'org_xprof/frontend/app/common/interfaces/tool';
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
  /** The tool datasets. */
  @Input() datasets: Tool[] = [];

  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  loading = true;
  loadingMessage = '';

  constructor(private readonly router: Router, store: Store<{}>) {
    store.select(getLoadingState)
        .pipe(takeUntil(this.destroyed))
        .subscribe((loadingState: LoadingState) => {
          this.loading = loadingState.loading;
          this.loadingMessage = loadingState.message;
        });
  }

  updateTool(event: NavigationEvent) {
    this.loading = false;
    this.router.navigate([event.tag || 'empty', event]);
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
