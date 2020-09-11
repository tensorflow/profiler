/** The GViz object for testing */
export const GVIZ_FOR_TESTING = {
  charts: {
    load: () => {},
    safeLoad: () => {},
    setOnLoadCallback: () => {},
  },
  visualization: {
    AreaChart: () => {},
    NumberFormat: () => {
      return {format: () => {}};
    },
    DataTable: () => {
      return {
        addColumn: () => {},
        getDistinctValues: () => [],
        getNumberOfColumns: () => 0,
        getNumberOfRows: () => 0,
        getColumnIndex: () => 0,
        getValue: () => 0,
        insertColumn: () => {},
        sort: () => {},
        clone: () => {
          return {
            addColumn: () => {},
            getDistinctValues: () => [],
            getNumberOfColumns: () => 0,
            getNumberOfRows: () => 0,
            getColumnIndex: () => 0,
            getValue: () => 0,
            insertColumn: () => {},
            sort: () => {},
          };
        },
      };
    },
    Table: () => {},
  },
};
