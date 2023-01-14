import {ChartClass} from 'org_xprof/frontend/app/common/interfaces/chart';

interface FormatDiffInfo {
  rangeMin?: number;
  rangeMax?: number;
  hasColor: boolean;
  isLargeBetter: boolean;
}

interface FormatValueInfo {
  rangeMin?: number;
  rangeMax?: number;
  multiplier: number;
  fixed: number;
  suffix: string;
}

const RANGE_MIN = 0;
const RANGE_MAX = 999;
const XNOR = (a: boolean, b: boolean): boolean => {
  return (a && b) || (!a && !b);
};

/**
 * Return the diffed pie-chart table based on category.
 */
export function computeCategoryDiffTable(
    groupView: google.visualization.DataView,
    baseGroupView: google.visualization.DataView,
    chart: ChartClass): google.visualization.DataTable|null {
  if (!groupView || !baseGroupView) {
    return null;
  }

  // Obtain a superset of categories, and the map from category to self time
  // in both baseline and current profiles.
  const categorySet = new Set();  // Assume set is unordered.
  const oldMap: {[key: string]: number} = {};
  const newMap: {[key: string]: number} = {};
  for (let i = 0; i < groupView.getNumberOfRows(); i++) {
    newMap[groupView.getValue(i, 0)] = groupView.getValue(i, 1);
    categorySet.add(groupView.getValue(i, 0));
  }
  for (let i = 0; i < baseGroupView.getNumberOfRows(); i++) {
    oldMap[baseGroupView.getValue(i, 0)] = baseGroupView.getValue(i, 1);
    categorySet.add(baseGroupView.getValue(i, 0));
  }

  // Initialize the oldTable and newTable with the superset of categories.
  const oldTable = new google.visualization.DataTable();
  for (let i = 0; i < baseGroupView.getNumberOfColumns(); i++) {
    oldTable.addColumn({
      'type': baseGroupView.getColumnType(i),
      'label': baseGroupView.getColumnLabel(i),
    });
  }
  oldTable.addRows(categorySet.size);
  let rowID = 0;
  for (const skey of categorySet.keys()) {
    oldTable.setCell(rowID, 0, skey);
    oldTable.setCell(rowID, 1, 0.0);
    rowID++;
  }
  const newTable = oldTable.clone();

  // Fill in the value in oldTable and newTable respectively.
  for (let i = 0; i < oldTable.getNumberOfRows(); i++) {
    if (oldTable.getValue(i, 0) in oldMap) {
      oldTable.setCell(i, 1, oldMap[oldTable.getValue(i, 0)]);
    }
  }
  for (let i = 0; i < newTable.getNumberOfRows(); i++) {
    if (newTable.getValue(i, 0) in newMap) {
      newTable.setCell(i, 1, newMap[newTable.getValue(i, 0)]);
    }
  }

  // Return the diffed pie-chart table.
  // tslint:disable-next-line:no-any
  return (chart as any)['computeDiff'](oldTable, newTable);
}

/**
 * Compute the stats difference between two tables. oldTable and newTable
 * need to be DataTable class, and function returns DataView class.
 * Assume the type and label of columns in both tables match, while their
 * row counts can be different.
 * This function works for both main table and opType aggregation table.
 * @param oldTable Previous data table to be compared.It is used to calculate
 *        the difference from the new data table.
 * @param newTable Data table for current values.The increase or decrease is
 *        displayed based on this value.
 * @param referenceCol Index of the column used for diff rows matching between
 *     the old and new table
 * @param comparisonCol Index of the column whose diff value will be appended as
 *     a new column in the merged table and used for sorting by default
 * @param addColumnType The type of an additional column at the end for sorting
 *        purpose.
 * @param addColumnLabel The label of an additional column at the end for
 *        sorting purpose.
 * @param sortColumns Columns used for sorting the created data table.
 * @param hiddenColumns Number of hidden columns in the created data table.
 * @param formatDiffInfo Define hasColor and isLargeBetter for the range of the
 *        column. If all values are true in 8 and false in all other ranges, it
 *        can be defined as follows. If rangeMin is not defined, 0 is used. If
 *        rangeMax is not defined, 999 is used.
 *        [
 *          {
 *            rangeMax: 7,
 *            hasColor: false,
 *            isLargeBetter: false,
 *          },
 *          {
 *            rangeMin: 8,
 *            rangeMax: 8,
 *            hasColor: true,
 *            isLargeBetter: true,
 *          },
 *          {
 *            rangeMin: 9,
 *            hasColor: true,
 *            isLargeBetter: false,
 *          },
 *        ]
 * @param formatValueInfo Defines multiplier, fixed, and suffix for the range of
 *        the column. For example, column 0 multiplies by 100, removes the
 *        decimal point, and adds a % sign. The remaining columns are displayed
 *        up to two decimal places. In this case, it is defined as follows. If
 *        rangeMin is not defined, 0 is used. If rangeMax is not defined, 999 is
 *        used.
 *        [
 *          {
 *            rangeMin: 0,
 *            rangeMax: 0,
 *            multiplier: 100,
 *            fixed: 0,
 *            suffix: '%',
 *          },
 *          {
 *            rangeMin: 1,
 *            multiplier: 1,
 *            fixed: 2,
 *            suffix: '',
 *          },
 *        ]
 */
