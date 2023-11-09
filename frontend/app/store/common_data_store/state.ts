import {SimpleDataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';

/** State of common data store */
export interface CommonDataStoreState {
  kernelStatsData: SimpleDataTable|null;
}

/** Initial state object */
export const INIT_COMMON_DATA_STORE_STATE: CommonDataStoreState = {
  kernelStatsData: null,
};

/** Feature key for store */
export const COMMON_DATA_STORE_KEY = 'common_data_store';
