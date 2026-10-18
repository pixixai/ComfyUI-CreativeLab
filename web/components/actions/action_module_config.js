/**
 * action_module_config.js
 * 负责动态悬浮工具栏渲染、模块属性配置、克隆与格式刷逻辑
 */
import { state, appState, saveAndRender } from "../ui_state.js";
import { getOutputSettingsLabel, attachOutputSettingsEvents, outputSettingsIcon } from "../modules/module_output_settings.js";
import { execSyncParams } from "./action_batch_sync.js";

// 引入无感卡片生成引擎
import { generateSingleCardHTML, attachCardEvents } from "../comp_taskcard.js";
import { restoreToolbarOverflow, scheduleToolbarLayout } from "../toolbar_layout.js";

export function renderDynamicToolbar(toolbarHandleContainer) {
    restoreToolbarOverflow(toolbarHandleContainer);
    const separator = toolbarHandleContainer.querySelector('#clab-module-toolbar-separator');
    const tb = toolbarHandleContainer.querySelector('#clab-module-toolbar');
    if (!tb || !separator) return;

    const isAnySelected = (state.selectedCardIds?.length > 0) || (state.selectedAreaIds?.length > 0);
    if (!isAnySelected) {
        tb.style.display = 'none';
        separator.style.display = 'none';
        scheduleToolbarLayout(toolbarHandleContainer);
        return;
    }

    tb.style.display = 'flex';
    separator.style.display = 'block';

    let html = ``;
    let mainType = null;
    let mainArea = null;
    const cloneTools = `
        <div data-clab-overflow-label="克隆与格式刷" data-clab-overflow-priority="4" style="display:flex; align-items:center; gap:2px;">
            <button id="tb-clone-btn" class="clab-btn" style="padding:4px 8px; display:flex; align-items:center; justify-content:center; background:rgba(255,255,255,0.1); border-color:transparent; color:#aaa;" title="原样克隆选中项" onmouseover="this.style.color='#fff'" onmouseout="this.style.color='#aaa'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
            <button id="tb-format-painter" class="clab-btn" style="padding:4px 8px; display:flex; align-items:center; justify-content:center; ${state.painterMode ? 'background:#ff9800; border-color:#ff9800; color:#fff;' : 'background:rgba(255,255,255,0.1); border-color:transparent; color:#aaa;'}" title="格式刷：连续点击覆盖参数或在空白处插入克隆 (ESC/右键/工具栏点击退出)" onmouseover="if(!${state.painterMode}) this.style.color='#fff'" onmouseout="if(!${state.painterMode}) this.style.color='#aaa'">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.06 11.9l8.07-8.06a2.85 2.85 0 1 1 4.03 4.03l-8.06 8.08"></path><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"></path></svg>
            </button>
        </div>
    `;

    if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
        const selectedAreas = [];
        state.cards.forEach(c => {
            c.areas?.forEach(a => { if (state.selectedAreaIds.includes(a.id)) selectedAreas.push({ card: c, area: a }); });
        });

        if (selectedAreas.length > 0) {
            mainType = selectedAreas[0].area.type;
            mainArea = selectedAreas[0].area;

            html += `
                <div class="clab-toolbar-type" data-clab-overflow-label="模块类型" data-clab-overflow-priority="7" style="display:flex; border: 1px dashed rgba(255,255,255,0.3); border-radius: 20px; padding: 2px; gap: 2px;">
                    <div class="clab-type-btn ${mainType === 'edit' ? 'active' : ''}" data-type="edit" style="padding: 4px 14px; border-radius: 16px; cursor: pointer; font-size: 12px; transition: all 0.2s; ${mainType === 'edit' ? 'background: rgba(255,255,255,0.2); color: #fff; font-weight: bold;' : 'color: #aaa;'}">输入</div>
                    <div class="clab-type-btn ${mainType === 'preview' ? 'active' : ''}" data-type="preview" style="padding: 4px 14px; border-radius: 16px; cursor: pointer; font-size: 12px; transition: all 0.2s; ${mainType === 'preview' ? 'background: rgba(255,255,255,0.2); color: #fff; font-weight: bold;' : 'color: #aaa;'}">输出</div>
                </div>
            `;

            html += cloneTools + `<div style="width:1px; height:16px; background:rgba(255,255,255,0.25); margin:0 2px;"></div>`;

            html += `
                <div data-clab-overflow-label="重置与同步" data-clab-overflow-priority="4" style="display:flex; align-items:center; margin-left: 4px; gap: 2px;">
                    <button id="tb-reset-module" style="background:transparent; border:none; color:#aaa; cursor:pointer; padding:0; display:flex; align-items:center; justify-content:center; transition:color 0.2s, transform 0.2s; width: 28px; height: 28px;" title="重置模块参数到新建状态" onmouseover="this.style.color='#fff'; this.style.transform='rotate(-45deg)'" onmouseout="this.style.color='#aaa'; this.style.transform='rotate(0deg)'">
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
                <div style="width:1px; height:16px; background:rgba(255,255,255,0.25); margin:0 2px;"></div>
            `;

            if (mainType === 'preview') {
                html += `
                    <div class="clab-toolbar-output-settings" data-clab-overflow-label="尺寸与显示" data-clab-overflow-priority="3">
                        <button type="button" id="tb-output-settings" title="尺寸与显示：比例、宽高、显示方式、匹配媒体比例" aria-haspopup="dialog" aria-expanded="false" aria-controls="clab-output-settings-popover">
                            <span class="clab-output-settings-label">${getOutputSettingsLabel(selectedAreas.filter(sa => sa.area.type === 'preview').map(sa => sa.area))}</span>${outputSettingsIcon}
                        </button>
                    </div>
                `;
            } else if (mainType === 'edit') {
                html += `
                    <div data-clab-overflow-label="输入设置" data-clab-overflow-priority="3" style="display:flex; align-items:center; gap:6px;">
                        <label style="font-size:13px; color:#ccc; display:flex; align-items:center; gap:4px; margin-left:8px; cursor:pointer;">
                            <input id="tb-auto-height" type="checkbox" ${mainArea.autoHeight ? 'checked' : ''} style="margin:0; width:14px; height:14px;"> 参数框高度适配
                        </label>
                    </div>
                `;
            }
        }
    }

    if (!html) html = cloneTools;

    if (mainType === 'preview') {
        html += `
            <div data-clab-overflow-label="历史记录" data-clab-overflow-priority="4" style="display:flex; align-items:center; gap:2px;">
                <button id="tb-manage-history" class="clab-btn" style="padding:4px 8px; display:flex; align-items:center; justify-content:center; ${mainArea?.isManageMode ? 'background:#4CAF50; border-color:#4CAF50; color:#fff;' : 'background:rgba(255,255,255,0.1); border-color:transparent; color:#aaa;'}" title="管理生成记录 (网格视图与拖拽排序)" onmouseover="if(!${mainArea?.isManageMode}) this.style.color='#fff'" onmouseout="if(!${mainArea?.isManageMode}) this.style.color='#aaa'">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                </button>
            </div>
        `;
    }

    tb.innerHTML = html;
    scheduleToolbarLayout(toolbarHandleContainer);
}

