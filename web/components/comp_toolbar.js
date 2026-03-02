/**
 * 文件名: comp_toolbar.js
 * 路径: web/components/comp_toolbar.js
 * 职责: 顶部静态工具栏 UI 容器 - 极度瘦身，负责向外暴露组装好的 UI 与事件入口
 */
import { state, appState, saveAndRender } from "./ui_state.js";
import { attachDataIOEvents } from "./actions/action_data_io.js";
import { attachRunEvents } from "./actions/action_run_executor.js";
import { renderDynamicToolbar as renderDynamic, attachDynamicToolbarEvents as attachDynamic } from "./actions/action_module_config.js";

// --- 初始化静态工具栏事件 (仅调用一次) ---
export function setupStaticToolbarEvents(panelContainer) {
    // 全局捕获器：彻底解决在模块上点击无法关闭下拉菜单的 Bug
    if (!window._slGlobalDropdownCatcher) {
        document.addEventListener('mousedown', (e) => {
            // 处理静态工具栏上的下拉菜单
            ['sl-import-json-wrapper', 'sl-export-json-wrapper', 'sl-run-btn-wrapper'].forEach(id => {
                const wrapper = document.getElementById(id);
                if (wrapper && !wrapper.contains(e.target)) {
                    const dp = wrapper.querySelector('.sl-custom-select-dropdown');
                    if (dp) dp.style.display = 'none';
                }
            });

            // 处理动态工具栏上的批量同步菜单
            const batchWrapper = document.getElementById('tb-batch-sync-btn')?.parentNode;
            if (batchWrapper && !batchWrapper.contains(e.target)) {
                const dp = document.getElementById('tb-batch-sync-dropdown');
                if (dp) dp.style.display = 'none';
            }

            // 处理所有的下拉选框 (关联节点、参数、填充模式等)
            if (!e.target.closest('.sl-custom-select')) {
                document.querySelectorAll('.sl-custom-select.open').forEach(el => {
                    el.classList.remove('open');
                    const area = el.closest('.sl-area');
                    if (area) area.style.zIndex = '';
                });
            }
        }, true);
        window._slGlobalDropdownCatcher = true;
    }

    // 新建任务
    panelContainer.querySelector("#sl-global-add-card").onclick = () => {
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
        saveAndRender();
        
        setTimeout(() => {
            const container = panelContainer.querySelector("#sl-cards-container");
            if (container) {
                const newCardEl = container.querySelector(`[data-card-id="${newCard.id}"]`);
                if (newCardEl) newCardEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        }, 50);
    };

    // 新建模块
    panelContainer.querySelector("#sl-global-add-module").onclick = () => {
        let targetCard = null;
        let insertIndex = -1;
        
        if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
            const areaId = state.selectedAreaIds[0];
            targetCard = state.cards.find(c => c.areas?.some(a => a.id === areaId));
            if (targetCard) insertIndex = targetCard.areas.findIndex(a => a.id === areaId) + 1;
        } else if (state.selectedCardIds && state.selectedCardIds.length > 0) {
            targetCard = state.cards.find(c => c.id === state.selectedCardIds[0]);
            if (targetCard) insertIndex = targetCard.areas ? targetCard.areas.length : 0;
        }

        if (!targetCard) return alert("请先选中一个任务或模块，以确定新建位置！");

        if (!targetCard.areas) targetCard.areas = [];
        const templateArea = { id: 'area_' + Date.now() + '_' + Math.floor(Math.random() * 1000), type: 'edit', targetNodeId: null, targetWidget: null, value: '', dataType: 'string', autoHeight: true };
        targetCard.areas.splice(insertIndex, 0, templateArea);
        
        state.selectedAreaIds = [templateArea.id];
        state.selectedCardIds = [];
        saveAndRender();
        
        setTimeout(() => {
            const el = document.querySelector(`.sl-area[data-area-id="${templateArea.id}"]`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);
    };

    // 挂载数据导入导出功能组件
    attachDataIOEvents(panelContainer);

    // 挂载执行运行组件
    attachRunEvents(panelContainer);

    // 创建配置节点
    panelContainer.querySelector("#sl-btn-config").onclick = () => {
        if(window.ShellLink) window.ShellLink.createNode();
    };
}

// --- 暴露渲染与事件接口供上层调用 ---
export function renderDynamicToolbar(container) {
    renderDynamic(container);
}

export function attachDynamicToolbarEvents(container) {
    attachDynamic(container);
}