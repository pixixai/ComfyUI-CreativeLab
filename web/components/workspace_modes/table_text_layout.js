import { tableAppearance } from './table_appearance.js';
import { tableColumnWidth, tableRowHeight, tablePadding } from './table_layout.js';
import { tableParameter } from './table_model.js';
import { getAreaResultType } from '../modules/media_types/media_utils.js';
import { renderText } from '../modules/media_types/media_text.js';

const measurements = new Map();
let probe, cachedCharacters = 0;

function measureText(area, width, output) {
    const source = output ? area.textContent || '' : String(area.value ?? '');
    const key = JSON.stringify([output,width,source,output && [area.textPreviewMarkdown,area.textSyntaxHighlight,area.textLoadState,!!area.missingHistoryRun]]);
    if (measurements.has(key)) return measurements.get(key);
    if (!probe) {
        probe = document.createElement('div');
        probe.className = 'clab-review-grid';
        probe.dataset.workspaceMode = 'table';
        probe.style.cssText = 'position:fixed;left:-100000px;top:0;visibility:hidden;pointer-events:none;contain:layout style paint;font:12px sans-serif';
        probe.setAttribute('aria-hidden','true');
        document.body.append(probe);
    }
    probe.style.width = `${width}px`;
    probe.innerHTML = output ? renderText({...area}) : '<textarea class="clab-edit-val" rows="1"></textarea>';
    let height;
    if (output) {
        const shell = probe.firstElementChild, body = shell.querySelector('.clab-text-body-scroll');
        shell.style.setProperty('height','auto','important');
        shell.style.setProperty('max-height','none','important');
        body.style.setProperty('overflow','visible','important');
        body.style.flex = 'none';
        height = shell.getBoundingClientRect().height;
    } else {
        const field = probe.firstElementChild;
        field.value = source;
        field.style.setProperty('max-height','none','important');
        height = Math.max(18,field.scrollHeight);
    }
    height = Math.ceil(height) + 2;
    // Only measurements live here, never controls or decoded media.
    if (key.length <= 1000000) {
        while (measurements.size >= 512 || cachedCharacters + key.length > 1000000) {
            const oldest = measurements.keys().next().value;
            cachedCharacters -= oldest.length;
            measurements.delete(oldest);
        }
        measurements.set(key,height);
        cachedCharacters += key.length;
    }
    probe.replaceChildren();
    return height;
}

export function hasTableTextExpansion(view) {
    return !!view.expandText || Object.values(view.rowTextExpansion || {}).some(Boolean) || Object.values(view.columnTextExpansion || {}).some(Boolean) || Object.values(view.cellAppearance || {}).some(cell=>cell.expandText?.value);
}

export function tableTextLayout(rows, columns, view, parameters, areaFor = (row,column)=>row.areas[column.index]) {
    const textHeights = {};
    if (!hasTableTextExpansion(view)) return {...view,textHeights};
    for (const row of rows) for (const column of columns) {
        if (!tableAppearance(view,'expandText',row.id,column.id)) continue;
        const area = areaFor(row,column);
        if (!area) continue;
        const output = area.type === 'preview';
        const parameter = output ? null : tableParameter(area,parameters);
        if (output ? getAreaResultType(area) !== 'text' : !['string','text'].includes(parameter.type) || parameter.choices?.length || parameter.uploadType) continue;
        const padding = tablePadding(tableAppearance(view,'padding',row.id,column.id));
        const width = Math.max(1,tableColumnWidth(column,view) - padding.left - padding.right - 2);
        const height = measureText(area,width,output) + padding.top + padding.bottom + 2;
        if (height > tableRowHeight(view,row)) textHeights[row.id] = Math.max(textHeights[row.id] || 0,height);
    }
    return {...view,textHeights};
}
