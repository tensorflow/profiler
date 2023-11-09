import {SimpleDataTable} from 'org_xprof/frontend/app/common/interfaces/data_table';

/** A base class for a google-charts dashboard. */
export class Dashboard {
  dataTable?: google.visualization.DataTable;

  // Columns from dataTable visible in dataView.
  // If empty, all columns from dataTable are shown.
  columns: Array<number|google.visualization.ColumnSpec> = [];

  // Filters for selecting rows from dataTable to show in dataView.
  // If empty, all rows from dataTable are shown.
  filters = new Map<number, google.visualization.DataTableCellFilter>();

  dataView?: google.visualization.DataView;

  parseData(data: SimpleDataTable|null) {
    if (!data) return;

    this.dataTable = new google.visualization.DataTable(data);
    this.updateView();
  }

  updateFilters(filter: google.visualization.DataTableCellFilter) {
    if (filter.column === -1) {
      return;
    }
    if (('value' in filter && filter.value !== undefined) ||
        ('minValue' in filter && filter.minValue !== undefined) ||
        ('maxValue' in filter && filter.maxValue !== undefined) ||
        'test' in filter) {
      this.filters.set(filter.column, filter);
    } else {
      this.filters.delete(filter.column);
    }
    this.updateView();
  }

  updateView() {
    if (!this.dataTable) {
      return;
    }
    const dataView = new google.visualization.DataView(this.dataTable);
    if (this.columns.length !== 0) {
      dataView.setColumns(this.columns);
    }
    if (this.filters.size !== 0) {
      dataView.setRows(this.dataTable.getFilteredRows(this.getFilters()));
    }
    this.dataView = dataView;
  }

  getFilters(): google.visualization.DataTableCellFilter[] {
    return Array.from(this.filters.values());
  }
}
