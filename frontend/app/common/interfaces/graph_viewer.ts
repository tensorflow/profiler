/** The interface for user input when generating a hlo graph */
export declare interface GraphConfigInput {
  selectedModule: string;
  opName: string;
  graphWidth: number;
  showMetadata: boolean;
  mergeFusion: boolean;
  programId?: string;
}

/** The query parameter object for route navigation and xhr */
export declare interface GraphViewerQueryParams {
  node_name: string;
  module_name: string;
  graph_width: number;
  show_metadata: boolean;
  merge_fusion: boolean;
  program_id?: string;
  graph_type?: string;
}
