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
    Table: () => {},
  },
};
