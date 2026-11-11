/**
 * 文件名: comp_contextmenu.js
 * 路径: web/components/comp_contextmenu.js
 * 职责: 右键菜单入口、事件挂载、菜单分组拼装（已修复不显示及绑定失效问题）
 */
import { state } from "./ui_state.js";
import { updateSelectionUI } from "./ui_selection.js";
import { renderContentGroup, bindContentGroup, openCardPreview } from "./contextmenu/group_content.js";
import { buildNodeGroupState, renderNodeGroup, bindNodeGroup } from "./contextmenu/group_node.js";
import { renderModuleGroup, bindModuleGroup } from "./contextmenu/group_module.js";

function collectSelectedAreaObjs() {
    const selectedAreaObjs = [];
    state.cards.forEach((card) => {
        card.areas?.forEach((area) => {
            if (state.selectedAreaIds.includes(area.id)) {
                selectedAreaObjs.push({ card, area });
            }
        });
    });
    return selectedAreaObjs;
}

export function setupContextMenu(panelContainer) {
    // 1. 初始化并确保菜单容器存在，加入高层级安全样式
    let menuEl = document.querySelector(".clab-context-menu");
    if (!menuEl) {
        menuEl = document.createElement("div");
        menuEl.className = "clab-context-menu";
        document.body.appendChild(menuEl);
    }

    const closeMenu = () => {
        menuEl.style.display = "none";
    };
    document.addEventListener('clab_enter_binding_mode', closeMenu);

    const closeMenuGlobally = (e) => {
        if (menuEl.style.display === "block" && !menuEl.contains(e.target)) {
            closeMenu();
        }
    };

    // 监听全局点击以关闭菜单
    window.addEventListener("mousedown", closeMenuGlobally, true);
    document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
    }, true);
    
    // 2. 核心渲染函数
    const positionMenu=(x,y)=>{
        menuEl.style.display="block";
        const rect=menuEl.getBoundingClientRect();
        menuEl.style.left=`${Math.max(8,Math.min(x,window.innerWidth-rect.width-8))}px`;
        menuEl.style.top=`${Math.max(8,Math.min(y,window.innerHeight-rect.height-8))}px`;
    };
    const showTableMenu = (x, y, target) => {
        const show = groups => {
            menuEl.innerHTML = '';
            groups.forEach((group, index) => {
                if (index) {
                    const divider = document.createElement('div');
                    divider.className = 'clab-context-menu-divider';
                    menuEl.append(divider);
                }
                for (const {action, label, invoke, disabled} of group) {
                    const item = document.createElement('div');
                    item.className = 'clab-context-menu-item';
                    if (action.startsWith('delete')) item.classList.add('clab-danger');
                    item.dataset.tableAction = action;
                    item.textContent = label;
                    item.setAttribute('role', 'menuitem');
                    if (action === 'settings') item.setAttribute('data-table-context-settings', '');
                    if (disabled) item.setAttribute('aria-disabled', 'true');
                    else {
                        item.tabIndex = 0;
                        item.onclick = () => { closeMenu(); invoke(); };
                        item.onkeydown = event => {
                            if (event.key !== 'Enter' && event.key !== ' ') return;
                            event.preventDefault();
                            event.stopPropagation();
                            item.click();
                        };
                    }
                    menuEl.append(item);
                }
            });
            positionMenu(x, y);
        };
        panelContainer.dispatchEvent(new CustomEvent('clab_table_menu', {detail:{...target, show, point:{x,y}}}));
    };
    const showMenu = (x, y, areaId) => {
        const selectedAreaObjs = collectSelectedAreaObjs();
        if (selectedAreaObjs.length === 0) return;

        const mainObj = selectedAreaObjs.find((o) => o.area.id === areaId);
        if (!mainObj) return;
        const showContent = mainObj.area?.type === "preview";

        // 构建状态
        const nodeState = buildNodeGroupState ? buildNodeGroupState(selectedAreaObjs) : {};

        // 步骤 A：先拼装所有的 HTML (千万不要在这个阶段绑定事件)
        let htmlContent = "";
        if (typeof renderContentGroup === "function") htmlContent += renderContentGroup(showContent);
        if (typeof renderNodeGroup === "function") htmlContent += renderNodeGroup(nodeState);
        if (typeof renderModuleGroup === "function") htmlContent += renderModuleGroup();
        
        // 步骤 B：一次性写入 DOM
        menuEl.innerHTML = htmlContent;

        // 步骤 C：DOM 稳定后，再执行所有的事件绑定
        // 只有这样 menuEl.querySelector 才能找到真实存在的节点
        const bindArgs = { menuEl, selectedAreaObjs, closeMenu, nodeState, mainObj };
        if (typeof bindContentGroup === "function") bindContentGroup(bindArgs);
        if (typeof bindNodeGroup === "function") bindNodeGroup(bindArgs);
        if (typeof bindModuleGroup === "function") bindModuleGroup(bindArgs);

        // 步骤 D：计算位置并显示 (防溢出屏幕)
        positionMenu(x,y);
    };

    if (!window.CLab) window.CLab = {};
    window.CLab.showPreviewContextMenu = (x, y, cardId, areaId, url) => {
        if (state.painterMode) {
            state.painterMode = false;
            state.painterSource = null;
            document.getElementById("clab-panel")?.classList.remove("clab-painter-active");
            updateSelectionUI();
            if (window._clabJustSave) window._clabJustSave();
            return;
        }

        if (panelContainer.dataset.workspaceMode === 'table') {
            showTableMenu(x, y, {areaId});
            return;
        }

        if (!state.selectedAreaIds.includes(areaId)) {
            state.selectedAreaIds = [areaId];
            updateSelectionUI();
        }
        showMenu(x, y, areaId);
    };

    // 3. 拦截容器的右键事件
    panelContainer.addEventListener("contextmenu", (e) => {
        if (state.painterMode) {
            e.preventDefault();
            e.stopPropagation();
            state.painterMode = false;
            state.painterSource = null;
            document.getElementById("clab-panel")?.classList.remove("clab-painter-active");
            updateSelectionUI();
            if (window._clabJustSave) window._clabJustSave();
            return;
        }

        if (panelContainer.dataset.workspaceMode === 'table') {
            const cell = e.target.closest('[role=cell][data-area-id]');
            const column = e.target.closest('.clab-table-column[data-table-column]');
            const row = e.target.closest('[role=rowheader]')?.closest('[data-table-row]');
            if ((!cell && !column && !row) || e.target.closest('[data-table-editing] textarea:not([readonly]),[data-table-editing] input:not([readonly]),[contenteditable=true]')) return;
            e.preventDefault();
            e.stopPropagation();
            showTableMenu(e.clientX, e.clientY, {areaId:cell?.dataset.areaId, rowId:row?.dataset.tableRow, columnId:column?.dataset.tableColumn});
            return;
        }

        const areaEl = e.target.closest(".clab-area");
        if (!areaEl) {
            const cardEl=e.target.closest('.clab-card:not(.clab-add-card-inline)');
            if(!cardEl)return;
            e.preventDefault();e.stopPropagation();
            if(!state.selectedCardIds.includes(cardEl.dataset.cardId)){
                state.selectedCardIds=[cardEl.dataset.cardId];state.selectedAreaIds=[];state.activeCardId=cardEl.dataset.cardId;updateSelectionUI();
            }
            const cards=state.cards.filter(card=>state.selectedCardIds.includes(card.id));
            menuEl.innerHTML='<div class="clab-context-menu-item" id="clab-ctx-preview-mode">预览模式</div>';
            menuEl.querySelector('#clab-ctx-preview-mode').onclick=()=>{closeMenu();openCardPreview(cards);};
            positionMenu(e.clientX,e.clientY);return;
        }

        const areaId = areaEl.dataset.areaId;
        if (!state.selectedAreaIds.includes(areaId)) {
            state.selectedAreaIds = [areaId];
            updateSelectionUI();
        }

        e.preventDefault();
        e.stopPropagation();

        // 关键修复：确保调用了 showMenu
        showMenu(e.clientX, e.clientY, areaId);
    });
}
