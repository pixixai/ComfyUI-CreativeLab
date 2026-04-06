/**
 * 文件名: comp_contextmenu.js
 * 路径: web/components/comp_contextmenu.js
 * 职责: 右键菜单入口、事件挂载、菜单分组拼装（已修复不显示及绑定失效问题）
 */
import { state } from "./ui_state.js";
import { updateSelectionUI } from "./ui_selection.js";
import { renderContentGroup, bindContentGroup } from "./contextmenu/group_content.js";
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
        // 关键修复：确保层级在 ComfyUI 画布之上
        Object.assign(menuEl.style, {
            position: "fixed",
            display: "none",
            zIndex: "999999", 
            backgroundColor: "var(--comfy-menu-bg, #282828)",
            color: "var(--fg-color, #ffffff)",
            border: "1px solid #444",
            padding: "8px 0",
            minWidth: "160px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
            borderRadius: "4px",
            userSelect: "none"
        });
        document.body.appendChild(menuEl);
    }

    const closeMenu = () => {
        menuEl.style.display = "none";
    };

    const closeMenuGlobally = (e) => {
        if (menuEl.style.display === "block" && !menuEl.contains(e.target)) {
            closeMenu();
        }
    };

    // 监听全局点击以关闭菜单
    window.addEventListener("mousedown", closeMenuGlobally, true);
    
    // 2. 核心渲染函数
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
        menuEl.style.display = "block";
        const rect = menuEl.getBoundingClientRect();
        
        let posX = x;
        let posY = y;
        // 边缘碰撞检测
        if (posX + rect.width > window.innerWidth) posX = window.innerWidth - rect.width;
        if (posY + rect.height > window.innerHeight) posY = window.innerHeight - rect.height;

        menuEl.style.left = `${posX}px`;
        menuEl.style.top = `${posY}px`;
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

        const areaEl = e.target.closest(".clab-area");
        if (!areaEl) return;

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
