import * as hloProto from 'org_xprof/frontend/app/common/interfaces/hlo.jsonpb_decls';
import * as memoryProfileProto from 'org_xprof/frontend/app/common/interfaces/memory_profile.jsonpb_decls';
import * as memoryViewerPreprocess from 'org_xprof/frontend/app/common/interfaces/memory_viewer_preprocess.jsonpb_decls';
import * as opProfileProto from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import * as diagnosticsProto from 'org_xprof/frontend/app/common/interfaces/diagnostics';

/** The base interface for a table filter.  */
export declare interface Filter {
  column: number;
  value: string|number;
  test?: (value: string) => boolean;
}

/** The base interface for a cell.  */
declare interface Cell<T> {
  v?: T;
  p?: {[key: string]: T};
}

/** All cell type. */
export type DataTableCell = Cell<DataTableCellValue>;

/** All cell value type */
export type DataTableCellValue = string|number|boolean;

/** The base interface for a column. */
export declare interface DataTableColumn {
  id?: string;
  label?: string;
  type?: string;
  p?: {[propertyKey: string]: string|boolean};
}

/** The base interface for a row value. */
export declare interface DataTableRow {
  c?: DataTableCell[];
}

/** The base interface for an empty property. */
declare interface EmptyProperty {}

/** The base interface for a genreal property object. */
declare interface GeneralProperty {
  [key: string]: string;
}

/** The base interface for data table without perperty. */
export declare interface SimpleDataTable {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  p?: EmptyProperty;
}

/** The base interface for data table with. */
export declare interface GeneralDataTable {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  p?: GeneralProperty;
}

/** The data table type for data table without perperty or null. */
export type SimpleDataTableOrNull = SimpleDataTable|null;

/* tslint:disable enforce-name-casing */
/** The base interface for properties of meta host-op table. */
declare interface MetaHostOpTableProperty {
  num_host_op_tables: string;
  valid_host_ops: string;
  hostnames: string;
  values: string;
}
/* tslint:enable */

/** The base interface for meta host-op table. */
export declare interface MetaHostOpTable {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  p: MetaHostOpTableProperty;
}

/** MetaHostOpTable type or Null. */
export type MetaHostOpTableOrNull = MetaHostOpTable|null;

/** The base interface for properties of host-op table. */
declare interface HostOpTableProperty {
  hostop: string;
  hostname: string;
  value: string;
}

/** The base interface for host-op table. */
export declare interface HostOpTable {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  p: HostOpTableProperty;
}

/** HostOpTable type or Null. */
export type HostOpTableOrNull = HostOpTable|null;

/** The base interface for a general analysis. */
export declare interface GeneralAnalysis {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  // Make the property k-v pair more general, note:
  // (1) value is always string
  // (2) Frontend should be responsible of correct key reference
  // and always have a default value fallback
  p?: GeneralProperty;
}

/** The data table type for a general analysis or null. */
export type GeneralAnalysisOrNull = GeneralAnalysis|null;

/** The base interface for an input pipeline analysis. */
export declare interface InputPipelineAnalysis {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  // Make the property k-v pair more general, note:
  // (1) value is always string
  // (2) Frontend should be responsible of correct key reference
  // and always have a default value fallback
  p?: GeneralProperty;
}

/** The data table type for an input pipeline analysis or null. */
export type InputPipelineAnalysisOrNull = InputPipelineAnalysis|null;

/** The base interface for a top ops table column. */
export declare interface TopOpsColumn {
  selfTimePercent: number;
  cumulativeTimePercent: number;
  category: number;
  operation: number;
  flopRate: number;
  tcEligibility: number;
  tcUtilization: number;
}

/* tslint:disable enforce-name-casing */
/** The base interface for a property of run environment. */
declare interface RunEnvironmentProperty {
  error_message?: string;
  host_count?: string;
  device_core_count?: string;
  device_type?: string;
  is_training?: string;
  tpu_core_count?: string;
}
/* tslint:enable */

/** The base interface for a run environment. */
export declare interface RunEnvironment {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  p?: RunEnvironmentProperty;
}

/** The data table type for a run environment or null. */
export type RunEnvironmentOrNull = RunEnvironment|null;

/* tslint:disable enforce-name-casing */
/** The base interface for a property of recommendation result. */
declare interface RecommendationResultProperty {
  bottleneck?: string;
  statement?: string;
  tf_function_statement_html?: string;
  eager_statement_html?: string;
  outside_compilation_statement_html?: string;
  all_other_bottleneck?: string;
  all_other_statement?: string;
  kernel_launch_bottleneck?: string;
  kernel_launch_statement?: string;
  device_collectives_bottleneck?: string;
  device_collectives_statement?: string;
  precision_statement?: string;
}
/* tslint:enable */

/** The base interface for a recommendation result. */
export declare interface RecommendationResult {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  p?: RecommendationResultProperty;
}

