import {Component, NgModule} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {DataRequestType} from 'org_xprof/frontend/app/common/constants/enums';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {setDataRequestStateAction} from 'org_xprof/frontend/app/store/actions';

import {KernelStatsModule} from './kernel_stats_module';

/** A kernel stats adapter component. */
@Component({
  selector: 'kernel-stats-adapter',
  template: '<kernel-stats></kernel-stats>',
})
export class KernelStatsAdapter {
  constructor(route: ActivatedRoute, private readonly store: Store<{}>) {
    route.params.subscribe(params => {
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
}

@NgModule({
  declarations: [KernelStatsAdapter],
  imports: [KernelStatsModule],
  exports: [KernelStatsAdapter]
})
export class KernelStatsAdapterModule {
}
