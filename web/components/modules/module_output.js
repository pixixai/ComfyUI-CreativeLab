/**
 * 文件名: module_output.js
 * 职责: 负责卡片内“输出模块”的 UI 渲染与交互 (网格管理、媒体预览、缩略图拖拽排序)
 */
import { state, dragState, saveAndRender } from "../ui_state.js";
import { getRatioCSS, showBindingToast, hideBindingToast } from "../ui_utils.js";
// 【完美保留】：继续使用你原本正确的媒体路由专员，绝不破坏底层架构！
import { renderMedia, attachMediaEvents } from "./module_media.js";
import { generateOutputControlsHTML, attachOutputSettingsEvents } from "./module_output_settings.js";
import {
    getAreaResultType,
    getMediaType,
    loadSelectedTextContent,
    remapPreviewHistory,
    syncTextContentWithSelection,
} from "./media_types/media_utils.js";
import { selectOutputHistory } from "./module_history.js";
import { refreshModuleBindingSummary } from "./module_binding.js";

function getTextSnippet(text) {
    const source = String(text || "").replace(/\s+/g, " ").trim();
    return source.length > 90 ? `${source.slice(0, 90)}...` : (source || "Empty Text");
}

function getTextHistoryLabel(url) {
    try {
        const resolved = new URL(url, window.location.origin);
        return resolved.searchParams.get("filename") || "Text";
    } catch (_) {
        return "Text";
    }
}

function renderTextHistoryThumb(area, idx) {
    const status = area.textHistoryStatus?.[idx] || "idle";
    const sourceText = area.textHistory?.[idx] || "";
    const snippet = status === "missing"
        ? "媒体丢失"
        : status === "loading"
            ? "正在读取..."
            : sourceText
                ? getTextSnippet(sourceText)
                : getTextHistoryLabel(area.history?.[idx]);
    const safeSnippet = snippet.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    return `
        <div style="width:100%; height:100%; display:flex; align-items:flex-start; justify-content:flex-start; background:linear-gradient(180deg, rgba(18,24,32,0.95), rgba(13,17,24,0.98)); color:#eaf1f8; padding:10px; box-sizing:border-box; font: 12px/1.45 sans-serif; overflow:hidden;">
            <div style="display:-webkit-box; -webkit-line-clamp:6; -webkit-box-orient:vertical; overflow:hidden; word-break:break-word;">
                ${safeSnippet}
            </div>
        </div>
    `;
}