export function computeDiffTable(
    oldTable: google.visualization.DataTable,
    newTable: google.visualization.DataTable, referenceCol: number,
    comparisonCol: number, addColumnType: string, addColumnLabel: string,
    sortColumns: google.visualization.SortByColumn[], hiddenColumns: number[],
    formatDiffInfo: FormatDiffInfo[],
    formatValueInfo: FormatValueInfo[]): google.visualization.DataView {
  const colsCount = oldTable.getNumberOfColumns();
  const diffTable = new google.visualization.DataTable();
  // The first column can be rank ('number') or opType ('string').
  diffTable.addColumn({
    'type': oldTable.getColumnType(0),
    'label': oldTable.getColumnLabel(0),
  });
  // Adds column label for diffTable. Assume old and new tables
  // have the same column types.
  for (let colIndex = 1; colIndex < colsCount; ++colIndex) {
    diffTable.addColumn({
      'type': oldTable.getColumnType(colIndex),
      'label': oldTable.getColumnLabel(colIndex),
    });
  }
  // Add additional column at the end for sorting purpose.
  diffTable.addColumn({
    'type': addColumnType,
    'label': addColumnLabel,
  });
  diffTable.addRows(oldTable.getNumberOfRows() + newTable.getNumberOfRows());

  // Merge sort and diff the oldTable and newTable based on opName.
  const numDiffRows = mergeSortTables(
      diffTable, oldTable, newTable, referenceCol, comparisonCol,
      formatDiffInfo, formatValueInfo);

  // Hide the empty rows, and the last column in diffTable.
  const diffView = new google.visualization.DataView(diffTable);
  if (numDiffRows > 0) {
    diffView.setRows(0, numDiffRows - 1);
    sortColumns.push({column: colsCount, desc: true});
    diffView.setRows(diffView.getSortedRows(sortColumns));
  }

  hiddenColumns.push(colsCount);
  diffView.hideColumns(hiddenColumns);

  return diffView;
}

/**
 * The function takes in oldTable and newTable, sort them by referenceCol
 * column, and fill their difference into the generated diffTable.
 * The difference in comparisonCol column is filled in the last column
 * of diffTable, and used for sorting the diffTable afterwards,
 */
