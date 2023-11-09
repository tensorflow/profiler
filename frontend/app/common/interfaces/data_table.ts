import * as hloProto from 'org_xprof/frontend/app/common/interfaces/hlo.jsonpb_decls';
import * as memoryProfileProto from 'org_xprof/frontend/app/common/interfaces/memory_profile.jsonpb_decls';
import * as memoryViewerPreprocess from 'org_xprof/frontend/app/common/interfaces/memory_viewer_preprocess.jsonpb_decls';
import * as opProfileProto from 'org_xprof/frontend/app/common/interfaces/op_profile.jsonpb_decls';
import * as diagnosticsProto from 'org_xprof/frontend/app/common/interfaces/diagnostics';

/** Constant of empty data in SimpleDataTable typing */
export const DEFAULT_SIMPLE_DATA_TABLE = {
  cols: [],
  rows: [],
  p: {},
};

/** All cell value type */
export type DataTableCellValue = string|number|boolean;

/** The base interface for a table filter.  */
export declare interface Filter extends
    google.visualization.DataTableCellFilter {}

/** The base interface for a genreal property object. */
// Make the property k-v pair more general, note:
// (1) value is always string
// (2) Frontend should be responsible of correct key reference
// and always have a default value fallback
declare interface GeneralProperty {
  [key: string]: string;
}

/** The base interface for data table without perperty. */
// We still needs this wrapper over gviz typing because our `p` is optional,
// which is the contract between Xprof FE and BE (API implementation also has p
// as optional)
// We partially extends the gviz interface to enable that
export interface SimpleDataTable extends
    Partial<google.visualization.DataObject> {}

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
export declare interface MetaHostOpTable extends SimpleDataTable {
  p?: MetaHostOpTableProperty;
}

/** The base interface for properties of host-op table. */
declare interface HostOpTableProperty {
  hostop: string;
  hostname: string;
  value: string;
}

/** The base interface for host-op table. */
export declare interface HostOpTable extends SimpleDataTable {
  p?: HostOpTableProperty;
}

/** The base interface for a general analysis. */
export declare interface GeneralAnalysis extends SimpleDataTable {
  p?: GeneralProperty;
}

/** The base interface for an input pipeline analysis. */
export declare interface InputPipelineAnalysis extends SimpleDataTable {
  p?: GeneralProperty;
}

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
export declare interface RunEnvironment extends SimpleDataTable {
  p?: RunEnvironmentProperty;
}

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
export declare interface RecommendationResult extends SimpleDataTable {
  p?: RecommendationResultProperty;
}

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
export declare interface NormalizedAcceleratorPerformance extends
    SimpleDataTable {
  p?: NormalizedAcceleratorPerformanceProperty;
}

/** The data table type for an input pipeline device-side analysis. */
export type InputPipelineDeviceAnalysis = InputPipelineAnalysis;

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
export declare interface InputPipelineHostAnalysis extends SimpleDataTable {
  p?: InputPipelineHostAnalysisProperty;
}

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
export declare interface TensorflowStatsData extends SimpleDataTable {
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

/** The data table type for a HloProto */
export type HloProto = hloProto.HloProto;

/** The data table type for a preprocessed memory viewer */
export type MemoryViewerPreprocessResult =
    memoryViewerPreprocess.PreprocessResult;

/** The data table type for a MemoryProfile. */
export type MemoryProfileProto = memoryProfileProto.MemoryProfile;

/** The data table type for a MemoryProfileSnapshot. */
export type MemoryProfileSnapshot = memoryProfileProto.MemoryProfileSnapshot;

/** The data table type for an Op Profile */
export type OpProfileProto = opProfileProto.Profile;

/** All overview page data table type. */
export type OverviewDataTable =
    GeneralAnalysis|InputPipelineAnalysis|RecommendationResult|RunEnvironment|
    SimpleDataTable|NormalizedAcceleratorPerformance;

/** All overview page data tuple type. */
export type OverviewDataTuple = [
  GeneralAnalysis,
  InputPipelineAnalysis,
  RunEnvironment,
  RecommendationResult,
  SimpleDataTable,
  NormalizedAcceleratorPerformance,
  SimpleDataTable,
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
export declare interface TfFunctionExplanationTable extends SimpleDataTable {
  p?: TfFunctionExplanationTableProperty;
}

/* tslint:disable enforce-name-casing */
declare interface TfFunctionDataTableProperty {
  has_concrete?: string;
  has_eager?: string;
}
/* tslint:enable */

/** The function table in tf-function stats. */
export declare interface TfFunctionDataTable extends SimpleDataTable {
  p?: TfFunctionDataTableProperty;
}

/** The data table type in tf-function stats. */
export type TfFunctionStatsTable =
    TfFunctionDataTable|TfFunctionExplanationTable;

/** All input pipeline page data table type. */
export type InputPipelineDataTable = InputPipelineDeviceAnalysis|
    InputPipelineHostAnalysis|MetaHostOpTable|HostOpTable|SimpleDataTable;

/** The data types with number, string, or undefined. */
export type PrimitiveTypeNumberStringOrUndefined = number|string|undefined;

/** All data type from tool response data. */
export type DataTable =
    SimpleDataTable|OverviewDataTable[]|InputPipelineDataTable[]|
    TensorflowStatsData[]|HloProto|MemoryViewerPreprocessResult|
    MemoryProfileProto|OpProfileProto|PodViewerDatabase;

/**
 * All DataTable types extended from google.visualization.DataTable.
 */
export type DataTableUnion = SimpleDataTable|TensorflowStatsData|
    TfFunctionExplanationTable|TfFunctionDataTable|MetaHostOpTable|HostOpTable|
    GeneralAnalysis|InputPipelineAnalysis|InputPipelineHostAnalysis|
    RunEnvironment|RecommendationResult|RecommendationResult;
