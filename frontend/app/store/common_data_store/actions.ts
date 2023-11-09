import {createAction, props} from '@ngrx/store';
import {SimpleDataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {ActionCreatorAny} from 'org_xprof/frontend/app/store/types';

/** Action to set kernel stats data property */
export const setKernelStatsDataAction: ActionCreatorAny = createAction(
    '[Kernel Stats] Set data property',
    props<{kernelStatsData: SimpleDataTable | null}>(),
);
