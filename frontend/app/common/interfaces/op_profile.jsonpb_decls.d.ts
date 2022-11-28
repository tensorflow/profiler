/* tslint:disable */
export interface Profile {
  byCategory?: Node;
  byProgram?: Node;
  deviceType?: string;
  byCategoryExcludeIdle?: Node;
  byProgramExcludeIdle?: Node;
}
export interface Node {
  name?: string;
  metrics?: Metrics;
  children?: Node[];
  category?: Node.InstructionCategory;
  xla?: Node.XLAInstruction;
  numChildren?: /* int32 */ number;
}
export namespace Node {
  export interface InstructionCategory {}
  export interface XLAInstruction {
    op?: string;
    expression?: string;
    provenance?: string;
    category?: string;
    layout?: Node.XLAInstruction.LayoutAnalysis;
    computationPrimitiveSize?: /* uint32 */ number;
  }
  export namespace XLAInstruction {
    export interface LayoutAnalysis {
      dimensions?: Node.XLAInstruction.LayoutAnalysis.Dimension[];
    }
    export namespace LayoutAnalysis {
      export interface Dimension {
        size?: /* int32 */ number;
        alignment?: /* int32 */ number;
        semantics?: string;
      }
    }
  }
}
export interface Metrics {
  time?: /* double */ number;
  flops?: /* double */ number;
  memoryBandwidth?: /* double */ number;
  rawTime?: /* double */ number;
  rawFlops?: /* double */ number;
  rawBytesAccessed?: /* double */ number;
}