export function attachDynamicToolbarEvents(toolbarHandleContainer) {
    const tb = toolbarHandleContainer.querySelector('#clab-module-toolbar');
    if (!tb) return;

    if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
        const selectedAreas = [];
        state.cards.forEach(c => c.areas?.forEach(a => { if (state.selectedAreaIds.includes(a.id)) selectedAreas.push({ card: c, area: a }); }));
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

        tb.querySelector('#tb-manage-history')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (!mainArea) return;
            const targetState = !mainArea.isManageMode;
            updateSelected(a => { a.isManageMode = targetState; });
        });

        tb.querySelectorAll('.clab-type-btn').forEach(btn => {
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

        tb.querySelector('#tb-reset-module')?.addEventListener('click', (e) => {
            e.stopPropagation();
            updateSelected(a => {
                a.targetNodeId = null; a.targetWidget = null; a.targetNodeIds = []; a.targetWidgets = [];
                if (a.type === 'preview') {
                    a.matchMedia = true; a.ratio = '16:9'; a.fillMode = '显示全部'; a.width = ''; a.height = '';
                    a.isManageMode = false;
                } else {
                    a.dataType = 'string'; a.autoHeight = true;
                }
            });
        });

        tb.querySelector('#tb-btn-sync-params')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mainArea && selectedAreas.length > 0) {
                execSyncParams(mainArea, selectedAreas[0].card);
            }
        });

        const autoCb = tb.querySelector('#tb-auto-height');
        if (autoCb) autoCb.onchange = e => updateSelected(a => a.autoHeight = e.target.checked);
    }
    attachOutputSettingsEvents(tb);

    tb.querySelector('#tb-clone-btn')?.addEventListener('click', (e) => {
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
                sortedAreaIdsToClone.forEach(areaId => {
                    const srcArea = card.areas.find(a => a.id === areaId);
                    if (srcArea) {
                        // 【克隆修复】：原封不动地保留所有属性，不再清空历史记录！
                        const newArea = JSON.parse(JSON.stringify(srcArea));
                        newArea.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 10000);
                        clonedAreas.push(newArea);
                        newSelectedAreaIds.push(newArea.id);
                    }
                });

                state.selectedAreaIds = newSelectedAreaIds;
                appState.lastClickedAreaId = newSelectedAreaIds[newSelectedAreaIds.length - 1];

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
                    document.querySelector(`.clab-area[data-area-id="${newSelectedAreaIds[newSelectedAreaIds.length - 1]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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
                    if (newCard.areas) {
                        newCard.areas.forEach((a, aIdx) => {
                            a.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + aIdx;
                        });
                    }
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
                if (wrapper) {
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
                        document.querySelector(`.clab-card[data-card-id="${newSelectedCardIds[newSelectedCardIds.length - 1]}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                }, 50);
            }).catch(err => {
                console.error("[CLab] 动态加载卡片引擎失败，降级为全量刷新:", err);
                saveAndRender();
            });
        }
    });

    tb.querySelector('#tb-format-painter')?.addEventListener('click', (e) => {
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
                    clonedData.resultUrl = '';
                    clonedData.history = [];
                    clonedData.historyIndex = 0;
                    clonedData.selectedThumbIndices = [];
                }
                state.painterSource = { type: 'area', data: clonedData };

            } else if (state.selectedCardIds && state.selectedCardIds.length > 0) {
                const srcCard = state.cards.find(c => c.id === state.selectedCardIds[0]);

                // 【格式刷修复】：同理，提取卡片级的“源墨水”时，遍历剥离所有子模块的历史记录！
                const clonedCard = JSON.parse(JSON.stringify(srcCard));
                if (clonedCard && clonedCard.areas) {
                    clonedCard.areas.forEach(a => {
                        if (a.type === 'preview') {
                            a.resultUrl = '';
                            a.history = [];
                            a.historyIndex = 0;
                            a.selectedThumbIndices = [];
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
