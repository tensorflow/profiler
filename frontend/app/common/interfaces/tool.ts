/** The base interface for tool item. */
export interface Tool {
  name: string;
  activeTools: string[];
}

/** The base interface for run tools map. */
export interface RunToolsMap {
  [key: string]: string[];
}
