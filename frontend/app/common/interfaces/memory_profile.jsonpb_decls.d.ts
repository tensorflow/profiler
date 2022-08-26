/* tslint:disable */
export type MemoryActivity =
    'UNKNOWN_ACTIVITY'|'ALLOCATION'|'DEALLOCATION'|'RESERVATION'|'EXPANSION';
export const enum NumericMemoryActivity {
  UNKNOWN_ACTIVITY = 0,
  ALLOCATION = 1,
  DEALLOCATION = 2,
  RESERVATION = 3,
  EXPANSION = 4,
}
export interface MemoryAggregationStats {
  stackReservedBytes?: /* int64 */ string;
  heapAllocatedBytes?: /* int64 */ string;
  freeMemoryBytes?: /* int64 */ string;
  fragmentation?: /* double */ number;
  peakBytesInUse?: /* int64 */ string;
}
export interface MemoryActivityMetadata {
  memoryActivity?: MemoryActivity;
  requestedBytes?: /* int64 */ string;
  allocationBytes?: /* int64 */ string;
  address?: /* uint64 */ string;
  tfOpName?: string;
  stepId?: /* int64 */ string;
  regionType?: string;
  dataType?: string;
  tensorShape?: string;
}
export interface MemoryProfileSnapshot {
  timeOffsetPs?: /* int64 */ string;
  aggregationStats?: MemoryAggregationStats;
  activityMetadata?: MemoryActivityMetadata;
}
export interface MemoryProfileSummary {
  peakBytesUsageLifetime?: /* int64 */ string;
  peakStats?: MemoryAggregationStats;
  peakStatsTimePs?: /* int64 */ string;
  memoryCapacity?: /* int64 */ string;
}
export interface ActiveAllocation {
  snapshotIndex?: /* int64 */ string;
  specialIndex?: /* int64 */ string;
  numOccurrences?: /* int64 */ string;
}
export interface PerAllocatorMemoryProfile {
  memoryProfileSnapshots?: MemoryProfileSnapshot[];
  profileSummary?: MemoryProfileSummary;
  activeAllocations?: ActiveAllocation[];
  specialAllocations?: MemoryActivityMetadata[];
  sampledTimelineSnapshots?: MemoryProfileSnapshot[];
}
export interface MemoryProfile {
  memoryProfilePerAllocator?:
      {[key: /* string */ string]: PerAllocatorMemoryProfile};
  numHosts?: /* int32 */ number;
  memoryIds?: string[];
  stepCount?: {[key: /* int64 */ string]: /* int64 */ string};
  version?: /* int32 */ number;
}
