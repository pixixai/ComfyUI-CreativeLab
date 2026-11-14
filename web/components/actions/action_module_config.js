import { hasCardWindow,cardWindow,revealWorkspaceTarget } from '../workspace_modes/card_window.js';
/**
 * action_module_config.js
 * 负责动态悬浮工具栏渲染、模块属性配置、克隆与格式刷逻辑
 */
import { clearPreviewHistory, remapHistoryModuleIds } from "../modules/media_types/media_utils.js";
import { state, appState, saveAndRender, getActiveWorkspace } from "../ui_state.js";
import { execSyncParams } from "./action_batch_sync.js";

// 引入无感卡片生成引擎
import { generateSingleCardHTML, attachCardEvents } from "../comp_taskcard.js";
import { restoreToolbarOverflow, refreshToolbarItems } from "../toolbar_layout.js";
import { cellSettingsIcon, tableResetIcon } from "../workspace_modes/table_icons.js";
import { selectedTableColumns } from "../workspace_modes/table_sheet.js";

const toolbarMarkup=new WeakMap();
function paintToolbar(handle,tb,html,display){
    if(toolbarMarkup.get(tb)===html&&tb.style.display===display){refreshToolbarItems(handle);return;}
    tb.innerHTML=html;tb.style.display=display;toolbarMarkup.set(tb,html);refreshToolbarItems(handle);
}
function selectedModules(){
    const ids=new Set(state.selectedAreaIds),result=[];
    if(ids.size===1&&state.activeCardId){const card=state.cards.find(card=>card.id===state.activeCardId),area=card?.areas.find(area=>ids.has(area.id));if(area)return [{card,area}];}
    for(const card of state.cards){for(const area of card.areas||[])if(ids.has(area.id)){result.push({card,area});if(result.length===ids.size)return result;}}
    return result;
}

const typeTools = type => `
                <div class="clab-toolbar-type" role="group" aria-label="模块类型">
                    <button type="button" class="clab-type-btn ${type === 'edit' ? 'active' : ''}" data-type="edit" aria-pressed="${type === 'edit'}">输入</button>
                    <button type="button" class="clab-type-btn ${type === 'preview' ? 'active' : ''}" data-type="preview" aria-pressed="${type === 'preview'}">输出</button>
                </div>
    `;

const historyTool = mainArea => `
            <div class="clab-tool-pair">
                <button id="tb-manage-history" class="clab-btn" aria-pressed="${Boolean(mainArea?.isManageMode)}" title="管理生成记录 (网格视图与拖拽排序)" onmouseover="if(!${mainArea?.isManageMode}) this.style.color='#fff'" onmouseout="if(!${mainArea?.isManageMode}) this.style.color='#aaa'">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
            </div>
        `;

