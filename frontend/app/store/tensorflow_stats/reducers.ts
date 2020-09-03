import {Action, ActionReducer, createReducer, on} from '@ngrx/store';
import {ActionCreatorAny} from 'org_xprof/frontend/app/store/types';

import * as actions from './actions';
import {INIT_TENSORFLOW_STATS_STATE, TensorflowStatsState} from './state';

/** Reduce functions of tensorflow stats. */
export const reducer: ActionReducer<TensorflowStatsState, Action> =
    createReducer(
        INIT_TENSORFLOW_STATS_STATE,
        on(
            actions.setDataAction,
            (state: TensorflowStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                data: action.data,
              };
            },
            ),
        on(
            actions.setDiffDataAction,
            (state: TensorflowStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                diffData: action.diffData,
              };
            },
            ),
        on(
            actions.setHasDiffAction,
            (state: TensorflowStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                hasDiff: action.hasDiff,
              };
            },
            ),
        on(
            actions.setShowPprofLinkAction,
            (state: TensorflowStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                showPprofLink: action.showPprofLink,
              };
            },
            ),
        on(
            actions.setShowFlopRateChartAction,
            (state: TensorflowStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                showFlopRateChart: action.showFlopRateChart,
              };
            },
            ),
        on(
            actions.setShowModelPropertiesAction,
            (state: TensorflowStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                showModelProperties: action.showModelProperties,
              };
            },
            ),
        on(
            actions.setTitleAction,
            (state: TensorflowStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                title: action.title,
              };
            },
            ),
    );

/** Tensorflow Stats reducer */
export function tensorFlowStatsReducer(
    state: TensorflowStatsState|undefined, action: Action) {
  return reducer(state, action);
}
