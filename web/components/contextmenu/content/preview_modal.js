/**
 * 文件名: preview_modal.js
 * 路径: web/components/contextmenu/content/preview_modal.js
 * 内容：预览弹窗（左中右布局、图片/音频/视频切换、键盘切换等）
 */
import { getSteppedHistoryIndex } from "../../modules/media_types/media_utils.js";
import { selectOutputHistory } from "../../modules/module_history.js";
import { state } from "../../ui_state.js";
import { previewModalStore } from "./state.js";
import { renderModelViewer, attachModelEvents, releaseModelViewer } from '../../modules/media_types/media_model.js';
import { collectPreviewRecords, sourceKey, parameterFields, displayValue, valueKey } from './preview_records.js';
import { renderVideoControls } from '../../modules/media_types/media_video.js';
import { injectMediaCSS } from '../../modules/module_media.js';
import { attachPreviewVideo } from './preview_video.js';
import { comparisonHTML, attachComparison, syncComparison } from './preview_compare.js';
import { renderTableSettings, buildTableModel, renderTable } from './preview_table.js';
import { exportPreviewHTML, exportPreviewPNGs, packagePreviewPNGs, downloadPreviewBlob } from './preview_export.js';
import { injectReviewStyles } from './preview_styles.js';
import { createDetailView, injectDetailStyles } from './preview_detail.js';
import { workspacePreviewSources, initialPreviewSources, sourceRecordCount, sortBrowseRecords, moveBrowseRecords, createBrowseLayout } from './preview_browse.js';
import {
    escapeHtml,
    normalizeHistoryUrl,
    clampValue,
    getSnapshotRows,
} from "./shared.js";

