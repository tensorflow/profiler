import {Action, ActionReducer, createReducer, on} from '@ngrx/store';

import * as actions from './actions';
import {AppState, INIT_APP_STATE} from './state';
import {ActionCreatorAny} from './types';

/** Reduce functions of app stats. */
export const reducer: ActionReducer<AppState, Action> = createReducer(
    INIT_APP_STATE,
    on(
        actions.setActiveHeapObjectAction,
        (state: AppState, action: ActionCreatorAny) => {
          return {
            ...state,
            memoryViewerState: {
              ...state.memoryViewerState,
              activeHeapObject: action.activeHeapObject,
            }
          };
        },
        ),
    on(
        actions.setActiveOpProfileNodeAction,
        (state: AppState, action: ActionCreatorAny) => {
          return {
            ...state,
            opProfileState: {
              ...state.opProfileState,
              activeOpProfileNode: action.activeOpProfileNode,
            }
          };
        },
        ),
    on(
        actions.setActivePodViewerInfoAction,
        (state: AppState, action: ActionCreatorAny) => {
          return {
            ...state,
            podViewerState: {
              ...state.podViewerState,
              activePodViewerInfo: action.activePodViewerInfo,
            }
          };
        },
        ),
    on(
        actions.setCapturingProfileAction,
        (state: AppState, action: ActionCreatorAny) => {
          return {
            ...state,
            capturingProfile: action.capturingProfile,
          };
        },
        ),
    on(
        actions.setLoadingStateAction,
        (state: AppState, action: ActionCreatorAny) => {
          return {
            ...state,
            loadingState: action.loadingState,
          };
        },
        ),
    on(
        actions.setCurrentToolStateAction,
        (state: AppState, action: ActionCreatorAny) => {
          return {
            ...state,
            currentTool: action.currentTool,
          };
        },
        ),
    on(
        actions.setDataRequestStateAction,
        (state: AppState, action: ActionCreatorAny) => {
          return {
            ...state,
            dataRequest: action.dataRequest,
          };
        },
        ),
    on(
        actions.clearExportAsCsvStateAction,
        (state: AppState, action: ActionCreatorAny) => {
          return {
            ...state,
            exportAsCsv: '',
          };
        },
        ),
    on(
        actions.setExportAsCsvStateAction,
        (state: AppState, action: ActionCreatorAny) => {
          return {
            ...state,
            exportAsCsv: action.exportAsCsv,
          };
        },
        ),
);

/** Reducer */
export function rootReducer(state: AppState|undefined, action: Action) {
  return reducer(state, action);
}
