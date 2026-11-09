export function createTableAppearanceOrder(seed) {
    return {sequence:seed?.sequence ?? 0, padding:seed?.padding ?? {}, alignment:seed?.alignment ?? {}};
}

export function tableAppearance(view, key, rowId, columnId) {
    const column = columnId == null ? undefined : (key === 'padding' ? view.columnPaddings : view.alignments)[columnId];
    const row = rowId == null ? undefined : (key === 'padding' ? view.rowPaddings : view.rowAlignments)[rowId];
    const order = view.appearanceOrder[key];
    const globalOrder = order[`table:${view.sheetId}`] ?? 0;
    const columnOrder = column === undefined ? -1 : order[`column:${columnId}`] ?? 0;
    const rowOrder = row === undefined ? -1 : order[`row:${rowId}`] ?? 0;
    const cell = view.cellAppearance?.[JSON.stringify([rowId,columnId])];
    if (cell?.[key]?.order >= Math.max(globalOrder, columnOrder, rowOrder)) return cell[key].value;
    if (rowOrder >= globalOrder && rowOrder >= columnOrder) return row;
    return columnOrder >= globalOrder ? column : view[key];
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
    const paddings = scope === 'row' ? view.rowPaddings : view.columnPaddings;
    const alignments = scope === 'row' ? view.rowAlignments : view.alignments;
    if (!key) {
        delete paddings[id];
        delete alignments[id];
        delete order.padding[address];
        delete order.alignment[address];
        return;
    }
    if (scope === 'table') sheet[key] = value;
    else (key === 'padding' ? paddings : alignments)[id] = value;
    order[key][address] = ++order.sequence;
}
