import { escapeHtml as esc, sanitizeHref } from './shared.js';
import { sourceKey, parameterFields, buildResultRows, absentOutputLabel, buildXYMatrix, displayValue, valueKey } from './preview_records.js';

const options = (items, value, empty = '') => `${empty ? `<option value="">${empty}</option>` : ''}${items.map(item => `<option value="${esc(item.key)}" ${item.key === value ? 'selected' : ''}>${esc(item.label)}</option>`).join('')}`;
export function recordMediaHTML(record) {
    const label = `${record.areaLabel} · 历史 ${record.index + 1}`;
    if (record.type === 'image') return `<img loading="lazy" src="${esc(record.url)}" alt="${esc(label)}">`;
    if (record.type === 'video') return `<video src="${esc(record.url)}" controls preload="none" muted playsinline></video>`;
    if (record.type === 'text') return `<pre>${esc(record.text || '文本未缓存，点击记录查看')}</pre>`;
    return `<a href="${esc(sanitizeHref(record.url))}" target="_blank" rel="noopener noreferrer">${esc(record.type === 'model' ? '3D 文件' : '打开文件')}</a>`;
}

export function renderTableSettings(records, sources, config) {
    const fields = parameterFields(records);
    if (!config.fields) config.fields = fields.map(field => field.key);
    if (!fields.some(field => field.key === config.x)) config.x = fields[0]?.key || '';
    if (!fields.some(field => field.key === config.y) || config.y === config.x) config.y = fields.find(field => field.key !== config.x)?.key || '';
    if (!fields.some(field => field.key === config.z) || [config.x, config.y].includes(config.z)) config.z = '';
    const sourceOptions = sources.map(({ card, area, cardLabel }) => ({ key: sourceKey(card, area), label: `${cardLabel || card.title || '未命名任务'} / ${area.title || '输出模块'}` }));
    if(!config.outputs)config.outputs=sourceOptions.map(source=>source.key);
    const rank=(order,key)=>order.includes(key)?order.indexOf(key):Number.MAX_SAFE_INTEGER;
    const orderedSources=[...sourceOptions].sort((a,b)=>rank(config.outputs,a.key)-rank(config.outputs,b.key));
    const orderedFields=[...fields].sort((a,b)=>rank(config.fields,a.key)-rank(config.fields,b.key));
    if (!sourceOptions.some(item => item.key === config.source)) config.source = sourceOptions[0]?.key || '';
    return `<div class="clab-review-section">表格布局</div><div class="clab-review-segment">${[['detail', '明细表'], ['xy', 'XY 矩阵']].map(([key, label]) => `<button data-table-layout="${key}" aria-pressed="${config.layout === key}">${label}</button>`).join('')}</div>
        <label class="clab-review-field">媒体宽度<input type="number" min="80" max="640" step="20" data-table-option="width" value="${config.width}"></label>
        <label class="clab-review-field">文字长度<input type="number" min="20" max="2000" step="20" data-table-option="textLimit" value="${config.textLimit}"></label>
        ${config.layout === 'xy' ? `<div class="clab-review-section">坐标轴（历史参数）</div>
        <label class="clab-review-field">输出模块<select data-table-option="source">${options(sourceOptions, config.source)}</select></label>
        <label class="clab-review-field">X 轴<select data-table-option="x">${options(fields, config.x, '选择参数')}</select></label>
        <label class="clab-review-field">Y 轴<select data-table-option="y">${options(fields.filter(f => f.key !== config.x), config.y, '选择参数')}</select></label>
        <label class="clab-review-field">Z 分组<select data-table-option="z">${options(fields.filter(f => ![config.x, config.y].includes(f.key)), config.z, '不分组')}</select></label>
        <div class="clab-review-section">其他参数筛选</div>${fields.filter(f => ![config.x, config.y, config.z].includes(f.key)).map(field => {
            const values = [...new Map(records.filter(record => record.parameters.has(field.key)).map(record => [valueKey(record.parameters.get(field.key).value), record.parameters.get(field.key).value])).entries()];
            return `<label class="clab-review-field">${esc(field.label)}<select data-table-filter="${esc(field.key)}">${options(values.map(([key, value]) => ({ key, label: displayValue(value) })), config.filters[field.key], '全部')}</select></label>`;
        }).join('')}` : `<div class="clab-review-section">输出列</div>${orderedSources.map(source=>`<label class="clab-review-check"><input type="checkbox" data-output-column="${esc(source.key)}" ${config.outputs.includes(source.key)?'checked':''}>${esc(source.label)}<span class="clab-review-column-move"><button data-output-move="${esc(source.key)}" data-step="-1">↑</button><button data-output-move="${esc(source.key)}" data-step="1">↓</button></span></label>`).join('')}<div class="clab-review-section">参数列（取消勾选可隐藏）</div>${fields.length ? orderedFields.map(field => `<label class="clab-review-check"><input type="checkbox" data-table-column="${esc(field.key)}" ${config.fields.includes(field.key) ? 'checked' : ''}>${esc(field.label)}<span class="clab-review-column-move"><button data-column-move="${esc(field.key)}" data-step="-1" title="向前移动">↑</button><button data-column-move="${esc(field.key)}" data-step="1" title="向后移动">↓</button></span></label>`).join('') : '<p>所选记录没有参数快照。</p>'}`}
        <p class="clab-review-note">只整理已勾选的历史记录。缺少快照的记录显示“参数未记录”。</p>`;
}

