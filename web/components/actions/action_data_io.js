/**
 * 文件名: action_data_io.js
 * 路径: web/components/actions/action_data_io.js
 * 职责: 负责导入JSON、导出JSON、媒体打包下载、后端本地文件整理、文件上传 (全微创更新版)
 */
import { state, appState, saveAndRender } from "../ui_state.js";
import { showBindingToast, hideBindingToast } from "../ui_utils.js";
import { app } from "../../../../scripts/app.js";

// 【引入微创渲染引擎与静态保存】
import { generateSingleCardHTML, attachCardEvents } from "../comp_taskcard.js"; 
import { generateAreaHTML, attachAreaEvents, justSave } from "../comp_modulearea.js"; 
import { updateSelectionUI } from "../ui_selection.js";
import { clabT, clabTf } from "../../clab_i18n.js";

// =========================================================================
// 核心网络请求：上传本地文件到服务器并返回文件名
// =========================================================================
export async function uploadImageToServer(file) {
    const formData = new FormData();
    formData.append('image', file);
    const resp = await fetch('/upload/image', {
        method: 'POST',
        body: formData
    });
    if(!resp.ok) throw new Error(resp.statusText);
    const data = await resp.json();
    if (!data.name) throw new Error(data.error || clabT("dataIo.uploadNoFilename"));
    return data;
}

