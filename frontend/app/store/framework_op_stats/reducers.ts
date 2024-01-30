import {Action, ActionReducer, createReducer, on} from '@ngrx/store';
import {ActionCreatorAny} from 'org_xprof/frontend/app/store/types';

import * as actions from './actions';
import {FrameworkOpStatsState, INIT_FRAMEWORK_OP_STATS_STATE} from './state';

/** Reduce functions of tensorflow stats. */
export const reducer: ActionReducer<FrameworkOpStatsState, Action> =
    createReducer(
        INIT_FRAMEWORK_OP_STATS_STATE,
        on(
            actions.setDataAction,
            (state: FrameworkOpStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                data: action.data,
              };
            },
            ),
        on(
            actions.setDiffDataAction,
            (state: FrameworkOpStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                diffData: action.diffData,
              };
            },
            ),
        on(
            actions.setHasDiffAction,
            (state: FrameworkOpStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                hasDiff: action.hasDiff,
              };
            },
            ),
        on(
            actions.setShowPprofLinkAction,
            (state: FrameworkOpStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                showPprofLink: action.showPprofLink,
              };
            },
            ),
        on(
            actions.setShowFlopRateChartAction,
            (state: FrameworkOpStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                showFlopRateChart: action.showFlopRateChart,
              };
            },
            ),
        on(
            actions.setShowModelPropertiesAction,
            (state: FrameworkOpStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                showModelProperties: action.showModelProperties,
              };
            },
            ),
        on(
            actions.setTitleAction,
            (state: FrameworkOpStatsState, action: ActionCreatorAny) => {
              return {
                ...state,
                title: action.title,
              };
            },
            ),
    );

/** Tensorflow Stats reducer */
export function frameworkOpStatsReducer(
    state: FrameworkOpStatsState|undefined, action: Action) {
  return reducer(state, action);
}
