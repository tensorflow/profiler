import {DataTableCell, DataTableColumn, DataTableRow, Filter, GeneralDataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';

class DataTableForTesting {
  constructor(
      public data: GeneralDataTable|null = {cols: [], rows: [], p: {}}) {}
  addColumn(type: string, label?: string, id?: string) {
    this.data?.cols?.push({type, label, id});
  }
  clone() {
    return new DataTableForTesting(this.data);
  }
  getColumnIndex(column: number|string): number {
    if (!this.data || !this.data.cols) {
      return -1;
    }

    for (let i = 0; i < this.data.cols.length; i++) {
      if (this.data.cols[i].id === column ||
          this.data.cols[i].label === column) {
        return i;
      }
    }

    return -1;
  }
  getColumnLabel(columnIndex: number): string {
    if (!this.data || !this.data.cols) {
      return '';
    }
    if (columnIndex >= this.data.cols.length) {
      return '';
    }
    return this.data.cols[columnIndex].label as string;
  }
  getColumnType(columnIdx: number) {
    if (!this.data || !this.data.cols || this.data.cols.length <= columnIdx) {
      return null;
    }
    return this.data.cols[columnIdx].type;
  }
  getColumnId(columnIdx: number) {
    if (!this.data || !this.data.cols || this.data.cols.length <= columnIdx) {
      return '';
    }
    return this.data.cols[columnIdx].id;
  }
  getColumnRange(columnIdx: number) {
    if (!this.data || !this.data.rows) {
      return [Infinity, -Infinity];
    }
    let min = Infinity;
    let max = -Infinity;
    this.data.rows.forEach(row => {
      const val = row.c![columnIdx].v as number;
      min = Math.min(val, min);
      max = Math.max(val, max);
    });
    return [min, max];
  }
  getDistinctValues() {
    return [];
  }
  getNumberOfColumns() {
    if (!this.data || !this.data.cols) {
      return -1;
    }
    return this.data.cols.length;
  }
  getNumberOfRows() {
    if (!this.data || !this.data.rows) {
      return -1;
    }
    return this.data.rows.length;
  }
  getValue() {
    return 0;
  }
  getTableProperty(propName: string): string {
    if (!this.data || !this.data.p) {
      return '';
    }
    return this.data.p[propName];
  }
  getFilteredRows(filters: Filter[]): number[] {
    if (!this.data || !this.data.rows) {
      return [];
    }
    if (filters === ([] as AnyDuringTs48Migration)) {
      return [
        ...Array.from<number>({length: this.data.rows.length}).fill(0).keys()
      ];
    }
    const rowsIdxArray: number[] = [];
    this.data.rows.forEach((row, index) => {
      const includeRow = filters.reduce((include, filter) => {
        if (!this.data!.cols || this.data!.cols.length <= filter.column) {
          return include;
        }
        return include && row.c![filter.column] === filter.value;
      }, true);
      if (includeRow) {
        rowsIdxArray.push(index);
      }
    });
    return rowsIdxArray;
  }
  insertColumn() {}
  setColumn() {}
  setValue() {}
  addRow(row: DataTableCell[]) {
    this.data?.rows?.push({c: row});
  }
  sort() {}

  /**
   * Returns a JSON representation of this DataTableForTesting.
   *
   * @return A JSON representation of this DataTableForTesting.
   */
  toJSON(): string {
    return JSON.stringify({
      'cols': this.data?.cols,
      'rows': this.data?.rows,
    });
  }
}

class DataViewForTesting {
  visRows: number[] = [];
  visCols: number[] = [];
  constructor(public table: DataTableForTesting) {
    this.visRows = [
      ...Array.from<number>({length: table.getNumberOfRows()}).fill(0).keys()
    ];
    this.visCols = [
      ...Array.from<number>({length: table.getNumberOfColumns()}).fill(0).keys()
    ];
  }
  getNumberOfColumns() {
    return this.table.getNumberOfColumns();
  }
  getColumnLabel(columnIndex: number) {
    return this.table.getColumnLabel(columnIndex);
  }
  setRows(rowsIdxArray: number[]) {
    this.visRows = rowsIdxArray;
  }
  setColumns() {}
  toDataTable() {
    return new DataTableForTesting({
      cols: this.table?.data?.cols?.filter(
                (col: DataTableColumn, index: number) =>
                    this.visCols.includes(index)) ||
          [],
      rows: this.table?.data?.rows?.filter(
                (row: DataTableRow, index: number) =>
                    this.visRows.includes(index)) ||
          [],
      p: this.table?.data?.p || {},
    });
  }
}

/** The GViz object for testing */
export const GVIZ_FOR_TESTING = {
  charts: {
    safeLoad: () => {},
    setOnLoadCallback: () => {},
  },
  visualization: {
    AreaChart: () => {},
    arrayToDataTable: () => {
      return new DataTableForTesting();
    },
    NumberFormat: () => {
      return {format: () => {}};
    },
    DataTable: (data: GeneralDataTable|null = null) => {
      return new DataTableForTesting(data);
    },
    DataView: (table: DataTableForTesting) => {
      return new DataViewForTesting(table);
    },
    Table: () => {},
    data: {
      group(dt: DataTableForTesting) {
        return dt;
      },
      sum() {},
    }
  },
};
