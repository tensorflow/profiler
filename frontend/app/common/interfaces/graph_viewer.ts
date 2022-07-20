/** The interface for user input when generating a hlo graph */
export declare interface GraphConfigInput {
  moduleList: string[];
  selectedModule: string;
  opName: string;
  graphWidth: number;
  showMetadata: boolean;
  mergeFusion: boolean;
}
