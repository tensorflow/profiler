// tslint:disable:enforce-comments-on-exported-symbols global enums
export const enum IdleOption {
  YES = 'Yes',
  NO = 'No',
}

export const enum OpExecutor {
  NONE = '',
  DEVICE = 'Device',
  HOST = 'Host'
}

export const enum OpKind {
  NONE = '',
  NAME = 'Name',
  TYPE = 'Type'
}

export const enum TpuClass {
  UNKNOWN = 0,
  TPU_V2,
  TPU_V3,
}

export const enum DataRequestType {
  UNKNOWN = 0,
  TENSORFLOW_STATS,
  TENSORFLOW_STATS_DIFF,
}
// tslint:enable:enforce-comments-on-exported-symbols
