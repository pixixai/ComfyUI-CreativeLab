import { hasCardWindow } from '../workspace_modes/card_window.js';
/**
 * 文件名: action_data_io.js
 * 路径: web/components/actions/action_data_io.js
 * 职责: 负责导入 JSON 和上传文件
 */
import { state, appState } from "../ui_state.js";
import { app } from "../../../../scripts/app.js";

// 【引入微创渲染引擎与静态保存】
import { generateSingleCardHTML, attachCardEvents } from "../comp_taskcard.js"; 
import { generateAreaHTML, attachAreaEvents, justSave } from "../comp_modulearea.js"; 
import { updateSelectionUI } from "../ui_selection.js";

// =========================================================================
// 核心网络请求：上传本地文件到服务器并返回文件名
// =========================================================================
export async function uploadImageToServer(file, subfolder = '') {
    const formData = new FormData();
    formData.append('image', file);
    if (subfolder) formData.append('subfolder', subfolder);
    const resp = await fetch('/upload/image', {
        method: 'POST',
        body: formData
    });
    if(!resp.ok) throw new Error(resp.statusText);
    const data = await resp.json();
    if (!data.name) throw new Error(data.error || '上传失败，未返回文件名');
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
                <button class="clab-btn" id="clab-import-json-btn" title="批量导入JSON快速构建" style="padding: 0; width: 34px; height: 34px; display:flex; align-items:center; justify-content:center;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <div id="clab-import-json-dropdown" class="clab-custom-select-dropdown clab-toolbar-menu" style="display:none; top: calc(100% + 4px); left: 0; min-width: 170px; z-index: 10002;">
                    <div class="clab-custom-select-group-title">从剪切板导入JSON数据</div>
                    <div class="clab-custom-select-item" id="clab-import-new-clip">创建任务</div>
                    <div class="clab-custom-select-item" id="clab-import-append-smart-clip">追加模块</div>
                    <div class="clab-custom-select-item" id="clab-import-append-sel-clip">追加模块到选中</div>
                    
                    <div class="clab-custom-select-group-title">从本地文件导入JSON数据</div>
                    <div class="clab-custom-select-item" id="clab-import-new-local">创建任务</div>
                    <div class="clab-custom-select-item" id="clab-import-append-smart-local">追加模块</div>
                    <div class="clab-custom-select-item" id="clab-import-append-sel-local">追加模块到选中</div>
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
                if (dataArray.length === 0) return alert("导入的数据为空！");

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
                        return alert("【追加失败】\n请先点击选中一个或多个任务卡片（支持 Ctrl 多选），然后再执行“追加模块到选中”！");
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
                if (newCardsToDOM.length > 0 && cardsWrapper&&!hasCardWindow(cardsWrapper.closest('#clab-cards-container'))) {
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
                alert("导入失败：无法解析 JSON 数据。\n" + e.message);
            }
        };

        const handleClipboardImport = async (mode) => {
            dropdown.style.display = 'none';
            try {
                const text = await navigator.clipboard.readText();
                if (!text) return alert("剪切板为空，请先复制 JSON 数据！");
                processImportedJSON(text, mode);
            } catch (err) {
                alert("无法读取剪切板。\n" + err.message);
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
}
