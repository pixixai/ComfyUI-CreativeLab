import { addSheetColumn, addSheetRow, draftAreaId } from './table_sheet.js';
import { remapHistoryModuleIds } from '../modules/media_types/media_utils.js';
import { archiveTaskCards } from './task_archive.js';

function updateTrackLayout(view, sheet, axis, id, copyId) {
    const table = view.table;
    const fields = axis === 'row' ? ['heights', 'rowPaddings', 'rowAlignments']
        : ['widths', 'columnPaddings', 'alignments', 'configured', 'drafts'];
    const position = axis === 'row' ? 0 : 1;
    const pairs = fields.map(field => [table[field], id, copyId]);
    for (const order of [table.appearanceOrder.padding, table.appearanceOrder.alignment]) {
        pairs.push([order, `${axis}:${id}`, copyId && `${axis}:${copyId}`]);
    }
    for (const key of Object.keys(sheet.cellAppearance || {})) {
        const cell = JSON.parse(key);
        if (cell[position] !== id) continue;
        cell[position] = copyId;
        pairs.push([sheet.cellAppearance, key, copyId && JSON.stringify(cell)]);
    }
    for (const [map, key, next] of pairs) {
        if (!Object.hasOwn(map, key)) continue;
        if (next) map[next] = structuredClone(map[key]);
        else delete map[key];
    }
}

export function duplicateTableRow(sheet, cards, view, index) {
    const source = sheet.rows[index];
    const row = addSheetRow(sheet, index + 1);
    row.values = structuredClone(source.values);
    if (source.title) row.title = source.title;
    const card = cards.find(item => item.id === source.cardId);
    if (card) {
        const duplicate = structuredClone(card);
        const ids = new Map();
        duplicate.id = row.cardId = row.id;
        for (const area of duplicate.areas) {
            const nextId = draftAreaId(row, {id:area.tableColumnId});
            ids.set(area.id, nextId);
            area.id = nextId;
        }
        if (duplicate.xyOutputId) duplicate.xyOutputId = ids.get(duplicate.xyOutputId);
        remapHistoryModuleIds(duplicate.areas, ids);
        cards.splice(cards.indexOf(card) + 1, 0, duplicate);
    }
    updateTrackLayout(view, sheet, 'row', source.id, row.id);
    return row;
}

export function duplicateTableColumn(sheet, cards, view, index) {
    const source = sheet.columns[index];
    const column = addSheetColumn(sheet, index + 1);
    const id = column.id;
    Object.assign(column, structuredClone(source), {id, tableColumnId:id});
    const cardsById = new Map(cards.map(card => [card.id, card]));
    for (const row of sheet.rows) {
        if (Object.hasOwn(row.values, source.id)) row.values[id] = structuredClone(row.values[source.id]);
        const card = cardsById.get(row.cardId);
        const area = card?.areas.find(item => item.tableColumnId === source.id);
        if (!area) continue;
        const duplicate = {...structuredClone(area), id:draftAreaId(row, column), tableColumnId:id};
        remapHistoryModuleIds([duplicate], new Map([[area.id, duplicate.id]]));
        card.areas.splice(card.areas.indexOf(area) + 1, 0, duplicate);
    }
    updateTrackLayout(view, sheet, 'column', source.id, id);
    return column;
}

export function removeTableTracks(sheet, cards, view, axis, start, count, archived=[]) {
    const tracks=axis==='row'?sheet.rows:sheet.columns,items=tracks.slice(start,start+count);
    const ids = new Set(items.map(item => item.id));
    if(axis==='row')archiveTaskCards(cards,new Set(items.map(row=>row.cardId).filter(Boolean)),archived,view.table);
    if(axis==='row')sheet.rows=sheet.rows.filter(row=>!ids.has(row.id));else sheet.columns.splice(start,count);
    for (const id of ids) updateTrackLayout(view, sheet, axis, id);
    if (axis === 'column') {
        const members = new Set(sheet.rows.map(row => row.cardId));
        for (const row of sheet.rows) for (const id of ids) delete row.values[id];
        for (const card of cards) {
            if (!members.has(card.id)) continue;
            card.areas = card.areas.filter(area => !ids.has(area.tableColumnId));
            if (card.xyOutputId && !card.areas.some(area => area.id === card.xyOutputId)) delete card.xyOutputId;
        }
        return;
    }
    const deletedCards = new Set(items.map(row => row.cardId).filter(Boolean));
    for (let index = cards.length - 1; index >= 0; index--) {
        if (deletedCards.has(cards[index].id)) cards.splice(index, 1);
    }
    for (const other of view.table.sheets) {
        if (other !== sheet) other.rows = other.rows.filter(row => !deletedCards.has(row.cardId));
    }
    view.xy.taskIds = view.xy.taskIds.filter(id => !deletedCards.has(id));
    if (deletedCards.has(view.templateId)) view.templateId = sheet.rows.find(row => row.cardId)?.cardId || '';
}
