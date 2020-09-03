import {createFeatureSelector, createSelector} from '@ngrx/store';
import {MemoizedSelectorAny} from 'org_xprof/frontend/app/store/types';

import {TENSORFLOW_STATS_STORE_KEY, TensorflowStatsState} from './state';

const tensorFlowStatsState =
    createFeatureSelector<TensorflowStatsState>(TENSORFLOW_STATS_STORE_KEY);

/** Selector for data property */
export const getDataState: MemoizedSelectorAny = createSelector(
    tensorFlowStatsState,
    (tensorFlowStatsState: TensorflowStatsState) => tensorFlowStatsState.data);

/** Selector for diffData property */
export const getDiffDataState: MemoizedSelectorAny =
    createSelector(
        tensorFlowStatsState,
        (tensorFlowStatsState: TensorflowStatsState) =>
            tensorFlowStatsState.diffData);

/** Selector for hasDiff property */
export const getHasDiffState: MemoizedSelectorAny =
    createSelector(
        tensorFlowStatsState,
        (tensorFlowStatsState: TensorflowStatsState) =>
            tensorFlowStatsState.hasDiff);

/** Selector for showPprofLink property */
export const getShowPprofLinkState: MemoizedSelectorAny =
    createSelector(
        tensorFlowStatsState,
        (tensorFlowStatsState: TensorflowStatsState) =>
            tensorFlowStatsState.showPprofLink);

/** Selector for showFlopRateChart property */
export const getShowFlopRateChartState: MemoizedSelectorAny =
    createSelector(
        tensorFlowStatsState,
        (tensorFlowStatsState: TensorflowStatsState) =>
            tensorFlowStatsState.showFlopRateChart);

/** Selector for showModelProperties property */
export const getShowModelPropertiesState: MemoizedSelectorAny =
    createSelector(
        tensorFlowStatsState,
        (tensorFlowStatsState: TensorflowStatsState) =>
            tensorFlowStatsState.showModelProperties);

/** Selector for title property */
export const getTitleState: MemoizedSelectorAny = createSelector(
    tensorFlowStatsState,
    (tensorFlowStatsState: TensorflowStatsState) => tensorFlowStatsState.title);
