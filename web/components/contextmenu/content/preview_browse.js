import { escapeHtml as esc } from './shared.js';
import { sourceKey } from './preview_records.js';

export function workspacePreviewSources(cards) {
    return cards.flatMap((card, index) => (card.areas || []).filter(area => area.type === 'preview').map((area, outputIndex) => ({
        card, area, cardLabel: card.title || `#${index + 1}`, areaLabel: area.title || `##${outputIndex + 1}`,
    })));
}

export function initialPreviewSources(cards, selectedSources, selectedCardIds, fallbackCardId) {
    const all = workspacePreviewSources(cards).filter(source=>sourceRecordCount(source.area));
    if (selectedSources?.length) {
        const selected = new Set(selectedSources.map(source => sourceKey(source.card, source.area)));
        return all.filter(source => selected.has(sourceKey(source.card, source.area)));
    }
    const cardIds = new Set(selectedCardIds?.length ? selectedCardIds : [fallbackCardId]);
    return all.filter(source => cardIds.has(source.card.id));
}

export function sourceRecordCount(area) {
    return area.history?.length ? area.history.filter(Boolean).length : area.resultUrl ? 1 : 0;
}

export function sortBrowseRecords(records, order, customOrder = []) {
    if (order === 'source') return records;
    if (order === 'custom') {
        const ranks = new Map(customOrder.map((key, index) => [key, index]));
        return [...records].sort((a, b) => (ranks.get(a.key) ?? Infinity) - (ranks.get(b.key) ?? Infinity));
    }
    return [...records].sort((a, b) => ((a.run?.order ?? a.index+1) - (b.run?.order ?? b.index+1) || a.index - b.index) * (order === 'newest' ? -1 : 1));
}

export function moveBrowseRecords(order, keys, beforeKey = '') {
    const moving = new Set(keys);
    if (moving.has(beforeKey)) return order;
    const remaining = order.filter(key => !moving.has(key));
    const index = beforeKey ? remaining.indexOf(beforeKey) : remaining.length;
    if (index < 0) return order;
    remaining.splice(index, 0, ...order.filter(key => moving.has(key)));
    return remaining;
}

