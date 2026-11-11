import { escapeHtml as esc } from './shared.js';
import { previewRecordLabel } from './preview_records.js';

export function downloadPreviewBlob(blob, name) {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function buildStandaloneHTML(model, mediaPaths, textLimit = 200, mediaWidth = 240) {
    const width = Math.max(80, Math.min(640, mediaWidth));
    const sheetHTML = model => {
        const headers = model.header === false ? '' : `<tr>${model.columns.map(column =>
            `<th title="${esc(column)}">${esc(column.length > textLimit ? `${column.slice(0,textLimit)}…` : column)}</th>`).join('')}</tr>`;
        return `<h1>${esc(model.title)}</h1><p class="note">${esc(model.note || '')}</p><table>${headers && !model.headerAtBottom ? `<thead>${headers}</thead>` : ''}<tbody>${model.rows.map(row => `<tr>${row.cells.map(cell => `<td>${cell.text ? cell.text.length <= textLimit ? `<p>${esc(cell.text)}</p>` : `<details><summary>${esc(cell.text.slice(0,textLimit))}…</summary><p>${esc(cell.text)}</p></details>` : ''}${cell.records.map(record => {
            const path = mediaPaths.get(record.url);
            const media = !path ? '<p>资源未导出</p>' : record.type === 'image' ? `<img loading="lazy" src="${esc(path)}" alt="${esc(record.areaLabel)}">`
                : record.type === 'video' ? `<video controls preload="none" src="${esc(path)}"></video>`
                : record.type === 'audio' ? `<audio controls preload="none" src="${esc(path)}"></audio>`
                : `${record.type==='text'&&record.text?`<pre>${esc(record.text)}</pre>`:''}<a href="${esc(path)}">${record.type === 'text' ? '查看文本文件' : '打开文件'}</a>`;
            return media + (model.recordLabels !== false ? `<p>${esc(record.cardLabel)} / ${esc(previewRecordLabel(record))}</p>` : '');
        }).join('')}${!cell.text && !cell.records.length ? esc(model.emptyCellLabel) : ''}</td>`).join('')}</tr>`).join('')}</tbody>${headers && model.headerAtBottom ? `<tfoot>${headers}</tfoot>` : ''}</table>`;
    };
    return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(model.title)}</title><style>
        body{font:14px/1.5 system-ui,sans-serif;background:#191919;color:#ddd;margin:24px}table{border-collapse:collapse}th,td{border:1px solid #555;padding:10px;vertical-align:top;min-width:${width}px;max-width:${width}px;overflow-wrap:anywhere}th{background:#292929}img,video,audio{display:block;width:100%;margin:6px 0}img,video{height:auto}pre{white-space:pre-wrap}summary{cursor:pointer}a{color:#9dc9ff}.note{color:#aaa}p{white-space:pre-wrap}
        </style>${sheetHTML(model)}</html>`;
}

export async function exportPreviewHTML(model, config) {
    const { zipSync, strToU8 } = await import('../../../vendor/zip.js');
    const files = {}, paths = new Map();
    for (const record of model.rows.flatMap(row => row.cells.flatMap(cell => cell.records))) {
        if (paths.has(record.url)) continue;
        const response = await fetch(record.url);
        if (!response.ok) throw new Error(`资源读取失败（HTTP ${response.status}）：${record.areaLabel}，历史 ${record.index + 1}`);
        const url = new URL(record.url, window.location.origin);
        const extension = (url.searchParams.get('filename') || url.pathname).match(/\.([a-z0-9]{1,10})$/i)?.[1] || 'bin';
        const path = `media/${paths.size + 1}.${extension}`;
        paths.set(record.url, path); files[path] = new Uint8Array(await response.arrayBuffer());
    }
    files['index.html'] = strToU8(buildStandaloneHTML(model, paths, config.textLimit, config.width));
    return new Blob([zipSync(files, { level: 0 })], { type: 'application/zip' });
}

async function mediaPoster(record) {
    if (record.type === 'image') {
        const response = await fetch(record.url);
        if (!response.ok) throw new Error(`图片读取失败（HTTP ${response.status}）`);
        const blob=await response.blob();
        if(blob.type!=='image/svg+xml')return createImageBitmap(blob);
        const image=new Image(),url=URL.createObjectURL(blob);
        try { image.src=url;await image.decode();return await createImageBitmap(image); }
        finally { URL.revokeObjectURL(url); }
    }
    if (record.type !== 'video') return null;
    const video = document.createElement('video');
    video.muted = true; video.preload = 'auto'; video.src = record.url;
    try {
        await new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject(new Error('视频预览帧读取超时')), 15000);
            video.onloadeddata = () => { clearTimeout(timer); resolve(); };
            video.onerror = () => { clearTimeout(timer); reject(new Error('视频预览帧读取失败')); };
        });
        return await createImageBitmap(video);
    } finally { video.pause(); video.removeAttribute('src'); video.load(); }
}

function wrapText(context, value, width) {
    const lines = []; let line = '';
    for (const character of String(value)) {
        if (character === '\n' || line && context.measureText(line + character).width > width) { lines.push(line); line = ''; }
        if (character !== '\n') line += character;
    }
    if (line || !lines.length) lines.push(line);
    return lines;
}

export async function exportPreviewPNGs(model, config) {
    const files = [], cache = new Map(), textByUrl = new Map(), failed = [];
    const records = model.rows.flatMap(row => row.cells.flatMap(cell => cell.records));
    try {
        for (const record of records) {
            if (record.type === 'text') {
                if (record.text || textByUrl.has(record.url)) continue;
                try {
                    const response = await fetch(record.url);
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    textByUrl.set(record.url, await response.text());
                } catch {
                    textByUrl.set(record.url, '文本读取失败');
                    failed.push(previewRecordLabel(record));
                }
                continue;
            }
            if (cache.has(record.url)) continue;
            try { cache.set(record.url, await mediaPoster(record)); }
            catch { cache.set(record.url, null); failed.push(`${record.areaLabel} · 历史 ${record.index + 1}`); }
        }
        const columnWidth = config.width + 24, leading = model.leadingColumn === false ? 0 : 1;
        const perPage = Math.max(1, Math.floor(4096 / columnWidth) - leading);
        const headerHeight = model.header === false ? 0 : 80;
        for (let start = leading; start < model.columns.length || start === 1 && model.columns.length === 1; start += perPage) {
            const indices = [...(leading ? [0] : []), ...model.columns.slice(start, start + perPage).map((_, index) => start + index)];
            let page = document.createElement('canvas'), context, y;
            const drawHeader = () => {
                if (!headerHeight) return;
                indices.forEach((index, col) => {
                    context.fillStyle = '#303030'; context.fillRect(col * columnWidth, y, columnWidth, headerHeight);
                    const header = model.columns[index];
                    const text = header.length > config.textLimit ? `${header.slice(0, config.textLimit)}…` : header;
                    context.fillStyle = '#eee'; wrapText(context, text, columnWidth - 24).slice(0, 4).forEach((line, n) => context.fillText(line, col * columnWidth + 12, y + 20 + n * 16));
                });
                y += headerHeight;
            };
            const begin = () => {
                page.width = columnWidth * indices.length; page.height = 4096;
                context = page.getContext('2d'); context.fillStyle = '#191919'; context.fillRect(0, 0, page.width, page.height);
                context.font = 'bold 18px sans-serif'; context.fillStyle = '#eee'; context.fillText(model.title.slice(0, 90), 12, 28);
                context.font = '13px sans-serif'; context.fillStyle = '#aaa'; context.fillText((model.note || '').slice(0, 160), 12, 50);
                y = 64;
                if (!model.headerAtBottom) drawHeader();
            };
            const finish = async () => {
                if (model.headerAtBottom) drawHeader();
                const trimmed = document.createElement('canvas'); trimmed.width = page.width; trimmed.height = y + 8;
                trimmed.getContext('2d').drawImage(page, 0, 0);
                const blob = await new Promise(resolve => trimmed.toBlob(resolve, 'image/png'));
                if (!blob) throw new Error('表格图片生成失败');
                files.push({ name: `${config.name || 'XY矩阵'}-${files.length + 1}.png`, blob });
            };
            begin();
            for (const row of model.rows) {
                const cells = indices.map(index => {
                    const cell = row.cells[index];
                    const text = cell.text.length > config.textLimit ? `${cell.text.slice(0, config.textLimit)}…` : cell.text;
                    const lines = text ? wrapText(context, text, columnWidth - 24) : [];
                    const blocks = [];
                    for (let offset = 0; offset < lines.length; offset += 40) blocks.push({ lines: lines.slice(offset, offset + 40) });
                    for (const record of cell.records) {
                        const label = model.recordLabels === false ? '' : previewRecordLabel(record);
                        const content = cache.get(record.url) ? '' : record.type === 'text' ? (record.text || textByUrl.get(record.url) || '').slice(0, config.textLimit) : `${record.type === 'video' ? '视频' : '文件'}预览不可用`;
                        const lines = wrapText(context, [label, content].filter(Boolean).join('\n'), columnWidth - 24);
                        for (let offset = 0; offset < lines.length; offset += 40) blocks.push({ image: offset ? null : cache.get(record.url), lines: lines.slice(offset, offset + 40) });
                    }
                    if (!cell.text && !cell.records.length && model.emptyCellLabel) blocks.push({ lines: [model.emptyCellLabel] });
                    return blocks;
                });
                const height = block => (block.image ? config.width * .7 : 0) + block.lines.length * 18 + 12;
                while (cells.some(cell => cell.length)) {
                    const sections = cells.map(cell => { let h = 0; const items = []; while (cell.length && h + height(cell[0]) <= 1400) { const block = cell.shift(); items.push(block); h += height(block); } return { items, height: h }; });
                    const rowHeight = Math.max(40, ...sections.map(section => section.height)) + 12;
                    if (y + rowHeight + (model.headerAtBottom ? headerHeight : 0) > 4088) { await finish(); begin(); }
                    sections.forEach((section, col) => {
                        const x = col * columnWidth; context.strokeStyle = '#555'; context.strokeRect(x, y, columnWidth, rowHeight); let cy = y + 8;
                        for (const block of section.items) {
                            if (block.image) {
                                const w = block.image.width, h = block.image.height, scale = Math.min(config.width / w, config.width * .7 / h);
                                context.drawImage(block.image, x + 12 + (config.width - w * scale) / 2, cy, w * scale, h * scale); cy += config.width * .7;
                            }
                            context.fillStyle = '#ddd'; block.lines.forEach(line => { context.fillText(line, x + 12, cy + 16); cy += 18; }); cy += 12;
                        }
                    }); y += rowHeight;
                }
            }
            await finish();
        }
        return { files, failed };
    } finally { cache.forEach(bitmap => bitmap?.close()); }
}

export async function packagePreviewPNGs(files, name = '预览-分页图片.zip') {
    if (files.length === 1) return files[0];
    const { zipSync } = await import('../../../vendor/zip.js');
    const entries = {};
    for (const file of files) entries[file.name] = new Uint8Array(await file.blob.arrayBuffer());
    return { name, blob: new Blob([zipSync(entries, { level: 0 })], { type: 'application/zip' }) };
}
