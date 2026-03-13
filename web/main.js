/**
 * ComfyUI-CLab 扩展入口文件
 * 负责向 ComfyUI 注册扩展，统筹 UI 层与底层逻辑的初始化
 */
import { app } from "../../scripts/app.js";
import { StateManager } from "./state_manager.js";
import { setupAPIInjector } from "./api_injector.js";
import { setupUI, togglePanel } from "./ui_panel.js"; // 【修改点】：引入 togglePanel 方法

app.registerExtension({
    name: "ComfyUI.CLab",

    async setup() {
        console.log("[CLab] 开始加载...");
        setupUI();
        setupAPIInjector(app);

        // =========================================================================
        // 【修改点】：使用 V3 新版原生组件库，为 CLab 创建独立的按钮组
        // =========================================================================
        
        const clabBtn = document.createElement("button");
        clabBtn.className = "comfyui-button";
        
        // 独立组内的按钮，定义固定高度、内边距，并保留圆角
        // 【修改点】：gap: 3px (拉近图标和文字的距离)；padding: 0 8px (控制左右内边距，你可以自由调整这个 8px)
        clabBtn.style.cssText = "background: #262729; border: none; color: var(--fg-color, #fff); cursor: pointer; display: flex; align-items: center; gap: 6px; padding: 0 12px; height: 32px; font-size: 13px; border-radius: 4px !important; transition: background 0.15s ease;";
        
        // 使用指定的 PrimeIcons 字体图标
        clabBtn.innerHTML = `<i class="mdi mdi-tune clab-sidebar-icon" style="font-size: 14px;"></i> <span>CLab</span>`;
        
        // 初始化提示信息
        const initShortcut = window._clabShortcutRaw ? window._clabShortcutRaw.toUpperCase() : 'C';
        clabBtn.title = `打开 Creative Lab （快捷键${initShortcut}）`;
        
        // 悬停时动态获取最新快捷键，完美联动设置面板
        clabBtn.onmouseover = () => {
            clabBtn.style.background = "#3a3c3f";
            const currentShortcut = window._clabShortcutRaw ? window._clabShortcutRaw.toUpperCase() : 'C';
            clabBtn.title = `打开 Creative Lab （快捷键${currentShortcut}）`;
        };
        clabBtn.onmouseout = () => clabBtn.style.background = "#262729";
        clabBtn.onmousedown = () => clabBtn.style.background = "#4a4d50";
        clabBtn.onmouseup = () => clabBtn.style.background = "#3a3c3f";

        clabBtn.onclick = () => togglePanel();

        try {
            // 新样式：引入并为 CLab 单独创建一个原生按钮组 (ButtonGroup)
            const { ComfyButtonGroup } = await import("../../scripts/ui/components/buttonGroup.js");
            const clabGroup = new ComfyButtonGroup(clabBtn);
            
            // 【修改点】：去除了左右两侧的外边距
            clabGroup.element.style.margin = "0";

            if (app.menu && app.menu.settingsGroup && app.menu.settingsGroup.element) {
                // 像 Manager 一样，插入到右侧设置组的前面
                app.menu.settingsGroup.element.before(clabGroup.element);
            } else {
                // 如果没有 settingsGroup，直接追加到菜单末尾
                const oldMenu = document.querySelector(".comfy-menu");
                if (oldMenu) oldMenu.appendChild(clabGroup.element);
            }
        } catch (exception) {
            console.log('[CLab] ComfyUI 版本较旧，使用后备按钮模式。');
            // 后备：旧版原生按钮包裹
            // 【修改点】：去除了旧版包裹层的外边距
            const clabBtnWrapper = document.createElement("div");
            clabBtnWrapper.style.cssText = "display: flex; align-items: center; margin: 0;";
            clabBtnWrapper.appendChild(clabBtn);
            
            const oldMenu = document.querySelector(".comfy-menu");
            if (oldMenu) {
                oldMenu.appendChild(clabBtnWrapper);
            }
        }

        // 监听图谱清空事件（切换工作流、新建工作流时触发）
        const originalClear = app.graph.clear;
        app.graph.clear = function() {
            originalClear.apply(this, arguments);
            console.log("[CLab] 工作流被清空，隔离并重置面板状态...");
            StateManager.loadFromNode(app.graph); 
        };
    },

    // 节点加载完成时的钩子：用于打开包含配置节点的工作流时，自动恢复数据
    loadedGraphNode(node, appData) {
        if (node.type === "CLab_SystemConfig") {
            console.log("[CLab] 检测到工作流配置节点，准备同步数据...");
            setTimeout(() => {
                StateManager.loadFromNode(app.graph);
            }, 100);
        }
    },

    // 节点被手动创建/粘贴时的钩子
    nodeCreated(node) {
        if (node.type === "CLab_SystemConfig") {
            console.log("[CLab] 配置节点被创建或粘贴，尝试读取数据...");
            setTimeout(() => {
                StateManager.loadFromNode(app.graph);
            }, 100);
        }
    }
});

/**
 * 暴露全局方法给 UI 层调用
 */
window.CLab = {
    createNode() {
        StateManager.createConfigNode(app.graph);
    },
    saveState(newState) {
        Object.assign(StateManager.state, newState);
        StateManager.syncToNode(app.graph);
    }
};