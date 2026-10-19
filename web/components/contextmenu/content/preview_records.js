import { getMediaType } from '../../modules/media_types/media_utils.js';

export const valueKey = value => JSON.stringify(value);
export const displayValue = value => value == null ? '未记录' : typeof value === 'object' ? JSON.stringify(value) : String(value);
export const sourceKey = (card, area) => JSON.stringify([card.id, area.id]);

export function snapshotParameters(snapshot) {
    const parameters = new Map();
    for (const entry of snapshot || []) {
        const bindings = entry.targetWidgets?.length ? entry.targetWidgets : entry.targetWidget ? [`${entry.targetNodeId}||${entry.targetWidget}`] : [];
        for (const binding of bindings.length ? bindings : [`module||${entry.sourceAreaId || entry.title}`]) {
            const [node, widget] = binding.split('||');
            const key = JSON.stringify([node, widget]);
            parameters.set(key, { key, label: `${entry.title || widget} · ${node === 'module' ? widget : `[${node}] ${widget}`}`, value: entry.value });
        }
    }
    return parameters;
}

export function collectPreviewRecords(sources) {
    return sources.flatMap(({ card, area, cardLabel, areaLabel }) => {
        const history = area.history?.length ? area.history : area.resultUrl ? [area.resultUrl] : [];
        const occurrences = new Map();
        return history.flatMap((url, index) => {
            if (!url) return [];
            const run = area.historyRuns?.[index] || null;
            const identity = JSON.stringify([card.id, area.id, run?.id || '', url]);
            const occurrence = occurrences.get(identity) || 0;
            occurrences.set(identity, occurrence + 1);
            const snapshot = area.inputHistorySnapshots?.[index] || null;
            const source = sourceKey(card, area);
            return [{ key: `${identity}:${occurrence}`, source, cardId: card.id, areaId: area.id,
                cardLabel: cardLabel || card.title || '未命名任务', areaLabel: areaLabel || area.title || `##${card.areas.filter(a => a.type === 'preview').indexOf(area) + 1}`,
                url, name: new URL(url, 'http://local/').searchParams.get('filename') || url.split('/').pop(), index: area.history?.length ? index : -1, run, runId: run?.id || '', snapshot, parameters: snapshotParameters(snapshot),
                text: area.textHistory?.[index] ?? '', type: getMediaType(url) }];
        });
    });
}

export function parameterFields(records) {
    const fields = new Map();
    records.forEach(record => record.parameters.forEach((field, key) => { if (!fields.has(key)) fields.set(key, { key, label: field.label }); }));
    return [...fields.values()];
}

export function buildResultRows(records) {
    const rows = new Map();
    for (const record of records) {
        const key = record.runId ? JSON.stringify([record.cardId, record.runId]) : record.key;
        if (!rows.has(key)) rows.set(key, { key, cardId: record.cardId, label: `${record.cardLabel} · ${record.runId ? `运行 ${record.run?.order ?? record.runId}` : `历史 ${record.index + 1}（无运行编号）`}`,
            run: record.run, outputs: new Map(), parameters: new Map(), snapshot: record.snapshot });
        const row = rows.get(key);
        if (!row.outputs.has(record.source)) row.outputs.set(record.source, []);
        row.outputs.get(record.source).push(record);
        record.parameters.forEach((field, id) => { if (!row.parameters.has(id)) row.parameters.set(id, field); });
    }
    return [...rows.values()];
}

export function absentOutputLabel(row, source) {
    if (row.cardId !== source.card.id) return '—';
    if (!row.run) return '无运行关联信息';
    return row.run.areaIds?.includes(source.area.id) ? '无可用结果' : '未参与本次运行';
}

export function buildXYMatrix(records, { x, y, z = '', zValue, source = '', filters = {} }) {
    const eligible = records.filter(record => (!source || record.source === source) && record.parameters.has(x) && record.parameters.has(y)
        && (!z || record.parameters.has(z)) && Object.entries(filters).every(([key, value]) => value === '' || valueKey(record.parameters.get(key)?.value) === value));
    const values = key => [...new Map(eligible.map(record => [valueKey(record.parameters.get(key).value), record.parameters.get(key).value])).entries()];
    const zs = z ? values(z) : [];
    const activeZ = zs.some(([key]) => key === zValue) ? zValue : zs[0]?.[0];
    const slice = eligible.filter(record => !z || valueKey(record.parameters.get(z).value) === activeZ);
    const xs = values(x), ys = values(y);
    const cells = new Map();
    for (const record of slice) {
        const key = JSON.stringify([valueKey(record.parameters.get(x).value), valueKey(record.parameters.get(y).value)]);
        if (!cells.has(key)) cells.set(key, []);
        cells.get(key).push(record);
    }
    return { xs, ys, zs, activeZ, cells, missing: records.length - eligible.length };
}