export function generateOutputHTML(area, card) {
    const isAreaSelected = state.selectedAreaIds.includes(area.id);
    const nodeBypassedClass = (area.runtimeNodeBypassed === true || area.runtimeNodeDisabled === true) ? "clab-node-bypassed" : "";

    if (area.isManageMode && area.history && area.history.length > 0) {
        let gridHtml = `<div class="clab-history-grid" data-card-id="${card.id}" data-area-id="${area.id}" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; padding: 10px; width: 100%; box-sizing: border-box; max-height: 400px; overflow-y: auto;">`;
        
        const selectedThumbs = area.selectedThumbIndices || [];

        area.history.forEach((hUrl, idx) => {
            const isCurrent = !area.missingHistoryRun && idx === (area.historyIndex !== undefined ? area.historyIndex : area.history.length - 1);
            const isSelected = selectedThumbs.includes(idx);

            let border = '2px solid rgba(255,255,255,0.1)';
            if (isCurrent) border = '2px solid #4CAF50';
            else if (isSelected) border = '2px solid #2196F3';

            const urlLower = typeof hUrl === 'string' ? hUrl.toLowerCase() : '';
            const isVid = urlLower.match(/\.(mp4|webm|mov|avi|mkv)/);
            const isAud = urlLower.match(/\.(mp3|wav|ogg|flac|aac|m4a)/);
            
            // 【关键修复】：这里必须先解析出安全的 displayUrl，下面才能正常使用！
            const displayUrl = hUrl;
            const historyType = getMediaType(displayUrl);

            let media = '';
            if (historyType === 'video' || isVid) {
                // 【设置项支持】：动态判断是否启用高性能缩略图模式
                if (window._clabThumbPerfMode !== false) {
                    // 高性能模式：加入 preload="metadata" 和 #t=0.1，只截取首帧！
                    media = `<video data-clab-src="${displayUrl}#t=0.1" preload="metadata" style="width:100%; height:100%; object-fit:cover; pointer-events:none;" muted></video>`;
                } else {
                    // 动态模式：全量加载并自动循环播放 (极具视觉冲击力但较吃配置)
                    media = `<video data-clab-src="${displayUrl}" preload="auto" autoplay loop muted style="width:100%; height:100%; object-fit:cover; pointer-events:none;"></video>`;
                }
            } else if (historyType === 'audio' || isAud) {
                media = `<div style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; background:#222; color:#fff; font-size:24px;">🎵</div>`;
            } else if (historyType === 'text') {
                media = renderTextHistoryThumb(area, idx);
            } else {
                media = `<img loading="lazy" data-clab-src="${displayUrl}" style="width:100%; height:100%; object-fit:cover; pointer-events:none;" />`;
            }

            const overlay = isSelected ? `<div class="clab-thumb-selection" style="position:absolute;inset:0;background:rgba(33,150,243,0.3);pointer-events:none;"></div>` : '';
            
            const delBtn = `<div class="clab-thumb-delete" data-card="${card.id}" data-area="${area.id}" data-index="${idx}" style="position:absolute; top:3px; right:3px; width:18px; height:18px; background:rgba(255, 255, 255, 0.6); color:#333; font-weight:bold; border-radius:50%; font-size:10px; display:none; align-items:center; justify-content:center; cursor:pointer; z-index:10; box-shadow: 0 1px 3px rgba(0,0,0,0.3); transition: all 0.2s;" title="删除此记录">✖</div>`;

            gridHtml += `
                <div class="clab-history-thumb" draggable="true" data-card="${card.id}" data-area="${area.id}" data-index="${idx}" style="aspect-ratio: 1/1; border: ${border}; border-radius: 4px; cursor: grab; overflow: hidden; position: relative; background: #000; transition: border-color 0.2s;">
                    ${media}
                    ${overlay}
                    ${delBtn}
                </div>
            `;
        });
        gridHtml += `</div>`;

        const actionableIndices = (selectedThumbs && selectedThumbs.length > 0) 
            ? selectedThumbs 
            : (area.historyIndex !== undefined && area.history.length > 0 ? [area.historyIndex] : []);
        const hasSelection = actionableIndices.length > 0;
        
        const btnBaseStyle = "padding:4px 8px; border-radius:4px; border:none; transition:all 0.2s; font-size:10px; font-weight:normal;";
        const btnActiveStyle = 'cursor:pointer; color:#eee; background:rgba(255,255,255,0.15); box-shadow: 0 1px 3px rgba(0,0,0,0.3);';
        const btnDisabledStyle = 'cursor:not-allowed; color:#777; background:rgba(255,255,255,0.05); box-shadow:none;';
        
        const btnRemoveStyle = hasSelection ? btnActiveStyle : btnDisabledStyle;

        return `
            <div class="clab-area clab-output-area ${isAreaSelected ? 'active' : ''} ${nodeBypassedClass}" draggable="true" data-card-id="${card.id}" data-area-id="${area.id}" style="padding:0; position:relative; background: rgba(0,0,0,0.4); min-height: 100px;">
                <button class="clab-del-area-btn" data-card="${card.id}" data-area="${area.id}" title="删除输出模块" style="z-index: 30;">✖</button>
                
                <div class="clab-output-manage-head" style="padding: 8px 8px 8px 10px; border-radius:5px 5px 0 0; font-size: 12px; font-weight: bold; color: #ccc; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; gap:6px; align-items: center; background: rgba(0,0,0,0.3);">
                    <span style="min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">生成记录管理 (${area.history.length})</span>
                    <div style="display:flex; gap: 6px; align-items: center; flex-shrink:0;">
                        <button class="clab-manage-remove-btn" data-card="${card.id}" data-area="${area.id}" style="${btnBaseStyle} ${btnRemoveStyle}" ${hasSelection ? '' : 'disabled'} onmouseover="if(!this.disabled) { this.style.background='rgba(255,255,255,0.25)'; this.style.color='#fff'; }" onmouseout="if(!this.disabled) { this.style.background='rgba(255,255,255,0.15)'; this.style.color='#eee'; }">移除</button>
                        ${generateOutputControlsHTML(area)}
                    </div>
                </div>
                
                ${gridHtml}
            </div>
        `;
    }

    const resultType = getAreaResultType(area);
    let finalRatioCSS = getRatioCSS(area);
    if (area.matchMedia && area.width && area.height) {
        finalRatioCSS = `aspect-ratio: ${area.width} / ${area.height};`;
    }
    if (resultType === 'text') {
        finalRatioCSS = 'min-height: 72px;';
    }

    let objectFit = 'contain'; 
    if (area.fillMode === '填充') objectFit = 'cover';
    if (area.fillMode === '拉伸') objectFit = 'fill';

    let historyHtml = '';
    if (resultType !== 'text' && area.history && area.history.length > 1) {
        const currIdx = area.missingHistoryRun ? '—' : area.historyIndex !== undefined ? area.historyIndex + 1 : area.history.length;
        historyHtml = `<div class="clab-output-history-position" title="← / → 关联切换；Shift + ← / → 仅切换当前输出模块" style="position:absolute; top: 8px; left: 10px; color: rgba(255,255,255,0.9); font-size: 12px; font-weight: bold; font-family: sans-serif; letter-spacing: -0.5px; z-index: 20;">${currIdx} / ${area.history.length}</div>`;
    }

    // 🌟 将原本庞杂的媒体判定逻辑交给专员去处理！
    let mediaHtml = area.missingHistoryRun ? '' : renderMedia(area, objectFit);
    const previewBgClass = resultType === 'text' ? 'clab-preview-bg clab-preview-bg-text' : 'clab-preview-bg';
    const previewPlaceholderVisible = area.missingHistoryRun || (resultType === 'text' ? false : !area.resultUrl);

    return `
        <div class="clab-area clab-output-area ${isAreaSelected ? 'active' : ''} ${nodeBypassedClass}" draggable="true" data-card-id="${card.id}" data-area-id="${area.id}" style="padding:0; position:relative;">
            <button class="clab-del-area-btn" data-card="${card.id}" data-area="${area.id}" title="删除输出模块" style="z-index: 30;">✖</button>
            ${generateOutputControlsHTML(area)}
            ${historyHtml}
            <div class="${previewBgClass}" style="${finalRatioCSS} position: relative; ${resultType === 'text' ? 'display:block; background: rgb(25, 25, 25);' : ''}">
                ${mediaHtml}
                <span class="clab-preview-placeholder" style="display:${previewPlaceholderVisible ? 'block' : 'none'}; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 100%; text-align: center;">${area.missingHistoryRun ? '该次运行无可用记录' : area.targetNodeId ? `等待节点 [${area.targetNodeId}] 输出...` : '未关联节点'}</span>
            </div>
        </div>
    `;
}