function mergeSortTables(
    diffTable: google.visualization.DataTable,
    oldTable: google.visualization.DataTable,
    newTable: google.visualization.DataTable, referenceCol: number,
    comparisonCol: number, formatDiffInfo: FormatDiffInfo[],
    formatValueInfo: FormatValueInfo[]): number {
  oldTable.sort({column: referenceCol, desc: false});  // Ascending order.
  newTable.sort({column: referenceCol, desc: false});  // Ascending order.
  const oldSize = oldTable.getNumberOfRows();
  const newSize = newTable.getNumberOfRows();
  // colsCount is number of columns in the original tables. In diffTable
  // there is one additional column at the end which is the difference
  // in self time between two stats.  The column is used solely for
  // sorting the diffTable and gets hidden before function returns.
  const colsCount = oldTable.getNumberOfColumns();
  const largeCharInASCII = '~~~~';
  let rowIndex = 0;
  for (let oldRow = 0, newRow = 0; oldRow < oldSize || newRow < newSize;
       rowIndex++) {
    // Assign the largest character in ASCII table for comparison.
    const oldReferenceValue = (oldRow < oldSize) ?
        oldTable.getValue(oldRow, referenceCol) :
        largeCharInASCII;
    const newReferenceValue = (newRow < newSize) ?
        newTable.getValue(newRow, referenceCol) :
        largeCharInASCII;
    if (oldRow < oldSize && newRow < newSize &&
        oldReferenceValue === newReferenceValue) {
      // If reference value is the same, then diff the two stats.
      for (let colIndex = 0; colIndex < colsCount; colIndex++) {
        if (colIndex !== 0 && oldTable.getColumnType(colIndex) === 'number') {
          const baseVal = oldTable.getValue(oldRow, colIndex);
          const diffVal = newTable.getValue(newRow, colIndex) - baseVal;
          diffTable.setCell(
              rowIndex, colIndex, baseVal,
              functions.formatValue(baseVal, colIndex, formatValueInfo) +
                  functions.formatDiff(
                      diffVal, baseVal, colIndex, formatDiffInfo));
        } else {  // Use oldTable's string values, or rank.
          diffTable.setCell(
              rowIndex, colIndex, oldTable.getValue(oldRow, colIndex));
        }
      }
      const diffValue = newTable.getValue(newRow, comparisonCol) -
          oldTable.getValue(oldRow, comparisonCol);
      diffTable.setCell(rowIndex, colsCount, diffValue);
      oldRow++, newRow++;
    } else if (newRow === newSize || oldReferenceValue < newReferenceValue) {
      // If only old stats, then assign the diff as negative old stats.
      for (let colIndex = 0; colIndex < colsCount; colIndex++) {
        if (colIndex !== 0 && oldTable.getColumnType(colIndex) === 'number') {
          const baseVal = oldTable.getValue(oldRow, colIndex);
          const diffVal = -baseVal;
          diffTable.setCell(
              rowIndex, colIndex, baseVal,
              functions.formatValue(baseVal, colIndex, formatValueInfo) +
                  functions.formatDiff(
                      diffVal, baseVal, colIndex, formatDiffInfo));
        } else {  // Use oldTable's string values, or rank.
          diffTable.setCell(
              rowIndex, colIndex, oldTable.getValue(oldRow, colIndex));
        }
      }
      const diffValue = -oldTable.getValue(oldRow, comparisonCol);
      diffTable.setCell(rowIndex, colsCount, diffValue);
      oldRow++;
    } else {  // if (oldRow == oldSize || oldReferenceValue > newReferenceValue)
      // If only new stats, then assign the diff as new stats.
      for (let colIndex = 0; colIndex < colsCount; colIndex++) {
        if (colIndex !== 0 && newTable.getColumnType(colIndex) === 'number') {
          const baseVal = 0;
          const diffVal = newTable.getValue(newRow, colIndex);
          diffTable.setCell(
              rowIndex, colIndex, baseVal,
              functions.formatValue(baseVal, colIndex, formatValueInfo) +
                  functions.formatDiff(
                      diffVal, baseVal, colIndex, formatDiffInfo));
        } else {  // Use newTable's string values, or rank.
          diffTable.setCell(
              rowIndex, colIndex, newTable.getValue(newRow, colIndex));
        }
      }
      const diffValue = newTable.getValue(newRow, comparisonCol);
      diffTable.setCell(rowIndex, colsCount, diffValue);
      newRow++;
    }  // End of if condition comparing opName.
  }    // End of for loop over all rows.
  return rowIndex;
}

/**
 * Format value based on table column index.
 */
function formatValue(
    val: number, col: number, formatValueInfo: FormatValueInfo[]): string {
  for (const info of formatValueInfo) {
    const rangeMin =
        info.hasOwnProperty('rangeMin') ? info.rangeMin || 0 : RANGE_MIN;
    const rangeMax =
        info.hasOwnProperty('rangeMax') ? info.rangeMax || 0 : RANGE_MAX;
    if (col >= rangeMin && col <= rangeMax) {
      return (val * info.multiplier).toFixed(info.fixed) + info.suffix;
    }
  }
  return '';
}

/**
 * Format diff value.
 */
function formatDiff(
    diffVal: number, baseVal: number, colIndex: number,
    formatDiffInfo: FormatDiffInfo[]): string {
  for (const info of formatDiffInfo) {
    const rangeMin =
        info.hasOwnProperty('rangeMin') ? info.rangeMin || 0 : RANGE_MIN;
    const rangeMax =
        info.hasOwnProperty('rangeMax') ? info.rangeMax || 0 : RANGE_MAX;
    if (colIndex >= rangeMin && colIndex <= rangeMax) {
      return formatDiffWithColor(
          diffVal, baseVal, info.hasColor, info.isLargeBetter);
    }
  }
  return '';
}

