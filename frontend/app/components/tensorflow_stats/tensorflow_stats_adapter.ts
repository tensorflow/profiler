import {Component, NgModule} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Store} from '@ngrx/store';
import {DataRequestType} from 'org_xprof/frontend/app/common/constants/enums';
import {NavigationEvent} from 'org_xprof/frontend/app/common/interfaces/navigation_event';
import {setDataRequestStateAction} from 'org_xprof/frontend/app/store/actions';
import * as actions from 'org_xprof/frontend/app/store/tensorflow_stats/actions';

import {TensorflowStatsModule} from './tensorflow_stats_module';

/** An overview adapter component. */
@Component({
  selector: 'tensorflow-stats-adapter',
  template: '<tensorflow-stats></tensorflow-stats>',
})
export class TensorflowStatsAdapter {
  constructor(route: ActivatedRoute, private readonly store: Store<{}>) {
    route.params.subscribe(params => {
      this.update(params as NavigationEvent);
    });
    this.store.dispatch(actions.setTitleAction({title: 'TensorFlow Stats'}));
  }

  update(event: NavigationEvent) {
    const params = {
      run: event.run || '',
      tag: event.tag || 'tensorflow_stats',
      host: event.host || '',
    };
    this.store.dispatch(setDataRequestStateAction(
        {dataRequest: {type: DataRequestType.TENSORFLOW_STATS, params}}));
  }
}

@NgModule({
  declarations: [TensorflowStatsAdapter],
  imports: [TensorflowStatsModule],
  exports: [TensorflowStatsAdapter]
})
export class TensorflowStatsAdapterModule {
}
