import {createFeatureSelector, createSelector} from '@ngrx/store';
import {MemoizedSelectorAny} from 'org_xprof/frontend/app/store/types';

import {FRAMEWORK_OP_STATS_STORE_KEY, FrameworkOpStatsState} from './state';

const frameworkOpStatsState =
    createFeatureSelector<FrameworkOpStatsState>(FRAMEWORK_OP_STATS_STORE_KEY);

/** Selector for data property */
export const getDataState: MemoizedSelectorAny = createSelector(
    frameworkOpStatsState,
    (frameworkOpStatsState: FrameworkOpStatsState) =>
        frameworkOpStatsState.data);

/** Selector for diffData property */
export const getDiffDataState: MemoizedSelectorAny = createSelector(
    frameworkOpStatsState,
    (frameworkOpStatsState: FrameworkOpStatsState) =>
        frameworkOpStatsState.diffData);

/** Selector for hasDiff property */
export const getHasDiffState: MemoizedSelectorAny = createSelector(
    frameworkOpStatsState,
    (frameworkOpStatsState: FrameworkOpStatsState) =>
        frameworkOpStatsState.hasDiff);

/** Selector for showPprofLink property */
export const getShowPprofLinkState: MemoizedSelectorAny = createSelector(
    frameworkOpStatsState,
    (frameworkOpStatsState: FrameworkOpStatsState) =>
        frameworkOpStatsState.showPprofLink);

/** Selector for showFlopRateChart property */
export const getShowFlopRateChartState: MemoizedSelectorAny = createSelector(
    frameworkOpStatsState,
    (frameworkOpStatsState: FrameworkOpStatsState) =>
        frameworkOpStatsState.showFlopRateChart);

/** Selector for showModelProperties property */
export const getShowModelPropertiesState: MemoizedSelectorAny = createSelector(
    frameworkOpStatsState,
    (frameworkOpStatsState: FrameworkOpStatsState) =>
        frameworkOpStatsState.showModelProperties);

/** Selector for title property */
export const getTitleState: MemoizedSelectorAny = createSelector(
    frameworkOpStatsState,
    (frameworkOpStatsState: FrameworkOpStatsState) =>
        frameworkOpStatsState.title);