/**
 * Format diff value with color.
 */
function formatDiffWithColor(
    dividend: number, divisor: number, hasColor: boolean,
    isLargeBetter: boolean): string {
  // If dividend is 0, return 0.
  if (!dividend) return '<font color="grey">(0)</font>';

  let color;
  if (hasColor) {
    color = XNOR(dividend > 0, isLargeBetter) ? 'green' : 'red';
  } else {
    color = 'black';
  }

  let str;
  if (!divisor) {  // If divisor is 0, return the original dividend value.
    str = '(+' + dividend.toFixed(1) + ')';
  } else {
    str = dividend > 0 ? '(+' : '(';
    str += (dividend / divisor * 100).toFixed(0) + '%)';
  }

  return str.fontcolor(color);
}

/**
 * Return the diffed pie-chart table based on category.
 */
export function computePivotTable(
    dataTable: google.visualization.DataTable, columnLabel: string,
    rowLabel: string, valueLabel: string, newColumnLabel: string,
    sortByValue: boolean): google.visualization.DataTable|null {
  if (!dataTable) {
    return null;
  }

  const columnIndex = dataTable.getColumnIndex(columnLabel);
  const rowIndex = dataTable.getColumnIndex(rowLabel);
  const valueIndex = dataTable.getColumnIndex(valueLabel);

  if (sortByValue) {
    // Set sort columns
    dataTable.sort({column: valueIndex, desc: true});
  }

  // Creates pivotTable based on dataTable. The pivot table has one row for
  // each rowLabel column and one column for each columnLabel column.
  const pivotTable = new google.visualization.DataTable();
  pivotTable.addColumn('string', newColumnLabel);
  const columnValues = dataTable.getDistinctValues(columnIndex);
  const columnValuesMap = new Map<string, number>();
  columnValues.forEach(columnValue => {
    columnValuesMap.set(columnValue, pivotTable.getNumberOfColumns());
    pivotTable.addColumn('number', columnValue);
  });
  const rowValues = dataTable.getDistinctValues(rowIndex);
  const rowValuesMap = new Map<string, number>();
  rowValues.forEach(rowValue => {
    const row = pivotTable.getNumberOfRows();
    rowValuesMap.set(rowValue, row);
    pivotTable.addRow();
    pivotTable.setValue(row, 0, rowValue);
  });
  const numRows = dataTable.getNumberOfRows();
  for (let i = 0; i < numRows; ++i) {
    const rowValue = dataTable.getValue(i, rowIndex) as string;
    const columnValue = dataTable.getValue(i, columnIndex) as string;
    const value = dataTable.getValue(i, valueIndex);
    pivotTable.setValue(
        rowValuesMap.get(rowValue)!, columnValuesMap.get(columnValue)!, value);
  }

  return pivotTable;
}

/**
 * Create a group table with a group column and a value column.
 * @param dataTable The data table to be changed to a group.
 * @param filters Filters on the data to be displayed.
 * @param gColumn The column index to group the data.
 * @param vColumn The column index that has data value.
 * @param showSingleGroup If false, no data will be returned if only 1 group
 *     exists.
 */
export function computeGroupView(
    dataTable: google.visualization.DataTable,
    filters: google.visualization.DataTableCellFilter[], gColumn: number,
    vColumn: number,
    showSingleGroup: boolean = true): google.visualization.DataView {
  const numberFormatter =
      new google.visualization.NumberFormat({'fractionDigits': 0});
  const dataView = new google.visualization.DataView(dataTable);

  if (filters && filters.length > 0) {
    dataView.setRows(dataView.getFilteredRows(filters));
  }

  const dataGroup = google.visualization.data.group(
      dataView, [gColumn], [{
        'column': vColumn,
        'aggregation': google.visualization.data.sum,
        'type': 'number',
      }]);
  if (!showSingleGroup && dataGroup.getNumberOfRows() === 1) {
    dataGroup.removeRow(0);
  }
  dataGroup.sort({column: 1, desc: true});
  numberFormatter.format(dataGroup, 1);
  return new google.visualization.DataView(dataGroup);
}

/**
 * Export object used for testing dependency injection
 * So formatValue and formatDiff can be spyed
 */
export const functions = {
  formatValue,
  formatDiff,
  mergeSortTables,
};