function historyGridKey(area) {
    return JSON.stringify([area.history, area.textHistory, area.textHistoryStatus, window._clabThumbPerfMode]);
}

export function refreshOutputAreaInPlace(areaEl, area, card) {
    if (!areaEl.classList.contains('clab-output-area')) return false;
    const temp = document.createElement('div');
    temp.innerHTML = generateOutputHTML(area, card);
    const next = temp.firstElementChild;
    const grid = areaEl.querySelector('.clab-history-grid');
    const nextGrid = next.querySelector('.clab-history-grid');
    if (!!grid !== !!nextGrid) return false;
    areaEl.className = next.className;
    areaEl.dataset.cardId = card.id;
    areaEl.style.cssText = next.style.cssText;
    refreshModuleBindingSummary(areaEl, area);
    const controls = areaEl.querySelector('.clab-output-controls');
    const copy = controls.querySelector('.clab-text-copy-btn');
    const nextCopy = next.querySelector('.clab-text-copy-btn');
    if (copy && !nextCopy) copy.remove();
    else if (!copy && nextCopy) controls.prepend(nextCopy);
    if (grid) {
        if (grid._clabHistoryKey !== historyGridKey(area)) {
            const scroll = grid.scrollTop;
            grid.innerHTML = nextGrid.innerHTML;
            grid.scrollTop = scroll;
            grid._clabHistoryKey = historyGridKey(area);
        } else {
            grid.querySelectorAll('.clab-history-thumb').forEach((thumb, index) => {
                const selected = area.selectedThumbIndices?.includes(index);
                const current = !area.missingHistoryRun && index === area.historyIndex;
                thumb.style.borderColor = current ? '#4CAF50' : selected ? '#2196F3' : 'rgba(255,255,255,0.1)';
                const overlay = thumb.querySelector('.clab-thumb-selection');
                if (selected && !overlay) thumb.insertAdjacentHTML('beforeend', '<div class="clab-thumb-selection" style="position:absolute;inset:0;background:rgba(33,150,243,0.3);pointer-events:none;"></div>');
                else if (!selected && overlay) overlay.remove();
            });
        }
        const heading = areaEl.querySelector('.clab-output-manage-head > span');
        heading.textContent = next.querySelector('.clab-output-manage-head > span').textContent;
        const remove = areaEl.querySelector('.clab-manage-remove-btn');
        const nextRemove = next.querySelector('.clab-manage-remove-btn');
        remove.disabled = nextRemove.disabled;
        remove.style.cssText = nextRemove.style.cssText;
    } else {
        const bg = areaEl.querySelector('.clab-preview-bg');
        const nextBg = next.querySelector('.clab-preview-bg');
        const media = bg.querySelector('.clab-preview-img, .clab-media-target');
        const nextMedia = nextBg.querySelector('.clab-preview-img, .clab-media-target');
        const shell = bg.querySelector('.clab-text-preview-shell');
        const nextShell = nextBg.querySelector('.clab-text-preview-shell');
        bg.className = nextBg.className;
        if (bg.style.cssText !== nextBg.style.cssText) bg.style.cssText = nextBg.style.cssText;
        if (media && nextMedia && media.tagName === nextMedia.tagName) {
            media.className = nextMedia.className;
            media.id = nextMedia.id;
            if (media.getAttribute('src') !== nextMedia.getAttribute('src')) {
                media.src = nextMedia.getAttribute('src');
                bg.querySelector('.clab-media-dead-fallback')?.remove();
            }
            if (media.style.cssText !== nextMedia.style.cssText) media.style.cssText = nextMedia.style.cssText;
            media.setAttribute('onerror', nextMedia.getAttribute('onerror') || '');
        } else if (shell && nextShell) {
            const body = shell.querySelector('.clab-text-body-content');
            const nextBody = nextShell.querySelector('.clab-text-body-content');
            if (body.innerHTML !== nextBody.innerHTML) body.innerHTML = nextBody.innerHTML;
            if (shell.dataset.historyUrl !== area.resultUrl) shell.querySelector('.clab-text-body-scroll').scrollTop = 0;
            shell.dataset.historyUrl = area.resultUrl || '';
            shell.querySelectorAll('[data-option]').forEach(input => {
                input.checked = nextShell.querySelector(`[data-option="${input.dataset.option}"]`).checked;
            });
            const counter = shell.querySelector('.clab-text-history-position');
            const nextCounter = nextShell.querySelector('.clab-text-history-position');
            if (counter && !nextCounter) counter.remove();
            else if (!counter && nextCounter) shell.querySelector('.clab-text-toolbar').append(nextCounter);
            else if (counter && nextCounter) { counter.textContent = nextCounter.textContent; counter.title = nextCounter.title; }
        } else if (bg.innerHTML !== nextBg.innerHTML) {
            bg.innerHTML = nextBg.innerHTML;
        }
        const placeholder = bg.querySelector('.clab-preview-placeholder');
        const nextPlaceholder = nextBg.querySelector('.clab-preview-placeholder');
        if (placeholder) { placeholder.textContent = nextPlaceholder.textContent; placeholder.style.cssText = nextPlaceholder.style.cssText; }
        const counter = areaEl.querySelector(':scope > .clab-output-history-position');
        const nextCounter = next.querySelector(':scope > .clab-output-history-position');
        if (counter && !nextCounter) counter.remove();
        else if (!counter && nextCounter) controls.after(nextCounter);
        else if (counter && nextCounter) counter.textContent = nextCounter.textContent;
    }
    attachOutputEvents(areaEl);
    return true;
}

