/** The base interface for a navigation event. */
export declare interface NavigationEvent {
  // TODO(jonahweaver): Replace run and tag, with sessionId and tool
  // respectively.
  run?: string;
  tag?: string;
  host?: string;
  // Graph Viewer crosslink params
  opName?: string;
  // Navigation controlling params
  firstLoad?: boolean;
  moduleName?: string;
  memorySpaceColor?: string;
}
