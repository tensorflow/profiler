/**
 * Interface for statement info.
 * Determines the id of the statement to be extracted from the
 * recommendation result.
 */
export declare interface StatementInfo {
  id: string;
  color?: string;
}

/** Interface for statement data. */
export declare interface StatementData {
  value: string;
  color?: string;
}

/** Interface for tip info. */
export declare interface TipInfo {
  title: string;
  style?: {[key: string]: string};
  tips: string[];
  tipType: string;
}