export function renderDynamicToolbar(toolbarHandleContainer) {
    restoreToolbarOverflow(toolbarHandleContainer);
    const tb = toolbarHandleContainer.querySelector('#clab-module-toolbar');
    if (!tb) return;

    const view = getActiveWorkspace()?.view;
    const mode = view?.mode;
    if (mode === 'xy') {
        paintToolbar(toolbarHandleContainer,tb,'','none');
        return;
    }

    const isAnySelected = state.selectedCardIds.length || state.selectedAreaIds.length;
    if (mode === 'table') {
        const table = view.table;
        const selected = new Set(state.selectedAreaIds);
        const sheet = selected.size && Array.isArray(table?.sheets) ? table.sheets.find(item => item.id === table.sheetId) : null;
        const [column] = selectedTableColumns(sheet, state.cards, selected);
        const output = column?.type === 'preview'
            ? state.cards.flatMap(card => card.areas).find(area => area.type === 'preview' && selected.has(area.id))
            : null;
        const html = (column ? typeTools(column.type) +
            `<button type="button" class="clab-btn" id="tb-reset-table-columns" title="重置所选列的标题、类型、绑定和取值（保留历史）">${tableResetIcon}</button>` : '') +
            `<button type="button" class="clab-btn clab-table-toolbar-settings" id="tb-table-cell-settings" aria-haspopup="dialog" title="设置单元格的尺寸与外观">${cellSettingsIcon}<span>单元格设置</span></button>` +
            (output ? historyTool(output) : '');
        paintToolbar(toolbarHandleContainer,tb,html,'flex');
        return;
    }
    if (!isAnySelected) {
        paintToolbar(toolbarHandleContainer,tb,'','none');
        return;
    }

    tb.style.display = 'flex';

    let html = ``;
    let mainType = null;
    let mainArea = null;
    const cloneTools = `
        <div class="clab-tool-pair">
            <button id="tb-clone-btn" class="clab-btn" style="padding:4px 8px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.1); border-color:transparent; color:#aaa;" title="原样克隆选中项" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#aaa'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button id="tb-format-painter" class="clab-btn" aria-pressed="${state.painterMode}" title="格式刷：连续点击覆盖参数或在空白处插入克隆 (ESC/右键/工具栏点击退出)" onmouseover="if(!${state.painterMode}) this.style.color='#fff'" onmouseout="if(!${state.painterMode}) this.style.color='#aaa'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"></path><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"></path></svg>
            </button>
        </div>
    `;

    if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
        const selectedAreas = selectedModules();

        if (selectedAreas.length > 0) {
            mainType = selectedAreas[0].area.type;
            mainArea = selectedAreas[0].area;

            html += typeTools(mainType);

            html += cloneTools;

            html += `
                <div class="clab-tool-pair">
                    <button id="tb-reset-module" style="background:transparent; border:none; color:#aaa; cursor:pointer; padding:0; display:flex; align-items:center; justify-content:center; transition:color 0.2s, transform 0.2s; width: 28px; height: 28px;" title="重置模块参数到新建状态" >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                    </button>

                    <button class="clab-btn" id="tb-btn-sync-params" title="同步参数至其它任务相同位置" style="padding: 0; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; color: #aaa; transition: color 0.2s;" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#aaa'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M4 12v-2.5c0-1.93 1.57-3.5 3.5-3.5h11"/>
                            <polyline points="15 2 19 6 15 10"/>
                            <path d="M20 12v2.5c0 1.93-1.57 3.5-3.5 3.5h-11"/>
                            <polyline points="9 22 5 18 9 14"/>
                        </svg>
                    </button>
                </div>
            `;

            if (mainType === 'edit') {
                html += `
                    <div class="clab-tool-pair">
                        <label class="clab-auto-height" title="参数框高度适配">
                            <input id="tb-auto-height" type="checkbox" ${mainArea.autoHeight ? 'checked' : ''} > 参数框高度适配
                        </label>
                    </div>
                `;
            }
        }
    }

    if (!html) html = cloneTools;

    if (mainType === 'preview') html += historyTool(mainArea);
    paintToolbar(toolbarHandleContainer,tb,html,'flex');
}

