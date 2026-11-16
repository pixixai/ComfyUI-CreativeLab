export function createTableAppearanceOrder(seed) {
    return {sequence:seed?.sequence ?? 0, padding:seed?.padding ?? {}, alignment:seed?.alignment ?? {}, expandText:seed?.expandText ?? {}};
}

const appearanceMaps = {padding:['rowPaddings','columnPaddings'],alignment:['rowAlignments','alignments'],expandText:['rowTextExpansion','columnTextExpansion']};

export function tableAppearance(view, key, rowId, columnId) {
    const [rowMap,columnMap] = appearanceMaps[key];
    const column = columnId == null ? undefined : view[columnMap]?.[columnId];
    const row = rowId == null ? undefined : view[rowMap]?.[rowId];
    const order = view.appearanceOrder[key] || {};
    const globalOrder = order[`table:${view.sheetId}`] ?? 0;
    const columnOrder = column === undefined ? -1 : order[`column:${columnId}`] ?? 0;
    const rowOrder = row === undefined ? -1 : order[`row:${rowId}`] ?? 0;
    const cell = view.cellAppearance?.[JSON.stringify([rowId,columnId])];
    if (cell?.[key]?.order >= Math.max(globalOrder, columnOrder, rowOrder)) return cell[key].value;
    if (rowOrder >= globalOrder && rowOrder >= columnOrder) return row;
    return columnOrder >= globalOrder ? column : view[key];
}

export function tableTextExpansionState(view, cells) {
    if (!cells.length) return !!view.expandText;
    const enabled = ({rowId,columnId}) => !!tableAppearance(view,'expandText',rowId,columnId);
    const current = enabled(cells[0]);
    return cells.every(cell=>enabled(cell)===current) ? current : null;
}

export function setTableCellAppearance(view, sheet, cells, key, value) {
    const order = ++view.appearanceOrder.sequence;
    sheet.cellAppearance ??= {};
    for (const {rowId, columnId} of cells) {
        const cell = sheet.cellAppearance[JSON.stringify([rowId,columnId])] ??= {};
        cell[key] = {value, order};
    }
}

export function setTableAppearance(view, sheet, scope, id, key, value) {
    const address = `${scope}:${id ?? sheet.id}`;
    const order = view.appearanceOrder;
    const mapFor = key => view[appearanceMaps[key][scope === 'row' ? 0 : 1]] ??= {};
    if (!key) {
        for (const key of Object.keys(appearanceMaps)) {
            delete mapFor(key)[id];
            if (order[key]) delete order[key][address];
        }
        return;
    }
    if (scope === 'table') sheet[key] = value;
    else mapFor(key)[id] = value;
    (order[key] ??= {})[address] = ++order.sequence;
}