/** The data table type for a recommendation result or null. */
export type RecommendationResultOrNull = RecommendationResult|null;

/* tslint:disable enforce-name-casing */
/** The base interface for a property of normalized accelerator performance. */
declare interface NormalizedAcceleratorPerformanceProperty {
  background_link_0?: string;
  background_link_1?: string;
  inference_cost_line_0?: string;
  inference_cost_line_1?: string;
  inference_productivity_line_0?: string;
  inference_productivity_line_1?: string;
  total_naps_line_0?: string;
  total_naps_line_1?: string;
  total_naps_line_2?: string;
  training_cost_line_0?: string;
  training_cost_line_1?: string;
  training_productivity_line_0?: string;
  training_productivity_line_1?: string;
}
/* tslint:enable */

/** The base interface for a normalized accelerator performance. */
export declare interface NormalizedAcceleratorPerformance {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  p?: NormalizedAcceleratorPerformanceProperty;
}

/** The data table type for a normalized accelerator performance or null. */
export type NormalizedAcceleratorPerformanceOrNull =
    NormalizedAcceleratorPerformance|null;

/** The data table type for an input pipeline device-side analysis. */
export type InputPipelineDeviceAnalysis = InputPipelineAnalysis;

/** The data table type for an input pipeline device-side analysis or null. */
export type InputPipelineDeviceAnalysisOrNull =
    InputPipelineDeviceAnalysis|null;

/* tslint:disable enforce-name-casing */
/** The base interface for a property of input pipeline host-side anaysis. */
declare interface InputPipelineHostAnalysisProperty {
  advanced_file_read_us?: string;
  demanded_file_read_us?: string;
  enqueue_us?: string;
  preprocessing_us?: string;
  unclassified_nonequeue_us?: string;
}
/* tslint:enable */

/** The base interface for an input pipeline host-side analysis. */
export declare interface InputPipelineHostAnalysis {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  p?: InputPipelineHostAnalysisProperty;
}

/** The data table type for an input pipeline host-side analysis or null. */
export type InputPipelineHostAnalysisOrNull = InputPipelineHostAnalysis|null;

/** The base interface for a host ops table column. */
export interface HostOpsColumn {
  opName: number;
  count: number;
  timeInMs: number;
  timeInPercent: number;
  selfTimeInMs: number;
  selfTimeInPercent: number;
  category: number;
}

/* tslint:disable enforce-name-casing */
/** The base interface for a property of tensorflow stats. */
declare interface TensorflowStatsProperty {
  architecture_type?: string;
  device_tf_pprof_link?: string;
  host_tf_pprof_link?: string;
  task_type?: string;
}
/* tslint:enable */

/** The base interface for a tensorflow stats. */
export declare interface TensorflowStatsData {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  p?: TensorflowStatsProperty;
}

/** The base interface for a replica group. */
declare interface ReplicaGroup {
  replicaIds?: /* int64 */ string[];
}

/** The base interface for all reduce op info . */
export declare interface AllReduceOpInfo {
  name?: string;
  occurrences?: /* uint32 */ number;
  durationUs?: /* double */ number;
  dataSize?: /* uint64 */ string;
  replicaGroups?: ReplicaGroup[];
  description?: string;
}

/** The base interface for a channel info. */
export declare interface ChannelInfo {
  channelId?: /* int64 */ string;
  srcCoreIds?: /* uint32 */ number[];
  dstCoreIds?: /* uint32 */ number[];
  dataSize?: /* uint64 */ string;
  durationUs?: /* double */ number;
  occurrences?: /* uint32 */ number;
  utilization?: /* double */ number;
  hloNames?: string[];
  sendDelayUs?: /* double */ number;
  description?: string;
}

/** The base interface for a pod stats record. */
export declare interface PodStatsRecord {
  hostName?: string;
  chipId?: /* int32 */ number;
  nodeId?: /* int32 */ number;
  stepNum?: /* int32 */ number;
  totalDurationUs?: /* double */ number;
  stepBreakdownUs?: {[key: /* uint32 */ string]: /* double */ number};
  bottleneck?: string;
}

/** The base interface for a pod stats map. */
export declare interface PodStatsMap {
  stepNum?: /* uint32 */ number;
  podStatsPerCore?: {[key: /* uint32 */ string]: PodStatsRecord};
  channelDb?: ChannelInfo[];
  coreIdToReplicaIdMap?: {[key: /* uint32 */ string]: /* uint32 */ number};
  allReduceOpDb?: AllReduceOpInfo[];
}

/** The base interface for a pod stats sequence. */
declare interface PodStatsSequence {
  podStatsMap?: PodStatsMap[];
}

/** Chip details. */
export declare interface Chip {
  globalId?: number;
  hostX?: number;
  hostY?: number;
  hostZ?: number;
  indexOnHost?: number;
  x?: number;
  y?: number;
  z?: number;
}

