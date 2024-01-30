import {FrameworkOpStatsData} from 'org_xprof/frontend/app/common/interfaces/data_table';

/** State of tensorflow stats */
export interface FrameworkOpStatsState {
  data: FrameworkOpStatsData[];
  diffData: FrameworkOpStatsData[];
  hasDiff: boolean;
  showPprofLink: boolean;
  showFlopRateChart: boolean;
  showModelProperties: boolean;
  title: string;
}

/** Initial state object */
export const INIT_FRAMEWORK_OP_STATS_STATE: FrameworkOpStatsState = {
  data: [],
  diffData: [],
  hasDiff: false,
  showPprofLink: false,
  showFlopRateChart: false,
  showModelProperties: false,
  title: '',
};

/** Feature key for store */
export const FRAMEWORK_OP_STATS_STORE_KEY = 'framework_op_stats';
