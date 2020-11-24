// Type definitions for additional types of Gviz

declare namespace google {
  namespace charts {
    function safeLoad(packages: object): void;
  }
  namespace visualization {
    namespace data {
      // TODO(b/161803357): Remove 'any' after go/lsc-gviz-externs-cleanup.
      // tslint:disable-next-line:no-any
      function group(dataTable?: any, keys?: any, columns?: any): DataTable;
      function avg(): void;
      function count(): void;
      function max(): void;
      function min(): void;
      function sum(): void;
    }

    export interface ChartTooltip extends ChartTooltip {
      ignoreBounds?: boolean;
    }

    export interface DataTableCellFilter extends DataTableCellFilter {
      // TODO(b/161803357): Remove 'any' after go/lsc-gviz-externs-cleanup.
      test?:
          // tslint:disable-next-line:no-any
          (value: any, rowIndex: number, columnIndex: number,
           // tslint:disable-next-line:no-any
           dataTable: any) => boolean;
    }

    export class DataTableExt extends DataTable {
      getColumnIndex(column: number|string): number;
    }

    interface Intervals {
      style?: string;
      color?: string;
    }

    export interface LineChartOptions extends LineChartOptions {
      intervals?: Intervals;
    }
  }
}
