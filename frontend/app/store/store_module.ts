import {NgModule} from '@angular/core';
import {StoreModule} from '@ngrx/store';
import {commonDataStoreReducer} from 'org_xprof/frontend/app/store/common_data_store/reducers';
import {COMMON_DATA_STORE_KEY} from 'org_xprof/frontend/app/store/common_data_store/state';
import {frameworkOpStatsReducer} from 'org_xprof/frontend/app/store/framework_op_stats/reducers';
import {FRAMEWORK_OP_STATS_STORE_KEY} from 'org_xprof/frontend/app/store/framework_op_stats/state';

import {rootReducer} from './reducers';
import {STORE_KEY} from './state';

@NgModule({
  imports: [
    StoreModule.forFeature(STORE_KEY, rootReducer),
    StoreModule.forFeature(COMMON_DATA_STORE_KEY, commonDataStoreReducer),
    StoreModule.forFeature(
        FRAMEWORK_OP_STATS_STORE_KEY, frameworkOpStatsReducer),
    StoreModule.forRoot({}),
  ],
})
export class RootStoreModule {
}
