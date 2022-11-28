/* tslint:disable */
import * as xla_data from './xla_data.jsonpb_decls';

export type CustomCallSchedule =
    'SCHEDULE_NONE'|'SCHEDULE_LATEST'|'SCHEDULE_EARLIEST';
export const enum CustomCallSchedule$Names {
  SCHEDULE_NONE = 'SCHEDULE_NONE',
  SCHEDULE_LATEST = 'SCHEDULE_LATEST',
  SCHEDULE_EARLIEST = 'SCHEDULE_EARLIEST',
}
export const enum NumericCustomCallSchedule {
  SCHEDULE_NONE = 0,
  SCHEDULE_LATEST = 1,
  SCHEDULE_EARLIEST = 2,
}
export type CustomCallApiVersion = 'API_VERSION_UNSPECIFIED'|
    'API_VERSION_ORIGINAL'|'API_VERSION_STATUS_RETURNING';
export const enum CustomCallApiVersion$Names {
  API_VERSION_UNSPECIFIED = 'API_VERSION_UNSPECIFIED',
  API_VERSION_ORIGINAL = 'API_VERSION_ORIGINAL',
  API_VERSION_STATUS_RETURNING = 'API_VERSION_STATUS_RETURNING',
}
export const enum NumericCustomCallApiVersion {
  API_VERSION_UNSPECIFIED = 0,
  API_VERSION_ORIGINAL = 1,
  API_VERSION_STATUS_RETURNING = 2,
}
export type Kind = 'UNDEFINED_ALIAS'|'MAY_ALIAS'|'MUST_ALIAS';
export const enum Kind$Names {
  UNDEFINED_ALIAS = 'UNDEFINED_ALIAS',
  MAY_ALIAS = 'MAY_ALIAS',
  MUST_ALIAS = 'MUST_ALIAS',
}
export const enum NumericKind {
  UNDEFINED_ALIAS = 0,
  MAY_ALIAS = 1,
  MUST_ALIAS = 2,
}
export interface HloInstructionProto {
  name?: string;
  opcode?: string;
  shape?: xla_data.ShapeProto;
  metadata?: xla_data.OpMetadata;
  literal?: xla_data.LiteralProto;
  parameterNumber?: /* int64 */ string;
  fusionKind?: string;
  tupleIndex?: /* int64 */ string;
  dimensions?: /* int64 */ string[];
  window?: xla_data.Window;
  convolutionDimensionNumbers?: xla_data.ConvolutionDimensionNumbers;
  featureGroupCount?: /* int64 */ string;
  batchGroupCount?: /* int64 */ string;
  sliceDimensions?: HloInstructionProto.SliceDimensions[];
  exponentBits?: /* int32 */ number;
  mantissaBits?: /* int32 */ number;
  dynamicSliceSizes?: /* int64 */ string[];
  paddingConfig?: xla_data.PaddingConfig;
  outfeedConfig?: /* bytes */ string;
  distribution?: xla_data.RandomDistribution;
  epsilon?: /* float */ number;
  featureIndex?: /* int64 */ string;
  channelId?: /* int64 */ string;
  infeedConfig?: /* bytes */ string;
  customCallTarget?: string;
  outfeedShape?: xla_data.ShapeProto;
  dotDimensionNumbers?: xla_data.DotDimensionNumbers;
  fftType?: xla_data.FftType;
  fftLength?: /* int64 */ string[];
  comparisonDirection?: string;
  gatherDimensionNumbers?: xla_data.GatherDimensionNumbers;
  gatherSliceSizes?: /* int64 */ string[];
  channelName?: string;
  costEstimateNs?: /* int64 */ string;
  id?: /* int64 */ string;
  operandIds?: /* int64 */ string[];
  controlPredecessorIds?: /* int64 */ string[];
  calledComputationIds?: /* int64 */ string[];
  sharding?: xla_data.OpSharding;
  backendConfig?: /* bytes */ string;
  replicaGroups?: xla_data.ReplicaGroup[];
  /** @deprecated */
  allReduceId?: /* int64 */ string;
  useGlobalDeviceIds?: boolean;
  isHostTransfer?: boolean;
  isStable?: boolean;
  scatterDimensionNumbers?: xla_data.ScatterDimensionNumbers;
  precisionConfig?: xla_data.PrecisionConfig;
  sourceTargetPairs?: xla_data.SourceTarget[];
  domainEntrySharding?: xla_data.OpSharding;
  domainExitSharding?: xla_data.OpSharding;
  constrainLayout?: boolean;
  operandShapesWithLayout?: xla_data.ShapeProto[];
  triangularSolveOptions?: xla_data.TriangularSolveOptions;
  choleskyOptions?: xla_data.CholeskyOptions;
  parameterReplication?: xla_data.ParameterReplication;
  outerDimensionPartitions?: /* int64 */ string[];
  customCallHasSideEffect?: boolean;
  customCallOutputOperandAliasing?: xla_data.CustomCallOutputOperandAliasing[];
  customCallSchedule?: CustomCallSchedule;
  delta?: /* int64 */ string;
  indicesAreSorted?: boolean;
  frontendAttributes?: xla_data.FrontendAttributes;
  uniqueIndices?: boolean;
  rngAlgorithm?: xla_data.RandomAlgorithm;
  comparisonType?: string;
  isCrossProgramPrefetch?: boolean;
  paddingType?: xla_data.PaddingType;
  customCallApiVersion?: CustomCallApiVersion;
}
export namespace HloInstructionProto {
  export interface SliceDimensions {
    start?: /* int64 */ string;
    limit?: /* int64 */ string;
    stride?: /* int64 */ string;
  }
}
export interface HloComputationProto {
  name?: string;
  instructions?: HloInstructionProto[];
  programShape?: xla_data.ProgramShapeProto;
  id?: /* int64 */ string;
  rootId?: /* int64 */ string;
}
export interface HloScheduleProto {
  sequences?: {[key: /* int64 */ string]: HloScheduleProto.InstructionSequence};
}
export namespace HloScheduleProto {
  export interface InstructionSequence {
    instructionIds?: /* int64 */ string[];
  }
}
export interface HloInputOutputAliasProto {
  entries?: HloInputOutputAliasProto.AliasEntryProto[];
}
export namespace HloInputOutputAliasProto {
  export interface AliasEntryProto {
    outputShapeIndex?: /* int64 */ string[];
    parameterNumber?: /* int64 */ string;
    parameterShapeIndex?: /* int64 */ string[];
    kind?: Kind;
  }
}
export interface DynamicParameterBindingProto {
  entries?: DynamicParameterBindingProto.Binding[];
}
export namespace DynamicParameterBindingProto {
  export interface Binding {
    dynamicParamNum?: /* int64 */ string;
    dynamicParamIndex?: /* int64 */ string[];
    targetParamNum?: /* int64 */ string;
    targetParamIndex?: /* int64 */ string[];
    targetParamDimNum?: /* int64 */ string;
  }
}
export interface CrossProgramPrefetch {
  parameter?: /* int64 */ string;
  index?: /* int64 */ string[];
}
export interface HloModuleProto {
  name?: string;
  entryComputationName?: string;
  entryComputationId?: /* int64 */ string;
  computations?: HloComputationProto[];
  hostProgramShape?: xla_data.ProgramShapeProto;
  id?: /* int64 */ string;
  schedule?: HloScheduleProto;
  inputOutputAlias?: HloInputOutputAliasProto;
  dynamicParameterBinding?: DynamicParameterBindingProto;
  crossProgramPrefetches?: CrossProgramPrefetch[];
  isDynamic?: boolean;
}
export interface LogicalBufferProto {
  id?: /* int64 */ string;
  size?: /* int64 */ string;
  definedAt?: LogicalBufferProto.Location;
  color?: /* int64 */ string;
}
export namespace LogicalBufferProto {
  export interface Location {
    computationName?: string;
    instructionName?: string;
    shapeIndex?: /* int64 */ string[];
  }
}
export interface BufferAllocationProto {
  index?: /* int64 */ string;
  size?: /* int64 */ string;
  isThreadLocal?: boolean;
  isTuple?: boolean;
  isEntryComputationParameter?: boolean;
  isConstant?: boolean;
  parameterNumber?: /* int64 */ string;
  parameterShapeIndex?: /* int64 */ string[];
  maybeLiveOut?: boolean;
  color?: /* int64 */ string;
  assigned?: BufferAllocationProto.Assigned[];
}
export namespace BufferAllocationProto {
  export interface Assigned {
    logicalBufferId?: /* int64 */ string;
    offset?: /* int64 */ string;
    size?: /* int64 */ string;
  }
}
export interface HeapSimulatorTrace {
  events?: HeapSimulatorTrace.Event[];
  wholeModuleSimulation?: boolean;
  bufferAllocationIndex?: /* int64 */ string;
}
export namespace HeapSimulatorTrace {
  export interface Event {
    kind?: HeapSimulatorTrace.Event.Kind;
    bufferId?: /* int64 */ string;
    computationName?: string;
    instructionName?: string;
    shareWithCanonicalId?: /* int64 */ string;
  }
  export namespace Event {
    export type Kind = 'ALLOC'|'FREE'|'SHARE_WITH';
    export const enum Kind$Names {
      ALLOC = 'ALLOC',
      FREE = 'FREE',
      SHARE_WITH = 'SHARE_WITH',
    }
    export const enum NumericKind {
      ALLOC = 0,
      FREE = 1,
      SHARE_WITH = 2,
    }
  }
}
export interface HloModuleGroupProto {
  name?: string;
  hloModules?: HloModuleProto[];
}
export interface BufferAssignmentProto {
  logicalBuffers?: LogicalBufferProto[];
  bufferAliases?: BufferAssignmentProto.BufferAlias[];
  bufferAllocations?: BufferAllocationProto[];
  heapSimulatorTraces?: HeapSimulatorTrace[];
}
export namespace BufferAssignmentProto {
  export interface BufferAlias {
    sourceBufferId?: /* int64 */ string;
    location?: LogicalBufferProto.Location;
  }
}
export interface HloProto {
  hloModule?: HloModuleProto;
  bufferAssignment?: BufferAssignmentProto;
}
export interface HloSnapshot {
  hlo?: HloProto;
  arguments?: xla_data.LiteralProto[];
  result?: xla_data.LiteralProto;
  executionPlatform?: string;
}
export interface HloModuleMetadataProto {
  canonicalModuleId?: /* int64 */ string;
  moduleGroupName?: string;
  originalModuleId?: /* int64 */ string;
  partitionedModuleIds?: /* int64 */ string[];
  passMetadata?: HloPassMetadata[];
}
export interface HloPassMetadata {
  passId?: /* int64 */ string;
  passName?: string;
  pipelineName?: string;
  dumpFilenames?: string[];
  moduleChanged?: boolean;
  moduleId?: /* int64 */ string;
  moduleGroupModuleIds?: /* int64 */ string[];
  startTimestampUsec?: /* int64 */ string;
  endTimestampUsec?: /* int64 */ string;
}
