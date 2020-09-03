import {createAction, props} from '@ngrx/store';
import {TensorflowStatsData} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {ActionCreatorAny} from 'org_xprof/frontend/app/store/types';

/** Action to set data property */
export const setDataAction: ActionCreatorAny = createAction(
    '[Tensorflow Stats] Set data property',
    props<{data: TensorflowStatsData[]}>(),
);

/** Action to set diffData property */
export const setDiffDataAction: ActionCreatorAny = createAction(
    '[Tensorflow Stats] Set diffData property',
    props<{diffData: TensorflowStatsData[]}>(),
);

/** Action to set hasDiff property */
export const setHasDiffAction: ActionCreatorAny = createAction(
    '[Tensorflow Stats] Set hasData property',
    props<{hasDiff: boolean}>(),
);

/** Action to set showPprofLink property */
export const setShowPprofLinkAction: ActionCreatorAny =
    createAction(
        '[Tensorflow Stats] Set showPprofLink property',
        props<{showPprofLink: boolean}>(),
    );

/** Action to set showFlopRateChart property */
export const setShowFlopRateChartAction: ActionCreatorAny =
    createAction(
        '[Tensorflow Stats] Set showFlopRateChart property',
        props<{showFlopRateChart: boolean}>(),
    );

/** Action to set showModelProperties property */
export const setShowModelPropertiesAction: ActionCreatorAny =
    createAction(
        '[Tensorflow Stats] Set showModelProperties property',
        props<{showModelProperties: boolean}>(),
    );

/** Action to set title property */
export const setTitleAction: ActionCreatorAny = createAction(
    '[Tensorflow Stats] Set title property',
    props<{title: string}>(),
);
