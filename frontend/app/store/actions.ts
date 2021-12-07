import {createAction, props} from '@ngrx/store';
import {Node} from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import {AllReduceOpInfo, ChannelInfo, PodStatsRecord} from 'org_xprof/frontend/app/common/interfaces/data_table';
import {HeapObject} from 'org_xprof/frontend/app/common/interfaces/heap_object';

import {DataRequest, LoadingState} from './state';
import {ActionCreatorAny} from './types';

/** Action to set active heap object */
export const setActiveHeapObjectAction: ActionCreatorAny = createAction(
    '[Heap object] Set active heap object',
    props<{activeHeapObject: HeapObject | null}>(),
);

/** Action to set active op profile node */
export const setActiveOpProfileNodeAction: ActionCreatorAny = createAction(
    '[Op Profile Node] Set active op profile node',
    props<{activeOpProfileNode: Node | null}>(),
);

/** Action to set active info of the pod viewer */
export const setActivePodViewerInfoAction: ActionCreatorAny = createAction(
    '[Pod Viewer Info] Set active pod viewer info',
    props<{
      activePodViewerInfo: AllReduceOpInfo | ChannelInfo | PodStatsRecord | null
    }>(),
);

/** Action to set capturing profile */
export const setCapturingProfileAction: ActionCreatorAny = createAction(
    '[App State] Set capturing profile',
    props<{capturingProfile: boolean}>(),
);

/** Action to set loading state */
export const setLoadingStateAction: ActionCreatorAny = createAction(
    '[App State] Set loading state',
    props<{loadingState: LoadingState}>(),
);

/** Action to set current tool state */
export const setCurrentToolStateAction: ActionCreatorAny = createAction(
    '[App State] Set current tool state',
    props<{currentTool: string}>(),
);

/** Action to set request data state */
export const setDataRequestStateAction: ActionCreatorAny = createAction(
    '[App State] Set request data state',
    props<{dataRequest: DataRequest}>(),
);

/** Action to clear export_as_csv state */
export const clearExportAsCsvStateAction: ActionCreatorAny =
    createAction('[App State] Clear export_as_csv state');

/** Action to set export_as_csv state */
export const setExportAsCsvStateAction: ActionCreatorAny = createAction(
    '[App State] Set export_as_csv state',
    props<{exportAsCsv: string}>(),
);

/** Action to set error message state */
export const setErrorMessageStateAction: ActionCreatorAny = createAction(
    '[App State] Set error message state',
    props<{errorMessage: string}>(),
);