/** The base interface for information to draw topology graph. */
export declare interface PodViewerTopology {
  xDimension?: number;
  yDimension?: number;
  zDimension?: number;
  hostXStride?: number;
  hostYStride?: number;
  hostZStride?: number;
  numCoresPerChip?: number;
  cores?: Chip[];
}

/** The base interface for a pod viewer summary. */
export declare interface PodViewerSummary {
  warnings?: string[];
}

/** Interface for pod viewer step breakdown event. */
export declare interface StepBreakdownEvent {
  id: number;
  name: string;
}

/** The base interface for a pod viewer database. */
export declare interface PodViewerDatabase {
  deviceType?: string;
  podStatsSequence?: PodStatsSequence;
  summary?: PodViewerSummary;
  diagnostics?: diagnosticsProto.Diagnostics;
  stepBreakdownEvents?: StepBreakdownEvent[];
  topology?: PodViewerTopology;
}

/** Interface for step breakdown details card in pod viewer. */
export declare interface StepBreakdownDetailsCard {
  hostName?: string;
  chipId?: /* int32 */ number;
  nodeId?: /* int32 */ number;
}

/** The data table type for a tensorflow stats or null. */
export type TensorflowStatsDataOrNull = TensorflowStatsData|null;

/** The data table type for a HloProto or null. */
export type HloProtoOrNull = (hloProto.HloProto)|null;

/** The data table type for a preprocessed memory viewer or null. */
export type MemoryViewerPreprocessResultOrNull =
    (memoryViewerPreprocess.PreprocessResult)|null;

/** The data table type for a MemoryProfile or null. */
export type MemoryProfileProtoOrNull = (memoryProfileProto.MemoryProfile)|null;

/** The data table type for a MemoryProfileSnapshot. */
export type MemoryProfileSnapshot = memoryProfileProto.MemoryProfileSnapshot;

/** The data table type for a Profile or null. */
export type ProfileOrNull = (opProfileProto.Profile)|null;

/** All overview page data table type. */
export type OverviewDataTable =
    GeneralAnalysis|InputPipelineAnalysis|RecommendationResult|RunEnvironment|
    SimpleDataTable|NormalizedAcceleratorPerformance;

/** All overview page data tuple type. */
export type OverviewDataTuple = [
  GeneralAnalysisOrNull,
  InputPipelineAnalysisOrNull,
  RunEnvironmentOrNull,
  RecommendationResultOrNull,
  SimpleDataTableOrNull,
  NormalizedAcceleratorPerformanceOrNull,
  SimpleDataTableOrNull,
];

/* tslint:disable enforce-name-casing */
declare interface TfFunctionExplanationTableProperty {
  note_self_time?: string;
  note_gpu_time?: string;
  note_unknown_tracing_time?: string;
  recommendation_header?: string;
  trace_optimization_html?: string;
  eager_optimization_html?: string;
}
/* tslint:enable */

/** The explanation table in tf-function stats. */
export declare interface TfFunctionExplanationTable {
  cols?: DataTableColumn[];
  rows?: DataTableRow[];
  p?: TfFunctionExplanationTableProperty;
}

/** The explanation table in tf-function stats or null. */
export type TfFunctionExplanationTableOrNull = TfFunctionExplanationTable|null;

/* tslint:disable enforce-name-casing */
declare interface TfFunctionDataTableProperty {
  has_concrete?: string;
  has_eager?: string;
}
/* tslint:enable */

/** The function table in tf-function stats. */
export declare interface TfFunctionDataTable {
  cols: DataTableColumn[];
  rows: DataTableRow[];
  p: TfFunctionDataTableProperty;
}

/** The function table in tf-function stats or null. */
export type TfFunctionDataTableOrNull = TfFunctionDataTable|null;

/** The data table type in tf-function stats. */
export type TfFunctionStatsTable =
    TfFunctionDataTable|TfFunctionExplanationTable;

/** The data table type in tf-function stats or null. */
export type TfFunctionStatsTableOrNull = TfFunctionStatsTable|null;

/** All input pipeline page data table type. */
export type InputPipelineDataTable = InputPipelineDeviceAnalysis|
    InputPipelineHostAnalysis|MetaHostOpTable|HostOpTable|SimpleDataTable;

/** The data table type for a PodViewerDatabase or null. */
export type PodViewerDatabaseOrNull = PodViewerDatabase|null;

/** The data types with number, string, or undefined. */
export type PrimitiveTypeNumberStringOrUndefined = number|string|undefined;

/** All data table type. */
export type DataTable =
    OverviewDataTable[]|InputPipelineDataTable[]|TensorflowStatsData[]|
    hloProto.HloProto|memoryViewerPreprocess.PreprocessResult|
    memoryProfileProto.MemoryProfile|opProfileProto.Profile|PodViewerDatabase|
    null;
