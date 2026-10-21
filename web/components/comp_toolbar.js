/**
 * 文件名: comp_toolbar.js
 * 职责: 顶部静态工具栏 UI 容器
 */
import { state, appState, saveAndRender } from "./ui_state.js";
import { attachDataIOEvents } from "./actions/action_data_io.js";
import { attachRunEvents } from "./actions/action_run_executor.js";
import { renderDynamicToolbar as renderDynamic, attachDynamicToolbarEvents as attachDynamic } from "./actions/action_module_config.js";
import { generateSingleCardHTML, attachCardEvents } from "./comp_taskcard.js";
import { generateAreaHTML, attachAreaEvents, justSave } from "./comp_modulearea.js";
import { updateSelectionUI } from "./ui_selection.js";
import { resyncRecords, cleanDeadRecords } from "./actions/action_record_maintenance.js";
import { setupResponsiveToolbar } from "./toolbar_layout.js";

// --- 初始化静态工具栏事件 ---
export function setupStaticToolbarEvents(panelContainer) {
    if (!window._clabGlobalDropdownCatcher) {
        document.addEventListener('mousedown', (e) => {
            ['clab-import-json-wrapper', 'clab-export-json-wrapper', 'clab-run-btn-wrapper'].forEach(id => {
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
        if (wrapper) {
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
                const newCardEl = container.querySelector(`[data-card-id="${newCard.id}"]`);
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

    const configBtn = panelContainer.querySelector("#clab-btn-config");
    if (configBtn && !panelContainer.querySelector("#clab-config-btn-wrapper")) {
        configBtn.outerHTML = `
            <div id="clab-config-btn-wrapper" class="clab-btn-group" style="position:relative; display:inline-flex; align-items:stretch; height: 34px;">
                <button class="clab-btn" id="clab-btn-config" title="创建配置锚点 (将数据保存至工作流)" style="border-top-right-radius:0; border-bottom-right-radius:0; padding:0 10px; border-right:1px solid rgba(255,255,255,0.1); height: 100%; display: flex; align-items: center;">
                    ⚓ 创建配置锚点
                </button>
                <button class="clab-btn" id="clab-config-dropdown-trigger" style="border-top-left-radius:0; border-bottom-left-radius:0; width:24px; padding:0; display:flex; align-items:center; justify-content:center; height: 100%;">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </button>
                <div id="clab-config-dropdown" class="clab-custom-select-dropdown clab-toolbar-menu" style="display:none; top:calc(100% + 4px); right:0; min-width:180px; z-index:10002;">
                    <div class="clab-custom-select-group-title">数据维护中心</div>
                    <div class="clab-custom-select-item" id="clab-maint-clean-dead">清理失效记录 (404)</div>
                    <div class="clab-custom-select-item" id="clab-maint-resync">重新同步记录 (强制刷新)</div>
                </div>
            </div>
        `;

        if (!window._clabConfigDropdownCatcher) {
            document.addEventListener('mousedown', (e) => {
                const wrapper = document.getElementById('clab-config-btn-wrapper');
                if (wrapper && !wrapper.contains(e.target)) {
                    const dp = document.getElementById('clab-config-dropdown');
                    if (dp) dp.style.display = 'none';
                }
            }, true);
            window._clabConfigDropdownCatcher = true;
        }

        const wrapper = panelContainer.querySelector("#clab-config-btn-wrapper");
        
        wrapper.querySelector("#clab-btn-config").onclick = () => {
            if(window.CLab) window.CLab.createNode();
        };

        wrapper.querySelector("#clab-config-dropdown-trigger").onclick = (e) => {
            e.stopPropagation();
            const dropdown = wrapper.querySelector("#clab-config-dropdown");
            const isVisible = dropdown.style.display === 'block';
            document.querySelectorAll('.clab-custom-select-dropdown').forEach(d => d.style.display = 'none');
            dropdown.style.display = isVisible ? 'none' : 'block';
        };

        wrapper.querySelector("#clab-maint-resync").onclick = () => {
            wrapper.querySelector("#clab-config-dropdown").style.display = 'none';
            return resyncRecords();
        };
        wrapper.querySelector("#clab-maint-clean-dead").onclick = () => {
            wrapper.querySelector("#clab-config-dropdown").style.display = 'none';
            return cleanDeadRecords();
        };
    }
    setupResponsiveToolbar(panelContainer.querySelector('#clab-toolbar-handle'));
}

export function renderDynamicToolbar(container) { renderDynamic(container); }
export function attachDynamicToolbarEvents(container) { attachDynamic(container); }
