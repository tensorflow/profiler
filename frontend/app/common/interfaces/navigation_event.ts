/** The base interface for a navigation event. */
export declare interface NavigationEvent {
  run?: string;
  tag?: string;
  host?: string;
  // Graph Viewer crosslink params
  opName?: string;
}
