import {Component, OnDestroy} from '@angular/core';
import {ActivatedRoute, Params} from '@angular/router';
import {Store} from '@ngrx/store';
import {OverviewPageDataTuple} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {setLoadingState} from 'org_xprof/frontend/app/common/utils/utils';
import {DataService} from 'org_xprof/frontend/app/services/data_service/data_service';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {OverviewPageCommon} from './overview_page_common';

/** An overview page component. */
@Component({
  standalone: false,
  selector: 'overview_page',
  templateUrl: './overview_page.ng.html',
})
export class OverviewPage extends OverviewPageCommon implements OnDestroy {
  run = '';
  tag = '';
  host = '';
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  constructor(
      route: ActivatedRoute, private readonly dataService: DataService,
      private readonly store: Store<{}>) {
    super();
    route.params.pipe(takeUntil(this.destroyed)).subscribe((params) => {
      this.processQuery(params);
      this.update();
    });
  }

  processQuery(params: Params) {
    this.host = params['host'];
    this.run = params['run'];
    this.tag = params['tag'] || 'overview_page';
  }

  update() {
    setLoadingState(true, this.store, 'Loading overview data');

    this.dataService.getData(this.run, this.tag, this.host)
        .pipe(takeUntil(this.destroyed))
        .subscribe((data) => {
          setLoadingState(false, this.store);
          /** Transfer data to Overview Page DataTable type */
          this.parseOverviewPageData((data || []) as OverviewPageDataTuple);
        });
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}