export function attachDataIOEvents(panelContainer) {
    // ----------------------------------------------------
    // 1. JSON 导入功能
    // ----------------------------------------------------
    const addModuleBtn = panelContainer.querySelector("#clab-global-add-module");
    if (addModuleBtn && !panelContainer.querySelector("#clab-import-json-wrapper")) {
        addModuleBtn.insertAdjacentHTML('afterend', `
            <div id="clab-import-json-wrapper" style="position:relative; display:inline-flex; align-items:center;">
                <button class="clab-btn" id="clab-import-json-btn" title="${clabT("dataIo.importJsonBtnTitle")}" style="padding: 0; width: 34px; height: 34px; display:flex; align-items:center; justify-content:center;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div id="clab-import-json-dropdown" class="clab-custom-select-dropdown" style="display:none; top: calc(100% + 4px); left: 0; min-width: 170px; z-index: 10002;">
                    <div class="clab-custom-select-group-title" style="padding: 6px 12px; font-size: 12px; margin-top: 0; box-sizing: border-box; font-weight: bold; color: #aaa; background: rgba(255,255,255,0.05);">${clabT("dataIo.importFromClipboard")}</div>
                    <div class="clab-custom-select-item" id="clab-import-new-clip">${clabT("dataIo.importCreateTask")}</div>
                    <div class="clab-custom-select-item" id="clab-import-append-smart-clip">${clabT("dataIo.importAppendModule")}</div>
                    <div class="clab-custom-select-item" id="clab-import-append-sel-clip">${clabT("dataIo.importAppendToSelection")}</div>
                    
                    <div class="clab-custom-select-group-title" style="padding: 6px 12px; font-size: 12px; margin-top: 4px; box-sizing: border-box; font-weight: bold; color: #aaa; background: rgba(255,255,255,0.05);">${clabT("dataIo.importFromLocalFile")}</div>
                    <div class="clab-custom-select-item" id="clab-import-new-local">${clabT("dataIo.importCreateTask")}</div>
                    <div class="clab-custom-select-item" id="clab-import-append-smart-local">${clabT("dataIo.importAppendModule")}</div>
                    <div class="clab-custom-select-item" id="clab-import-append-sel-local">${clabT("dataIo.importAppendToSelection")}</div>
                </div>
            </div>
        `);

        const wrapper = panelContainer.querySelector("#clab-import-json-wrapper");
        const btn = wrapper.querySelector("#clab-import-json-btn");
        const dropdown = wrapper.querySelector("#clab-import-json-dropdown");

        btn.onclick = (e) => {
            e.stopPropagation();
            const isVisible = dropdown.style.display === 'block';
            document.querySelectorAll('.clab-custom-select-dropdown').forEach(d => d.style.display = 'none');
            dropdown.style.display = isVisible ? 'none' : 'block';
        };

        const processImportedJSON = (jsonStr, mode) => {
            try {
                const data = JSON.parse(jsonStr);
                let dataArray = Array.isArray(data) ? data : [data];
                if (dataArray.length === 0) return alert(clabT("dataIo.importEmptyData"));

                let smartAppendStartIndex = 0;
                let newCardsToDOM = []; // 暂存需要插入 DOM 的新卡片
                let newAreasToDOM = {}; // 暂存需要插入 DOM 的新模块

                if (mode === 'new') {
                    const newCards = [];
                    dataArray.forEach((obj, cIdx) => {
                        if (typeof obj !== 'object' || obj === null) return;
                        const card = { id: 'card_' + Date.now() + '_' + Math.floor(Math.random()*1000) + cIdx, title: '', areas: [] };
                        let aIdx = 0;
                        for (const [key, value] of Object.entries(obj)) {
                            let finalValue = value;
                            if (typeof value === 'object' && value !== null) finalValue = JSON.stringify(value);
                            else if (value === null) finalValue = "";
                            else finalValue = String(value);

                            card.areas.push({
                                id: 'area_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + aIdx++,
                                type: 'edit', title: key, value: finalValue, targetNodeId: null, targetWidget: null, dataType: 'string', autoHeight: true
                            });
                        }
                        newCards.push(card);
                    });

                    if (newCards.length > 0) {
                        const insertIndex = state.cards.length;
                        state.cards.push(...newCards);
                        state.selectedCardIds = [newCards[0].id];
                        state.activeCardId = newCards[0].id;
                        state.selectedAreaIds = [];
                        appState.lastClickedCardId = newCards[0].id;
                        
                        newCards.forEach((c, idx) => {
                            newCardsToDOM.push({ card: c, index: insertIndex + idx });
                        });
                    }

                } else if (mode === 'smart_append') {
                    let startIndex = 0;
                    if (state.selectedCardIds && state.selectedCardIds.length > 0) {
                        const foundIndex = state.cards.findIndex(c => c.id === state.selectedCardIds[0]);
                        if (foundIndex !== -1) startIndex = foundIndex;
                    }
                    smartAppendStartIndex = startIndex;

                    dataArray.forEach((obj, indexOffset) => {
                        if (typeof obj !== 'object' || obj === null) return;
                        const targetIndex = startIndex + indexOffset;
                        let targetCard;
                        let isNewCard = false;

                        if (targetIndex < state.cards.length) targetCard = state.cards[targetIndex];
                        else {
                            targetCard = { id: 'card_' + Date.now() + '_' + Math.floor(Math.random() * 1000) + indexOffset, title: '', areas: [] };
                            state.cards.push(targetCard);
                            isNewCard = true;
                        }

                        if (!targetCard.areas) targetCard.areas = [];
                        let aIdx = 0;
                        const addedAreas = [];
                        for (const [key, value] of Object.entries(obj)) {
                            let finalValue = value;
                            if (typeof finalValue === 'object' && finalValue !== null) finalValue = JSON.stringify(finalValue);
                            else if (finalValue === null) finalValue = "";
                            else finalValue = String(finalValue);

                            addedAreas.push({
                                id: 'area_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + aIdx++,
                                type: 'edit', title: key, value: finalValue, targetNodeId: null, targetWidget: null, dataType: 'string', autoHeight: true
                            });
                        }
                        
                        targetCard.areas.push(...addedAreas);

                        if (isNewCard) {
                            newCardsToDOM.push({ card: targetCard, index: targetIndex });
                        } else {
                            if (!newAreasToDOM[targetCard.id]) newAreasToDOM[targetCard.id] = [];
                            newAreasToDOM[targetCard.id].push(...addedAreas);
                        }
                    });
                } else if (mode === 'append_selected') {
                    if (!state.selectedCardIds || state.selectedCardIds.length === 0) {
                        return alert(clabT("dataIo.importAppendNeedCards"));
                    }
                    state.selectedCardIds.forEach((cardId, index) => {
                        const card = state.cards.find(c => c.id === cardId);
                        const obj = dataArray[index]; 
                        if (card && obj && typeof obj === 'object' && obj !== null) {
                            if (!card.areas) card.areas = [];
                            let aIdx = 0;
                            const addedAreas = [];
                            for (const [key, value] of Object.entries(obj)) {
                                let finalValue = value;
                                if (typeof finalValue === 'object' && finalValue !== null) finalValue = JSON.stringify(finalValue);
                                else if (finalValue === null) finalValue = "";
                                else finalValue = String(finalValue);

                                addedAreas.push({
                                    id: 'area_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + aIdx++,
                                    type: 'edit', title: key, value: finalValue, targetNodeId: null, targetWidget: null, dataType: 'string', autoHeight: true
                                });
                            }
                            card.areas.push(...addedAreas);
                            if (!newAreasToDOM[card.id]) newAreasToDOM[card.id] = [];
                            newAreasToDOM[card.id].push(...addedAreas);
                        }
                    });
                }
                
                // =========================================================
                // 【核心引擎替换】：彻底抛弃 saveAndRender，采用无感 DOM 物理拼贴
                // =========================================================
                const cardsWrapper = document.querySelector('.clab-cards-wrapper');
                
                // 1. 批量插入全新生成的任务卡片
                if (newCardsToDOM.length > 0 && cardsWrapper) {
                    const temp = document.createElement('div');
                    newCardsToDOM.forEach(item => {
                        temp.innerHTML += generateSingleCardHTML(item.card, item.index);
                    });
                    
                    const frag = document.createDocumentFragment();
                    while(temp.firstChild) frag.appendChild(temp.firstChild);
                    
                    // 【直接追加】：剔除寻找幽灵按钮的代码，直接追加碎片
                    cardsWrapper.appendChild(frag);
                    
                    attachCardEvents(cardsWrapper);
                    // 为通过 JSON 凭空生成的新卡片内部模块，补绑拖拽和监听事件！
                    if (window._clabAttachAreaEvents) window._clabAttachAreaEvents(cardsWrapper);
                }
                
                // 2. 批量追加新模块到现有的任务卡片中
                for (let cardId in newAreasToDOM) {
                    const card = state.cards.find(c => c.id === cardId);
                    const cardBody = document.querySelector(`.clab-card[data-card-id="${cardId}"] .clab-area-list`);
                    if (cardBody && card) {
                        const temp = document.createElement('div');
                        newAreasToDOM[cardId].forEach(area => {
                            temp.innerHTML += generateAreaHTML(area, card);
                        });
                        const frag = document.createDocumentFragment();
                        while(temp.firstChild) frag.appendChild(temp.firstChild);
                        cardBody.appendChild(frag);
                        attachAreaEvents(cardBody);
                    }
                }

                // 3. 静默保存数据与更新 UI，全程不闪屏
                justSave();
                updateSelectionUI();
                if (window._clabUpdateAllDefaultTitles) window._clabUpdateAllDefaultTitles();
                if (window._clabUpdateCardsLayout) window._clabUpdateCardsLayout();
                
                setTimeout(() => {
                    const container = panelContainer.querySelector("#clab-cards-container");
                    if (!container) return;
                    if (mode === 'new' || mode === 'smart_append') container.scrollTo({ left: container.scrollWidth, behavior: 'smooth' });
                }, 50);

            } catch (e) {
                alert(clabT("dataIo.importParseError") + e.message);
            }
        };

        const handleClipboardImport = async (mode) => {
            dropdown.style.display = 'none';
            try {
                const text = await navigator.clipboard.readText();
                if (!text) return alert(clabT("dataIo.clipboardEmpty"));
                processImportedJSON(text, mode);
            } catch (err) {
                alert(clabT("dataIo.clipboardReadError") + err.message);
            }
        };

        const handleLocalImport = (mode) => {
            dropdown.style.display = 'none';
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.json';
            fileInput.onchange = (ev) => {
                const file = ev.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (e2) => processImportedJSON(e2.target.result, mode);
                reader.readAsText(file);
            };
            fileInput.click();
        };

        wrapper.querySelector("#clab-import-new-clip").onclick = (e) => { e.stopPropagation(); handleClipboardImport('new'); };
        wrapper.querySelector("#clab-import-append-smart-clip").onclick = (e) => { e.stopPropagation(); handleClipboardImport('smart_append'); };
        wrapper.querySelector("#clab-import-append-sel-clip").onclick = (e) => { e.stopPropagation(); handleClipboardImport('append_selected'); };
        wrapper.querySelector("#clab-import-new-local").onclick = (e) => { e.stopPropagation(); handleLocalImport('new'); };
        wrapper.querySelector("#clab-import-append-smart-local").onclick = (e) => { e.stopPropagation(); handleLocalImport('smart_append'); };
        wrapper.querySelector("#clab-import-append-sel-local").onclick = (e) => { e.stopPropagation(); handleLocalImport('append_selected'); };
    }

    // ----------------------------------------------------
    // 2. 导出与媒体下载功能
    // ----------------------------------------------------
    const configBtn = panelContainer.querySelector("#clab-btn-config");
    if (configBtn && !panelContainer.querySelector("#clab-export-json-wrapper")) {
        configBtn.insertAdjacentHTML('beforebegin', `
            <div id="clab-export-json-wrapper" style="position:relative; display:inline-flex; align-items:center;">
                <button class="clab-btn" id="clab-export-json-btn" title="${clabT("dataIo.exportBtnTitle")}" style="padding: 0; width: 34px; height: 34px; display:flex; align-items:center; justify-content:center;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                </button>
                <div id="clab-export-json-dropdown" class="clab-custom-select-dropdown" style="display:none; top: calc(100% + 4px); right: 0; left: auto; min-width: 250px; z-index: 10002;">
                    
                    <div class="clab-custom-select-group-title" style="padding: 6px 12px; font-size: 12px; margin-top: 0; box-sizing: border-box; font-weight: bold; color: #aaa; background: rgba(255,255,255,0.05); display: flex; align-items: center; white-space: nowrap; gap: 12px;">${clabT("dataIo.zipSectionTitle")}</div>
                    <div class="clab-custom-select-item" id="clab-export-media-all">${clabT("dataIo.downloadAll")}</div>
                    <div class="clab-custom-select-item" id="clab-export-media-sel">${clabT("dataIo.downloadSelected")}</div>
                    <div class="clab-custom-select-item" id="clab-export-media-all-history">${clabT("dataIo.downloadAllHistory")}</div>
                    <div class="clab-custom-select-item" id="clab-export-media-sel-history">${clabT("dataIo.downloadSelectedHistory")}</div>
                    
                    <div class="clab-custom-select-group-title" style="padding: 6px 12px; font-size: 12px; margin-top: 4px; box-sizing: border-box; font-weight: bold; color: #aaa; background: rgba(255,255,255,0.05);">${clabT("dataIo.organizeSectionTitle")}</div>
                    <div class="clab-custom-select-item" id="clab-export-org-move">${clabT("dataIo.orgMoveSubfolder")}</div>
                    <div class="clab-custom-select-item" id="clab-export-org-copy">${clabT("dataIo.orgCopySubfolder")}</div>
                    <div class="clab-custom-select-item" id="clab-export-org-move-history">${clabT("dataIo.orgMoveSubfolderHistory")}</div>
                    <div class="clab-custom-select-item" id="clab-export-org-copy-history">${clabT("dataIo.orgCopySubfolderHistory")}</div>
                    
                    <div class="clab-custom-select-group-title" style="padding: 0 0 0 12px; height: 28px; font-size: 12px; margin-top: 4px; box-sizing: border-box; font-weight: bold; color: #aaa; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: space-between; white-space: nowrap;">
                        <span>${clabT("dataIo.exportJsonTitle")}</span>
                        <div style="display: flex; height: 100%; align-items: center; pointer-events: auto;">
                            <div id="clab-json-action-copy" style="height: 100%; width: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: #2a2a2a; color: #fff; transition: all 0.2s;" title="${clabT("dataIo.jsonActionCopyTitle")}">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            </div>
                            <div id="clab-json-action-download" style="height: 100%; width: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; background: transparent; color: #888; transition: all 0.2s;" title="${clabT("dataIo.jsonActionDownloadTitle")}">
                                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                            </div>
                        </div>
                    </div>
                    <div class="clab-custom-select-item" id="clab-export-json-input">${clabT("dataIo.exportJsonInput")}</div>
                    <div class="clab-custom-select-item" id="clab-export-json-output">${clabT("dataIo.exportJsonOutput")}</div>
                    <div class="clab-custom-select-item" id="clab-export-json-all">${clabT("dataIo.exportJsonAll")}</div>
                    <div class="clab-custom-select-item" id="clab-export-json-output-history">${clabT("dataIo.exportJsonOutputHistory")}</div>
                    <div class="clab-custom-select-item" id="clab-export-json-all-history">${clabT("dataIo.exportJsonAllHistory")}</div>
                </div>
            </div>
        `);

        const exportWrapper = panelContainer.querySelector("#clab-export-json-wrapper");
        const exportBtn = exportWrapper.querySelector("#clab-export-json-btn");
        const exportDropdown = exportWrapper.querySelector("#clab-export-json-dropdown");

        exportBtn.onclick = (e) => {
            e.stopPropagation();
            const isVisible = exportDropdown.style.display === 'block';
            document.querySelectorAll('.clab-custom-select-dropdown').forEach(d => d.style.display = 'none');
            exportDropdown.style.display = isVisible ? 'none' : 'block';
        };

        const downloadMediaFiles = async (mode, includeHistory = false) => {
            exportDropdown.style.display = 'none';
            const urlsToDownload = [];
            
            const extractUrlsFromArea = (a) => {
                if (a.type === 'preview') {
                    if (includeHistory && a.history && a.history.length > 0) {
                        urlsToDownload.push(...a.history);
                    } else if (a.resultUrl) {
                        urlsToDownload.push(a.resultUrl);
                    }
                }
            };

            if (mode === 'selected') {
                if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
                    state.cards.forEach(c => c.areas?.forEach(a => {
                        if (state.selectedAreaIds.includes(a.id)) extractUrlsFromArea(a);
                    }));
                } else if (state.selectedCardIds && state.selectedCardIds.length > 0) {
                    state.cards.filter(c => state.selectedCardIds.includes(c.id)).forEach(c => {
                        c.areas?.forEach(a => extractUrlsFromArea(a));
                    });
                } else return alert(clabT("dataIo.selectForDownload"));
            } else {
                state.cards.forEach(c => c.areas?.forEach(a => extractUrlsFromArea(a)));
            }

            const uniqueUrls = [...new Set(urlsToDownload)];
            if (uniqueUrls.length === 0) return alert(clabT("dataIo.noMediaToDownload"));

            // 同步获取自定义的文件夹名称用于 Zip 命名
            const archiveBase = window._clabArchiveDir || "CLab";

            if (uniqueUrls.length === 1) {
                try {
                    const url = uniqueUrls[0];
                    const urlObj = new URL(url, window.location.origin);
                    const filename = urlObj.searchParams.get('filename') || `media_${Date.now()}`;
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const blobUrl = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl; a.download = filename; 
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    URL.revokeObjectURL(blobUrl);
                } catch (err) { alert(clabT("dataIo.downloadFailed") + err.message); }
            } else {
                if (typeof showBindingToast === 'function') showBindingToast(clabT("dataIo.zipPackingToast"), false);
                try {
                    if (!window.JSZip) {
                        await new Promise((resolve, reject) => {
                            const script = document.createElement('script');
                            script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
                            script.onload = resolve; script.onerror = reject;
                            document.head.appendChild(script);
                        });
                    }
                    const zip = new window.JSZip();
                    const folder = zip.folder(`${archiveBase}_Export`);
                    
                    for (let i = 0; i < uniqueUrls.length; i++) {
                        const url = uniqueUrls[i];
                        const urlObj = new URL(url, window.location.origin);
                        const filename = urlObj.searchParams.get('filename') || `media_${Date.now()}_${i}`;
                        const response = await fetch(url);
                        const blob = await response.blob();
                        folder.file(filename, blob);
                    }
                    
                    const zipBlob = await zip.generateAsync({ type: "blob" });
                    const zipUrl = URL.createObjectURL(zipBlob);
                    const a = document.createElement('a');
                    a.href = zipUrl; a.download = `${archiveBase}_Media_${Date.now()}.zip`;
                    document.body.appendChild(a); a.click(); document.body.removeChild(a);
                    URL.revokeObjectURL(zipUrl);
                    if (typeof hideBindingToast === 'function') hideBindingToast();
                } catch (err) {
                    if (typeof hideBindingToast === 'function') hideBindingToast();
                    alert(clabT("dataIo.zipFallbackAlert"));
                    for (let i = 0; i < uniqueUrls.length; i++) {
                        try {
                            const url = uniqueUrls[i];
                            const urlObj = new URL(url, window.location.origin);
                            const filename = urlObj.searchParams.get('filename') || `media_${Date.now()}_${i}`;
                            const response = await fetch(url);
                            const blob = await response.blob();
                            const blobUrl = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = blobUrl; a.download = filename; 
                            document.body.appendChild(a); a.click(); document.body.removeChild(a);
                            URL.revokeObjectURL(blobUrl);
                            await new Promise(res => setTimeout(res, 300));
                        } catch (e) {}
                    }
                }
            }
        };

        exportWrapper.querySelector("#clab-export-media-all").onclick = (e) => { e.stopPropagation(); downloadMediaFiles('all', false); };
        exportWrapper.querySelector("#clab-export-media-sel").onclick = (e) => { e.stopPropagation(); downloadMediaFiles('selected', false); };
        exportWrapper.querySelector("#clab-export-media-all-history").onclick = (e) => { e.stopPropagation(); downloadMediaFiles('all', true); };
        exportWrapper.querySelector("#clab-export-media-sel-history").onclick = (e) => { e.stopPropagation(); downloadMediaFiles('selected', true); };

        let currentJsonAction = 'copy'; 
        const copyActionBtn = exportWrapper.querySelector("#clab-json-action-copy");
        const downloadActionBtn = exportWrapper.querySelector("#clab-json-action-download");

        const updateJsonActionState = () => {
            if (currentJsonAction === 'copy') {
                copyActionBtn.style.background = '#2a2a2a'; copyActionBtn.style.color = '#fff';
                downloadActionBtn.style.background = 'transparent'; downloadActionBtn.style.color = '#888';
            } else {
                copyActionBtn.style.background = 'transparent'; copyActionBtn.style.color = '#888';
                downloadActionBtn.style.background = '#2a2a2a'; downloadActionBtn.style.color = '#fff';
            }
        };

        copyActionBtn.onclick = (e) => { e.stopPropagation(); currentJsonAction = 'copy'; updateJsonActionState(); };
        downloadActionBtn.onclick = (e) => { e.stopPropagation(); currentJsonAction = 'download'; updateJsonActionState(); };

        const generateExportJSON = (mode) => {
            const result = [];
            const cardsToExport = (state.selectedCardIds && state.selectedCardIds.length > 0) 
                ? state.cards.filter(c => state.selectedCardIds.includes(c.id)) : state.cards;

            const formatUrl = (val) => {
                if (!val) return "";
                try {
                    const urlObj = new URL(val, window.location.origin);
                    const filename = urlObj.searchParams.get('filename');
                    let subfolder = urlObj.searchParams.get('subfolder');
                    if (filename) return subfolder ? `${subfolder.replace(/\\/g, '/')}/${filename}` : filename;
                } catch (e) {}
                return val;
            };

            cardsToExport.forEach((card) => {
                const cardObj = {};
                let unnamedInputCount = 1, unnamedOutputCount = 1;
                
                if (mode === 'input' || mode === 'all' || mode === 'all_history') {
                    card.areas?.filter(a => a.type === 'edit').forEach((a) => {
                        cardObj[a.title || `##${unnamedInputCount++}`] = a.value || "";
                    });
                }
                
                if (mode === 'output' || mode === 'all' || mode === 'output_history' || mode === 'all_history') {
                    const includeHistory = mode.includes('_history');
                    card.areas?.filter(a => a.type === 'preview').forEach((a) => {
                        let exportValue;
                        if (includeHistory && a.history && a.history.length > 0) {
                            exportValue = a.history.map(h => formatUrl(h)).filter(h => h !== "");
                        } else {
                            exportValue = formatUrl(a.resultUrl || "");
                        }
                        cardObj[a.title || `##${unnamedOutputCount++}`] = exportValue;
                    });
                }
                result.push(cardObj);
            });
            return JSON.stringify(result, null, 4);
        };

        const handleJsonExport = async (mode) => {
            exportDropdown.style.display = 'none';
            const jsonStr = generateExportJSON(mode);
            if (currentJsonAction === 'copy') {
                try {
                    await navigator.clipboard.writeText(jsonStr);
                    alert(clabT("dataIo.jsonCopied"));
                } catch (err) { alert(clabT("dataIo.jsonCopyFailed") + err.message); }
            } else if (currentJsonAction === 'download') {
                const blob = new Blob([jsonStr], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url; a.download = `CLab_Export_${mode}_${Date.now()}.json`;
                a.click(); URL.revokeObjectURL(url);
            }
        };

        exportWrapper.querySelector("#clab-export-json-input").onclick = (e) => { e.stopPropagation(); handleJsonExport('input'); };
        exportWrapper.querySelector("#clab-export-json-output").onclick = (e) => { e.stopPropagation(); handleJsonExport('output'); };
        exportWrapper.querySelector("#clab-export-json-all").onclick = (e) => { e.stopPropagation(); handleJsonExport('all'); };
        exportWrapper.querySelector("#clab-export-json-output-history").onclick = (e) => { e.stopPropagation(); handleJsonExport('output_history'); };
        exportWrapper.querySelector("#clab-export-json-all-history").onclick = (e) => { e.stopPropagation(); handleJsonExport('all_history'); };

        // =========================================================================
        // 【核心升级】：支持遍历所有生成记录的物理文件重排与归档
        // =========================================================================
        const organizeOutputFiles = async (action, includeHistory = false) => {
            exportDropdown.style.display = 'none';
            let workflowName = "Unsaved_Workflow";
            const configNode = app.graph._nodes.find(n => n.type === "CLab_SystemConfig");
            
            // 【核心修复】：将中英文的默认节点名称（包含各种空格变体）都加入白名单，防止多语言翻译导致误判
            const defaultTitles = [
                "⚓ CLab System Config", 
                "⚓ CLab系统配置", 
                "⚓ CLab 系统配置", 
                "CLab_SystemConfig"
            ];
            
            if (configNode && configNode.title && !defaultTitles.includes(configNode.title.trim())) {
                workflowName = configNode.title;
            } else if (app?.extensionManager?.workflow?.activeWorkflow?.filename) {
                workflowName = app.extensionManager.workflow.activeWorkflow.filename.replace(".json", "");
            }
            
            workflowName = workflowName.replace(/[\\/:"*?<>|]/g, "_").trim();

            const filesToProcess = [];
            const archiveBase = window._clabArchiveDir || "CLab"; // 同步获取用户设置的归档路径

            state.cards.forEach((card, cardIndex) => {
                const taskName = card.title ? card.title.replace(/[\\/:"*?<>|]/g, "_").trim() : String(cardIndex + 1);
                let previewCount = 0;
                
                card.areas?.forEach((area) => {
                    if (area.type === 'preview') {
                        previewCount++;
                        const areaName = area.title ? area.title.replace(/[\\/:"*?<>|]/g, "_").trim() : String(previewCount);
                        
                        const extractUrl = (urlStr, indexSuffix = "") => {
                            if (!urlStr) return;
                            try {
                                const urlObj = new URL(urlStr, window.location.origin);
                                const filename = urlObj.searchParams.get('filename');
                                if (filename) {
                                    const subfolder = urlObj.searchParams.get('subfolder') || "";
                                    filesToProcess.push({
                                        id: area.id, 
                                        filename: filename,
                                        type: urlObj.searchParams.get('type') || "output", 
                                        subfolder: subfolder,
                                        target_subfolder: `${archiveBase}/${workflowName}`, // 【核心修改】：应用用户的自定义归档路径
                                        // 为历史记录添加有序后缀 (例如: _v1, _v2)，防止依赖后端容错导致排序错乱
                                        target_filename: indexSuffix ? `${taskName}_${areaName}${indexSuffix}` : `${taskName}_${areaName}`
                                    });
                                }
                            } catch (e) {}
                        };

                        if (includeHistory && area.history && area.history.length > 0) {
                            area.history.forEach((hUrl, idx) => {
                                extractUrl(hUrl, `_v${idx + 1}`);
                            });
                        } else if (area.resultUrl) {
                            extractUrl(area.resultUrl, "");
                        }
                    }
                });
            });

            if (filesToProcess.length === 0) return alert(clabT("dataIo.noFilesToOrganize"));

            try {
                const response = await fetch('/clab/organize_files', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: action, files: filesToProcess }) });
                const res = await response.json();
                if (res.status === 'success') {
                    if (action === 'move') {
                        let affectedAreaIds = [];
                        res.results.forEach(r => {
                            state.cards.forEach(c => c.areas?.forEach(a => {
                                if (a.id === r.old_id) {
                                    if (a.resultUrl) {
                                        try {
                                            const urlObj = new URL(a.resultUrl, window.location.origin);
                                            if (urlObj.searchParams.get('filename') === r.old_filename) {
                                                urlObj.searchParams.set('filename', r.new_filename);
                                                urlObj.searchParams.set('subfolder', r.new_subfolder);
                                                a.resultUrl = urlObj.toString();
                                            }
                                        } catch(e) {}
                                    }
                                    
                                    if (a.history && a.history.length > 0) {
                                        a.history = a.history.map(hUrl => {
                                            try {
                                                const hObj = new URL(hUrl, window.location.origin);
                                                if (hObj.searchParams.get('filename') === r.old_filename) {
                                                    hObj.searchParams.set('filename', r.new_filename);
                                                    hObj.searchParams.set('subfolder', r.new_subfolder);
                                                    return hObj.toString();
                                                }
                                            } catch(e){}
                                            return hUrl;
                                        });
                                    }
                                    if (!affectedAreaIds.includes(a.id)) affectedAreaIds.push(a.id);
                                }
                            }));
                        });
                        
                        if (affectedAreaIds.length > 0) {
                            affectedAreaIds.forEach(id => {
                                if (window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(id);
                            });
                            if (window._clabJustSave) window._clabJustSave(); else saveAndRender();
                        }
                    }
                    alert(clabTf(action === "move" ? "dataIo.organizeSuccessMove" : "dataIo.organizeSuccessCopy", {
                        count: res.results.length,
                        path: `${archiveBase}/${workflowName}`
                    }));
                } else alert(clabT("dataIo.organizeFailed") + (res.error || clabT("dataIo.organizeErrorUnknown")));
            } catch (err) { alert(clabT("dataIo.organizeRequestFailed") + err.message); }
        };

        exportWrapper.querySelector("#clab-export-org-move").onclick = (e) => { e.stopPropagation(); organizeOutputFiles('move', false); };
        exportWrapper.querySelector("#clab-export-org-copy").onclick = (e) => { e.stopPropagation(); organizeOutputFiles('copy', false); };
        exportWrapper.querySelector("#clab-export-org-move-history").onclick = (e) => { e.stopPropagation(); organizeOutputFiles('move', true); };
        exportWrapper.querySelector("#clab-export-org-copy-history").onclick = (e) => { e.stopPropagation(); organizeOutputFiles('copy', true); };
    }
}

/** 语言切换或重绘后同步已插入面板的导入/导出下拉文案（事件仍绑在原 DOM 上） */
export function refreshInjectedDataIoLabels(panelContainer) {
    if (!panelContainer) return;

    const impBtn = panelContainer.querySelector("#clab-import-json-btn");
    if (impBtn) impBtn.title = clabT("dataIo.importJsonBtnTitle");
    const impDrop = panelContainer.querySelector("#clab-import-json-dropdown");
    if (impDrop) {
        const gts = impDrop.querySelectorAll(":scope > .clab-custom-select-group-title");
        if (gts[0]) gts[0].textContent = clabT("dataIo.importFromClipboard");
        if (gts[1]) gts[1].textContent = clabT("dataIo.importFromLocalFile");
    }
    const setTxt = (sel, key) => {
        const el = panelContainer.querySelector(sel);
        if (el) el.textContent = clabT(key);
    };
    setTxt("#clab-import-new-clip", "dataIo.importCreateTask");
    setTxt("#clab-import-append-smart-clip", "dataIo.importAppendModule");
    setTxt("#clab-import-append-sel-clip", "dataIo.importAppendToSelection");
    setTxt("#clab-import-new-local", "dataIo.importCreateTask");
    setTxt("#clab-import-append-smart-local", "dataIo.importAppendModule");
    setTxt("#clab-import-append-sel-local", "dataIo.importAppendToSelection");

    const expBtn = panelContainer.querySelector("#clab-export-json-btn");
    if (expBtn) expBtn.title = clabT("dataIo.exportBtnTitle");
    const expDrop = panelContainer.querySelector("#clab-export-json-dropdown");
    if (expDrop) {
        const gts = expDrop.querySelectorAll(":scope > .clab-custom-select-group-title");
        if (gts[0]) gts[0].textContent = clabT("dataIo.zipSectionTitle");
        if (gts[1]) gts[1].textContent = clabT("dataIo.organizeSectionTitle");
        if (gts[2]) {
            const sp = gts[2].querySelector("span");
            if (sp) sp.textContent = clabT("dataIo.exportJsonTitle");
        }
    }
    setTxt("#clab-export-media-all", "dataIo.downloadAll");
    setTxt("#clab-export-media-sel", "dataIo.downloadSelected");
    setTxt("#clab-export-media-all-history", "dataIo.downloadAllHistory");
    setTxt("#clab-export-media-sel-history", "dataIo.downloadSelectedHistory");
    setTxt("#clab-export-org-move", "dataIo.orgMoveSubfolder");
    setTxt("#clab-export-org-copy", "dataIo.orgCopySubfolder");
    setTxt("#clab-export-org-move-history", "dataIo.orgMoveSubfolderHistory");
    setTxt("#clab-export-org-copy-history", "dataIo.orgCopySubfolderHistory");
    setTxt("#clab-export-json-input", "dataIo.exportJsonInput");
    setTxt("#clab-export-json-output", "dataIo.exportJsonOutput");
    setTxt("#clab-export-json-all", "dataIo.exportJsonAll");
    setTxt("#clab-export-json-output-history", "dataIo.exportJsonOutputHistory");
    setTxt("#clab-export-json-all-history", "dataIo.exportJsonAllHistory");

    const jCopy = panelContainer.querySelector("#clab-json-action-copy");
    if (jCopy) jCopy.setAttribute("title", clabT("dataIo.jsonActionCopyTitle"));
    const jDown = panelContainer.querySelector("#clab-json-action-download");
    if (jDown) jDown.setAttribute("title", clabT("dataIo.jsonActionDownloadTitle"));
}