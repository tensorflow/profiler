import {createFeatureSelector, createSelector} from '@ngrx/store';
import {MemoizedSelectorAny} from 'org_xprof/frontend/app/store/types';

import {COMMON_DATA_STORE_KEY, CommonDataStoreState} from './state';

const commonDataStoreState =
    createFeatureSelector<CommonDataStoreState>(COMMON_DATA_STORE_KEY);

/** Selector for kernel stats data property */
export const getKernelStatsDataState: MemoizedSelectorAny = createSelector(
    commonDataStoreState,
    (commonDataStoreState: CommonDataStoreState) =>
        commonDataStoreState.kernelStatsData);
