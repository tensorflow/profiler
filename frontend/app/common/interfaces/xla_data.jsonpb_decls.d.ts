/* tslint:disable */
export type PrimitiveType =
    'PRIMITIVE_TYPE_INVALID'|'PRED'|'S8'|'S16'|'S32'|'S64'|'U8'|'U16'|'U32'|
    'U64'|'F16'|'F32'|'BF16'|'F64'|'C64'|'C128'|'TUPLE'|'OPAQUE_TYPE'|'TOKEN';
export const enum PrimitiveType$Names {
  PRIMITIVE_TYPE_INVALID = 'PRIMITIVE_TYPE_INVALID',
  PRED = 'PRED',
  S8 = 'S8',
  S16 = 'S16',
  S32 = 'S32',
  S64 = 'S64',
  U8 = 'U8',
  U16 = 'U16',
  U32 = 'U32',
  U64 = 'U64',
  F16 = 'F16',
  F32 = 'F32',
  BF16 = 'BF16',
  F64 = 'F64',
  C64 = 'C64',
  C128 = 'C128',
  TUPLE = 'TUPLE',
  OPAQUE_TYPE = 'OPAQUE_TYPE',
  TOKEN = 'TOKEN',
}
export const enum NumericPrimitiveType {
  PRIMITIVE_TYPE_INVALID = 0,
  PRED = 1,
  S8 = 2,
  S16 = 3,
  S32 = 4,
  S64 = 5,
  U8 = 6,
  U16 = 7,
  U32 = 8,
  U64 = 9,
  F16 = 10,
  F32 = 11,
  BF16 = 16,
  F64 = 12,
  C64 = 15,
  C128 = 18,
  TUPLE = 13,
  OPAQUE_TYPE = 14,
  TOKEN = 17,
}
export type DimLevelType = 'DIM_DENSE';
export const enum DimLevelType$Names {
  DIM_DENSE = 'DIM_DENSE',
}
export const enum NumericDimLevelType {
  DIM_DENSE = 0,
}
export type ProfileType = 'INVALID'|'WINDOW'|'FLAG'|'INTEGER';
export const enum ProfileType$Names {
  INVALID = 'INVALID',
  WINDOW = 'WINDOW',
  FLAG = 'FLAG',
  INTEGER = 'INTEGER',
}
export const enum NumericProfileType {
  INVALID = 0,
  WINDOW = 1,
  FLAG = 2,
  INTEGER = 3,
}
export type PaddingType = 'PADDING_INVALID'|'PADDING_VALID'|'PADDING_SAME';
export const enum PaddingType$Names {
  PADDING_INVALID = 'PADDING_INVALID',
  PADDING_VALID = 'PADDING_VALID',
  PADDING_SAME = 'PADDING_SAME',
}
export const enum NumericPaddingType {
  PADDING_INVALID = 0,
  PADDING_VALID = 1,
  PADDING_SAME = 2,
}
export type FftType = 'FFT'|'IFFT'|'RFFT'|'IRFFT';
export const enum FftType$Names {
  FFT = 'FFT',
  IFFT = 'IFFT',
  RFFT = 'RFFT',
  IRFFT = 'IRFFT',
}
export const enum NumericFftType {
  FFT = 0,
  IFFT = 1,
  RFFT = 2,
  IRFFT = 3,
}
export type RandomDistribution = 'RNG_INVALID'|'RNG_UNIFORM'|'RNG_NORMAL';
export const enum RandomDistribution$Names {
  RNG_INVALID = 'RNG_INVALID',
  RNG_UNIFORM = 'RNG_UNIFORM',
  RNG_NORMAL = 'RNG_NORMAL',
}
export const enum NumericRandomDistribution {
  RNG_INVALID = 0,
  RNG_UNIFORM = 1,
  RNG_NORMAL = 2,
}
export type RandomAlgorithm = 'RNG_DEFAULT'|'RNG_THREE_FRY'|'RNG_PHILOX';
export const enum RandomAlgorithm$Names {
  RNG_DEFAULT = 'RNG_DEFAULT',
  RNG_THREE_FRY = 'RNG_THREE_FRY',
  RNG_PHILOX = 'RNG_PHILOX',
}
export const enum NumericRandomAlgorithm {
  RNG_DEFAULT = 0,
  RNG_THREE_FRY = 1,
  RNG_PHILOX = 2,
}
export interface PaddingConfig {
  dimensions?: PaddingConfig.PaddingConfigDimension[];
}
export namespace PaddingConfig {
  export interface PaddingConfigDimension {
    edgePaddingLow?: /* int64 */ string;
    edgePaddingHigh?: /* int64 */ string;
    interiorPadding?: /* int64 */ string;
  }
}
export interface TileProto {
  dimensions?: /* int64 */ string[];
}
export interface LayoutProto {
  dimLevelTypes?: DimLevelType[];
  minorToMajor?: /* int64 */ string[];
  tiles?: TileProto[];
  elementSizeInBits?: /* int64 */ string;
  memorySpace?: /* int64 */ string;
}
export interface ShapeProto {
  elementType?: PrimitiveType;
  dimensions?: /* int64 */ string[];
  tupleShapes?: ShapeProto[];
  layout?: LayoutProto;
  isDynamicDimension?: boolean[];
}
export interface ProgramShapeProto {
  parameters?: ShapeProto[];
  result?: ShapeProto;
  parameterNames?: string[];
}
export interface ComputationStats {
  flopCount?: /* double */ number;
  transcendentalCount?: /* double */ number;
}
export interface OpMetadata {
  opType?: string;
  opName?: string;
  sourceFile?: string;
  sourceLine?: /* int32 */ number;
  profileType?: ProfileType[];
  creationPassId?: /* int64 */ string;
  logicalCreationPassId?: /* int64 */ string;
  sizeOfGeneratedCodeInBytes?: /* int64 */ string;
  sizeOfMemoryWorkingSetInBytes?: /* int64 */ string;
}
export interface ExecutionProfile {
  compilationCacheHit?: boolean;
  compileTimeMs?: /* int64 */ string;
  computeCycleCount?: /* int64 */ string;
  computeTimeNs?: /* int64 */ string;
  computeAndTransferTimeNs?: /* int64 */ string;
  executableSizeInBytes?: /* int64 */ string;
  profileCacheHit?: boolean;
}
export interface ExecutionHandle {
  handle?: /* int64 */ string;
}
export interface GlobalDataHandle {
  handle?: /* int64 */ string;
}
export interface DeviceHandle {
  handle?: /* int64 */ string;
  deviceCount?: /* int64 */ string;
}
export interface ChannelHandle {
  handle?: /* int64 */ string;
  type?: ChannelHandle.ChannelType;
}
export namespace ChannelHandle {
  export type ChannelType = 'CHANNEL_TYPE_INVALID'|'DEVICE_TO_DEVICE'|
      'DEVICE_TO_HOST'|'HOST_TO_DEVICE';
  export const enum ChannelType$Names {
    CHANNEL_TYPE_INVALID = 'CHANNEL_TYPE_INVALID',
    DEVICE_TO_DEVICE = 'DEVICE_TO_DEVICE',
    DEVICE_TO_HOST = 'DEVICE_TO_HOST',
    HOST_TO_DEVICE = 'HOST_TO_DEVICE',
  }
  export const enum NumericChannelType {
    CHANNEL_TYPE_INVALID = 0,
    DEVICE_TO_DEVICE = 1,
    DEVICE_TO_HOST = 2,
    HOST_TO_DEVICE = 3,
  }
}
export interface DeviceAssignmentProto {
  replicaCount?: /* int32 */ number;
  computationCount?: /* int32 */ number;
  computationDevices?: DeviceAssignmentProto.ComputationDevice[];
}
export namespace DeviceAssignmentProto {
  export interface ComputationDevice {
    replicaDeviceIds?: /* int32 */ number[];
  }
}
export interface LiteralProto {
  shape?: ShapeProto;
  preds?: boolean[];
  s8s?: /* bytes */ string;
  u8s?: /* bytes */ string;
  s32s?: /* int32 */ number[];
  s64s?: /* int64 */ string[];
  u32s?: /* uint32 */ number[];
  u64s?: /* uint64 */ string[];
  f32s?: /* float */ number[];
  f64s?: /* double */ number[];
  c64s?: /* float */ number[];
  c128s?: /* double */ number[];
  tupleLiterals?: LiteralProto[];
  f16s?: /* bytes */ string;
  bf16s?: /* bytes */ string;
  u16s?: /* bytes */ string;
  s16s?: /* bytes */ string;
  sparseIndices?: /* int64 */ string[];
}
export interface WindowDimension {
  size?: /* int64 */ string;
  stride?: /* int64 */ string;
  paddingLow?: /* int64 */ string;
  paddingHigh?: /* int64 */ string;
  windowDilation?: /* int64 */ string;
  baseDilation?: /* int64 */ string;
  windowReversal?: boolean;
}
export interface Window {
  dimensions?: WindowDimension[];
}
export interface GatherDimensionNumbers {
  offsetDims?: /* int64 */ string[];
  collapsedSliceDims?: /* int64 */ string[];
  startIndexMap?: /* int64 */ string[];
  indexVectorDim?: /* int64 */ string;
}
export interface ScatterDimensionNumbers {
  updateWindowDims?: /* int64 */ string[];
  insertedWindowDims?: /* int64 */ string[];
  scatterDimsToOperandDims?: /* int64 */ string[];
  indexVectorDim?: /* int64 */ string;
}
export interface ConvolutionDimensionNumbers {
  inputBatchDimension?: /* int64 */ string;
  inputFeatureDimension?: /* int64 */ string;
  inputSpatialDimensions?: /* int64 */ string[];
  kernelInputFeatureDimension?: /* int64 */ string;
  kernelOutputFeatureDimension?: /* int64 */ string;
  kernelSpatialDimensions?: /* int64 */ string[];
  outputBatchDimension?: /* int64 */ string;
  outputFeatureDimension?: /* int64 */ string;
  outputSpatialDimensions?: /* int64 */ string[];
}
export interface DotDimensionNumbers {
  lhsContractingDimensions?: /* int64 */ string[];
  rhsContractingDimensions?: /* int64 */ string[];
  lhsBatchDimensions?: /* int64 */ string[];
  rhsBatchDimensions?: /* int64 */ string[];
}
export interface TriangularSolveOptions {
  leftSide?: boolean;
  lower?: boolean;
  unitDiagonal?: boolean;
  transposeA?: TriangularSolveOptions.Transpose;
}
export namespace TriangularSolveOptions {
  export type Transpose =
      'TRANSPOSE_INVALID'|'NO_TRANSPOSE'|'TRANSPOSE'|'ADJOINT';
  export const enum Transpose$Names {
    TRANSPOSE_INVALID = 'TRANSPOSE_INVALID',
    NO_TRANSPOSE = 'NO_TRANSPOSE',
    TRANSPOSE = 'TRANSPOSE',
    ADJOINT = 'ADJOINT',
  }
  export const enum NumericTranspose {
    TRANSPOSE_INVALID = 0,
    NO_TRANSPOSE = 1,
    TRANSPOSE = 2,
    ADJOINT = 3,
  }
}
export interface CholeskyOptions {
  lower?: boolean;
}
export interface FrontendAttributes {
  map?: {[key: /* string */ string]: string};
}
export interface OpSharding {
  type?: OpSharding.Type;
  tileShape?: ShapeProto;
  tileAssignmentDimensions?: /* int64 */ string[];
  tileAssignmentDevices?: /* int64 */ string[];
  tupleShardings?: OpSharding[];
  replicateOnLastTileDim?: boolean;
  metadata?: OpMetadata[];
  lastTileDims?: OpSharding.Type[];
}
export namespace OpSharding {
  export type Type = 'REPLICATED'|'MAXIMAL'|'TUPLE'|'OTHER'|'MANUAL';
  export const enum Type$Names {
    REPLICATED = 'REPLICATED',
    MAXIMAL = 'MAXIMAL',
    TUPLE = 'TUPLE',
    OTHER = 'OTHER',
    MANUAL = 'MANUAL',
  }
  export const enum NumericType {
    REPLICATED = 0,
    MAXIMAL = 1,
    TUPLE = 2,
    OTHER = 3,
    MANUAL = 4,
  }
}
export interface ReplicaGroup {
  replicaIds?: /* int64 */ string[];
}
export interface SourceTarget {
  source?: /* int64 */ string;
  target?: /* int64 */ string;
}
export interface PrecisionConfig {
  operandPrecision?: PrecisionConfig.Precision[];
}
export namespace PrecisionConfig {
  export type Precision = 'DEFAULT'|'HIGH'|'HIGHEST';
  export const enum Precision$Names {
    DEFAULT = 'DEFAULT',
    HIGH = 'HIGH',
    HIGHEST = 'HIGHEST',
  }
  export const enum NumericPrecision {
    DEFAULT = 0,
    HIGH = 1,
    HIGHEST = 2,
  }
}
export interface ParameterReplication {
  replicatedAtLeafBuffers?: boolean[];
}
export interface WhileLoopBackendConfig {
  knownTripCount?: WhileLoopBackendConfig.KnownTripCount;
}
export namespace WhileLoopBackendConfig {
  export interface KnownTripCount {
    n?: /* int64 */ string;
  }
}
export interface CustomCallOutputOperandAliasing {
  outputShapeIndex?: /* int64 */ string[];
  operandIndex?: /* int64 */ string;
  operandShapeIndex?: /* int64 */ string[];
}
