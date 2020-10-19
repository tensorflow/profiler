import {createFeatureSelector, createSelector,} from '@ngrx/store';

import {AppState, MemoryViewerState, OpProfileState, PodViewerState, STORE_KEY} from './state';
import {MemoizedSelectorAny} from './types';

const appState = createFeatureSelector<AppState>(STORE_KEY);

/** Selector for MemoryViewerState */
export const getMemoryViewerState: MemoizedSelectorAny = createSelector(
    appState, (appState: AppState) => appState.memoryViewerState);

/** Selector for ActiveHeapObjectState */
export const getActiveHeapObjectState: MemoizedSelectorAny = createSelector(
    getMemoryViewerState,
    (memoryViewerState: MemoryViewerState) =>
        memoryViewerState.activeHeapObject);

/** Selector for OpProfileState */
export const getOpProfileState: MemoizedSelectorAny =
    createSelector(appState, (appState: AppState) => appState.opProfileState);

/** Selector for ActiveOpProfileNodeState */
export const getActiveOpProfileNodeState: MemoizedSelectorAny = createSelector(
    getOpProfileState,
    (opProfileState: OpProfileState) => opProfileState.activeOpProfileNode);

/** Selector for PodViewerState */
export const getPodViewerState: MemoizedSelectorAny =
    createSelector(appState, (appState: AppState) => appState.podViewerState);

/** Selector for ActivePodViewerInfoState */
export const getActivePodViewerInfoState: MemoizedSelectorAny = createSelector(
    getPodViewerState,
    (podViewerState: PodViewerState) => podViewerState.activePodViewerInfo);

/** Selector for CapturingProfileState */
export const getCapturingProfileState: MemoizedSelectorAny =
    createSelector(appState, (appState: AppState) => appState.capturingProfile);

/** Selector for LoadingState */
export const getLoadingState: MemoizedSelectorAny =
    createSelector(appState, (appState: AppState) => appState.loadingState);

/** Selector for CurrentTool */
export const getCurrentTool: MemoizedSelectorAny =
    createSelector(appState, (appState: AppState) => appState.currentTool);

/** Selector for DataRequestType */
export const getDataRequest: MemoizedSelectorAny =
    createSelector(appState, (appState: AppState) => appState.dataRequest);

/** Selector for ExportAsCsv */
export const getExportAsCsv: MemoizedSelectorAny =
    createSelector(appState, (appState: AppState) => appState.exportAsCsv);

/** Selector for ErrorMessage */
export const getErrorMessage: MemoizedSelectorAny =
    createSelector(appState, (appState: AppState) => appState.errorMessage);
