/** The OpProfileNode interface. */
export declare interface OpProfileNode {
  metrics?: Metrics;
}

/** The Metrics interface. */
declare interface Metrics {
  time?: number;
  flops?: number;
  memoryBandwidthUtil?: number;
  hbmBandwidthUtil?: number;
  rawTime?: number;
  rawFlops?: number;
  rawBytesAccessed?: number;
}
