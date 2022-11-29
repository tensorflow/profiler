/** The OpProfileNode interface. */
export declare interface OpProfileNode {
  metrics?: Metrics;
}

/** The Metrics interface. */
declare interface Metrics {
  timeFraction?: number;
  flops?: number;
  memoryBandwidth?: number;
  rawTime?: number;
  rawFlops?: number;
  rawBytesAccessed?: number;
}
