export const tableSizes = {
    width: { min: 64, max: 6000, default: 256 },
    height: { min: 48, max: 2000, default: 144 },
};
const dimension = (key, value) => Math.max(tableSizes[key].min, Math.min(tableSizes[key].max, Math.round(value)));
export const tableRowHeight = (view, row) => dimension('height', view.heights?.[row?.id] || view.rowHeight || tableSizes.height.default);
export const tableColumnWidth = (column, view) => dimension('width', view.widths?.[column?.id] || view.columnWidth || tableSizes.width.default);
const sides = ['top','bottom','left','right'];
export function tablePadding(value) {
    return Object.fromEntries(sides.map(side=>{const size=typeof value==='number'?value:value?.[side];return [side,Number.isFinite(size)?Math.max(0,Math.min(64,size)):10];}));
}

export const tableRatios = [[9,21],[1,2],[6,11],[9,16],[2,3],[3,4],[4,5],[5,6],[1,1],[6,5],[5,4],[4,3],[3,2],[16,9],[2,1],[21,9]];
const ratios = tableRatios.map(([w,h]) => w/h);
export const tableRatioPreset = (width, height, key) => ratios.findIndex(ratio =>
    key === 'width' ? Math.round(height * ratio) === width : Math.round(width / ratio) === height);

export function tableRatioPosition(width, height, key) {
    const current = width / height;
    const exact = tableRatioPreset(width, height, key);
    if (exact >= 0) return exact;
    const next = ratios.findIndex(ratio => ratio > current);
    if (next <= 0) return next === 0 ? 0 : ratios.length - 1;
    return next - 1 + (current - ratios[next - 1]) / (ratios[next] - ratios[next - 1]);
}

export function tablePresetSize(key, index, width, height) {
    return dimension(key, key === 'width' ? height * ratios[index] : width / ratios[index]);
}

export function parseTablePadding(text) {
    const values = text.trim().split(/[\s,，、]+/).filter(Boolean);
    if (!values.length || values.length > 4 || values.some(value => !/^\d+$/.test(value) || Number(value) > 64)) {
        throw new Error('请输入 1～4 个 0 到 64 的整数，顺序为上、下、左、右。');
    }
    return Object.fromEntries(sides.map((side, index) => [side, Number(values[index] ?? 0)]));
}

export function applyTableLayout(wrapper,columns,view) {
    wrapper.style.setProperty('--clab-table-height',`${tableRowHeight(view)}px`);
    const widths = columns.map(column => tableColumnWidth(column, view));
    wrapper.style.setProperty('--clab-table-columns',`var(--clab-table-row-width,44px) ${widths.map(width=>`${width}px`).join(' ')} var(--clab-table-add-column-width,28px)`);
    wrapper.querySelectorAll('[data-table-row]').forEach(element=>element.style.setProperty('--clab-table-height',`${tableRowHeight(view,{id:element.dataset.tableRow})}px`));
    for(const cell of wrapper.querySelectorAll('[role=cell]:has(.clab-upload-zone)'))fitTableMedia(cell,widths[cell.dataset.tableIndex],tableRowHeight(view,{id:cell.dataset.cardId}));

}

export function fitTableMedia(cell,width,height) {
    const zone=cell.querySelector('.clab-upload-zone');if(!zone)return;
    const preview=zone.querySelector('.clab-upload-preview:not([hidden])');
    const [top,right,bottom,left]=(cell.style.getPropertyValue('--clab-table-padding').match(/\d+(?:\.\d+)?/g)||[0,0,0,0]).map(Number);
    const horizontal=Math.min(1,width/(2*(left+right))),vertical=Math.min(1,height/(2*(top+bottom)));
    cell.style.setProperty('--clab-table-media-padding',`${top*vertical}px ${right*horizontal}px ${bottom*vertical}px ${left*horizontal}px`);
    const zoom=Math.min(1,(width-(left+right)*horizontal-2)/236,(height-(top+bottom)*vertical-2)/(preview?204:48));
    if(zoom>0)cell.style.setProperty('--clab-table-media-zoom',zoom);
}

export function resizeTableCells(view, sheet, key, value, ids = []) {
    if (!Number.isFinite(Number(value)) || Number(value) <= 0) return false;
    const size = dimension(key, Number(value));
    const [overrides, items, setting] = key === 'width'
        ? [view.widths, sheet.columns, 'columnWidth'] : [view.heights, sheet.rows, 'rowHeight'];
    if (ids.length) {
        for (const id of ids) overrides[id] = size;
    } else {
        sheet[setting] = size;
        for (const item of items) delete overrides[item.id];
    }
    return true;
}
