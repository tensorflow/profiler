import {Action, ActionReducer, createReducer, on} from '@ngrx/store';
import {ActionCreatorAny} from 'org_xprof/frontend/app/store/types';

import * as actions from './actions';
import {CommonDataStoreState, INIT_COMMON_DATA_STORE_STATE} from './state';

/** Reduce functions of common data store. */
export const reducer: ActionReducer<CommonDataStoreState, Action> =
    createReducer(
        INIT_COMMON_DATA_STORE_STATE,
        on(
            actions.setKernelStatsDataAction,
            (state: CommonDataStoreState, action: ActionCreatorAny) => {
              return {
                ...state,
                kernelStatsData: action.kernelStatsData,
              };
            },
            ),
    );

/** Common Data Store reducer */
export function commonDataStoreReducer(
    state: CommonDataStoreState|undefined, action: Action) {
  return reducer(state, action);
}
