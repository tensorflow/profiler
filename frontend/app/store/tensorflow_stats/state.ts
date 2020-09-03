import {TensorflowStatsData} from 'org_xprof/frontend/app/common/interfaces/data_table';

/** State of tensorflow stats */
export interface TensorflowStatsState {
  data: TensorflowStatsData[];
  diffData: TensorflowStatsData[];
  hasDiff: boolean;
  showPprofLink: boolean;
  showFlopRateChart: boolean;
  showModelProperties: boolean;
  title: string;
}

/** Initial state object */
export const INIT_TENSORFLOW_STATS_STATE: TensorflowStatsState = {
  data: [],
  diffData: [],
  hasDiff: false,
  showPprofLink: false,
  showFlopRateChart: false,
  showModelProperties: false,
  title: '',
};

/** Feature key for store */
export const TENSORFLOW_STATS_STORE_KEY = 'tensorflow_stats';
