import {ChartClass} from 'org_xprof/frontend/app/common/interfaces/chart';

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