export function createBrowseLayout(root, settings, onReorder) {
    let thumbnailsCleanup, stripSignature = '', lastActive = '';
    const footer = root.querySelector('.clab-browse-footer'), left = root.querySelector('.clab-preview-modal-left');
    const body = root.querySelector('.clab-preview-modal-body');
    function restoreButton(side) {
        const name = { sources: '来源面板', parameters: '参数面板', filmstrip: '缩略图区域' }[side];
        return `<button type="button" data-browse-restore="${side}" hidden title="恢复${name}默认大小" aria-label="恢复${name}默认大小"><svg width="12" height="12" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 2 11 8 5 14Z" fill="currentColor"/></svg></button>`;
    }
    for (const side of ['sources', 'parameters']) {
        const handle = document.createElement('div');
        handle.className = `clab-browse-side-resize ${side}`; handle.dataset.browseResize = side;
        handle.tabIndex = 0; handle.setAttribute('role', 'separator'); handle.setAttribute('aria-orientation', 'vertical');
        handle.setAttribute('aria-label', `调整${side === 'sources' ? '来源' : '参数'}区域宽度`); handle.title = '拖动调整区域宽度';
        handle.innerHTML = restoreButton(side);
        body.appendChild(handle);
    }
    const observerController = new AbortController();
    const applyLayout = () => {
        if (root.dataset.reviewLayout === 'filmstrip' && body.clientWidth > 0) {
            const minimum = body.clientWidth < 700 ? 90 : 130, center = body.clientWidth < 600 ? 120 : 200;
            const sourceMinimum = settings.sourceWidth > 0 ? minimum : 0, parameterMinimum = settings.parameterWidth > 0 ? minimum : 0;
            settings.sourceWidth = Math.max(sourceMinimum, settings.sourceWidth);
            settings.parameterWidth = Math.max(parameterMinimum, settings.parameterWidth);
            const available = Math.max(sourceMinimum + parameterMinimum, body.clientWidth - center - 12);
            const excess = settings.sourceWidth + settings.parameterWidth - available;
            const extra = settings.sourceWidth + settings.parameterWidth - sourceMinimum - parameterMinimum;
            if (excess > 0 && extra > 0) {
                const sourceExtra = settings.sourceWidth - sourceMinimum;
                settings.sourceWidth -= excess * sourceExtra / extra;
                settings.parameterWidth -= excess * (extra - sourceExtra) / extra;
            }
        }
        root.style.setProperty('--browse-source-width', `${settings.sourceWidth}px`);
        root.style.setProperty('--browse-parameter-width', `${settings.parameterWidth}px`);
        root.style.setProperty('--browse-film-height', `${settings.height}px`);
        root.style.setProperty('--browse-thumb-width', `${settings.thumbSize}px`);
        root.dataset.sourceCollapsed = String(settings.sourceWidth === 0);
        root.dataset.parameterCollapsed = String(settings.parameterWidth === 0);
        root.dataset.filmCollapsed = String(settings.height === 0);
        root.querySelectorAll('[data-browse-restore]').forEach(button => {
            const key = button.dataset.browseRestore === 'filmstrip' ? 'height' : button.dataset.browseRestore === 'sources' ? 'sourceWidth' : 'parameterWidth';
            button.hidden = settings[key] !== 0;
            button.parentElement.dataset.collapsed = String(settings[key] === 0);
        });
        body.querySelectorAll('[data-browse-resize]').forEach(handle => handle.setAttribute('aria-valuenow', Math.round(settings[handle.dataset.browseResize === 'sources' ? 'sourceWidth' : 'parameterWidth'])));
    };
    function restorePanel(side) {
        if (side === 'filmstrip') settings.height = 164;
        else settings[side === 'sources' ? 'sourceWidth' : 'parameterWidth'] = side === 'sources' ? (window.innerWidth < 1100 ? 180 : 220) : (window.innerWidth < 1100 ? 240 : 300);
        applyLayout();
    }
    let resizeStart;
    const stopResize = () => { resizeStart = null; root.classList.remove('clab-filmstrip-resizing', 'clab-sidebar-resizing'); };
    root.addEventListener('pointerdown', event => {
        const handle = event.target.closest('[data-filmstrip-resize], [data-browse-resize]');
        if (!handle || event.button !== 0 || event.target.closest('[data-browse-restore]')) return;
        event.preventDefault(); handle.setPointerCapture(event.pointerId);
        resizeStart = { side: handle.dataset.browseResize, x: event.clientX, y: event.clientY, height: settings.height, sourceWidth: settings.sourceWidth, parameterWidth: settings.parameterWidth };
        root.classList.add(resizeStart.side ? 'clab-sidebar-resizing' : 'clab-filmstrip-resizing');
    }, { signal: observerController.signal });
    root.addEventListener('pointermove', event => {
        if (!resizeStart) return;
        const { side } = resizeStart;
        if (side) {
            const key = side === 'sources' ? 'sourceWidth' : 'parameterWidth', other = side === 'sources' ? 'parameterWidth' : 'sourceWidth';
            const minimum = body.clientWidth < 700 ? 90 : 130, center = body.clientWidth < 600 ? 120 : 200;
            const width = resizeStart[key] + (event.clientX - resizeStart.x) * (side === 'sources' ? 1 : -1);
            settings[key] = width < minimum - 36 ? 0 : Math.max(minimum, Math.min(body.clientWidth - settings[other] - center - 12, width));
        } else {
            const height = resizeStart.height + resizeStart.y - event.clientY;
            settings.height = height < 80 ? 0 : Math.max(116, Math.min(root.querySelector('.clab-preview-modal-panel').clientHeight * .45, height));
        }
        applyLayout();
    }, { signal: observerController.signal });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) root.addEventListener(type, stopResize, { signal: observerController.signal });
    root.addEventListener('keydown', event => {
        const side = event.target.dataset.browseResize;
        if (side && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
            event.preventDefault(); event.stopPropagation();
            const key = side === 'sources' ? 'sourceWidth' : 'parameterWidth', delta = (event.key === 'ArrowRight' ? 16 : -16) * (side === 'sources' ? 1 : -1);
            if (settings[key] === 0) { if (delta > 0) restorePanel(side); return; }
            settings[key] += delta;
            if (settings[key] < (body.clientWidth < 700 ? 90 : 130)) settings[key] = 0;
            applyLayout(); return;
        }
        if (!event.target.matches('[data-filmstrip-resize]') || !['ArrowUp','ArrowDown'].includes(event.key)) return;
        event.preventDefault(); event.stopPropagation();
        if (settings.height === 0) { if (event.key === 'ArrowUp') restorePanel('filmstrip'); return; }
        settings.height += event.key === 'ArrowUp' ? 16 : -16;
        settings.height = settings.height < 116 ? 0 : Math.min(root.querySelector('.clab-preview-modal-panel').clientHeight * .45, settings.height);
        applyLayout();
    }, { signal: observerController.signal });
    window.addEventListener('blur', stopResize, { signal: observerController.signal });
    window.addEventListener('resize', applyLayout, { signal: observerController.signal });
    left.addEventListener('click', event => {
        const summary = event.target.closest('.clab-browse-source-tree summary');
        if (!summary || event.target.closest('[data-browse-fold], input')) return;
        event.preventDefault();
        if (event.target.closest('[data-browse-card-name]')) {
            const checkbox = summary.querySelector('[data-browse-card-check]');
            if (!checkbox.disabled) checkbox.click();
        }
    }, { signal: observerController.signal });

    function renderSources(cards, allSources, selectedSources) {
        if (!left.querySelector('.clab-browse-source-tree')) left.innerHTML = `<div class="clab-browse-source-head">来源</div>
            <label class="clab-review-field"><input type="search" data-browse-search placeholder="搜索任务或模块" aria-label="搜索任务或模块" value="${esc(settings.search)}"></label>
            <div class="clab-browse-source-actions"><button data-browse-select="all">全选</button><button data-browse-select="none">取消</button><small data-browse-source-count></small></div><div class="clab-browse-source-tree"></div>`;
        const tree = left.querySelector('.clab-browse-source-tree');
        const search=left.querySelector('[data-browse-search]');
        if(search.value!==settings.search)search.value=settings.search;
        const closed = new Set([...tree.querySelectorAll('details:not([open])')].map(group => group.dataset.browseCard));
        const selected = new Set(selectedSources.map(source => sourceKey(source.card, source.area)));
        const query = settings.search.trim().toLowerCase();
        const scroll = left.scrollTop;
        tree.innerHTML = cards.map((card, index) => {
            const cardLabel = card.title || `#${index + 1}`, outputs = allSources.filter(source => source.card === card);
            const matches = outputs.filter(source => `${cardLabel} ${source.areaLabel}`.toLowerCase().includes(query));
            if (query && !matches.length && !cardLabel.toLowerCase().includes(query)) return '';
            const available = outputs.filter(source => sourceRecordCount(source.area));
            const checked = available.filter(source => selected.has(sourceKey(card, source.area))).length;
            return `<details data-browse-card="${esc(card.id)}" ${query || !closed.has(card.id) ? 'open' : ''}><summary><span data-browse-fold title="展开或折叠任务"></span><input type="checkbox" data-browse-card-check="${esc(card.id)}" aria-label="选择任务 ${esc(cardLabel)}" ${available.length && checked === available.length ? 'checked' : ''} ${available.length ? '' : 'disabled'}><button type="button" data-browse-card-name title="${esc(cardLabel)}" ${available.length ? '' : 'disabled'}>${esc(cardLabel)}</button><small>${outputs.reduce((sum, source) => sum + sourceRecordCount(source.area), 0)}</small></summary>
                ${matches.map(source => {
                    const key = sourceKey(card, source.area), count = sourceRecordCount(source.area);
                    return `<label class="clab-browse-source-row"><input type="checkbox" data-browse-source="${esc(key)}" aria-label="选择输出模块 ${esc(source.areaLabel)}" ${selected.has(key) ? 'checked' : ''} ${count ? '' : 'disabled'}><span title="${esc(source.areaLabel)}">${esc(source.areaLabel)}</span><small>${count}</small></label>`;
                }).join('') || '<p class="clab-review-note">没有输出模块</p>'}</details>`;
        }).join('') || '<p class="clab-review-note">没有匹配的任务或模块</p>';
        tree.querySelectorAll('[data-browse-card-check]').forEach(input => {
            const available = allSources.filter(source => source.card.id === input.dataset.browseCardCheck && sourceRecordCount(source.area));
            const count = available.filter(source => selected.has(sourceKey(source.card, source.area))).length;
            input.indeterminate = count > 0 && count < available.length;
        });
        left.querySelector('[data-browse-source-count]').textContent = `${selectedSources.length} 个模块`;
        left.scrollTop = scroll; applyLayout();
    }

    let records = [], allRecords = [], activeIndex = -1, selected = new Set(), anchor = '', comparison = null;
    let dragged = [], dropBefore = '', dropReady = false, suppressClick = false;

    function updateSelection() {
        const strip = footer.querySelector('.clab-browse-filmstrip');
        if (!strip) return;
        strip.querySelectorAll('[data-index]').forEach(button => {
            const active = Number(button.dataset.index) === activeIndex;
            button.classList.toggle('active', active); button.setAttribute('aria-current', String(active));
            const picked = selected.has(allRecords[Number(button.dataset.index)]?.key);
            button.classList.toggle('selected', picked); button.setAttribute('aria-selected', String(picked));
            const record=allRecords[Number(button.dataset.index)],badge=button.querySelector('.clab-filmstrip-assignment');
            const slots=comparison?['a','b'].filter(slot=>comparison[slot]===record?.key):[];
            const letters=slots.map(slot=>slot.toUpperCase());
            if(badge.textContent!==letters.join(''))badge.innerHTML=letters.map(letter=>`<span>${letter}</span>`).join('');
            badge.hidden=!slots.length;
        });
        strip.querySelectorAll('.clab-filmstrip-group').forEach(group => {
            const buttons = [...group.querySelectorAll('[data-index]')];
            const picked = buttons.length > 0 && buttons.every(button => selected.has(allRecords[Number(button.dataset.index)]?.key));
            group.classList.toggle('selected', picked); group.querySelector('[data-filmstrip-group]').setAttribute('aria-pressed', String(picked));
        });
        const picked = records.filter(record => selected.has(record.key)), current = picked[0] || allRecords[activeIndex];
        const sameSource = picked.every(record => record.source === current?.source);
        const sourceRecords = allRecords.filter(record => record.source === current?.source);
        const status = footer.querySelector('.clab-browse-status');
        const count = records.length === allRecords.length ? `共 ${allRecords.length} 条` : `显示 ${records.length} 条，共 ${allRecords.length} 条`;
        const detail = current ? `${sameSource ? `${current.cardLabel} · ${current.areaLabel}` : `${new Set(picked.map(record => record.source)).size} 个模块`} · ${picked.length > 1 ? `已选 ${picked.length} 条` : `${sourceRecords.findIndex(record => record.key === current.key) + 1}/${sourceRecords.length}`}` : '未选择记录';
        status.textContent = `${count}${comparison ? ` · 待替换 ${comparison.slot.toUpperCase()}` : ''} · ${detail}`;
        status.title = `${count}（共计当前勾选来源的全部记录）\n${detail}`;
    }

    function handleClick(event) {
        if (suppressClick) { suppressClick = false; return true; }
        const restore = event.target.closest('[data-browse-restore]');
        if (restore) { restorePanel(restore.dataset.browseRestore); return true; }
        if (event.target.closest('[data-browse-size-reset]')) {
            settings.thumbSize = 120; footer.querySelector('[data-browse-size]').value = 120; applyLayout(); return true;
        }
        const groupButton = event.target.closest('[data-filmstrip-group]');
        if (groupButton) {
            selected = new Set([...groupButton.closest('.clab-filmstrip-group').querySelectorAll('[data-index]')].map(button => allRecords[Number(button.dataset.index)].key));
            anchor = [...selected][0]; updateSelection(); return true;
        }
        const thumb = event.target.closest('.clab-filmstrip-thumb');
        if (!thumb) return false;
        const key = allRecords[Number(thumb.dataset.index)].key;
        if (event.shiftKey && anchor) {
            const start = records.findIndex(record => record.key === anchor), end = records.findIndex(record => record.key === key);
            if (start >= 0) selected = new Set(records.slice(Math.min(start, end), Math.max(start, end) + 1).map(record => record.key));
        } else if (event.ctrlKey || event.metaKey) { selected.has(key) ? selected.delete(key) : selected.add(key); anchor = key; }
        else { selected = new Set([key]); anchor = key; return false; }
        updateSelection(); return true;
    }

    const clearDrop = () => { footer.querySelectorAll('.drop-before,.drop-after').forEach(el => el.classList.remove('drop-before', 'drop-after')); dropReady = false; };
    footer.addEventListener('dragstart', event => {
        const thumb = event.target.closest('.clab-filmstrip-thumb'), group = event.target.closest('[data-filmstrip-group]');
        if (!thumb && !group) { event.preventDefault(); return; }
        if (group) selected = new Set([...group.closest('.clab-filmstrip-group').querySelectorAll('[data-index]')].map(button => allRecords[Number(button.dataset.index)].key));
        else { const key = allRecords[Number(thumb.dataset.index)].key; if (!selected.has(key)) selected = new Set([key]); }
        dragged = records.filter(record => selected.has(record.key)).map(record => record.key);
        event.dataTransfer.effectAllowed = 'copyMove'; event.dataTransfer.setData('text/plain', 'CreativeLab preview records');
        if(thumb)event.dataTransfer.setData('application/x-clab-preview-record',allRecords[Number(thumb.dataset.index)].key);
        updateSelection();
    });
    footer.addEventListener('dragover', event => {
        const strip = event.target.closest('.clab-browse-filmstrip');
        if (!dragged.length || !strip) return;
        event.preventDefault(); event.dataTransfer.dropEffect = 'move'; clearDrop();
        const rect = strip.getBoundingClientRect();
        if (event.clientX < rect.left + 40) strip.scrollLeft -= 18;
        else if (event.clientX > rect.right - 40) strip.scrollLeft += 18;
        let thumb = event.target.closest('.clab-filmstrip-thumb');
        const group = event.target.closest('.clab-filmstrip-group');
        if (!thumb && !event.target.closest('[data-filmstrip-group]')) {
            let distance = Infinity;
            strip.querySelectorAll('.clab-filmstrip-thumb').forEach(button => {
                const bounds = button.getBoundingClientRect(), gap = Math.min(Math.abs(event.clientX - bounds.left), Math.abs(event.clientX - bounds.right));
                if (gap < distance) { thumb = button; distance = gap; }
            });
        }
        let target = thumb || group, after = false;
        if (target) {
            const bounds = target.getBoundingClientRect(); after = event.clientX > bounds.left + bounds.width / 2;
            const buttons = thumb ? [thumb] : [...group.querySelectorAll('[data-index]')];
            const key = allRecords[Number((after ? buttons.at(-1) : buttons[0]).dataset.index)].key;
            const index = records.findIndex(record => record.key === key);
            dropBefore = records[index + (after ? 1 : 0)]?.key || '';
        } else { target = strip.lastElementChild; after = true; dropBefore = ''; }
        target?.classList.add(after ? 'drop-after' : 'drop-before'); dropReady = true;
    });
    footer.addEventListener('dragleave', event => { if (!footer.contains(event.relatedTarget)) clearDrop(); });
    footer.addEventListener('drop', event => {
        if (!dragged.length || !dropReady) return;
        event.preventDefault(); const keys = dragged; dragged = []; clearDrop(); suppressClick = true;
        onReorder(keys, dropBefore); setTimeout(() => { suppressClick = false; }, 0);
    });
    footer.addEventListener('dragend', () => { dragged = []; clearDrop(); });
    footer.addEventListener('wheel', event => {
        const strip = event.target.closest('.clab-browse-filmstrip');
        if (!strip || event.ctrlKey) return;
        event.preventDefault();
        const delta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
        strip.scrollLeft += delta * (event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? strip.clientWidth : 1);
    }, { passive: false });

    function renderFilmstrip(nextRecords, nextAllRecords, nextActiveIndex, typeFilter, nextComparison = null) {
        records = nextRecords; allRecords = nextAllRecords; activeIndex = nextActiveIndex; comparison = nextComparison;
        if (!footer.querySelector('.clab-browse-filmstrip')) footer.innerHTML = `<div class="clab-filmstrip-resize" data-filmstrip-resize tabindex="0" role="separator" aria-orientation="horizontal" aria-label="调整缩略图区域高度" title="拖动调整缩略图区域高度">${restoreButton('filmstrip')}</div>
            <div class="clab-browse-tools">
                <label>媒体<select data-review-type aria-label="浏览媒体类型"></select></label>
                <label>排序<select data-browse-sort aria-label="浏览排序方式"><option value="source">任务 / 模块</option><option value="newest">生成：新到旧</option><option value="oldest">生成：旧到新</option><option value="custom">自定义排序</option></select></label>
                <span class="clab-browse-status" role="status"></span>
                <label class="clab-browse-thumb-size"><button type="button" data-browse-size-reset title="恢复默认缩略图大小" aria-label="恢复默认缩略图大小"><svg viewBox="0 0 20 16" width="16" height="14" aria-hidden="true"><rect x="1" y="1" width="18" height="14" rx="2" fill="none" stroke="currentColor"/><path d="m3 12 4-5 3 3 3-4 4 6Z" fill="currentColor"/></svg></button><input type="range" min="88" max="176" step="8" data-browse-size aria-label="缩略图大小"></label>
            </div><div class="clab-browse-filmstrip" role="list" aria-label="历史媒体缩略图"></div>`;
        const types=comparison?[['','全部'],['image','图片'],['video','视频']]:[['', '全部'], ['image', '图片'], ['video', '视频'], ['audio', '音频'], ['text', '文本'], ['model', '3D'], ['file', '文件']];
        footer.querySelector('[data-review-type]').innerHTML = types.map(([key, label]) => `<option value="${key}" ${typeFilter === key ? 'selected' : ''}>${label}</option>`).join('');
        footer.querySelector('[data-browse-sort]').value = settings.sort;
        footer.querySelector('[data-browse-size]').value = settings.thumbSize;
        const strip = footer.querySelector('.clab-browse-filmstrip'), signature = JSON.stringify(records.map(record => [record.key, record.areaLabel, record.cardLabel]));
        const indices = new Map(allRecords.map((record, index) => [record.key, index]));
        if (signature !== stripSignature) {
            thumbnailsCleanup?.();
            const scroll = strip.scrollLeft, groups = [];
            for (const record of records) {
                if (groups.at(-1)?.source !== record.source) groups.push({ source: record.source, records: [] });
                groups.at(-1).records.push(record);
            }
            strip.innerHTML = groups.map(group => {
                const label = `${group.records[0].cardLabel} · ${group.records[0].areaLabel}`;
                const thumbnails = group.records.map(record => {
                    const title = `${record.cardLabel} / ${record.areaLabel}\n${record.name}\n${record.index < 0 ? '当前结果' : `历史 ${record.index + 1}`}`;
                    const media = record.type === 'image' ? `<img loading="lazy" draggable="false" src="${esc(record.url)}" alt="${esc(record.name)}">` : record.type === 'video' ? `<video data-film-src="${esc(record.url.split('#')[0])}#t=0.01" muted playsinline preload="metadata"></video>` : `<span class="clab-preview-modal-thumb-badge">${({ audio: '音频', text: '文本', model: '3D', file: '文件' })[record.type] || record.type}</span>`;
                    return `<button type="button" draggable="true" class="clab-preview-modal-thumb clab-filmstrip-thumb" data-index="${indices.get(record.key)}" title="${esc(title)}"><div class="clab-preview-modal-thumb-media">${media}</div><span class="clab-filmstrip-assignment" hidden></span><span class="clab-filmstrip-history">${record.index < 0 ? '当前' : record.index + 1}</span></button>`;
                }).join('');
                return `<section class="clab-filmstrip-group"><button type="button" data-filmstrip-group draggable="true" title="${esc(label)}；点击选择分区，拖动调整顺序">${esc(label)} <small>${group.records.length}</small></button><div class="clab-filmstrip-group-items">${thumbnails}</div></section>`;
            }).join('') || '<div class="clab-preview-modal-empty">没有符合筛选条件的媒体</div>';
            const observer = new IntersectionObserver(entries => entries.forEach(({ target, isIntersecting }) => { if (isIntersecting) { target.src = target.dataset.filmSrc; observer.unobserve(target); } }), { root: strip, rootMargin: '0px 160px' });
            strip.querySelectorAll('video').forEach(video => observer.observe(video));
            thumbnailsCleanup = () => { observer.disconnect(); strip.querySelectorAll('video').forEach(video => { video.pause(); video.removeAttribute('src'); video.load(); }); };
            strip.scrollLeft = scroll; stripSignature = signature;
        }
        const active = allRecords[activeIndex]?.key || '';
        if (active !== lastActive) selected = new Set(active ? [active] : []);
        selected = new Set([...selected].filter(key => records.some(record => record.key === key)));
        updateSelection();
        if (active !== lastActive) strip.querySelector('.active')?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
        lastActive = active; applyLayout();
    }

    function release() { thumbnailsCleanup?.(); thumbnailsCleanup = null; stripSignature = ''; lastActive = ''; selected.clear(); dragged = []; clearDrop(); stopResize(); }
    return { renderSources, renderFilmstrip, applyLayout, handleClick, release };
}