export function attachDynamicToolbarEvents(toolbarHandleContainer) {
    const tb = toolbarHandleContainer.querySelector('#clab-module-toolbar');
    if (!tb) return;
    const onClick=(selector,handler)=>{const button=tb.querySelector(selector);if(button)button.onclick=handler;};

    if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
        const selectedAreas = selectedModules();
        const mainType = selectedAreas[0]?.area.type;
        const mainArea = selectedAreas[0]?.area;

        const updateSelected = updater => {
            selectedAreas.forEach(sa => {
                if (sa.area.type !== mainType) return;
                updater(sa.area);
                if (window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(sa.area.id);
            });
            if (window._clabJustSave) window._clabJustSave(); else saveAndRender();
            renderDynamicToolbar(toolbarHandleContainer);
            attachDynamicToolbarEvents(toolbarHandleContainer);
            if (window._clabUpdateAllDefaultTitles) window._clabUpdateAllDefaultTitles();
        };

        onClick('#tb-manage-history', (e) => {
            e.stopPropagation();
            if (!mainArea) return;
            const targetState = !mainArea.isManageMode;
            updateSelected(a => { a.isManageMode = targetState; });
        });

        if (getActiveWorkspace()?.view?.mode !== 'table') tb.querySelectorAll('.clab-type-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const newType = btn.dataset.type;
                if (newType === mainType) return;

                updateSelected(a => {
                    a.type = newType;
                    if (newType === 'preview') {
                        a.matchMedia = a.matchMedia ?? true;
                        a.ratio = a.ratio ?? '16:9';
                        a.fillMode = a.fillMode ?? '显示全部';
                        a.isManageMode = false;
                    } else {
                        a.dataType = a.dataType ?? 'string';
                        a.autoHeight = a.autoHeight ?? true;
                    }
                });
            };
        });

        onClick('#tb-reset-module', (e) => {
            e.stopPropagation();
            updateSelected(a => {
                a.targetNodeId = null; a.targetWidget = null; a.targetNodeIds = []; a.targetWidgets = [];
                if (a.type === 'preview') {
                    a.matchMedia = true; a.ratio = '16:9'; a.fillMode = '显示全部'; a.width = ''; a.height = '';
                    a.isManageMode = false;
                } else {
                    a.dataType = 'string'; a.autoHeight = true; a.showUploadPreview = false;
                }
            });
        });

        onClick('#tb-btn-sync-params', (e) => {
            e.stopPropagation();
            if (mainArea && selectedAreas.length > 0) {
                execSyncParams(mainArea, selectedAreas[0].card);
            }
        });

        const autoCb = tb.querySelector('#tb-auto-height');
        if (autoCb) autoCb.onchange = e => updateSelected(a => a.autoHeight = e.target.checked);
    }

    onClick('#tb-clone-btn', (e) => {
        e.stopPropagation();

        if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
            let newSelectedAreaIds = [];
            const areasByCard = {};
            state.selectedAreaIds.forEach(areaId => {
                const card = state.cards.find(c => c.areas?.some(a => a.id === areaId));
                if (card) {
                    if (!areasByCard[card.id]) areasByCard[card.id] = [];
                    areasByCard[card.id].push(areaId);
                }
            });

            document.querySelectorAll('.clab-area.active').forEach(el => el.classList.remove('active', 'selected'));

            for (const cardId in areasByCard) {
                const card = state.cards.find(c => c.id === cardId);
                if (!card || !card.areas) continue;

                const sortedAreaIdsToClone = areasByCard[cardId].sort((idA, idB) => {
                    return card.areas.findIndex(a => a.id === idA) - card.areas.findIndex(a => a.id === idB);
                });

                const lastSrcIndex = card.areas.findIndex(a => a.id === sortedAreaIdsToClone[sortedAreaIdsToClone.length - 1]);
                let insertBaseIndex = lastSrcIndex + 1;

                const clonedAreas = [];
                const historyIdMap = new Map();
                sortedAreaIdsToClone.forEach(areaId => {
                    const srcArea = card.areas.find(a => a.id === areaId);
                    if (srcArea) {
                        // 【克隆修复】：原封不动地保留所有属性，不再清空历史记录！
                        const newArea = JSON.parse(JSON.stringify(srcArea));
                        newArea.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
                        historyIdMap.set(srcArea.id, newArea.id);
                        clonedAreas.push(newArea);
                        newSelectedAreaIds.push(newArea.id);
                    }
                });

                state.selectedAreaIds = newSelectedAreaIds;
                appState.lastClickedAreaId = newSelectedAreaIds[newSelectedAreaIds.length - 1];

                remapHistoryModuleIds(clonedAreas, historyIdMap);
                card.areas.splice(insertBaseIndex, 0, ...clonedAreas);

                const lastEl = document.querySelector(`.clab-area[data-area-id="${sortedAreaIdsToClone[sortedAreaIdsToClone.length - 1]}"]`);
                if (lastEl && window._clabGenerateAreaHTML && window._clabAttachAreaEvents) {
                    const temp = document.createElement('div');
                    temp.innerHTML = clonedAreas.map(a => window._clabGenerateAreaHTML(a, card)).join('');
                    const frag = document.createDocumentFragment();
                    while (temp.firstChild) frag.appendChild(temp.firstChild);
                    lastEl.parentNode.insertBefore(frag, lastEl.nextSibling);
                    window._clabAttachAreaEvents(lastEl.parentNode);
                }
            }

            if (window._clabJustSave) window._clabJustSave(); else saveAndRender();

            renderDynamicToolbar(toolbarHandleContainer);
            attachDynamicToolbarEvents(toolbarHandleContainer);
            if (window._clabUpdateAllDefaultTitles) window._clabUpdateAllDefaultTitles();
            if (window.CLab && window.CLab.updateSelectionUI) {
                window.CLab.updateSelectionUI();
            }

            setTimeout(() => {
                if (newSelectedAreaIds.length > 0) {
                    revealWorkspaceTarget(document.querySelector('#clab-cards-container'),null,newSelectedAreaIds[newSelectedAreaIds.length - 1])?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 50);

        } else if (state.selectedCardIds && state.selectedCardIds.length > 0) {
            let newSelectedCardIds = [];
            const sortedCardIdsToClone = [...state.selectedCardIds].sort((idA, idB) => {
                return state.cards.findIndex(c => c.id === idA) - state.cards.findIndex(c => c.id === idB);
            });

            const lastSrcIndex = state.cards.findIndex(c => c.id === sortedCardIdsToClone[sortedCardIdsToClone.length - 1]);
            let insertBaseIndex = lastSrcIndex + 1;

            const clonedCards = [];
            sortedCardIdsToClone.forEach((cardId, indexOffset) => {
                const srcCard = state.cards.find(c => c.id === cardId);
                if (srcCard) {
                    // 【克隆修复】：原封不动地保留所有属性，不再清空历史记录！
                    const newCard = JSON.parse(JSON.stringify(srcCard));
                    newCard.id = 'card_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + indexOffset;
                    const historyIdMap = new Map();
                    if (newCard.areas) {
                        newCard.areas.forEach((a, aIdx) => {
                            const oldId = a.id;
                            a.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + aIdx;
                            historyIdMap.set(oldId, a.id);
                        });
                    }
                    remapHistoryModuleIds(newCard.areas || [], historyIdMap);
                    clonedCards.push(newCard);
                    newSelectedCardIds.push(newCard.id);
                }
            });

            document.querySelectorAll('.clab-card.active').forEach(el => {
                el.classList.remove('active', 'selected');
                el.style.borderColor = '';
            });

            state.cards.splice(insertBaseIndex, 0, ...clonedCards);
            state.selectedCardIds = newSelectedCardIds;
            state.activeCardId = newSelectedCardIds[newSelectedCardIds.length - 1];
            appState.lastClickedCardId = state.activeCardId;

            import("../comp_taskcard.js").then(taskcard => {
                const wrapper = document.querySelector('.clab-cards-wrapper');
                const container=document.querySelector('#clab-cards-container');
                if(hasCardWindow(container))cardWindow(container).update();
                else if (wrapper) {
                    const temp = document.createElement('div');
                    clonedCards.forEach((c, idx) => {
                        temp.innerHTML += taskcard.generateSingleCardHTML(c, insertBaseIndex + idx);
                    });

                    const frag = document.createDocumentFragment();
                    while (temp.firstChild) frag.appendChild(temp.firstChild);

                    const lastSrcCardId = sortedCardIdsToClone[sortedCardIdsToClone.length - 1];
                    const lastSrcEl = wrapper.querySelector(`.clab-card[data-card-id="${lastSrcCardId}"]`);

                    if (lastSrcEl && lastSrcEl.nextSibling) {
                        wrapper.insertBefore(frag, lastSrcEl.nextSibling);
                    } else {
                        wrapper.appendChild(frag);
                    }

                    taskcard.attachCardEvents(wrapper);
                    if (window._clabAttachAreaEvents) window._clabAttachAreaEvents(wrapper);
                }

                if (window._clabJustSave) window._clabJustSave();
                if (window.CLab && window.CLab.updateSelectionUI) window.CLab.updateSelectionUI();
                if (window._clabUpdateAllDefaultTitles) window._clabUpdateAllDefaultTitles();
                if (window._clabUpdateCardsLayout) window._clabUpdateCardsLayout();

                setTimeout(() => {
                    if (newSelectedCardIds.length > 0) {
                        revealWorkspaceTarget(document.querySelector('#clab-cards-container'),newSelectedCardIds[newSelectedCardIds.length - 1])?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }, 50);
            }).catch(err => {
                console.error("[CLab] 动态加载卡片引擎失败，降级为全量刷新:", err);
                saveAndRender();
            });
        }
    });

    onClick('#tb-format-painter', (e) => {
        e.stopPropagation();
        const panelContainer = document.getElementById('clab-panel');
        if (state.painterMode) {
            state.painterMode = false;
            state.painterSource = null;
            if (panelContainer) panelContainer.classList.remove('clab-painter-active');
        } else {
            state.painterMode = true;
            if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
                let srcArea = null;
                state.cards.forEach(c => c.areas?.forEach(a => { if (a.id === state.selectedAreaIds[0]) srcArea = a; }));

                // 【格式刷修复】：在提取“源墨水”时，直接剥离并清空所有的历史记录与图库状态！
                const clonedData = JSON.parse(JSON.stringify(srcArea));
                if (clonedData && clonedData.type === 'preview') {
                    clearPreviewHistory(clonedData);
                }
                state.painterSource = { type: 'area', data: clonedData };

            } else if (state.selectedCardIds && state.selectedCardIds.length > 0) {
                const srcCard = state.cards.find(c => c.id === state.selectedCardIds[0]);

                // 【格式刷修复】：同理，提取卡片级的“源墨水”时，遍历剥离所有子模块的历史记录！
                const clonedCard = JSON.parse(JSON.stringify(srcCard));
                if (clonedCard && clonedCard.areas) {
                    clonedCard.areas.forEach(a => {
                        if (a.type === 'preview') {
                            clearPreviewHistory(a);
                        }
                    });
                }
                state.painterSource = { type: 'card', data: clonedCard };
            }
            if (panelContainer) panelContainer.classList.add('clab-painter-active');
        }
        renderDynamicToolbar(toolbarHandleContainer);
        attachDynamicToolbarEvents(toolbarHandleContainer);
    });
}
