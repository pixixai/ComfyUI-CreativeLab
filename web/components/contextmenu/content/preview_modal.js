/**
 * 文件名: preview_modal.js
 * 路径: web/components/contextmenu/content/preview_modal.js
 * 内容：预览弹窗（左中右布局、图片/音频/视频切换、键盘切换等）
 */
import { getSteppedHistoryIndex } from "../../modules/media_types/media_utils.js";
import { selectOutputHistory } from "../../modules/module_history.js";
import { getActiveWorkspace, state, saveAndRender } from "../../ui_state.js";
import { renderWorkspaceBar, attachWorkspaceEvents, switchWorkspace } from "../../comp_workspace.js";
import { attachWorkspaceModeMenu } from '../../workspace_modes/workspace_mode_menu.js';
import { setWorkspaceMode } from '../../workspace_modes/workspace_modes.js';
import { previewModalStore } from "./state.js";
import { renderModelViewer, attachModelEvents, releaseModelViewer } from '../../modules/media_types/media_model.js';
import { collectPreviewRecords, sourceKey, parameterFields, displayValue, valueKey } from './preview_records.js';
import { renderVideoControls } from '../../modules/media_types/media_video.js';
import { injectMediaCSS } from '../../modules/module_media.js';
import { attachPreviewVideo } from './preview_video.js';
import { attachPreviewPan } from './preview_pan.js';
import { comparisonHTML, attachComparison, syncComparison } from './preview_compare.js';
import { renderTableSettings, buildTableModel, renderTable } from './preview_table.js';
import { exportPreviewHTML, downloadPreviewBlob } from './preview_export.js';
import { capturePreviewLayout, renderLayoutPNG, exportPreviewLayoutHTML } from './preview_layout_export.js';
import { exportParameterWorkbook } from './preview_xlsx.js';
import { createPreviewDataExport } from './preview_data_export.js';
import { reorderSourceHistories } from './preview_history_order.js';
import { createPreviewDownloads, filmstripDownloadRecords } from './preview_downloads.js';
import { workspaceMatrixAvailable, xySourceSetting } from './preview_workspace_sheets.js';
import { createPreviewParameterGrid } from './preview_parameter_grid.js';
import { createPreviewXYGrid } from './preview_xy_grid.js';
import { injectReviewStyles } from './preview_styles.js';
import { createDetailView, injectDetailStyles } from './preview_detail.js';
import { workspacePreviewSources, initialPreviewSources, sourceRecordCount, sourceBrowseGroups, snapshotBrowseGroups, moveBrowseGroupRecords, browseGroupCover, createBrowseLayout } from './preview_browse.js';
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
    let historyMatrix, matrixPreview, parameterGrid, xyGrid, renderedGrid = '';
    let allSources = [], browseLayout, detailView, renderedBrowseKey = '', renderedCompareKey = '', renderedMode = '';
    let returnFocus,downloads,dataExport,previewWorkspaceId='';
    const refreshSidebarExports=()=>{downloads.refresh();dataExport.refresh();};
    const selectedHistoryRecords = new Set();
    const sheetScales = {table:3,xy:3};
    const filmstripSessions = new Map();
    const browse = { search: '', sort: 'source', session:null, thumbColumns: 2, sourceWidth: window.innerWidth < 1100 ? 280 : 320, parameterWidth: window.innerWidth < 1100 ? 240 : 300 };
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

    function commitHistoryOrder(groups,source='') {
        const active=getActivePreviewEntry()?.key;
        const covers=new Map(groups.map(group=>[group.id,browseGroupCover(group,browse.session.covers)?.key]));
        const {changed,keys}=reorderSourceHistories(source?allSources.filter(item=>sourceKey(item.card,item.area)===source):allSources,groups);
        const remap=key=>keys.get(key)||key;
        browse.session.customGroups=snapshotBrowseGroups(groups).map(group=>({...group,keys:group.keys.map(remap)}));
        browse.sort='custom';
        const pinned=new Map([...browse.session.covers].map(([id,key])=>[id,remap(key)]));
        browse.session.covers=pinned;
        const after=sourceBrowseGroups(collectPreviewRecords(allSources),'custom',browse.session.customGroups);
        for(const group of after) {
            const previous=covers.get(group.id);
            if(previous&&browseGroupCover(group,pinned)?.key!==remap(previous))pinned.set(group.id,remap(previous));
        }
        for(const [id,key] of browse.session.positions)browse.session.positions.set(id,remap(key));
        compare.a=remap(compare.a);compare.b=remap(compare.b);
        const selected=[...selectedHistoryRecords].map(remap);selectedHistoryRecords.clear();selected.forEach(key=>selectedHistoryRecords.add(key));
        const selectedSources=new Set(sources.map(source=>sourceKey(source.card,source.area)));
        allSources=workspacePreviewSources(state.cards);sources=allSources.filter(source=>selectedSources.has(sourceKey(source.card,source.area)));
        previewModalStore.entries=collectPreviewRecords(sources);
        previewModalStore.activeIndex=previewModalStore.entries.findIndex(record=>record.key===remap(active));
        if(changed.length) {
            if(window._clabSurgicallyUpdateArea)changed.forEach(id=>window._clabSurgicallyUpdateArea(id));
            else saveAndRender();
            window._clabJustSave?.();
        }
        renderPreviewModal();
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
    }

    function teardownPreviewEnhancers() {
        renderedBrowseKey='';renderedCompareKey='';renderedMode='';
        if (renderedGrid === 'table') parameterGrid.release();
        if (renderedGrid === 'xy') xyGrid.release();
        renderedGrid = '';
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

    function switchPreviewGroup(step, linked) {
        const groups = filteredGroups(), key = getActivePreviewEntry()?.key;
        const current = groups.findIndex(group => group.records.some(entry => entry.key === key));
        openFilmstripGroup(groups[current < 0 ? 0 : current + step], linked);
    }

    function openFilmstripGroup(group, linked = true) {
        if (!group) return;
        const entry = group.records.find(record=>record.key===browse.session.positions.get(group.id)) ||
            browseGroupCover(group,browse.session.covers);
        const index = previewModalStore.entries.findIndex(record=>record.key===entry.key);
        if (mode==='compare') {
            previewModalStore.activeIndex = index;
            renderPreviewModal();
        } else if (index>=0 && index!==previewModalStore.activeIndex) selectPreviewEntry(index,linked);
    }

    function applyPreviewImageTransform(root) {
        const image = root.querySelector(".clab-preview-modal-main-image");
        if (image) image.style.transform = `translate(${previewModalStore.imagePanX}px, ${previewModalStore.imagePanY}px) scale(${previewModalStore.imageZoom})`;
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
            <div class="clab-preview-modal-panel" role="dialog" aria-label="预览模式">
                <div class="clab-preview-modal-head">
                    <div class="clab-review-notice" role="status"></div>
                    <div class="clab-review-modes" role="group" aria-label="预览模式">${[['browse','浏览'],['compare','比较'],['detail','明细表'],['table','参数表'],['xy','XY 矩阵']].map(([key,label])=>`<button type="button" data-review-mode="${key}" aria-pressed="${key==='browse'}">${label}</button>`).join('')}</div>
                    <div class="clab-review-head-actions">
                        <div class="clab-toolbar-type" role="group" aria-label="工作区与预览切换">
                            <button class="clab-type-btn clab-preview-modal-close" type="button" aria-label="返回工作区" aria-pressed="false">工作区</button>
                            <button type="button" class="clab-type-btn" aria-pressed="true">预览</button>
                        </div>
                    </div>
                </div>
                <div class="clab-workspace-strip clab-review-workspaces">
                    <div class="clab-workspace-shell">
                        <div class="clab-workspace-tabs" data-review-workspaces role="group" aria-label="切换工作区"></div>
                        <div class="clab-mode-menu" id="clab-preview-workspace-mode-menu" role="menu" aria-label="工作区模式" hidden>${[['cards','任务卡片'],['table','参数表'],['xy','XY 矩阵']].map(([key,label])=>`<button type="button" data-workspace-mode="${key}" role="menuitemradio" aria-checked="false">${label}</button>`).join('')}</div>
                    </div>
                </div>
                <div class="clab-preview-modal-body">
                    <div class="clab-preview-modal-left"></div>
                    <div class="clab-preview-modal-center"></div>
                    <div class="clab-preview-modal-right"></div>
                </div>
            </div>
        `;
        document.body.appendChild(root);
        previewModalStore.root = root;
        const tabs = root.querySelector('[data-review-workspaces]');
        attachWorkspaceEvents(tabs,{
            beforeChange:()=>parameterGrid?.flush(),
            onChange:()=>{
                if(root.classList.contains('visible')&&previewWorkspaceId!==state.activeWorkspaceId){
                    openPreviewModal(undefined,undefined,undefined,undefined,workspacePreviewSources(state.cards),returnFocus,mode);
                    tabs.querySelector('.active .clab-workspace-tab-select')?.focus({preventScroll:true});
                }
            },
        });
        const workspaceModeMenu=attachWorkspaceModeMenu(tabs.closest('.clab-workspace-strip'),(next,id)=>{
            parameterGrid.flush();if(id!==state.activeWorkspaceId)switchWorkspace(id);
            setWorkspaceMode(document.querySelector('#clab-panel'),next);
            openPreviewModal(undefined,undefined,undefined,undefined,workspacePreviewSources(state.cards),returnFocus,next==='cards'?'browse':next);
        });
        browseLayout=createBrowseLayout(root,browse,{
            onReorder({keys,targetId,beforeKey}) {
                const groups = sourceBrowseGroups(collectPreviewRecords(allSources),browse.sort,browse.session.customGroups);
                const target=allSources.find(source=>`source:${sourceKey(source.card,source.area)}`===targetId);
                if (target&&!groups.some(group=>group.id===targetId)) groups.push({id:targetId,source:sourceKey(target.card,target.area),label:`${target.cardLabel} · ${target.areaLabel}`,records:[]});
                const internal=keys.every(key=>groups.find(group=>group.id===targetId)?.records.some(record=>record.key===key));
                const reordered = moveBrowseGroupRecords(groups,keys,targetId,beforeKey);
                if (reordered===groups) return;
                if(internal) {commitHistoryOrder(reordered);return;}
                browse.session.customGroups = snapshotBrowseGroups(reordered);
                browse.sort = 'custom';
                renderPreviewModal();
            },
        });
        const coverMenu = document.createElement('div');
        coverMenu.className = 'clab-filmstrip-cover-menu';
        coverMenu.setAttribute('popover','auto');
        coverMenu.innerHTML = '<button type="button" class="clab-context-menu-item" data-review-cover>设为封面</button>';
        root.append(coverMenu);
        const closeCoverMenu = () => {
            if (coverMenu.matches(':popover-open')) coverMenu.hidePopover();
        };
        root.querySelector('.clab-preview-modal-center').addEventListener('contextmenu',event=>{
            const record = getActivePreviewEntry();
            if (mode!=='browse' || !record || event.target.closest('button,a,input,textarea,select,[contenteditable=true]')) return;
            const group = filteredGroups().find(group=>group.records.some(item=>item.key===record.key));
            if (!group) return;
            event.preventDefault();
            event.stopPropagation();
            const item = coverMenu.firstElementChild;
            item.textContent = browse.session.covers.get(group.id)===record.key ? '取消设为封面' : '设为封面';
            item.onclick = () => { browseLayout.toggleCover(record.key); closeCoverMenu(); };
            if (!coverMenu.matches(':popover-open')) coverMenu.showPopover();
            coverMenu.style.left = `${Math.max(4,Math.min(event.clientX,innerWidth-coverMenu.offsetWidth-4))}px`;
            coverMenu.style.top = `${Math.max(4,Math.min(event.clientY,innerHeight-coverMenu.offsetHeight-4))}px`;
        });

        downloads = createPreviewDownloads(root,getDownloadRecords,()=>state.cards);
        dataExport = createPreviewDataExport(root,getDownloadRecords,()=>state.cards,getJSONCards);
        detailView = createDetailView(root,refreshSidebarExports);
        const panes = ['center','left','right'].map(side=>root.querySelector('.clab-preview-modal-'+side));
        const sheetChanged=()=>{updateSheetExportButtons(root);refreshSidebarExports();};
        parameterGrid = createPreviewParameterGrid(...panes,sheetChanged,sheetExportControls(true));
        xyGrid = createPreviewXYGrid(...panes,sheetChanged,sheetExportControls(false));

        const close = () => {
            closeCoverMenu();workspaceModeMenu.close();
            root.classList.remove("visible");
            teardownPreviewEnhancers();
            browseLayout.release();
            resetPreviewImageTransform();
            sources=[];allSources=[];previewModalStore.entries=[];tableModel=null;
            parameterGrid.flush();
            const focus = returnFocus?.getClientRects().length ? returnFocus : document.querySelector('#clab-btn-preview');
            focus?.focus({ preventScroll:true });
            returnFocus = null;
        };
        root.querySelector(".clab-preview-modal-backdrop").addEventListener("click", close);
        root.querySelector(".clab-preview-modal-close").addEventListener("click", close);
        root.addEventListener("click", (event) => {
            if(event.target.closest('.clab-review-workspaces'))return;
            const layer = event.target.closest('[data-review-layer]');
            if (renderedGrid === 'xy' && layer) { xyGrid.showLayer(layer.dataset.reviewLayer);return; }
            if (renderedGrid === 'xy' && event.target.closest('[data-review-xy-fit]')) { xyGrid.fit();return; }
            const swap = event.target.closest('[data-review-xy-swap]');
            if (renderedGrid === 'xy' && swap) { xyGrid.swap(swap.dataset.reviewXySwap,matrixPreview);return; }
            if((mode!=='detail'||event.target.closest('[data-browse-restore]'))&&browseLayout.handleClick(event))return;
            const sourceSelect=event.target.closest('[data-browse-select]');
            if(sourceSelect){setBrowseSources(sourceSelect.dataset.browseSelect==='all'?allSources.filter(source=>sourceRecordCount(source.area)):[]);return;}
            const reverse=event.target.closest('[data-browse-reverse]');
            if(reverse) {
                const source=reverse.dataset.browseReverse,reversed=browse.session.reversedSources??=new Set();
                reversed.has(source)?reversed.delete(source):reversed.add(source);
                const groups=sourceBrowseGroups(collectPreviewRecords(allSources),browse.sort,browse.session.customGroups);
                commitHistoryOrder(groups.map(group=>group.source===source?{...group,records:group.records.slice().reverse()}:group),source);return;
            }
            const modeButton = event.target.closest('button[data-review-mode]');
            if (modeButton) {
                closeCoverMenu();
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
            if(view) { browseSheetRecord(view.dataset.viewRecord);return; }
            if (mode==='xy'&&matrixPreview.matrixSource==='history'&&panes[0].contains(event.target)
                &&!event.target.closest('button,a,input,select,video,audio')) {
                const key=event.target.closest('[data-record-key]')?.dataset.recordKey;
                if (!event.ctrlKey&&!event.metaKey) selectedHistoryRecords.clear();
                if (key) selectedHistoryRecords.has(key)?selectedHistoryRecords.delete(key):selectedHistoryRecords.add(key);
                paintHistorySelection(panes[0]);refreshSidebarExports();
                return;
            }
            if(event.target.closest('input[type=checkbox]'))return;
            const thumb = event.target.closest(".clab-preview-modal-thumb")||event.target.closest('.clab-source-cover-frame')?.querySelector('.clab-source-cover');
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
            if (target.matches('[data-review-png-scale]')) {
                sheetScales[mode]=Math.max(1,Math.min(10,Number(target.value)||3));
                target.value=sheetScales[mode];
                return;
            }
            if (renderedGrid === 'table' && target.matches('[data-grid-filter]')) { parameterGrid.filter(target);return; }
            if (renderedGrid === 'xy' && xyGrid.change(target,matrixPreview)) return;
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
            if (target.matches('[data-sheet-option=matrixSource]')) {
                matrixPreview.matrixSource = target.value;
                const focused = document.activeElement === target;
                renderPreviewModal();
                if (focused) root.querySelector('[data-sheet-option=matrixSource]')?.focus({preventScroll:true});
                return;
            }
            if(target.matches('[data-review-type]')) typeFilter=target.value;
            else if(target.matches('[data-table-option]')) {
                const key=target.dataset.tableOption;
                historyMatrix[key]=sheetOptionValue(key,target.value);
                if(['x','y','z'].includes(key))delete historyMatrix.filters[target.value];
            }
            else if(target.matches('[data-table-filter]'))historyMatrix.filters[target.dataset.tableFilter]=target.value;
            else return;
            renderPreviewModal();
        });
        root.addEventListener('input',event=>{
            const target=event.target;
            if(target.matches('[data-browse-search]')){browse.search=target.value;renderPreviewModal();}
            if(target.matches('[data-browse-columns]')){
                browse.thumbColumns=Number(target.value);browseLayout.applyLayout();
                root.querySelector('[data-browse-columns-label]').textContent=`${browse.thumbColumns} 列`;
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

        document.addEventListener("keydown", (event) => {
            if (!root.classList.contains("visible")) return;
            const active = getActivePreviewEntry();
            const typing = isEditableTarget(event.target) || isEditableTarget(document.activeElement);

            if ((event.key === " " || event.key === "Spacebar") && mode === 'browse' && active?.type === "image" && !typing && !event.target.closest?.('button')) {
                event.preventDefault();
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                if (coverMenu.matches(':popover-open')) { closeCoverMenu(); return; }
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

            if (event.defaultPrevented) return;
            if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                switchPreviewEntry(event.key === 'ArrowLeft' ? -1 : 1, !event.shiftKey);
            } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
                event.preventDefault();
                switchPreviewGroup(event.key === 'ArrowUp' ? -1 : 1, !event.shiftKey);
            }
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

    function filteredGroups(filter=typeFilter) {
        return sourceBrowseGroups(previewModalStore.entries,browse.sort,browse.session.customGroups)
            .map(group=>({...group,records:group.records.filter(entry=>(!filter || entry.type===filter)
                && (mode!=='compare' || ['image','video'].includes(entry.type)))}))
            .filter(group=>group.records.length);
    }

    const filteredEntries = () => filteredGroups().flatMap(group => group.records);

    function paintHistorySelection(center) {
        for (const element of center.querySelectorAll('[data-record-key]')) {
            element.classList.toggle('is-download-selected',selectedHistoryRecords.has(element.dataset.recordKey));
        }
    }

    function getDownloadRecords(selected,includeHistory) {
        if (mode==='browse'||mode==='compare') {
            const keys=new Set(mode==='compare'?[compare.a,compare.b]:[getActivePreviewEntry()?.key]);
            const groups=filteredGroups(mode==='compare'&&selected?'':typeFilter);
            return filmstripDownloadRecords(groups,browse.session.covers,keys,selected,includeHistory);
        }
        if (mode==='detail') return detailView.downloadRecords(selected,includeHistory);
        if (renderedGrid==='table') return parameterGrid.downloadRecords(selected,includeHistory);
        if (renderedGrid==='xy') return xyGrid.downloadRecords(selected,includeHistory);
        return (tableModel?.rows||[]).flatMap(row=>row.cells.flatMap(cell=>{
            const picked=cell.records.filter(record=>selectedHistoryRecords.has(record.key));
            return selected&&!picked.length?[]:!selected||includeHistory?cell.records:picked;
        }));
    }

    function getJSONCards() {
        if (mode==='detail') return detailView.jsonCards();
        if (renderedGrid==='table') return parameterGrid.jsonCards();
        if (renderedGrid==='xy') return xyGrid.jsonCards();
        const records=getDownloadRecords(false,false);
        const visible=new Set(records.map(record=>JSON.stringify([record.cardId,record.areaId])));
        return state.cards.filter(card=>records.some(record=>record.cardId===card.id)).map(card=>({...card,
            areas:card.areas.filter(area=>area.type==='edit'||visible.has(JSON.stringify([card.id,area.id])))}));
    }

    function setBrowseSources(nextSources) {
        const activeKey=getActivePreviewEntry()?.key;
        sources=nextSources;previewModalStore.entries=collectPreviewRecords(sources);
        previewModalStore.activeIndex=previewModalStore.entries.findIndex(entry=>entry.key===activeKey);
        if(previewModalStore.activeIndex<0)previewModalStore.activeIndex=previewModalStore.entries.length?0:-1;
        renderPreviewModal();
    }

    function sheetOptionValue(key, value) {
        if (key === 'width') return Math.max(80, Math.min(640, Number(value) || 200));
        if (key === 'textLimit') return Math.max(20, Math.min(2000, Number(value) || 200));
        return value;
    }

    function browseSheetRecord(key) {
        const record = tableModel?.rows.flatMap(row=>row.cells).flatMap(cell=>cell.records).find(item=>item.key===key);
        if (!record) return;
        if (!sources.some(source=>sourceKey(source.card,source.area)===record.source)) {
            sources = allSources.filter(source=>sourceKey(source.card,source.area)===record.source || sources.includes(source));
            previewModalStore.entries = collectPreviewRecords(sources);
        }
        previewModalStore.activeIndex = previewModalStore.entries.findIndex(entry=>entry.key===key);
        typeFilter = '';
        mode = 'browse';
        renderPreviewModal();
    }

    function loadSheetText(records, root) {
        const loads = [];
        for (const record of records) {
            if (record.type !== 'text' || record.text) continue;
            const cached = previewModalStore.textCache.get(record.url);
            if (cached) {
                if (cached.state !== 'loading') record.text = cached.text;
                continue;
            }
            previewModalStore.textCache.set(record.url,{state:'loading',text:''});
            loads.push(fetch(record.url).then(response=>{
                if(!response.ok)throw new Error(`HTTP ${response.status}`);
                return response.text();
            }).then(text=>previewModalStore.textCache.set(record.url,{state:'ready',text}))
                .catch(error=>previewModalStore.textCache.set(record.url,{state:'error',text:`文本读取失败：${error.message}`})));
        }
        if (loads.length) void Promise.all(loads).then(()=>{
            if (root.classList.contains('visible') && ['table','xy'].includes(mode)) renderPreviewModal();
        });
    }

    function renderCompareParameters(right,a,b) {
        const fields=parameterFields([a,b].filter(Boolean));
        right.innerHTML=`<div class="clab-review-section">A/B 参数对照</div>${fields.length?`<table class="clab-compare-parameters"><thead><tr><th>参数</th><th>A</th><th>B</th></tr></thead><tbody>${fields.map(field=>{
            const av=a?.parameters.get(field.key),bv=b?.parameters.get(field.key),different=valueKey(av?.value)!==valueKey(bv?.value);
            return `<tr class="${different?'different':''}"><th>${escapeHtml(field.label)}</th><td>${escapeHtml(displayValue(av?.value))}</td><td>${escapeHtml(displayValue(bv?.value))}</td></tr>`;
        }).join('')}</tbody></table>`:'<p class="clab-review-note">所选记录没有参数快照。</p>'}<p class="clab-review-note">不同参数以深色背景突出。选择 A/B 不改变卡片当前历史和输入值。</p>`;
    }

    async function exportTable(kind) {
        if(exporting||!hasExportData())return;
        exporting=true;
        const model=tableModel,name=mode==='table'?'参数表':'XY矩阵',config={...historyMatrix,name},root=ensurePreviewModal(),notice=root.querySelector('.clab-review-notice');
        const source=root.querySelector('.clab-preview-modal-center :is(.clab-review-grid-stage,.clab-result-sheet)');
        const scale=sheetScales[mode];
        updateSheetExportButtons(root);
        notice.textContent='正在整理资源并导出…';
        try {
            if(kind==='xlsx'){
                const data=parameterGrid.exportSource();
                downloadPreviewBlob(await exportParameterWorkbook(source,data),`${name}.xlsx`);
            } else if(kind==='html'){
                const archive=renderedGrid?await exportPreviewLayoutHTML(source,name):await exportPreviewHTML(model,config);
                downloadPreviewBlob(archive,`${name}-HTML.zip`);
            } else {
                if(kind==='copy'&&(!navigator.clipboard?.write||!window.ClipboardItem))throw new Error('当前浏览器无法复制图片，可使用下载 PNG');
                const png=capturePreviewLayout(source).then(layout=>renderLayoutPNG(layout,scale));
                if(kind==='copy')await navigator.clipboard.write([new ClipboardItem({'image/png':png})]);
                else downloadPreviewBlob(await png,`${name}.png`);
            }
            notice.textContent=kind==='copy'?'PNG 已复制到剪贴板。':'导出完成。';
        } catch(error) { notice.textContent=`导出失败：${error.message}`; }
        finally { exporting=false;updateSheetExportButtons(root); }
    }

    function updateSheetExportButtons(root) {
        const disabled = exporting || !hasExportData();
        root.querySelectorAll('[data-review-export]').forEach(button=>button.disabled=disabled);
        const scale=root.querySelector('[data-review-png-scale]');
        if(scale)scale.value=sheetScales[mode];
    }

    function hasExportData() {
        if (renderedGrid==='table') return parameterGrid.hasExportData();
        if (renderedGrid==='xy') return xyGrid.hasExportData();
        return !!(tableModel?.rows.length&&tableModel.columns.length);
    }

    function sheetExportControls(workbook) {
        return `<section><h3 title="按当前预览的版式导出；PNG 可调整放大倍数，HTML 可离线查看。">导出</h3><label class="clab-review-field clab-review-png-scale">PNG 放大倍数<input type="number" min="1" max="10" step="1" data-review-png-scale value="3"></label>
        <div class="clab-review-export clab-review-layout-export">
            <button type="button" data-review-export="copy">复制 PNG</button>
            <button type="button" data-review-export="png">下载 PNG</button>
            ${workbook?'<button type="button" data-review-export="xlsx">下载 Excel</button>':''}
            <button type="button" data-review-export="html">打包 HTML</button>
        </div></section>`;
    }

    function renderPreviewModal() {
        const root=ensurePreviewModal(),left=root.querySelector('.clab-preview-modal-left'),center=root.querySelector('.clab-preview-modal-center'),right=root.querySelector('.clab-preview-modal-right');
        const entries=previewModalStore.entries;
        const workspaceSheet=mode==='table'||mode==='xy'&&matrixPreview.matrixSource==='workspace';
        root.dataset.reviewMode=mode;
        root.dataset.reviewLayout='workspace';
        root.toggleAttribute('data-workspace-sheet',workspaceSheet);
        root.querySelectorAll('[data-review-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.reviewMode===mode)));
        if(mode!=='detail'&&!workspaceSheet) {
            browseLayout.renderSources(state.cards,allSources,sources);
            const groups=filteredGroups(),visible=groups.flatMap(group=>group.records),active=getActivePreviewEntry();
            if(active&&!visible.some(entry=>entry.key===active.key))previewModalStore.activeIndex=visible.length?entries.findIndex(entry=>entry.key===visible[0].key):-1;
            else if(previewModalStore.activeIndex<0&&visible.length&&!state.cards.find(card=>card.id===previewModalStore.activeCardId)?.areas.find(area=>area.id===previewModalStore.activeAreaId)?.missingHistoryRun)previewModalStore.activeIndex=entries.findIndex(entry=>entry.key===visible[0].key);
            if(mode!=='xy')browseLayout.renderMedia(groups,entries,previewModalStore.activeIndex,typeFilter,mode==='compare'?compare:null);
            else browseLayout.release();
        } else browseLayout.release();
        browseLayout.applyLayout();
        if(previewModalStore.activeIndex>=entries.length)previewModalStore.activeIndex=entries.length?0:-1;
        const active=getActivePreviewEntry()||{type:'missing',name:'该次运行无可用记录',index:-1};
        if(mode==='compare') {
            const a=entries.find(entry=>entry.key===compare.a),b=entries.find(entry=>entry.key===compare.b);
            const key=JSON.stringify([a?.key,a?.url,b?.key,b?.url]);
            if(renderedMode!=='compare'||renderedCompareKey!==key) {
                teardownPreviewEnhancers();center.innerHTML=comparisonHTML(a,b,compare);cleanupReview=attachComparison(center,compare);
                renderedCompareKey=key;renderedMode='compare';
            }
            syncComparison(center,compare);renderCompareParameters(right,a,b);refreshSidebarExports();return;
        }
        if(mode==='detail') {
            if(renderedMode!=='detail'){teardownPreviewEnhancers();renderedMode='detail';}
            detailView.render(state.cards);return;
        }
        if(mode==='table'||mode==='xy') {
            if (workspaceSheet) {
                if (renderedGrid!==mode) {
                    teardownPreviewEnhancers();renderedMode=renderedGrid=mode;
                    if (mode==='table') parameterGrid.mount();
                    else xyGrid.mount(matrixPreview);
                }
                return;
            }
            if(renderedMode!==mode||renderedGrid){teardownPreviewEnhancers();renderedMode=mode;}
            right.innerHTML=renderTableSettings(entries,sources,historyMatrix,xySourceSetting(matrixPreview),sheetExportControls(false));
            tableModel=buildTableModel(entries,sources,historyMatrix);
            loadSheetText(tableModel.rows.flatMap(row=>row.cells).flatMap(cell=>cell.records),root);
            center.innerHTML=renderTable(tableModel,historyMatrix);
            paintHistorySelection(center);
            updateSheetExportButtons(root);
            refreshSidebarExports();
            return;
        }
        const browseKey=JSON.stringify([active.key||'',active.url||'',active.type,active.type==='text'?previewModalStore.textCache.get(normalizeHistoryUrl(active.url))?.state:'',active.type==='missing'?`${typeFilter}:${sources.length}`:'']);
        if(renderedMode!=='browse'||renderedBrowseKey!==browseKey) {
            teardownPreviewEnhancers();
            if(active.cardId){previewModalStore.activeCardId=active.cardId;previewModalStore.activeAreaId=active.areaId;}
            center.innerHTML=active.type==='missing'&&!sources.length?'<div class="clab-preview-modal-empty">请在左侧勾选要查看的输出模块</div>':active.type==='missing'&&typeFilter?'<div class="clab-preview-modal-empty">没有符合筛选条件的媒体</div>':renderPreviewCenter(active);
            if(active.type==='image'){
                applyPreviewImageTransform(root);
                cleanupReview=attachPreviewPan(center.querySelector('.clab-preview-modal-image-stage'),(x,y)=>{
                    previewModalStore.imagePanX+=x;
                    previewModalStore.imagePanY+=y;
                    applyPreviewImageTransform(root);
                });
            } else resetPreviewImageTransform();
            if(active.type==='video') {
                const player = center.querySelector('.clab-preview-video');
                cleanupReview = attachPreviewVideo(player, { primaryPan:true, status: player.querySelector('.clab-preview-video-status') });
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
        refreshSidebarExports();
    }

    function openPreviewModal(card, area, preferredUrl, preferredIndex, selectedSources, opener, initialMode = 'browse') {
        const root = ensurePreviewModal();
        returnFocus = opener;
        selectedHistoryRecords.clear();
        teardownPreviewEnhancers();
        previewModalStore.activeCardId = card?.id || "";
        previewModalStore.activeAreaId = area?.id || "";
        allSources=workspacePreviewSources(state.cards);
        sources=initialPreviewSources(state.cards,selectedSources||(area?[{card,area}]:[]),state.selectedCardIds,card?.id);
        browse.search='';
        previewModalStore.entries=collectPreviewRecords(sources);
        typeFilter='';mode=initialMode;
        const workspace = getActiveWorkspace(), view = workspace.view;
        previewWorkspaceId=workspace.id;detailView.open(state.cards,workspace);
        compare={a:'',b:'',slot:'a',layout:'side',view:{x:0,y:0,zoom:1,split:.5}};
        if (!filmstripSessions.has(workspace.id)) filmstripSessions.set(workspace.id,{covers:new Map(),positions:new Map(),customGroups:[]});
        browse.session = filmstripSessions.get(workspace.id);
        parameterGrid.open(workspace);
        xyGrid.open(view.xy,state.cards);
        historyMatrix={width:200,textLimit:200,x:'',y:'',z:'',zValue:'',source:'',filters:{}};
        matrixPreview={width:320,textLimit:200,matrixSource:view.mode==='xy'||workspaceMatrixAvailable(view.xy)?'workspace':'history'};
        const tabs = root.querySelector('[data-review-workspaces]');
        renderWorkspaceBar(tabs);
        tabs.querySelector('.active')?.scrollIntoView({block:'nearest',inline:'nearest'});
        previewModalStore.activeIndex = area?.missingHistoryRun ? -1 : previewModalStore.entries.findIndex(entry=>entry.cardId===card?.id && entry.areaId===area?.id && entry.index===(Number.isInteger(preferredIndex)?preferredIndex:area?.historyIndex));
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
        if (opener) root.querySelector(".clab-preview-modal-close").focus({ preventScroll:true });
    }

    return {
        openPreviewModal,
        renderPreviewModal,
    };
}

