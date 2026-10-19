import { escapeHtml as esc } from './shared.js';

export function downloadPreviewBlob(blob, name) {
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = name; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
}

export function buildStandaloneHTML(model, mediaPaths, textLimit = 200, mediaWidth = 240) {
    return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(model.title)}</title><style>
        body{font:14px/1.5 system-ui,sans-serif;background:#191919;color:#ddd;margin:24px}table{border-collapse:collapse}th,td{border:1px solid #555;padding:12px;vertical-align:top;min-width:180px;max-width:660px;overflow-wrap:anywhere}th{background:#292929}img,video{display:block;width:${Math.max(80,Math.min(640,mediaWidth))}px;max-width:100%;height:auto;margin:6px 0}pre{white-space:pre-wrap}summary{cursor:pointer}a{color:#9dc9ff}.note{color:#aaa}p{white-space:pre-wrap}
        </style><h1>${esc(model.title)}</h1><p class="note">${esc(model.note || '')}</p><table><thead><tr>${model.columns.map(column => `<th>${esc(column)}</th>`).join('')}</tr></thead><tbody>${model.rows.map(row => `<tr>${row.cells.map(cell => `<td>${cell.text ? cell.text.length <= textLimit ? `<p>${esc(cell.text)}</p>` : `<details><summary>${esc(cell.text.slice(0,textLimit))}…</summary><p>${esc(cell.text)}</p></details>` : ''}${cell.records.map(record => {
            const path = mediaPaths.get(record.url);
            const media = !path ? '<p>资源未导出</p>' : record.type === 'image' ? `<img loading="lazy" src="${esc(path)}" alt="${esc(record.areaLabel)}">`
                : record.type === 'video' ? `<video controls preload="none" src="${esc(path)}"></video>` : `${record.type==='text'&&record.text?`<pre>${esc(record.text)}</pre>`:''}<a href="${esc(path)}">${esc(record.type === 'text' ? '查看文本文件' : '打开文件')}</a>`;
            return `${media}<p>${esc(record.cardLabel)} / ${esc(record.areaLabel)} · 历史 ${record.index + 1}</p>`;
        }).join('')}${!cell.text && !cell.records.length ? '无结果' : ''}</td>`).join('')}</tr>`).join('')}</tbody></table></html>`;
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
    const files = [], cache = new Map(), failed = [];
    const records = model.rows.flatMap(row => row.cells.flatMap(cell => cell.records));
    try {
        for (const record of records) {
            if (cache.has(record.url)) continue;
            try { cache.set(record.url, await mediaPoster(record)); }
            catch { cache.set(record.url, null); failed.push(`${record.areaLabel} · 历史 ${record.index + 1}`); }
        }
        const columnWidth = Math.max(180, config.width + 24), perPage = Math.max(1, Math.floor(4096 / columnWidth) - 1);
        for (let start = 1; start < model.columns.length || start === 1 && model.columns.length === 1; start += perPage) {
            const indices = [0, ...model.columns.slice(start, start + perPage).map((_, index) => start + index)];
            let page = document.createElement('canvas'), context, y;
            const begin = () => {
                page.width = columnWidth * indices.length; page.height = 4096;
                context = page.getContext('2d'); context.fillStyle = '#191919'; context.fillRect(0, 0, page.width, page.height);
                context.font = 'bold 18px sans-serif'; context.fillStyle = '#eee'; context.fillText(model.title.slice(0, 90), 12, 28);
                context.font = '13px sans-serif'; context.fillStyle = '#aaa'; context.fillText((model.note || '').slice(0, 160), 12, 50);
                y = 64;
                indices.forEach((index, col) => {
                    context.fillStyle = '#303030'; context.fillRect(col * columnWidth, y, columnWidth, 80);
                    context.fillStyle = '#eee'; wrapText(context, model.columns[index], columnWidth - 24).slice(0, 4).forEach((line, n) => context.fillText(line, col * columnWidth + 12, y + 20 + n * 16));
                }); y += 80;
            };
            const finish = async () => {
                const trimmed = document.createElement('canvas'); trimmed.width = page.width; trimmed.height = y + 8;
                trimmed.getContext('2d').drawImage(page, 0, 0);
                const blob = await new Promise(resolve => trimmed.toBlob(resolve, 'image/png'));
                if (!blob) throw new Error('表格图片生成失败');
                files.push({ name: `XY矩阵-${files.length + 1}.png`, blob });
            };
            begin();
            for (const row of model.rows) {
                const cells = indices.map(index => {
                    const cell = row.cells[index];
                    const text = cell.text.length > config.textLimit ? `${cell.text.slice(0, config.textLimit)}…` : cell.text;
                    const lines = wrapText(context, text, columnWidth - 24);
                    const blocks = [];
                    for (let offset = 0; offset < lines.length; offset += 40) blocks.push({ lines: lines.slice(offset, offset + 40) });
                    for (const record of cell.records) {
                        const lines = wrapText(context, `${record.areaLabel} · 历史 ${record.index + 1}${cache.get(record.url) ? '' : record.type === 'text' ? `\n${record.text.slice(0, config.textLimit)}` : `\n${record.type === 'video' ? '视频' : '文件'}预览不可用`}`, columnWidth - 24);
                        for (let offset = 0; offset < lines.length; offset += 40) blocks.push({ image: offset ? null : cache.get(record.url), lines: lines.slice(offset, offset + 40) });
                    }
                    if (!cell.text && !cell.records.length) blocks.push({ lines: ['无结果'] });
                    return blocks;
                });
                const height = block => (block.image ? config.width * .7 : 0) + block.lines.length * 18 + 12;
                while (cells.some(cell => cell.length)) {
                    const sections = cells.map(cell => { let h = 0; const items = []; while (cell.length && h + height(cell[0]) <= 1400) { const block = cell.shift(); items.push(block); h += height(block); } return { items, height: h }; });
                    const rowHeight = Math.max(40, ...sections.map(section => section.height)) + 12;
                    if (y + rowHeight > 4090) { await finish(); begin(); }
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