export function attachOutputEvents(container) {
    attachOutputSettingsEvents(container);
    // 🌟 接管媒体区域特有的交互！
    attachMediaEvents(container);

    // 【微创手术引擎】：在此处拦截局部更新，不影响其他模块的视频播放！
    const applySurgicalUpdate = (area) => {
        if (window._clabSurgicallyUpdateArea) {
            window._clabSurgicallyUpdateArea(area.id);
            if (window._clabJustSave) window._clabJustSave();
        } else {
            saveAndRender();
        }
    };

    // 【功能1】：网格视图下“仅移除” (仅限当前模块，不删文件)
    container.querySelectorAll('.clab-manage-remove-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            if (btn.disabled) return;
            const cardId = btn.dataset.card;
            const areaId = btn.dataset.area;
            const card = state.cards.find(c => c.id === cardId);
            const area = card?.areas.find(a => a.id === areaId);

            if (area && area.history && area.history.length > 0) {
                let targetIndicesSet = new Set();
                if (area.selectedThumbIndices && area.selectedThumbIndices.length > 0) {
                    area.selectedThumbIndices.forEach(idx => targetIndicesSet.add(idx));
                }
                if (area.historyIndex !== undefined && area.historyIndex >= 0 && area.historyIndex < area.history.length) {
                    targetIndicesSet.add(area.historyIndex);
                }
                
                let targetIndices = Array.from(targetIndicesSet);

                if (targetIndices.length > 0) {
                    const preservedIndex = remapPreviewHistory(area, area.history.map((_, i) => i).filter(i => !targetIndices.includes(i)));

                    if (area.history.length === 0) {
                        area.resultUrl = '';
                        area.historyIndex = 0;
                        area.selectedThumbIndices = [];
                        if (Array.isArray(area.textHistory)) area.textContent = '';
                        area.textLoadState = 'idle';
                    } else {
                        let newActiveIdx = preservedIndex;
                        if (newActiveIdx === -1) newActiveIdx = Math.max(0, area.history.length - 1);
                        area.historyIndex = newActiveIdx;
                        area.resultUrl = area.history[newActiveIdx];
                        area.selectedThumbIndices = []; 
                        syncTextContentWithSelection(area);
                        void loadSelectedTextContent(area, { refresh: true });
                    }
                    applySurgicalUpdate(area);
                }
            }
        };
    });

    container.querySelectorAll('.clab-history-grid').forEach(grid => {
        const owner = state.cards.find(card => card.id === grid.dataset.cardId)?.areas.find(area => area.id === grid.dataset.areaId);
        if (owner) grid._clabHistoryKey = historyGridKey(owner);
        grid.onclick = (e) => {
            if (e.target === grid) {
                const card = state.cards.find(c => c.id === grid.dataset.cardId);
                const area = card?.areas.find(a => a.id === grid.dataset.areaId);
                if (area) {
                    area.selectedThumbIndices = []; 
                    applySurgicalUpdate(area);
                }
            }
        };
    });

    container.querySelectorAll('.clab-thumb-delete').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const cardId = btn.dataset.card;
            const areaId = btn.dataset.area;
            const idx = parseInt(btn.dataset.index, 10);
            const card = state.cards.find(c => c.id === cardId);
            const area = card?.areas.find(a => a.id === areaId);

            if (area && area.history) {
                let toDelete = [idx];
                if (area.selectedThumbIndices && area.selectedThumbIndices.includes(idx)) {
                    toDelete = [...area.selectedThumbIndices];
                }
                
                const preservedIndex = remapPreviewHistory(area, area.history.map((_, i) => i).filter(i => !toDelete.includes(i)));

                if (area.history.length === 0) {
                    area.resultUrl = '';
                    area.historyIndex = 0;
                    area.selectedThumbIndices = [];
                    if (Array.isArray(area.textHistory)) area.textContent = '';
                    area.textLoadState = 'idle';
                } else {
                    let newActiveIdx = preservedIndex;
                    if (newActiveIdx === -1) newActiveIdx = Math.max(0, area.history.length - 1);
                    area.historyIndex = newActiveIdx;
                    area.resultUrl = area.history[newActiveIdx];
                    area.selectedThumbIndices = [];
                    syncTextContentWithSelection(area);
                    void loadSelectedTextContent(area, { refresh: true });
                }
                applySurgicalUpdate(area);
            }
        }
    });

    container.querySelectorAll('.clab-history-thumb').forEach(thumb => {
        thumb.onclick = (e) => {
            e.stopPropagation();
            if (e.target.closest('.clab-thumb-delete')) return;
            
            const cardId = thumb.dataset.card;
            const areaId = thumb.dataset.area;
            const idx = parseInt(thumb.dataset.index, 10);
            const card = state.cards.find(c => c.id === cardId);
            const area = card?.areas.find(a => a.id === areaId);
            
            if (area && area.history) {
                if (!area.selectedThumbIndices) area.selectedThumbIndices = [];
                
                if (e.ctrlKey || e.metaKey) {
                    if (area.selectedThumbIndices.includes(idx)) {
                        area.selectedThumbIndices = area.selectedThumbIndices.filter(i => i !== idx);
                    } else {
                        area.selectedThumbIndices.push(idx);
                    }
                    area.lastClickedThumbIdx = idx;
                } else if (e.shiftKey && area.lastClickedThumbIdx !== undefined) {
                    const start = Math.min(area.lastClickedThumbIdx, idx);
                    const end = Math.max(area.lastClickedThumbIdx, idx);
                    const range = [];
                    for (let i = start; i <= end; i++) range.push(i);
                    area.selectedThumbIndices = Array.from(new Set([...area.selectedThumbIndices, ...range]));
                } else {
                    area.selectedThumbIndices = [idx];
                    area.lastClickedThumbIdx = idx;
                    selectOutputHistory(card, area, idx);
                    return;
                }
                applySurgicalUpdate(area);
            }
        };

        if (thumb.dataset.clabHistoryDragBound === '1') return;
        thumb.dataset.clabHistoryDragBound = '1';
        thumb.addEventListener('dragstart', (e) => {
            e.stopPropagation(); 
            if (e.target.closest('.clab-thumb-delete')) { e.preventDefault(); return; }

            const idx = parseInt(thumb.dataset.index, 10);
            const card = state.cards.find(c => c.id === thumb.dataset.card);
            const area = card?.areas.find(a => a.id === thumb.dataset.area);

            let dragIndices = [idx];
            if (area && area.selectedThumbIndices && area.selectedThumbIndices.includes(idx)) {
                dragIndices = [...area.selectedThumbIndices].sort((a,b) => a-b);
            }

            dragState.type = 'thumb';
            dragState.cardId = thumb.dataset.card;
            dragState.areaId = thumb.dataset.area;
            dragState.thumbIndices = dragIndices; 

            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', 'thumb');
            setTimeout(() => thumb.style.opacity = '0.5', 0);
        });

        thumb.addEventListener('dragend', (e) => {
            e.stopPropagation();
            thumb.style.opacity = '1';
            document.querySelectorAll('.clab-drag-over-thumb-left, .clab-drag-over-thumb-right').forEach(el => {
                el.classList.remove('clab-drag-over-thumb-left', 'clab-drag-over-thumb-right');
            });
            dragState.type = null; dragState.cardId = null; dragState.areaId = null; dragState.thumbIndices = null;
        });

        thumb.addEventListener('dragover', (e) => {
            const idx = parseInt(thumb.dataset.index, 10);
            if (dragState.type === 'thumb' && dragState.areaId === thumb.dataset.area && (!dragState.thumbIndices || !dragState.thumbIndices.includes(idx))) {
                e.preventDefault(); e.stopPropagation();
                const rect = thumb.getBoundingClientRect();
                const midX = rect.left + rect.width / 2;
                
                if (e.clientX < midX) {
                    thumb.classList.add('clab-drag-over-thumb-left');
                    thumb.classList.remove('clab-drag-over-thumb-right');
                    thumb.dataset.dropPosition = 'left';
                } else {
                    thumb.classList.add('clab-drag-over-thumb-right');
                    thumb.classList.remove('clab-drag-over-thumb-left');
                    thumb.dataset.dropPosition = 'right';
                }
            }
        });

        thumb.addEventListener('dragleave', (e) => {
            e.stopPropagation();
            if (!thumb.contains(e.relatedTarget)) {
                thumb.classList.remove('clab-drag-over-thumb-left', 'clab-drag-over-thumb-right');
                delete thumb.dataset.dropPosition;
            }
        });

        thumb.addEventListener('drop', (e) => {
            if (dragState.type === 'thumb') {
                e.preventDefault(); e.stopPropagation();
                const dropPos = thumb.dataset.dropPosition;
                thumb.classList.remove('clab-drag-over-thumb-left', 'clab-drag-over-thumb-right');
                delete thumb.dataset.dropPosition;

                const targetIdx = parseInt(thumb.dataset.index, 10);
                const draggedIndices = dragState.thumbIndices;
                
                if (!draggedIndices || draggedIndices.includes(targetIdx)) return;

                const card = state.cards.find(c => c.id === dragState.cardId);
                const area = card?.areas.find(a => a.id === dragState.areaId);
                
                if (area && area.history) {
                    const indices = area.history.map((_, i) => i).filter(i => !draggedIndices.includes(i));
                    let newTargetIdx = indices.indexOf(targetIdx);
                    if (dropPos === 'right') newTargetIdx++;
                    indices.splice(newTargetIdx, 0, ...draggedIndices);
                    const activeIndex = remapPreviewHistory(area, indices);
                    area.historyIndex = activeIndex >= 0 ? activeIndex : area.history.length - 1;
                    area.resultUrl = area.history[area.historyIndex] || '';
                    syncTextContentWithSelection(area);
                    void loadSelectedTextContent(area, { refresh: true });

                    area.selectedThumbIndices = [];
                    for(let i=0; i<draggedIndices.length; i++) {
                        area.selectedThumbIndices.push(newTargetIdx + i);
                    }
                    
                    applySurgicalUpdate(area);
                }
            }
        });
    });
}
