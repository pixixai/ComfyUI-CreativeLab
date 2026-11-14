import { openMaintenancePanel } from './actions/action_maintenance_panel.js';
/**
 * 文件名: comp_toolbar.js
 * 职责: 顶部静态工具栏 UI 容器
 */
import { state, appState, saveAndRender } from "./ui_state.js";
import { attachDataIOEvents } from "./actions/action_data_io.js";
import { attachRunEvents } from "./actions/action_run_executor.js";
import { renderDynamicToolbar as renderDynamic, attachDynamicToolbarEvents as attachDynamic } from "./actions/action_module_config.js";
import { hasCardWindow,cardWindow,revealWorkspaceTarget } from './workspace_modes/card_window.js';
import { generateSingleCardHTML, attachCardEvents } from "./comp_taskcard.js";
import { generateAreaHTML, attachAreaEvents, justSave } from "./comp_modulearea.js";
import { updateSelectionUI } from "./ui_selection.js";
import { setupResponsiveToolbar } from "./toolbar_layout.js";

// --- 初始化静态工具栏事件 ---
export function setupStaticToolbarEvents(panelContainer) {
    if (!window._clabGlobalDropdownCatcher) {
        document.addEventListener('mousedown', (e) => {
            ['clab-import-json-wrapper', 'clab-run-btn-wrapper'].forEach(id => {
                const wrapper = document.getElementById(id);
                if (wrapper && !wrapper.contains(e.target)) {
                    const dp = wrapper.querySelector('.clab-custom-select-dropdown');
                    if (dp) dp.style.display = 'none';
                }
            });
            const batchWrapper = document.getElementById('tb-batch-sync-btn')?.parentNode;
            if (batchWrapper && !batchWrapper.contains(e.target)) {
                const dp = document.getElementById('tb-batch-sync-dropdown');
                if (dp) dp.style.display = 'none';
            }
            if (!e.target.closest('.clab-custom-select')) {
                document.querySelectorAll('.clab-custom-select.open').forEach(el => {
                    el.classList.remove('open');
                    const area = el.closest('.clab-area');
                    if (area) area.style.zIndex = '';
                });
            }
        }, true);
        window._clabGlobalDropdownCatcher = true;
    }

    // 【极速新建任务】：使用 insertAdjacentHTML 做外科手术拼贴
    panelContainer.querySelector("#clab-global-add-card").onclick = () => {
        let insertIndex = state.cards.length; 
        if (state.selectedCardIds && state.selectedCardIds.length > 0) {
            const idx = state.cards.findIndex(c => c.id === state.selectedCardIds[0]);
            if (idx !== -1) insertIndex = idx + 1;
        } else if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
            const cardIdx = state.cards.findIndex(c => c.areas?.some(a => a.id === state.selectedAreaIds[0]));
            if (cardIdx !== -1) insertIndex = cardIdx + 1;
        }

        const newCard = { id: 'card_' + Date.now(), title: ``, areas: [] };
        state.cards.splice(insertIndex, 0, newCard);
        
        state.selectedCardIds = [newCard.id];
        state.activeCardId = newCard.id;
        state.selectedAreaIds = [];
        appState.lastClickedCardId = newCard.id;
        
        const wrapper = panelContainer.querySelector('.clab-cards-wrapper');
        if (hasCardWindow(panelContainer.querySelector('#clab-cards-container'))) cardWindow(panelContainer.querySelector('#clab-cards-container')).update();
        else if (wrapper) {
            const temp = document.createElement('div');
            temp.innerHTML = generateSingleCardHTML(newCard, insertIndex);
            const newEl = temp.firstElementChild;
            
            // 【干净利落的插入逻辑】：不再去寻找幽灵大按钮了，直接追加到末尾即可！
            if (insertIndex >= state.cards.length - 1) {
                wrapper.appendChild(newEl);
            } else {
                const nextCard = state.cards[insertIndex + 1];
                const nextEl = wrapper.querySelector(`.clab-card[data-card-id="${nextCard.id}"]`);
                wrapper.insertBefore(newEl, nextEl);
            }
            attachCardEvents(wrapper);
            // 触发全新动态排版引擎，确保居中或左对齐计算准确
            if (window._clabUpdateCardsLayout) window._clabUpdateCardsLayout();
        }

        justSave();
        updateSelectionUI();
        
        setTimeout(() => {
            const container = panelContainer.querySelector("#clab-cards-container");
            if (container) {
                const newCardEl = revealWorkspaceTarget(container,newCard.id);
                if (newCardEl) newCardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }, 50);
    };

    // 【极速新建模块】：支持跨卡片多选模块并发插入、多选卡片并发插入！
    panelContainer.querySelector("#clab-global-add-module").onclick = () => {
        let insertionTasks = [];
        
        if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
            // 【终极增强】：遍历所有卡片，找出所有被选中的模块。
            // 采用“倒序(Descending)索引排序”！这样在同一个卡片内连续插入多个模块时，从下往上插，数组索引绝对不会错乱偏移！
            state.cards.forEach(card => {
                if (!card.areas) return;
                let selectedIndices = [];
                card.areas.forEach((a, idx) => {
                    if (state.selectedAreaIds.includes(a.id)) selectedIndices.push(idx);
                });
                
                selectedIndices.sort((a, b) => b - a); // 从大到小排列
                
                selectedIndices.forEach(idx => {
                    insertionTasks.push({ card: card, insertIndex: idx + 1 });
                });
            });
        } else if (state.selectedCardIds && state.selectedCardIds.length > 0) {
            // 遍历所有选中的卡片，支持矩阵式并发创建到末尾
            state.selectedCardIds.forEach(cardId => {
                const targetCard = state.cards.find(c => c.id === cardId);
                if (targetCard) {
                    insertionTasks.push({ card: targetCard, insertIndex: targetCard.areas ? targetCard.areas.length : 0 });
                }
            });
        }

        if (insertionTasks.length === 0) return alert("请先选中一个或多个任务卡片/模块，以确定新建位置！");

        const newlyCreatedAreaIds = [];
        let lastCreatedAreaId = null;

        insertionTasks.forEach((task, idx) => {
            const targetCard = task.card;
            if (!targetCard.areas) targetCard.areas = [];
            const insertIndex = task.insertIndex;
            
            // 加入 idx 盐值，防止并发创建时出现完全相同的 ID
            const templateArea = { id: 'area_' + Date.now() + '_' + Math.floor(Math.random() * 10000) + idx, type: 'edit', targetNodeId: null, targetWidget: null, value: '', dataType: 'string', autoHeight: true };
            
            targetCard.areas.splice(insertIndex, 0, templateArea);
            newlyCreatedAreaIds.push(templateArea.id);
            lastCreatedAreaId = templateArea.id;

            const cardBody = document.querySelector(`.clab-card[data-card-id="${targetCard.id}"] .clab-area-list`);
            if (cardBody) {
                const temp = document.createElement('div');
                temp.innerHTML = generateAreaHTML(templateArea, targetCard);
                const newEl = temp.firstElementChild;
                
                if (insertIndex >= targetCard.areas.length - 1) {
                    cardBody.appendChild(newEl);
                } else {
                    const nextArea = targetCard.areas[insertIndex + 1];
                    const nextEl = cardBody.querySelector(`.clab-area[data-area-id="${nextArea.id}"]`);
                    if (nextEl) cardBody.insertBefore(newEl, nextEl);
                    else cardBody.appendChild(newEl);
                }
                attachAreaEvents(cardBody);
            }
        });

        // 选中所有刚生成的空白模块
        state.selectedAreaIds = newlyCreatedAreaIds;
        state.selectedCardIds = [];
        appState.lastClickedAreaId = lastCreatedAreaId;

        justSave();
        updateSelectionUI();
        
        setTimeout(() => {
            if (lastCreatedAreaId) {
                const el = document.querySelector(`.clab-area[data-area-id="${lastCreatedAreaId}"]`);
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 50);
    };

    attachDataIOEvents(panelContainer);
    attachRunEvents(panelContainer);
    const previewButton = panelContainer.querySelector("#clab-btn-preview");
    previewButton.onclick = async () => {
        const { openWorkspacePreview } = await import("./contextmenu/group_content.js");
        const overflow = previewButton.closest(".clab-toolbar-overflow-menu:popover-open");
        if (overflow) overflow.hidePopover();
        openWorkspacePreview(overflow ? panelContainer.querySelector("#clab-toolbar-more") : previewButton);
    };

    const maintenanceSlot = panelContainer.querySelector("#clab-maintenance-slot");
    if (maintenanceSlot) {
        maintenanceSlot.outerHTML = `<div id="clab-config-btn-wrapper" class="clab-btn-group"><button type="button" class="clab-btn" id="clab-config-dropdown-trigger" title="数据维护">数据维护</button></div>`;
        panelContainer.querySelector('#clab-config-dropdown-trigger').onclick=event=>openMaintenancePanel(event.currentTarget);
    }
    setupResponsiveToolbar(panelContainer.querySelector('#clab-toolbar-handle'));
}

export function renderDynamicToolbar(container) { renderDynamic(container); }
export function attachDynamicToolbarEvents(container) { attachDynamic(container); }
