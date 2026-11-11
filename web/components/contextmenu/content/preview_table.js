import { escapeHtml as esc, sanitizeHref } from './shared.js';
import { sourceKey, parameterFields, buildXYMatrix, displayValue, valueKey, previewRecordLabel } from './preview_records.js';

const options = (items, value, empty = '') => `${empty ? `<option value="">${empty}</option>` : ''}${items.map(item => `<option value="${esc(item.key)}" ${item.key === value ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}`;
export function recordMediaHTML(record, textLimit = Infinity) {
    const label = previewRecordLabel(record);
    if (record.type === 'image') return `<img loading="lazy" src="${esc(record.url)}" alt="${esc(label)}">`;
    if (record.type === 'video') return `<video src="${esc(record.url)}" controls preload="none" muted playsinline></video>`;
    if (record.type === 'audio') return `<audio src="${esc(record.url)}" controls preload="none"></audio>`;
    if (record.type === 'text') {
        const text = record.text || '文本未缓存，点击记录查看';
        return `<pre>${esc(text.length > textLimit ? `${text.slice(0, textLimit)}…` : text)}</pre>`;
    }
    return `<a href="${esc(sanitizeHref(record.url))}" target="_blank" rel="noopener noreferrer">${esc(record.type === 'model' ? '3D 文件' : '打开文件')}</a>`;
}

export function renderTableSettings(records, sources, config, sourceSetting, exportControls) {
    const fields = parameterFields(records);
    if (!fields.some(field => field.key === config.x)) config.x = fields[0]?.key || '';
    if (!fields.some(field => field.key === config.y) || config.y === config.x) config.y = fields.find(field => field.key !== config.x)?.key || '';
    if (!fields.some(field => field.key === config.z) || [config.x, config.y].includes(config.z)) config.z = '';
    const sourceOptions = sources.map(({ card, area, cardLabel }) => ({ key: sourceKey(card, area), label: `${cardLabel || card.title || '未命名任务'} / ${area.title || '输出模块'}` }));
    if (!sourceOptions.some(item => item.key === config.source)) config.source = sourceOptions[0]?.key || '';
    return `<div class="clab-review-sheet-settings"><section><h3>矩阵来源</h3>${sourceSetting}
        <label class="clab-review-field">输出模块<select data-table-option="source">${options(sourceOptions, config.source)}</select></label></section>
        <section><h3>排版</h3>
        <label class="clab-review-field">媒体宽度<input type="number" min="80" max="640" step="20" data-table-option="width" value="${config.width}"></label>
        <label class="clab-review-field">文字长度<input type="number" min="20" max="2000" step="20" data-table-option="textLimit" value="${config.textLimit}"></label></section>
        <section><h3>坐标轴（历史参数）</h3>
        <label class="clab-review-field">X 轴<select data-table-option="x">${options(fields, config.x, '选择参数')}</select></label>
        <label class="clab-review-field">Y 轴<select data-table-option="y">${options(fields.filter(f => f.key !== config.x), config.y, '选择参数')}</select></label>
        <label class="clab-review-field">Z 分组<select data-table-option="z">${options(fields.filter(f => ![config.x, config.y].includes(f.key)), config.z, '不分组')}</select></label>
        </section><section><h3>其他参数筛选</h3>${fields.filter(f => ![config.x, config.y, config.z].includes(f.key)).map(field => {
            const values = [...new Map(records.filter(record => record.parameters.has(field.key)).map(record => [valueKey(record.parameters.get(field.key).value), record.parameters.get(field.key).value])).entries()];
            return `<label class="clab-review-field">${esc(field.label)}<select data-table-filter="${esc(field.key)}">${options(values.map(([key, value]) => ({ key, label: displayValue(value) })), config.filters[field.key], '全部')}</select></label>`;
        }).join('')}</section>
        ${exportControls}</div>`;
}

export function buildTableModel(records, sources, config) {
    const fields = parameterFields(records);
    if (!config.x || !config.y) return { title: 'XY 矩阵', columns: [], rows: [], note: '至少需要两个不同的历史参数，请在右侧选择 X、Y 轴。' };
    const matrix = buildXYMatrix(records, config);
    config.zValue = matrix.activeZ;
    const fieldLabel = key => fields.find(field => field.key === key)?.label || '';
    return { title: `XY 矩阵 · X：${fieldLabel(config.x)} · Y：${fieldLabel(config.y)}${config.z ? ` · ${fieldLabel(config.z)}＝${displayValue(matrix.zs.find(([key]) => key === matrix.activeZ)?.[1])}` : ''}`,
        columns: [fieldLabel(config.y), ...matrix.xs.map(([, value]) => displayValue(value))],
        rows: matrix.ys.map(([yk, y]) => ({ label: displayValue(y), cells: [{ text: displayValue(y), records: [] }, ...matrix.xs.map(([xk]) => ({ text: '', records: matrix.cells.get(JSON.stringify([xk, yk])) || [] }))] })),
        emptyCellLabel: '无结果',
        note: `缺失组合保留空格；同一组合的多条记录全部保留。${matrix.missing ? ` ${matrix.missing} 条记录不符合输出模块、轴或筛选条件。` : ''}`,
        zs: matrix.zs, activeZ: matrix.activeZ };
}

export function renderTable(model, config) {
    const truncate = text => text.length > config.textLimit ? `${text.slice(0, config.textLimit)}…` : text;
    const headers = model.header === false ? '' : `<tr>${model.columns.map(column => `<th title="${esc(column)}">${esc(truncate(column))}</th>`).join('')}</tr>`;
    return `<div class="clab-result-sheet" style="--review-media-width:${config.width}px"><h3>${esc(model.title)}</h3>
        ${model.zs?.length ? `<label>Z 分组 <select data-table-option="zValue">${options(model.zs.map(([key, value]) => ({ key, label: displayValue(value) })), model.activeZ)}</select></label>` : ''}
        ${model.note ? `<p class="clab-review-note">${esc(model.note)}</p>` : ''}
        ${model.columns.length && model.rows.length ? `<table class="clab-result-table">${headers && !model.headerAtBottom ? `<thead>${headers}</thead>` : ''}
            <tbody>${model.rows.map(row => `<tr>${row.cells.map(cell => `<td>
                ${cell.text ? `<span title="${esc(cell.text)}">${esc(truncate(cell.text))}</span>` : ''}
                ${cell.records.map(record => `<div class="clab-result-record" data-record-key="${esc(record.key)}">${recordMediaHTML(record, config.textLimit)}
                    ${model.recordLabels !== false ? `<button data-view-record="${esc(record.key)}">${esc(previewRecordLabel(record))}</button>` : ''}</div>`).join('')}
                ${!cell.text && !cell.records.length && model.emptyCellLabel ? `<span class="clab-review-note">${esc(model.emptyCellLabel)}</span>` : ''}
            </td>`).join('')}</tr>`).join('')}</tbody>
            ${headers && model.headerAtBottom ? `<tfoot>${headers}</tfoot>` : ''}</table>` : '<div class="clab-preview-modal-empty">没有可预览的行列</div>'}</div>`;
}