export function createPreviewModalApi({
    setupAudioWaveform,
    bindPreviewTextEditor,
    getPreviewTextState,
} = {}) {
    let sources = [], mode = 'browse', typeFilter = '', cleanupReview = null, tableModel, exporting = false;
    let compare = { a: '', b: '', slot: 'a', layout: 'side', view: { x: 0, y: 0, zoom: 1, split: .5 } };
    let table = { layout: 'xy', fields: null, width: 200, textLimit: 200, x: '', y: '', z: '', zValue: '', source: '', filters: {} };
    let allSources = [], browseLayout, detailView, renderedBrowseKey = '', renderedCompareKey = '', renderedMode = '';
    const browse = { search: '', sort: 'source', customOrder: [], height: 164, thumbSize: 120, sourceWidth: window.innerWidth < 1100 ? 180 : 220, parameterWidth: window.innerWidth < 1100 ? 240 : 300 };
    const safeSetupAudioWaveform = typeof setupAudioWaveform === "function" ? setupAudioWaveform : () => { };
    const safeBindPreviewTextEditor = typeof bindPreviewTextEditor === "function" ? bindPreviewTextEditor : () => { };
    const safeGetPreviewTextState = typeof getPreviewTextState === "function"
        ? getPreviewTextState
        : (_cacheKey, fallbackText = "") => ({
            text: String(fallbackText ?? ""),
            syntaxHighlight: false,
            previewMarkdown: false,
            dirty: false,
        });

    function getActivePreviewEntry() {
        if (!Array.isArray(previewModalStore.entries) || previewModalStore.entries.length === 0) return null;
        if (previewModalStore.activeIndex < 0 || previewModalStore.activeIndex >= previewModalStore.entries.length) return null;
        return previewModalStore.entries[previewModalStore.activeIndex] || null;
    }

    function isEditableTarget(target) {
        if (!target) return false;
        const el = target instanceof Element ? target : null;
        if (!el) return false;
        if (el.closest("input, textarea, select, [contenteditable='true']")) return true;
        if (el.classList?.contains("clab-preview-modal-text-editor-input")) return true;
        return false;
    }

    function resetPreviewImageTransform() {
        previewModalStore.imageZoom = 1;
        previewModalStore.imagePanX = 0;
        previewModalStore.imagePanY = 0;
        previewModalStore.imageDragging = false;
    }

    function syncPreviewImageCursor(root) {
        const stage = root.querySelector(".clab-preview-modal-image-stage");
        if (!stage) return;
        stage.classList.toggle("hand-ready", previewModalStore.imageSpacePressed || previewModalStore.imageDragging);
        stage.classList.toggle("dragging", previewModalStore.imageDragging);
    }

    function teardownPreviewEnhancers() {
        renderedBrowseKey='';renderedCompareKey='';renderedMode='';
        cleanupReview?.(); cleanupReview = null;
        detailView?.release();
        previewModalStore.root?.querySelectorAll('.clab-preview-modal-center video, .clab-preview-modal-center audio').forEach(media => { media.pause(); media.removeAttribute('src'); media.load(); });
        previewModalStore.activeModelCleanup?.();
        previewModalStore.activeModelCleanup = null;
        if (typeof previewModalStore.activeAudioCleanup === "function") {
            try { previewModalStore.activeAudioCleanup(); } catch (_) { }
        }
        previewModalStore.activeAudioCleanup = null;
        if (typeof previewModalStore.activeTextCleanup === "function") {
            try { previewModalStore.activeTextCleanup(); } catch (_) { }
        }
        previewModalStore.activeTextCleanup = null;
        previewModalStore.imageDragging = false;
    }

    function selectPreviewEntry(index, linked = true) {
        const entry = previewModalStore.entries[index];
        if (!entry) return;
        const card = state.cards.find(item => item.id === entry.cardId);
        const area = card?.areas.find(item => item.id === entry.areaId);
        if (area && entry.index >= 0) {
            const matchesEntry = (url, i) => normalizeHistoryUrl(url) === normalizeHistoryUrl(entry.url)
                && (area.historyRuns?.[i]?.id || '') === entry.runId;
            const recordIndex = matchesEntry(area.history[entry.index], entry.index) ? entry.index : area.history.findIndex(matchesEntry);
            if (recordIndex < 0) return;
            selectOutputHistory(card, area, recordIndex, { linked });
            previewModalStore.entries = collectPreviewRecords(sources);
            previewModalStore.activeIndex = previewModalStore.entries.findIndex(item => item.key === entry.key);
        } else {
            previewModalStore.activeIndex = index;
        }
        previewModalStore.activeCardId = entry.cardId;
        previewModalStore.activeAreaId = entry.areaId;
        resetPreviewImageTransform();
        renderPreviewModal();
    }

    function switchPreviewEntry(step, linked = true) {
        const card = state.cards.find(item => item.id === previewModalStore.activeCardId);
        const area = card?.areas.find(item => item.id === previewModalStore.activeAreaId);
        const localIndex = area?.missingHistoryRun && previewModalStore.activeIndex < 0 ? getSteppedHistoryIndex(area, step) : -1;
        const candidates=filteredEntries().filter(entry=>linked||entry.areaId===area?.id&&entry.cardId===card?.id);
        const current=candidates.findIndex(entry=>entry.key===getActivePreviewEntry()?.key);
        const next=candidates[Math.max(0,Math.min(candidates.length-1,current+step))];
        const index = localIndex >= 0 ? previewModalStore.entries.findIndex(entry => entry.areaId === area.id && entry.cardId === card.id && entry.index === localIndex)
            : next?previewModalStore.entries.findIndex(entry=>entry.key===next.key):-1;
        if (index >= 0 && index !== previewModalStore.activeIndex) selectPreviewEntry(index, linked);
    }

    function applyPreviewImageTransform(root) {
        const image = root.querySelector(".clab-preview-modal-main-image");
        if (!image) {
            syncPreviewImageCursor(root);
            return;
        }
        image.style.transform = `translate(${previewModalStore.imagePanX}px, ${previewModalStore.imagePanY}px) scale(${previewModalStore.imageZoom})`;
        syncPreviewImageCursor(root);
    }

    function ensurePreviewModal() {
        if (previewModalStore.root && document.body.contains(previewModalStore.root)) {
            return previewModalStore.root;
        }

        const root = document.createElement("div");
        injectMediaCSS();
        injectReviewStyles();
        injectDetailStyles();
        root.className = "clab-preview-modal";
        root.innerHTML = `
            <div class="clab-preview-modal-backdrop"></div>
            <div class="clab-preview-modal-panel">
                <div class="clab-preview-modal-head">
                    <div class="clab-preview-modal-title">预览模式</div>
                    <div class="clab-review-modes clab-review-segment">${[['browse','浏览'],['compare','比较'],['detail','明细表'],['xy','XY 矩阵']].map(([key,label])=>`<button data-review-mode="${key}" aria-pressed="${key==='browse'}">${label}</button>`).join('')}</div>
                    <div class="clab-review-head-actions">
                    <button class="clab-preview-modal-close" type="button">关闭</button></div>
                </div>
                <div class="clab-review-notice" role="status"></div>
                <div class="clab-preview-modal-body">
                    <div class="clab-preview-modal-left"></div>
                    <div class="clab-preview-modal-center"></div>
                    <div class="clab-preview-modal-right"></div>
                </div>
                <div class="clab-browse-footer" hidden></div>
            </div>
        `;
        document.body.appendChild(root);
        previewModalStore.root = root;
        browseLayout=createBrowseLayout(root,browse,(keys,beforeKey)=>{
            const visible=filteredEntries().map(entry=>entry.key);
            const reordered=moveBrowseRecords(visible,keys,beforeKey);
            if(reordered===visible)return;
            const hidden=browse.customOrder.filter(key=>!visible.includes(key));
            browse.customOrder=[...reordered,...hidden];browse.sort='custom';renderPreviewModal();
        });

        detailView = createDetailView(root);

        const close = () => {
            root.classList.remove("visible");
            teardownPreviewEnhancers();
            browseLayout.release();
            previewModalStore.imageSpacePressed = false;
            resetPreviewImageTransform();
            sources=[];allSources=[];previewModalStore.entries=[];tableModel=null;
        };
        root.querySelector(".clab-preview-modal-backdrop").addEventListener("click", close);
        root.querySelector(".clab-preview-modal-close").addEventListener("click", close);
        root.addEventListener("click", (event) => {
            if((mode!=='detail'||event.target.closest('[data-browse-restore]'))&&browseLayout.handleClick(event))return;
            const sourceSelect=event.target.closest('[data-browse-select]');
            if(sourceSelect){setBrowseSources(sourceSelect.dataset.browseSelect==='all'?allSources.filter(source=>sourceRecordCount(source.area)):[]);return;}
            const modeButton = event.target.closest('button[data-review-mode]');
            if (modeButton) {
                mode = modeButton.dataset.reviewMode;
                if(mode==='compare'&&!['','image','video'].includes(typeFilter))typeFilter='';
                renderPreviewModal();return;
            }
            const exportButton = event.target.closest('[data-review-export]');
            if (exportButton) { void exportTable(exportButton.dataset.reviewExport); return; }
            const layout = event.target.closest('[data-compare-layout]');
            if (layout) { compare.layout = layout.dataset.compareLayout; renderPreviewModal(); return; }
            const slot = event.target.closest('[data-compare-slot]');
            if (slot) { compare.slot = slot.dataset.compareSlot; renderPreviewModal(); return; }
            if (event.target.closest('[data-compare-swap]')) { [compare.a,compare.b]=[compare.b,compare.a]; renderPreviewModal(); return; }
            const view=event.target.closest('[data-view-record]');
            if(view) { previewModalStore.activeIndex=previewModalStore.entries.findIndex(entry=>entry.key===view.dataset.viewRecord);mode='browse';renderPreviewModal();return; }
            if(event.target.closest('input[type=checkbox]'))return;
            const thumb = event.target.closest(".clab-preview-modal-thumb");
            if (!thumb) return;
            const nextIndex = Number(thumb.dataset.index);
            if (!Number.isFinite(nextIndex) || nextIndex < 0 || nextIndex >= previewModalStore.entries.length) return;
            if(mode==='compare') {
                const entry=previewModalStore.entries[nextIndex];
                if(!['image','video'].includes(entry.type))return;
                compare[compare.slot]=entry.key;compare.slot=compare.slot==='a'?'b':'a';previewModalStore.activeIndex=nextIndex;renderPreviewModal();
            } else selectPreviewEntry(nextIndex);
        });
        root.addEventListener('change',event=>{
            const target=event.target;
            if(target.matches('[data-browse-source]')){
                const selected=new Set(sources.map(source=>sourceKey(source.card,source.area)));
                target.checked?selected.add(target.dataset.browseSource):selected.delete(target.dataset.browseSource);
                setBrowseSources(allSources.filter(source=>selected.has(sourceKey(source.card,source.area))));return;
            }
            if(target.matches('[data-browse-card-check]')){
                const selected=new Set(sources.map(source=>sourceKey(source.card,source.area)));
                allSources.filter(source=>source.card.id===target.dataset.browseCardCheck&&sourceRecordCount(source.area)).forEach(source=>target.checked?selected.add(sourceKey(source.card,source.area)):selected.delete(sourceKey(source.card,source.area)));
                setBrowseSources(allSources.filter(source=>selected.has(sourceKey(source.card,source.area))));return;
            }
            if(target.matches('[data-browse-sort]')){
                if(target.value==='custom'&&!browse.customOrder.length)browse.customOrder=filteredEntries().map(entry=>entry.key);
                browse.sort=target.value;renderPreviewModal();return;
            }
            if(target.matches('[data-review-type]')) typeFilter=target.value;
            else if(target.matches('[data-table-option]')) {
                const key=target.dataset.tableOption;
                table[key]=key==='width'?Math.max(80,Math.min(640,Number(target.value)||200)):key==='textLimit'?Math.max(20,Math.min(2000,Number(target.value)||200)):target.value;
                if(['x','y','z'].includes(key))delete table.filters[target.value];
            }
            else if(target.matches('[data-table-filter]'))table.filters[target.dataset.tableFilter]=target.value;
            else return;
            renderPreviewModal();
        });
        root.addEventListener('input',event=>{
            const target=event.target;
            if(target.matches('[data-browse-search]')){browse.search=target.value;browseLayout.renderSources(state.cards,allSources,sources);}
            if(target.matches('[data-browse-size]')){
                browse.thumbSize=Number(target.value);browse.height=Math.max(browse.height,browse.thumbSize*.6+86);browseLayout.applyLayout();
            }
        });

        const centerEl = root.querySelector(".clab-preview-modal-center");
        const dropStage = event => mode==='compare' ? event.target.closest('.clab-compare-stage') : null;
        centerEl.addEventListener('dragover',event=>{
            const stage=dropStage(event);
            if(!stage||!Array.from(event.dataTransfer.types).includes('application/x-clab-preview-record'))return;
            event.preventDefault();event.dataTransfer.dropEffect='copy';
            const rect=stage.getBoundingClientRect(),label=event.target.closest('[data-compare-slot]');
            stage.dataset.dropSlot=label?.dataset.compareSlot||((event.clientX-rect.left)/rect.width<(compare.layout==='split'?compare.view.split:.5)?'a':'b');
        });
        centerEl.addEventListener('dragleave',event=>{
            const stage=dropStage(event);
            if(stage&&!stage.contains(event.relatedTarget))delete stage.dataset.dropSlot;
        });
        centerEl.addEventListener('drop',event=>{
            const stage=dropStage(event),slot=stage?.dataset.dropSlot;
            if(!slot)return;
            event.preventDefault();delete stage.dataset.dropSlot;
            const key=event.dataTransfer.getData('application/x-clab-preview-record');
            const index=previewModalStore.entries.findIndex(entry=>entry.key===key&&['image','video'].includes(entry.type));
            if(index<0)return;
            compare[slot]=key;compare.slot=slot==='a'?'b':'a';previewModalStore.activeIndex=index;renderPreviewModal();
        });
        root.addEventListener('dragend',()=>{const stage=centerEl.querySelector('.clab-compare-stage');if(stage)delete stage.dataset.dropSlot;});
        centerEl.addEventListener("wheel", (event) => {
            if (!root.classList.contains("visible") || mode!=='browse') return;
            const active = getActivePreviewEntry();
            if (!active || active.type !== "image") return;
            event.preventDefault();
            const factor = event.deltaY < 0 ? 1.12 : 0.9;
            previewModalStore.imageZoom = clampValue(previewModalStore.imageZoom * factor, 0.2, 6);
            applyPreviewImageTransform(root);
        }, { passive: false });

        centerEl.addEventListener("mousedown", (event) => {
            if (!root.classList.contains("visible") || mode!=='browse') return;
            const active = getActivePreviewEntry();
            if (!active || active.type !== "image") return;

            const middleButton = event.button === 1;
            const spaceDrag = event.button === 0 && previewModalStore.imageSpacePressed;
            if (!middleButton && !spaceDrag) return;

            event.preventDefault();
            event.stopPropagation();

            previewModalStore.imageDragging = true;
            previewModalStore.imageDragStartX = event.clientX;
            previewModalStore.imageDragStartY = event.clientY;
            previewModalStore.imageDragOriginX = previewModalStore.imagePanX;
            previewModalStore.imageDragOriginY = previewModalStore.imagePanY;
            applyPreviewImageTransform(root);
        });

        centerEl.addEventListener("auxclick", (event) => {
            if (!root.classList.contains("visible") || mode!=='browse') return;
            if (event.button !== 1) return;
            const active = getActivePreviewEntry();
            if (!active || active.type !== "image") return;
            event.preventDefault();
        });

        const stopImageDrag = () => {
            if (!previewModalStore.imageDragging) return;
            previewModalStore.imageDragging = false;
            applyPreviewImageTransform(root);
        };

        window.addEventListener("mousemove", (event) => {
            if (!root.classList.contains("visible")) return;
            if (!previewModalStore.imageDragging) return;
            const deltaX = event.clientX - previewModalStore.imageDragStartX;
            const deltaY = event.clientY - previewModalStore.imageDragStartY;
            previewModalStore.imagePanX = previewModalStore.imageDragOriginX + deltaX;
            previewModalStore.imagePanY = previewModalStore.imageDragOriginY + deltaY;
            applyPreviewImageTransform(root);
        });

        window.addEventListener("mouseup", stopImageDrag);
        window.addEventListener("blur", stopImageDrag);

        document.addEventListener("keydown", (event) => {
            if (!root.classList.contains("visible")) return;
            const active = getActivePreviewEntry();
            const typing = isEditableTarget(event.target) || isEditableTarget(document.activeElement);

            if ((event.key === " " || event.key === "Spacebar") && mode === 'browse' && active?.type === "image" && !typing) {
                event.preventDefault();
                previewModalStore.imageSpacePressed = true;
                applyPreviewImageTransform(root);
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                close();
                return;
            }
            if(mode!=='browse')return;

            if ((event.ctrlKey || event.metaKey) && String(event.key || "").toLowerCase() === "s" && active?.type === "text") {
                event.preventDefault();
                const saveBtn = root.querySelector(".clab-preview-modal-text-save");
                if (saveBtn && !saveBtn.disabled) {
                    saveBtn.click();
                }
                return;
            }

            if (typing || event.ctrlKey || event.metaKey || event.altKey || event.isComposing) return;

            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                switchPreviewEntry(-1, !event.shiftKey);
                return;
            }
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                switchPreviewEntry(1, !event.shiftKey);
            }
        });

        document.addEventListener("keyup", (event) => {
            if (!root.classList.contains("visible")) return;
            if (event.key !== " " && event.key !== "Spacebar") return;
            if (!previewModalStore.imageSpacePressed) return;
            previewModalStore.imageSpacePressed = false;
            applyPreviewImageTransform(root);
        });

        return root;
    }

    function renderPreviewCenter(entry) {
        if (!entry) return `<div class="clab-preview-modal-empty">No preview resource</div>`;
        if (entry.type === 'missing') return `<div class="clab-preview-modal-empty">该次运行无可用记录</div>`;

        const safeUrl = escapeHtml(entry.url || "");
        const safeName = escapeHtml(entry.name || "");
        if (entry.type === "image") {
            return `
                <div class="clab-preview-modal-image-stage">
                    <img class="clab-preview-modal-main-image" src="${safeUrl}" alt="${safeName}" />
                </div>
            `;
        }
        if (entry.type === "video") {
            return `<div class="clab-preview-video clab-video-player clab-video-paused"><div class="clab-preview-video-transform"><video class="clab-preview-modal-main-video" src="${safeUrl}" preload="metadata" muted playsinline></video></div>${renderVideoControls()}<div class="clab-preview-video-status" role="status"></div></div>`;
        }
        if (entry.type === 'model') return renderModelViewer(entry.url);
        if (entry.type === "audio") {
            return `
                <div class="clab-preview-modal-audio-wrap">
                    <div class="clab-preview-modal-audio-wave-wrap">
                        <canvas class="clab-preview-modal-audio-wave"></canvas>
                    </div>
                    <div class="clab-preview-modal-audio-name">${safeName || "Audio"}</div>
                    <audio class="clab-preview-modal-main-audio" src="${safeUrl}" controls></audio>
                </div>
            `;
        }
        if (entry.type === "text") {
            const cacheKey = normalizeHistoryUrl(entry.url || "");
            const cached = previewModalStore.textCache.get(cacheKey);
            if (!cached || cached.state === "loading") {
                if (!cached) {
                    previewModalStore.textCache.set(cacheKey, { state: "loading", text: "" });
                    fetch(entry.url, { cache: "no-store" })
                        .then((response) => response.ok ? response.text() : Promise.reject(new Error(`HTTP ${response.status}`)))
                        .then((text) => {
                            previewModalStore.textCache.set(cacheKey, { state: "ready", text });
                            renderPreviewModal();
                        })
                        .catch((error) => {
                            previewModalStore.textCache.set(cacheKey, { state: "error", text: String(error?.message || error || "load failed") });
                            renderPreviewModal();
                        });
                }
                return `<div class="clab-preview-modal-loading">文本加载中...</div>`;
            }
            if (cached.state === "error") {
                return `<div class="clab-preview-modal-error">文本加载失败: ${escapeHtml(cached.text || "未知错误")}</div>`;
            }

            const editorState = safeGetPreviewTextState(cacheKey, cached.text || "");
            const textValue = String(editorState.text ?? "");
            const body = `
                <div class="clab-preview-modal-text-editor-host clab-preview-modal-text-editor-code-host hidden"></div>
                <div class="clab-preview-modal-text-editor-host clab-preview-modal-text-editor-markdown-host hidden"></div>
                <textarea class="clab-preview-modal-text-editor-input" spellcheck="false">${escapeHtml(textValue)}</textarea>
            `;

            return `
                <div class="clab-preview-modal-text-editor" data-cache-key="${escapeHtml(cacheKey)}">
                    <div class="clab-preview-modal-text-toolbar">
                        <label class="clab-preview-modal-text-option">
                            <input type="checkbox" class="clab-preview-modal-text-opt-syntax" ${editorState.syntaxHighlight ? "checked" : ""}>
                            <span>语法高亮</span>
                        </label>
                        <label class="clab-preview-modal-text-option">
                            <input type="checkbox" class="clab-preview-modal-text-opt-markdown" ${editorState.previewMarkdown ? "checked" : ""}>
                            <span>预览Markdown</span>
                        </label>
                        <button type="button" class="clab-preview-modal-text-copy">复制</button>
                        <button type="button" class="clab-preview-modal-text-save" ${editorState.dirty ? "" : "disabled"}>保存</button>
                    </div>
                    <div class="clab-preview-modal-text-body">${body}</div>
                </div>
            `;
        }
        return `
            <div class="clab-preview-modal-file-wrap">
                <div class="clab-preview-modal-file-name">${safeName || "File"}</div>
                <a class="clab-preview-modal-file-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open resource link</a>
            </div>
        `;
    }

    function filteredEntries() {
        const records=previewModalStore.entries.filter(entry => (!typeFilter || entry.type===typeFilter)
            && (mode!=='compare' || ['image','video'].includes(entry.type)));
        return sortBrowseRecords(records,browse.sort,browse.customOrder);
    }

    function setBrowseSources(nextSources) {
        const activeKey=getActivePreviewEntry()?.key;
        sources=nextSources;previewModalStore.entries=collectPreviewRecords(sources);
        previewModalStore.activeIndex=previewModalStore.entries.findIndex(entry=>entry.key===activeKey);
        if(previewModalStore.activeIndex<0)previewModalStore.activeIndex=previewModalStore.entries.length?0:-1;
        renderPreviewModal();
    }

    function renderCompareParameters(right,a,b) {
        const fields=parameterFields([a,b].filter(Boolean));
        right.innerHTML=`<div class="clab-review-section">A/B 参数对照</div>${fields.length?`<table class="clab-compare-parameters"><thead><tr><th>参数</th><th>A</th><th>B</th></tr></thead><tbody>${fields.map(field=>{
            const av=a?.parameters.get(field.key),bv=b?.parameters.get(field.key),different=valueKey(av?.value)!==valueKey(bv?.value);
            return `<tr class="${different?'different':''}"><th>${escapeHtml(field.label)}</th><td>${escapeHtml(displayValue(av?.value))}</td><td>${escapeHtml(displayValue(bv?.value))}</td></tr>`;
        }).join('')}</tbody></table>`:'<p class="clab-review-note">所选记录没有参数快照。</p>'}<p class="clab-review-note">不同参数以深色背景突出。选择 A/B 不改变卡片当前历史和输入值。</p>`;
    }

    async function exportTable(kind) {
        if(exporting||!tableModel?.rows.length)return;
        exporting=true;
        const model=tableModel,config={...table},root=ensurePreviewModal(),notice=root.querySelector('.clab-review-notice');
        root.querySelectorAll('[data-review-export]').forEach(button=>button.disabled=true);
        notice.textContent='正在整理资源并导出…';
        try {
            if(kind==='html')downloadPreviewBlob(await exportPreviewHTML(model,config),'XY矩阵-HTML.zip');
            else {
                const {files,failed}=await exportPreviewPNGs(model,config),packaged=await packagePreviewPNGs(files,'XY矩阵-分页图片.zip');
                downloadPreviewBlob(packaged.blob,packaged.name);
                if(failed.length){notice.textContent=`已导出；${failed.length} 个媒体预览不可用，图片中已标注。`;return;}
            }
            notice.textContent='导出完成。';
        } catch(error) { notice.textContent=`导出失败：${error.message}`; }
        finally { exporting=false;root.querySelectorAll('[data-review-export]').forEach(button=>button.disabled=false); }
    }

    function renderPreviewModal() {
        const root=ensurePreviewModal(),left=root.querySelector('.clab-preview-modal-left'),center=root.querySelector('.clab-preview-modal-center'),right=root.querySelector('.clab-preview-modal-right');
        const entries=previewModalStore.entries;
        root.dataset.reviewMode=mode;
        root.dataset.reviewLayout='workspace';
        root.querySelectorAll('[data-review-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.reviewMode===mode)));
        root.querySelectorAll('[data-review-export]').forEach(button=>button.disabled=exporting);
        root.querySelector('.clab-browse-footer').hidden=!['browse','compare'].includes(mode);
        if(mode!=='detail') {
            browseLayout.renderSources(state.cards,allSources,sources);
            const visible=filteredEntries(),active=getActivePreviewEntry();
            if(active&&!visible.some(entry=>entry.key===active.key))previewModalStore.activeIndex=visible.length?entries.findIndex(entry=>entry.key===visible[0].key):-1;
            else if(previewModalStore.activeIndex<0&&visible.length&&!state.cards.find(card=>card.id===previewModalStore.activeCardId)?.areas.find(area=>area.id===previewModalStore.activeAreaId)?.missingHistoryRun)previewModalStore.activeIndex=entries.findIndex(entry=>entry.key===visible[0].key);
            if(mode!=='xy')browseLayout.renderFilmstrip(visible,entries,previewModalStore.activeIndex,typeFilter,mode==='compare'?compare:null);
            else browseLayout.release();
        } else browseLayout.release();
        browseLayout.applyLayout();
        if(previewModalStore.activeIndex>=entries.length)previewModalStore.activeIndex=entries.length?0:-1;
        const active=getActivePreviewEntry()||{type:'missing',name:'该次运行无可用记录',index:-1};
        root.querySelector('.clab-preview-modal-title').textContent=mode==='browse'?`预览模式 · ${active.areaLabel||''}`:mode==='compare'?'A/B 比较':mode==='detail'?'明细表':'XY 矩阵';
        if(mode==='compare') {
            const a=entries.find(entry=>entry.key===compare.a),b=entries.find(entry=>entry.key===compare.b);
            const key=JSON.stringify([a?.key,a?.url,b?.key,b?.url]);
            if(renderedMode!=='compare'||renderedCompareKey!==key) {
                teardownPreviewEnhancers();center.innerHTML=comparisonHTML(a,b,compare);cleanupReview=attachComparison(center,compare);
                renderedCompareKey=key;renderedMode='compare';
            }
            syncComparison(center,compare);renderCompareParameters(right,a,b);return;
        }
        if(mode==='detail') {
            if(renderedMode!=='detail'){teardownPreviewEnhancers();renderedMode='detail';}
            detailView.render(state.cards);return;
        }
        if(mode==='xy') {
            teardownPreviewEnhancers();
            const records=entries;
            for(const record of records.filter(item=>item.type==='text'&&!item.text)) {
                const cached=previewModalStore.textCache.get(record.url);
                if(cached) { if(cached.state==='ready')record.text=cached.text;continue; }
                previewModalStore.textCache.set(record.url,{state:'loading',text:''});
                fetch(record.url).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.text();}).then(text=>{
                    record.text=text;previewModalStore.textCache.set(record.url,{state:'ready',text});
                    if(root.classList.contains('visible')&&mode==='xy')renderPreviewModal();
                }).catch(error=>{previewModalStore.textCache.set(record.url,{state:'error',text:error.message});record.text=`文本读取失败：${error.message}`;if(root.classList.contains('visible')&&mode==='xy')renderPreviewModal();});
            }
            right.innerHTML=renderTableSettings(records,sources,table);
            tableModel=buildTableModel(records,sources,table,entries);center.innerHTML=renderTable(tableModel,table);return;
        }
        const browseKey=JSON.stringify([active.key||'',active.url||'',active.type,active.type==='text'?previewModalStore.textCache.get(normalizeHistoryUrl(active.url))?.state:'',active.type==='missing'?`${typeFilter}:${sources.length}`:'']);
        if(renderedMode!=='browse'||renderedBrowseKey!==browseKey) {
            teardownPreviewEnhancers();
            if(active.cardId){previewModalStore.activeCardId=active.cardId;previewModalStore.activeAreaId=active.areaId;}
            center.innerHTML=active.type==='missing'&&!sources.length?'<div class="clab-preview-modal-empty">请在左侧勾选要查看的输出模块</div>':active.type==='missing'&&typeFilter?'<div class="clab-preview-modal-empty">没有符合筛选条件的媒体</div>':renderPreviewCenter(active);
            if(active.type==='image')applyPreviewImageTransform(root);
            else {resetPreviewImageTransform();applyPreviewImageTransform(root);}
            if(active.type==='video') {
                const player = center.querySelector('.clab-preview-video');
                cleanupReview = attachPreviewVideo(player, { status: player.querySelector('.clab-preview-video-status') });
            }
            if(active.type==='audio')safeSetupAudioWaveform(center,active);
            if(active.type==='text')safeBindPreviewTextEditor(center,active);
            if(active.type==='model') {
                attachModelEvents(center);const stage=center.querySelector('.clab-glb-viewer');previewModalStore.activeModelCleanup=()=>releaseModelViewer(stage);
            }
            renderedMode='browse';renderedBrowseKey=browseKey;
        }
        const rows=getSnapshotRows(active.snapshot);
        right.innerHTML=rows.length?rows.map(row=>`<div class="clab-preview-modal-param"><div class="clab-preview-modal-param-key">${escapeHtml(row.key)}</div><div class="clab-preview-modal-param-meta">Node: ${escapeHtml(row.node||'-')} | Type: ${escapeHtml(row.type||'string')}</div><pre class="clab-preview-modal-param-value">${escapeHtml(row.value||'')}</pre></div>`).join(''):'<div class="clab-preview-modal-empty">此记录没有保存输入参数快照</div>';
    }

    function openPreviewModal(card, area, preferredUrl, preferredIndex, selectedSources) {
        const root = ensurePreviewModal();
        teardownPreviewEnhancers();
        previewModalStore.activeCardId = card?.id || "";
        previewModalStore.activeAreaId = area?.id || "";
        allSources=workspacePreviewSources(state.cards);
        sources=initialPreviewSources(state.cards,selectedSources||(area?[{card,area}]:[]),state.selectedCardIds,card?.id);
        browse.search='';
        previewModalStore.entries=collectPreviewRecords(sources);
        typeFilter='';mode='browse';
        detailView.open(state.cards);
        compare={a:'',b:'',slot:'a',layout:'side',view:{x:0,y:0,zoom:1,split:.5}};
        table={layout:'detail',fields:null,width:200,textLimit:200,x:'',y:'',z:'',zValue:'',source:'',filters:{}};
        previewModalStore.activeIndex = area?.missingHistoryRun ? -1 : previewModalStore.entries.findIndex(entry=>entry.cardId===card?.id && entry.areaId===area?.id && entry.index===(Number.isInteger(preferredIndex)?preferredIndex:area?.historyIndex));
        previewModalStore.imageSpacePressed = false;
        resetPreviewImageTransform();

        if (previewModalStore.entries.length > 0) {
            if (Number.isFinite(preferredIndex) && preferredIndex >= 0 && preferredIndex < previewModalStore.entries.length) {
                previewModalStore.activeIndex = previewModalStore.entries.findIndex(entry=>entry.cardId===card.id && entry.areaId===area.id && entry.index===preferredIndex);
            } else if (preferredUrl) {
                const normalized = normalizeHistoryUrl(preferredUrl);
                const found = previewModalStore.entries.findIndex((entry) => entry.areaId===area.id && entry.cardId===card.id && normalizeHistoryUrl(entry.url) === normalized);
                if (found >= 0) previewModalStore.activeIndex = found;
            }
        }

        root.querySelector('.clab-review-notice').textContent='';
        if(previewModalStore.activeIndex<0&&!area?.missingHistoryRun)previewModalStore.activeIndex=previewModalStore.entries.length?0:-1;
        renderPreviewModal();
        root.classList.add("visible");
        browseLayout.applyLayout();
    }

    return {
        openPreviewModal,
        renderPreviewModal,
    };
}

