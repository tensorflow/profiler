import {Component, NgModule, OnDestroy} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {DataRequestType} from 'org_xprof/frontend/app/common/constants/enums';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {setDataRequestStateAction} from 'org_xprof/frontend/app/store/actions';
import {ReplaySubject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

import {KernelStatsModule} from './kernel_stats_module';

/** A kernel stats adapter component. */
@Component({
  selector: 'kernel-stats-adapter',
  template: '<kernel-stats></kernel-stats>',
})
export class KernelStatsAdapter implements OnDestroy {
  /** Handles on-destroy Subject, used to unsubscribe. */
  private readonly destroyed = new ReplaySubject<void>(1);

  constructor(route: ActivatedRoute, private readonly store: Store<{}>) {
    route.params.pipe(takeUntil(this.destroyed)).subscribe((params) => {
      this.update(params as NavigationEvent);
    });
  }

  update(event: NavigationEvent) {
    const params = {
      run: event.run || '',
      tag: event.tag || 'kernel_stats',
      host: event.host || '',
    };
    this.store.dispatch(setDataRequestStateAction(
        {dataRequest: {type: DataRequestType.KERNEL_STATS, params}}));
  }

  ngOnDestroy() {
    // Unsubscribes all pending subscriptions.
    this.destroyed.next();
    this.destroyed.complete();
  }
}

@NgModule({
  declarations: [KernelStatsAdapter],
  imports: [KernelStatsModule],
  exports: [KernelStatsAdapter]
})
export class KernelStatsAdapterModule {
}
