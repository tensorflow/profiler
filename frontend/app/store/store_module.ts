import {NgModule} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {commonDataStoreReducer} from 'org_xprof/frontend/app/store/common_data_store/reducers';
import {COMMON_DATA_STORE_KEY} from 'org_xprof/frontend/app/store/common_data_store/state';
import {tensorFlowStatsReducer} from 'org_xprof/frontend/app/store/tensorflow_stats/reducers';
import {TENSORFLOW_STATS_STORE_KEY} from 'org_xprof/frontend/app/store/tensorflow_stats/state';

import {rootReducer} from './reducers';
import {STORE_KEY} from './state';

@NgModule({
  imports: [
    StoreModule.forFeature(STORE_KEY, rootReducer),
    StoreModule.forFeature(COMMON_DATA_STORE_KEY, commonDataStoreReducer),
    StoreModule.forFeature(TENSORFLOW_STATS_STORE_KEY, tensorFlowStatsReducer),
    StoreModule.forRoot({}),
  ],
})
export class RootStoreModule {
}
