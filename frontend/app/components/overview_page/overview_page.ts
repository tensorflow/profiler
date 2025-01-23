import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {OverviewPageDataTuple} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {setLoadingStateAction} from 'org_xprof/frontend/app/store/actions';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {OverviewPageCommon} from './overview_page_common';

/** An overview page component. */
@Component({
  standalone: false,
  selector: 'overview_page',
  templateUrl: './overview_page.ng.html',
  styleUrls: ['./overview_page.css']
})
export class OverviewPage extends OverviewPageCommon implements OnDestroy {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  profileStartTime = '';

  constructor(
      route: ActivatedRoute, private readonly dataService: DataService,
      private readonly store: Store<{}>) {
    super();
    route.params.pipe(takeUntil(this.destroyed)).subscribe((params) => {
      this.update(params as NavigationEvent);
    });
  }

  update(event: NavigationEvent) {
    const run = event.run || '';
    const tag = event.tag || 'overview_page';
    const host = event.host || '';

    this.store.dispatch(setLoadingStateAction({
      loadingState: {
        loading: true,
        message: 'Loading data',
      }
    }));

    this.dataService.getData(run, tag, host)
        .pipe(takeUntil(this.destroyed))
        .subscribe((data) => {
          this.store.dispatch(setLoadingStateAction({
            loadingState: {
              loading: false,
              message: '',
            }
          }));

          /** Transfer data to Overview Page DataTable type */
          this.parseOverviewPageData((data || []) as OverviewPageDataTuple);
          this.parseRunEnvironmentDetail();
        });
  }

  parseRunEnvironmentDetail() {
    const runEnvironmentProp: Record<string, string> =
        (this.runEnvironment || {}).p || {};
    this.profileStartTime = runEnvironmentProp['profile_start_time'] || '';
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