export function buildTableModel(records, sources, config, allRecords = records) {
    const fields = parameterFields(records);
    if (config.layout === 'xy') {
        if (!config.x || !config.y) return { title: 'XY 矩阵', columns: [], rows: [], note: '至少需要两个不同的历史参数，请在右侧选择 X、Y 轴。' };
        const matrix = buildXYMatrix(records, config);
        config.zValue = matrix.activeZ;
        const fieldLabel = key => fields.find(field => field.key === key)?.label || '';
        return { title: `XY 矩阵 · X：${fieldLabel(config.x)} · Y：${fieldLabel(config.y)}${config.z ? ` · ${fieldLabel(config.z)}＝${displayValue(matrix.zs.find(([key]) => key === matrix.activeZ)?.[1])}` : ''}`,
            columns: [fieldLabel(config.y), ...matrix.xs.map(([, value]) => displayValue(value))],
            rows: matrix.ys.map(([yk, y]) => ({ label: displayValue(y), cells: [{ text: displayValue(y), records: [] }, ...matrix.xs.map(([xk]) => ({ text: '', records: matrix.cells.get(JSON.stringify([xk, yk])) || [] }))] })),
            note: `缺失组合保留空格；同一组合的多条记录全部保留。${matrix.missing ? ` ${matrix.missing} 条记录不符合输出模块、轴或筛选条件。` : ''}`,
            zs: matrix.zs, activeZ: matrix.activeZ };
    }
    const visibleSources=(config.outputs || sources.map(source=>sourceKey(source.card,source.area))).map(key=>sources.find(source=>sourceKey(source.card,source.area)===key)).filter(Boolean);
    const selectedFields = (config.fields || []).map(key => fields.find(field => field.key === key)).filter(Boolean);
    return { title: '生成结果明细表', columns: ['任务 / 运行', ...visibleSources.map(({ card, area, cardLabel }) => `${cardLabel || card.title || '未命名任务'} / ${area.title || '输出模块'}`), ...selectedFields.map(field => field.label)],
        rows: buildResultRows(records).map(row => ({ label: row.label, cells: [{ text: row.label, records: [] },
            ...visibleSources.map(source => ({ text: row.outputs.has(sourceKey(source.card, source.area)) ? '' : allRecords.some(record=>record.source===sourceKey(source.card,source.area)&&record.cardId===row.cardId&&record.runId&&record.runId===row.run?.id)?'未选入表格':absentOutputLabel(row, source), records: row.outputs.get(sourceKey(source.card, source.area)) || [] })),
            ...selectedFields.map(field => ({ text: row.parameters.has(field.key) ? displayValue(row.parameters.get(field.key).value) : '参数未记录', records: [] }))] })),
        note: '按任务和运行编号关联输出及参数；无运行编号的旧记录各自独立显示。' };
}

export function renderTable(model, config) {
    return `<div class="clab-result-sheet" style="--review-media-width:${config.width}px"><h3>${esc(model.title)}</h3>
        ${model.zs?.length ? `<label>Z 分组 <select data-table-option="zValue">${options(model.zs.map(([key, value]) => ({ key, label: displayValue(value) })), model.activeZ)}</select></label>` : ''}
        <p class="clab-review-note">${esc(model.note)}</p>${model.rows.length ? `<table class="clab-result-table"><thead><tr>${model.columns.map(column => `<th>${esc(column)}</th>`).join('')}</tr></thead><tbody>${model.rows.map(row => `<tr>${row.cells.map(cell => `<td>${cell.text ? `<span title="${esc(cell.text)}">${esc(cell.text.length > config.textLimit ? `${cell.text.slice(0, config.textLimit)}…` : cell.text)}</span>` : ''}${cell.records.map(record => `<div class="clab-result-record" data-record-key="${esc(record.key)}">${recordMediaHTML(record)}<button data-view-record="${esc(record.key)}">${esc(record.areaLabel)} · 历史 ${record.index + 1}</button></div>`).join('')}${!cell.text && !cell.records.length ? '<span class="clab-review-note">无结果</span>' : ''}</td>`).join('')}</tr>`).join('')}</tbody></table>` : '<div class="clab-preview-modal-empty">没有可排列的记录</div>'}</div>`;
}
