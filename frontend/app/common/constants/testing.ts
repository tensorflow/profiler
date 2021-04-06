import {SimpleDataTableOrNull} from 'org_xprof/frontend/app/common/interfaces/data_table';

class DataTableForTesting {
  constructor(public data: SimpleDataTableOrNull = null) {}
  addColumn() {}
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
    return 0;
  }
  getValue() {
    return 0;
  }
  insertColumn() {}
  setColumn() {}
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
  constructor(public table: DataTableForTesting) {}
  getNumberOfColumns() {
    return this.table.getNumberOfColumns();
  }
  getColumnLabel(columnIndex: number) {
    return this.table.getColumnLabel(columnIndex);
  }
}

/** The GViz object for testing */
export const GVIZ_FOR_TESTING = {
  charts: {
    load: () => {},
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
    DataTable: (data: SimpleDataTableOrNull = null) => {
      return new DataTableForTesting(data);
    },
    DataView: (table: DataTableForTesting) => {
      return new DataViewForTesting(table);
    },
    Table: () => {},
  },
};
