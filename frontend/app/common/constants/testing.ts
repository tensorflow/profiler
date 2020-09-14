const DATA_TABLE_FOR_TESTING = {
  addColumn: () => {},
  getDistinctValues: () => [],
  getNumberOfColumns: () => 0,
  getNumberOfRows: () => 0,
  getColumnIndex: () => 0,
  getValue: () => 0,
  insertColumn: () => {},
  sort: () => {},
  clone: () => {
    return DATA_TABLE_FOR_TESTING;
  },
};

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
      return DATA_TABLE_FOR_TESTING;
    },
    NumberFormat: () => {
      return {format: () => {}};
    },
    DataTable: () => {
      return DATA_TABLE_FOR_TESTING;
    },
    Table: () => {},
  },
};
