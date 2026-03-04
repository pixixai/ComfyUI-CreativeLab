/**
 * ui_panel.js：【主入口】负责组装组件、处理全局生命周期事件。
 */
import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js"; 
import { state, appState, saveAndRender } from "./components/ui_state.js";
import { injectCSS, showBindingToast, hideBindingToast, getWidgetDef } from "./components/ui_utils.js";
import { setupStaticToolbarEvents, renderDynamicToolbar, attachDynamicToolbarEvents } from "./components/comp_toolbar.js";
import { renderCardsList, attachCardEvents } from "./components/comp_taskcard.js";
import { attachAreaEvents } from "./components/comp_modulearea.js";

console.log("[ShellLink] UI 拆分重构版本已被成功导入 (终极中央代理极速版)");

let panelContainer = null;
let backdropContainer = null;

export function setupUI() {
    injectCSS(); 
    
    const overrideStyle = document.createElement("style");
    overrideStyle.innerHTML = `
        .sl-custom-select-item:hover {
            background-color: rgba(255, 255, 255, 0.15) !important;
            color: #ffffff !important;
        }
        #shell-link-panel {
            --sl-card-width: 320px;
        }
        #shell-link-panel .sl-card {
            width: var(--sl-card-width) !important;
            min-width: var(--sl-card-width) !important;
            max-width: var(--sl-card-width) !important;
            transition: width 0.1s ease, min-width 0.1s ease, max-width 0.1s ease;
        }
        #sl-card-width-input::-webkit-outer-spin-button,
        #sl-card-width-input::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        #sl-card-width-input[type=number] {
            -moz-appearance: textfield;
        }
        
        .sl-context-menu {
            background: #2a2a2a !important;
            border: 1px solid #555 !important;
            border-radius: 6px !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
            padding: 4px 0 !important;
            font-family: sans-serif !important;
            backdrop-filter: none !important;
        }
        .sl-context-menu-title {
            padding: 6px 12px !important; 
            font-size: 12px !important;  
            color: #aaa !important;
            font-weight: bold !important;
            background: rgba(255,255,255,0.08) !important; 
            margin: 0 !important; 
            pointer-events: none !important;
            letter-spacing: normal !important;
        }
        .sl-context-menu-item {
            padding: 6px 12px !important;
            font-size: 12px !important;
            color: #eee !important;
            cursor: pointer !important;
            transition: background 0.1s !important;
            display: flex !important;
            align-items: center !important;
        }
        .sl-context-menu-item:hover {
            background-color: rgba(255, 255, 255, 0.15) !important;
            color: #ffffff !important;
        }
        .sl-context-menu-item.sl-danger {
            color: #ff4d4f !important;
        }
        .sl-context-menu-item.sl-danger:hover {
            background-color: #ff4d4f !important;
            color: #ffffff !important;
        }
        .sl-context-menu-divider {
            height: 1px !important;
            background: rgba(255, 255, 255, 0.1) !important;
            margin: 4px 12px !important; 
        }
    `;
    document.head.appendChild(overrideStyle);

    try {
        if (!panelContainer) {
            createPanelDOM();
            setupGlobalEventListeners();
            if (backdropContainer) document.body.appendChild(backdropContainer);
            document.body.appendChild(panelContainer);
            
            import("./components/comp_contextmenu.js").then(module => {
                module.setupContextMenu(panelContainer);
            }).catch(err => {
                console.warn("[ShellLink] 提示：右键菜单模块未找到或内部存在错误，右键功能暂不生效，详情见下方报错：", err);
            });
        }

        if (app.extensionManager && app.extensionManager.registerSidebarTab) {
            app.extensionManager.registerSidebarTab({
                id: "shellLinkSidebar",
                icon: "pi pi-sliders-v shell-link-sidebar-icon", 
                title: "ShellLink 控制台",
                tooltip: "打开 ShellLink 主面板 (快捷键 S)",
                type: "custom",
                render: (el) => {}
            });
            
            const globalSidebarHijacker = (e) => {
                let isOurTab = false;
                
                const tabBtn = e.target.closest('.p-tabview-nav-link, [role="tab"], li');
                const isOurIcon = e.target.classList && e.target.classList.contains('shell-link-sidebar-icon');
                
                if (isOurIcon || (tabBtn && tabBtn.querySelector('.shell-link-sidebar-icon'))) {
                    isOurTab = true;
                }

                if (isOurTab) {
                    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation();
                    if (e.type === 'click') togglePanel();
                }
            };

            window.addEventListener('pointerdown', globalSidebarHijacker, true);
            window.addEventListener('pointerup', globalSidebarHijacker, true);
            window.addEventListener('mousedown', globalSidebarHijacker, true);
            window.addEventListener('mouseup', globalSidebarHijacker, true);
            window.addEventListener('click', globalSidebarHijacker, true);
        }
    } catch (error) {
        console.error("[ShellLink] UI 面板初始化失败:", error);
    }
}

export function togglePanel() {
    if (!panelContainer) return;
    const isVisible = panelContainer.classList.contains('visible');
    if (isVisible) {
        panelContainer.classList.remove('visible');
        if (backdropContainer) backdropContainer.classList.remove('visible');
        state.painterMode = false;
        state.painterSource = null;
    } else {
        panelContainer.classList.add('visible');
        if (backdropContainer) backdropContainer.classList.add('visible');
        performRender(); 
    }
}

document.addEventListener("sl_render_ui", () => {
    performRender();
});

function performRender() {
    if (!panelContainer) return;
    const toolbarHandle = panelContainer.querySelector('#sl-toolbar-handle');
    const cardsContainer = panelContainer.querySelector('#sl-cards-container');
    renderDynamicToolbar(toolbarHandle);
    renderCardsList(cardsContainer);
    attachDynamicToolbarEvents(toolbarHandle);
    attachCardEvents(cardsContainer);
    attachAreaEvents(cardsContainer);
}

function createPanelDOM() {
    backdropContainer = document.createElement("div");
    backdropContainer.id = "sl-backdrop";
    backdropContainer.onclick = () => {
        if (!appState.isBindingMode) togglePanel();
    };

    panelContainer = document.createElement("div");
    panelContainer.id = "shell-link-panel";
    
    panelContainer.innerHTML = `
        <div class="sl-toolbar" id="sl-toolbar-handle">
            <div style="display:flex; gap:10px; align-items:center;">
                <button class="sl-btn" id="sl-global-add-card" title="新建空白任务卡片">+ 新建任务</button>
                <button class="sl-btn" id="sl-global-add-module" title="在当前任务内添加新模块">+ 新建模块</button>
                <div id="sl-module-toolbar-separator" style="width:1px; height:20px; background:rgba(255,255,255,0.2); margin:0 5px; display:none;"></div>
                <div id="sl-module-toolbar" style="display:none; align-items:center; gap:12px;"></div>
            </div>

            <div style="display:flex; gap:10px; align-items:center; margin-left:auto;">
                <div id="sl-run-btn-wrapper" class="sl-run-wrapper">
                    <button class="sl-btn run-btn-main" id="sl-btn-run" title="按规则运行选中任务 (局部)">▶ 运行</button>
                    <div style="width:1px; height:16px; background:rgba(255,255,255,0.4); margin: 0 4px; align-self: center;"></div>
                    <button class="sl-btn run-btn-toggle" id="sl-run-dropdown-toggle" title="展开更多运行选项">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                    </button>
                    <div id="sl-run-dropdown-menu" class="sl-custom-select-dropdown" style="display:none; top: calc(100% + 4px); right: 0; left: auto; min-width: 140px; z-index: 10002;">
                        <div class="sl-custom-select-item" id="sl-btn-run-all" style="display:flex; align-items:center; gap:8px;">
                            <svg width="15" height="15" viewBox="0 0 17.08 15.01" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                <path d="M6.63,6.6L1.95,2.64c-.77-.65-1.95-.11-1.95.91v7.93c0,1.01,1.18,1.56,1.95.91l4.68-3.96c.56-.47.56-1.34,0-1.81Z"/>
                                <path d="M16.74,6.77L9.02.23c-.63-.53-1.59-.09-1.59.74v13.07c0,.82.96,1.27,1.59.74l7.72-6.54c.46-.39.46-1.09,0-1.48Z"/>
                            </svg>
                            运行全部
                        </div>
                    </div>
                </div>
                <button class="sl-btn" id="sl-btn-config" title="在画布创建配置节点">⚓ 创建配置锚点</button>
            </div>
        </div>
        <div class="sl-cards-container" id="sl-cards-container"></div>

        <div id="sl-card-width-ctrl" style="position: absolute; bottom: 16px; left: 16px; z-index: 1000; display: flex; align-items: center; gap: 8px; transition: opacity 0.2s;">
            <svg id="sl-card-width-reset" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="恢复默认宽度" style="cursor: pointer; transition: stroke 0.2s;" onmouseover="this.style.stroke='#fff'" onmouseout="this.style.stroke='#888'">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            <input type="range" id="sl-card-width-slider" min="260" max="600" value="320" style="width: 80px; accent-color: #888; cursor: pointer; height: 4px; background: rgba(255,255,255,0.2); outline: none; border-radius: 2px; -webkit-appearance: none;">
            <input type="number" id="sl-card-width-input" title="手动输入宽度 (回车确认)" style="width: 36px; background: transparent; border: none; color: #888; font-size: 12px; outline: none; text-align: left; padding: 0; margin: 0; font-family: monospace; transition: color 0.2s;" onfocus="this.style.color='#fff'" onblur="this.style.color='#888'">
        </div>
    `;

    setupStaticToolbarEvents(panelContainer);

    panelContainer.addEventListener("click", (e) => {
        if (!state.painterMode) return;
        if (e.target.closest('#tb-format-painter')) return;
        const isToolbar = e.target.closest('#sl-toolbar-handle');
        const isAddCardBtn = e.target.closest('.sl-add-card-inline');

        if (isToolbar || isAddCardBtn) {
            state.painterMode = false;
            state.painterSource = null;
            panelContainer.classList.remove('sl-painter-active');
        }
    }, true);

    const cardsContainer = panelContainer.querySelector("#sl-cards-container");
    const toolbar = panelContainer.querySelector("#sl-toolbar-handle");
    
    // ==============================================================================================
    // 🌟 中央集权拦截引擎 🌟
    // 将原本散落在各个组件内部的杂乱点击事件，全部集中到外层大容器进行最高权限代理！
    // ==============================================================================================

    // [1] Mousedown：专门负责处理所有的“正常选中与多选”操作 (排斥格式刷模式)
    cardsContainer.addEventListener("mousedown", (e) => {
        if (state.painterMode) return;
        if (e.button !== 0) return; // 仅左键处理选中

        // 如果点击的是各种按钮、输入框等功能控件，放行，不做任何选中操作
        const isInteractive = e.target.closest('button, input, select, textarea, .sl-custom-select, .sl-edit-val-bool, .sl-del-area-btn, .sl-del-card-btn, .sl-history-thumb, .sl-upload-zone');
        if (isInteractive) return;

        const areaEl = e.target.closest('.sl-area');
        const cardEl = e.target.closest('.sl-card:not(.sl-add-card-inline)');

        if (areaEl) {
            // 【情况 A：点击了模块】
            const areaId = areaEl.dataset.areaId;
            if (e.ctrlKey || e.metaKey) {
                if (state.selectedAreaIds.includes(areaId)) state.selectedAreaIds = state.selectedAreaIds.filter(id => id !== areaId);
                else state.selectedAreaIds.push(areaId);
            } else {
                state.selectedAreaIds = [areaId];
            }
            
            // 🛡️ 强制清空卡片选中，完美解决“双重选中”的互斥 Bug！
            state.selectedCardIds = [];
            state.activeCardId = null;
            updateSelectionUI(); // 执行极速局部刷新
            
        } else if (cardEl) {
            // 【情况 B：点击了卡片本身】
            const targetId = cardEl.dataset.cardId;
            if (e.ctrlKey || e.metaKey) {
                if (state.selectedCardIds.includes(targetId)) state.selectedCardIds = state.selectedCardIds.filter(id => id !== targetId);
                else state.selectedCardIds.push(targetId);
                appState.lastClickedCardId = targetId;
            } else if (e.shiftKey && appState.lastClickedCardId) {
                const currentIndex = state.cards.findIndex(c => c.id === targetId);
                const lastIndex = state.cards.findIndex(c => c.id === appState.lastClickedCardId);
                const minIdx = Math.min(currentIndex, lastIndex);
                const maxIdx = Math.max(currentIndex, lastIndex);
                const rangeIds = state.cards.slice(minIdx, maxIdx + 1).map(c => c.id);
                state.selectedCardIds = Array.from(new Set([...state.selectedCardIds, ...rangeIds]));
                appState.lastClickedCardId = targetId;
            } else {
                state.selectedCardIds = [targetId];
                appState.lastClickedCardId = targetId;
            }
            
            state.activeCardId = state.selectedCardIds.length > 0 ? state.selectedCardIds[state.selectedCardIds.length - 1] : null;
            
            // 🛡️ 强制清空模块选中，完美排斥
            state.selectedAreaIds = [];
            updateSelectionUI(); // 执行极速局部刷新
        }
    });

    // [2] Click：专门处理“格式刷”和“点击空白处脱选”
    cardsContainer.addEventListener("click", (e) => {
        const isInteractive = e.target.closest('button, input, select, textarea, .sl-custom-select, .sl-edit-val-bool, .sl-del-area-btn, .sl-del-card-btn, .sl-history-thumb, .sl-upload-zone');
        const areaEl = e.target.closest('.sl-area');
        const cardEl = e.target.closest('.sl-card:not(.sl-add-card-inline)');

        if (state.painterMode) {
            if (isInteractive) return;
            
            if (state.painterSource?.type === 'card') {
                if (cardEl && !areaEl) {
                    const targetId = cardEl.dataset.cardId;
                    if (state.painterSource.data.id !== targetId) {
                        const targetCard = state.cards.find(c => c.id === targetId);
                        targetCard.areas = JSON.parse(JSON.stringify(state.painterSource.data.areas));
                        targetCard.areas.forEach(a => a.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
                        saveAndRender();
                    }
                } else if (!cardEl) {
                    let insertIndex = state.cards.length;
                    const cardEls = cardsContainer.querySelectorAll('.sl-card:not(.sl-add-card-inline)');
                    for (let i = 0; i < cardEls.length; i++) {
                        const rect = cardEls[i].getBoundingClientRect();
                        if (e.clientX < rect.left + rect.width / 2) { insertIndex = i; break; }
                    }
                    const newCard = JSON.parse(JSON.stringify(state.painterSource.data));
                    newCard.id = 'card_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                    if (newCard.areas) newCard.areas.forEach(a => a.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 1000));
                    state.cards.splice(insertIndex, 0, newCard);
                    saveAndRender();
                }
                return;
            }

            if (state.painterSource?.type === 'area') {
                if (areaEl) {
                    const targetAreaId = areaEl.dataset.areaId;
                    if (state.painterSource.data.id !== targetAreaId) {
                        const src = state.painterSource.data;
                        const card = state.cards.find(c => c.id === areaEl.dataset.cardId);
                        const area = card?.areas.find(a => a.id === targetAreaId);
                        if (area) {
                            area.type = src.type;
                            area.targetNodeId = src.targetNodeId;
                            area.targetWidget = src.targetWidget;
                            area.targetNodeIds = Array.isArray(src.targetNodeIds) ? [...src.targetNodeIds] : [];
                            area.targetWidgets = Array.isArray(src.targetWidgets) ? [...src.targetWidgets] : [];
                            area.dataType = src.dataType;
                            area.autoHeight = src.autoHeight;
                            area.ratio = src.ratio;
                            area.width = src.width;
                            area.height = src.height;
                            area.matchMedia = src.matchMedia;
                            area.fillMode = src.fillMode;
                            if (area.type !== src.type) area.value = ''; 
                            saveAndRender();
                        }
                    }
                } else if (cardEl && !areaEl) {
                    let insertIndex = 0;
                    const targetCard = state.cards.find(c => c.id === cardEl.dataset.cardId);
                    const areaEls = cardEl.querySelectorAll('.sl-area');
                    if (areaEls && areaEls.length > 0) {
                        insertIndex = targetCard.areas ? targetCard.areas.length : 0;
                        for (let i = 0; i < areaEls.length; i++) {
                            const rect = areaEls[i].getBoundingClientRect();
                            if (e.clientY < rect.top + rect.height / 2) { insertIndex = i; break; }
                        }
                    }
                    const newArea = JSON.parse(JSON.stringify(state.painterSource.data));
                    newArea.id = 'area_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
                    if (!targetCard.areas) targetCard.areas = [];
                    targetCard.areas.splice(insertIndex, 0, newArea);
                    saveAndRender();
                }
                return;
            }
            return;
        }

        // 【情况 C：点击空白处执行完全脱选】
        if (!isInteractive && (e.target === cardsContainer || e.target.classList.contains('sl-cards-wrapper'))) {
            handleDeselectAll(false);
        }
    });

    const handleDeselectAll = (forceExitPainter = false) => {
        const openDropdowns = document.querySelectorAll('.sl-custom-select.open');
        if (openDropdowns.length > 0) {
            openDropdowns.forEach(el => el.classList.remove('open'));
            return; 
        }
        let changed = false;
        if (forceExitPainter && state.painterMode) {
            state.painterMode = false;
            state.painterSource = null;
            changed = true;
        }
        if (state.selectedCardIds && state.selectedCardIds.length > 0) {
            state.selectedCardIds = [];
            state.activeCardId = null;
            changed = true;
        }
        if (state.selectedAreaIds && state.selectedAreaIds.length > 0) {
            state.selectedAreaIds = [];
            changed = true;
        }
        if(changed) {
            updateSelectionUI();
        }
    };

    toolbar.addEventListener("click", (e) => {
        const isInteractive = ['BUTTON', 'INPUT', 'LABEL', 'SELECT'].includes(e.target.tagName) || 
                              e.target.closest('button, input, label, select, .sl-custom-select, .sl-type-btn');
        if (!isInteractive) handleDeselectAll(true);
    });

    cardsContainer.addEventListener("wheel", (e) => {
        if (e.deltaY === 0) return;
        let isInsideVerticalScrollable = false;
        let elem = e.target;
        while (elem && elem !== cardsContainer) {
            if (elem.scrollHeight > elem.clientHeight) {
                const style = window.getComputedStyle(elem);
                if (style.overflowY === 'auto' || style.overflowY === 'scroll') {
                    const isAtTop = elem.scrollTop === 0;
                    const isAtBottom = Math.abs(elem.scrollHeight - elem.scrollTop - elem.clientHeight) < 1;
                    if ((e.deltaY < 0 && !isAtTop) || (e.deltaY > 0 && !isAtBottom)) {
                        isInsideVerticalScrollable = true; break;
                    }
                }
            }
            elem = elem.parentNode;
        }
        if (!isInsideVerticalScrollable) {
            e.preventDefault(); 
            cardsContainer.scrollLeft += Math.sign(e.deltaY) * 360;
        }
    }, { passive: false });

    makePanelDraggable();

    const widthSlider = panelContainer.querySelector('#sl-card-width-slider');
    const widthInput = panelContainer.querySelector('#sl-card-width-input');
    const widthResetBtn = panelContainer.querySelector('#sl-card-width-reset');
    const widthCtrlNode = panelContainer.querySelector('#sl-card-width-ctrl');
    
    if (widthSlider && widthInput && widthResetBtn) {
        const savedWidth = localStorage.getItem('shelllink-card-width') || '320';
        widthSlider.value = savedWidth <= 600 ? savedWidth : 600; 
        widthInput.value = savedWidth;
        panelContainer.style.setProperty('--sl-card-width', `${savedWidth}px`);

        const updateWidth = (val) => {
            let numVal = parseInt(val, 10);
            if (isNaN(numVal)) numVal = 320;
            if (numVal < 260) numVal = 260; 
            if (numVal > 1200) numVal = 1200; 

            widthSlider.value = Math.min(numVal, 600); 
            widthInput.value = numVal;
            panelContainer.style.setProperty('--sl-card-width', `${numVal}px`);
            localStorage.setItem('shelllink-card-width', numVal);
        };

        widthSlider.addEventListener('input', (e) => {
            e.stopPropagation();
            const val = e.target.value;
            widthInput.value = val;
            panelContainer.style.setProperty('--sl-card-width', `${val}px`);
        });

        widthSlider.addEventListener('change', (e) => {
            updateWidth(e.target.value);
        });

        widthInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.target.blur(); 
            }
        });
        widthInput.addEventListener('blur', (e) => {
            updateWidth(e.target.value);
        });

        widthResetBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            updateWidth(320);
        });

        const stopProp = e => e.stopPropagation();
        widthSlider.addEventListener('mousedown', stopProp);
        widthInput.addEventListener('mousedown', stopProp);
        widthResetBtn.addEventListener('mousedown', stopProp);
        if (widthCtrlNode) {
            widthCtrlNode.addEventListener('mousedown', stopProp);
            widthCtrlNode.addEventListener('click', stopProp);
        }
    }

    window.ShellLink.handleMediaError = (cardId, areaId, failedUrl) => {
        const card = state.cards.find(c => c.id === cardId);
        const area = card?.areas.find(a => a.id === areaId);
        if (area && area.history && area.history.length > 0) {
            const failedPath = new URL(failedUrl, window.location.origin).pathname + new URL(failedUrl, window.location.origin).search;
            const idx = area.history.findIndex(hUrl => {
                const hPath = new URL(hUrl, window.location.origin).pathname + new URL(hUrl, window.location.origin).search;
                return hPath === failedPath;
            });
            
            if (idx !== -1) {
                area.history.splice(idx, 1);
                if (area.history.length === 0) {
                    area.resultUrl = '';
                    area.historyIndex = 0;
                } else {
                    area.historyIndex = Math.min(idx, area.history.length - 1);
                    area.resultUrl = area.history[area.historyIndex];
                }
                setTimeout(() => saveAndRender(), 10);
            } else if (area.resultUrl === failedUrl) {
                area.resultUrl = '';
                setTimeout(() => saveAndRender(), 10);
            }
        } else if (area && area.resultUrl === failedUrl) {
             area.resultUrl = '';
             setTimeout(() => saveAndRender(), 10);
        }
    };
}

function makePanelDraggable() {
    const handle = panelContainer.querySelector('#sl-toolbar-handle');
    let isDragging = false, offsetX = 0, offsetY = 0;

    handle.addEventListener('mousedown', (e) => {
        if (['BUTTON', 'SELECT', 'INPUT', 'LABEL'].includes(e.target.tagName) || e.target.closest('button, select, input, label, .sl-custom-select')) return;
        isDragging = true;
        const rect = panelContainer.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;
        document.body.style.userSelect = 'none';
    });
    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        panelContainer.style.left = (e.clientX - offsetX) + 'px';
        panelContainer.style.top = (e.clientY - offsetY) + 'px';
        panelContainer.style.right = 'auto'; 
    });
    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
        }
    });
}

// =====================================================================================
// 🎯 核心 UI 进度条引擎
// =====================================================================================

const setUIProgress = (cardId, percentage, isHide = false, isError = false) => {
    const progContainer = document.querySelector(`.sl-card-progress-container[data-card-prog-id="${cardId}"]`);
    if (!progContainer) return;
    const bar = progContainer.querySelector('.sl-card-progress-bar');
    if (!bar) return;

    if (isError) {
        progContainer.style.opacity = '1';
        bar.classList.add('error');
        bar.style.setProperty('transition', 'none', 'important'); 
        bar.style.setProperty('width', '100%', 'important');
    } else if (isHide) {
        if (!bar.classList.contains('error')) {
            progContainer.style.opacity = '0';
            setTimeout(() => {
                if (!bar.classList.contains('error')) {
                    bar.style.setProperty('transition', 'none', 'important');
                    bar.style.setProperty('width', '0%', 'important');
                }
            }, 300);
        }
    } else {
        progContainer.style.opacity = '1';
        if (!bar.classList.contains('error')) {
            bar.style.setProperty('transition', 'width 0.3s ease-out', 'important');
            bar.style.setProperty('width', `${percentage}%`, 'important');
        }
    }
};

const bumpUIProgress = (cardId) => {
    const bar = document.querySelector(`.sl-card-progress-container[data-card-prog-id="${cardId}"] .sl-card-progress-bar`);
    if (bar && !bar.classList.contains('error')) {
        let currentW = parseFloat(bar.style.width) || 5;
        if (currentW < 90) {
            bar.style.setProperty('transition', 'width 0.3s ease-out', 'important');
            bar.style.setProperty('width', `${currentW + (100 - currentW) * 0.15}%`, 'important');
        }
    }
};

function setupGlobalEventListeners() {
    window.addEventListener('contextmenu', (e) => {
        if (appState.isBindingMode) {
            e.preventDefault(); 
            e.stopPropagation();
            return;
        }

        if (state.painterMode) {
            e.preventDefault(); e.stopPropagation();
            state.painterMode = false;
            state.painterSource = null;
            saveAndRender();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (appState.isBindingMode) return; 
        if (e.key === 'Escape' && state.painterMode) {
            state.painterMode = false;
            state.painterSource = null;
            saveAndRender();
            return;
        }

        if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && state.selectedAreaIds.length === 1) {
            if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
            
            const areaId = state.selectedAreaIds[0];
            let targetArea = null;
            for (const c of state.cards) {
                const a = c.areas?.find(x => x.id === areaId);
                if (a) { targetArea = a; break; }
            }
            
            if (targetArea && targetArea.type === 'preview' && targetArea.history && targetArea.history.length > 1) {
                e.preventDefault(); 
                let idx = targetArea.historyIndex !== undefined ? targetArea.historyIndex : targetArea.history.length - 1;
                
                if (e.key === 'ArrowLeft') {
                    idx = Math.max(0, idx - 1);
                } else {
                    idx = Math.min(targetArea.history.length - 1, idx + 1);
                }
                
                if (targetArea.historyIndex !== idx) {
                    targetArea.historyIndex = idx;
                    targetArea.resultUrl = targetArea.history[idx];
                    saveAndRender();
                }
                return;
            }
        }

        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || e.target.isContentEditable) return;
        if (e.key.toLowerCase() === 's' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            togglePanel();
        }
    });

    // ---------------------------------------------------------------------------------
    // 🚥 原生事件流水线监听器
    // ---------------------------------------------------------------------------------
    let currentExecutingCardId = null;

    document.addEventListener('sl_execution_start', (e) => {
        const tasks = e.detail.tasks || [];
        tasks.forEach(task => {
            const bar = document.querySelector(`.sl-card-progress-container[data-card-prog-id="${task.cardId}"] .sl-card-progress-bar`);
            if (bar) bar.classList.remove('error'); 
            setUIProgress(task.cardId, 5);
        });
    });

    document.addEventListener('sl_execution_error', (e) => {
        const cardId = e.detail?.cardId;
        if (cardId) setUIProgress(cardId, 100, false, true);
    });

    api.addEventListener("execution_start", (e) => {
        const pid = e.detail?.prompt_id;
        if (pid && window.ShellLink && window._slLastGeneratedTask && !window._slTaskMap[pid]) {
            window._slTaskMap[pid] = window._slLastGeneratedTask;
            window._slLastGeneratedTask = null;
        }
        const task = window._slTaskMap[pid];
        if (task) {
            currentExecutingCardId = task.cardId;
            setUIProgress(task.cardId, 5);
        }
    });

    api.addEventListener("progress_state", (e) => {
        const pid = e.detail?.prompt_id;
        const task = window._slTaskMap[pid];
        const cardId = task ? task.cardId : currentExecutingCardId;
        if (cardId && e.detail.nodes) {
            let total = 0, done = 0;
            for (const nid in e.detail.nodes) {
                total += e.detail.nodes[nid].max || 0;
                done += e.detail.nodes[nid].value || 0;
            }
            if (total > 0) setUIProgress(cardId, Math.max(5, (done / total) * 100));
        }
    });

    api.addEventListener("progress", (e) => {
        if (currentExecutingCardId) {
            const { value, max } = e.detail;
            if (max > 0) setUIProgress(currentExecutingCardId, Math.max(5, (value / max) * 100));
        }
    });

    api.addEventListener("executing", (e) => {
        const pid = e.detail?.prompt_id;
        const task = window._slTaskMap[pid];
        const cardId = task ? task.cardId : currentExecutingCardId;
        
        if (cardId) {
            if (e.detail.node) {
                bumpUIProgress(cardId);
            } else {
                setUIProgress(cardId, 100);
                setTimeout(() => setUIProgress(cardId, 0, true), 500);
                if (currentExecutingCardId === cardId) currentExecutingCardId = null;
            }
        }
    });

    api.addEventListener("executed", (event) => {
        const detail = event.detail;
        const executedNodeId = detail.node;     
        const outputData = detail.output;       
        const prompt_id = detail.prompt_id; 

        const task = (window._slTaskMap && prompt_id) ? window._slTaskMap[prompt_id] : null;
        if (!task) return;

        const card = state.cards.find(c => c.id === task.cardId);
        if (!card || !card.areas) return;

        card.areas.filter(a => a.type === 'preview').forEach(area => {
            if (task.previewAreaIds && task.previewAreaIds.length > 0) {
                if (!task.previewAreaIds.includes(area.id)) return;
            }

            if (String(area.targetNodeId) === String(executedNodeId)) {
                let newUrl = null;
                if (outputData.images && outputData.images.length > 0) {
                    const img = outputData.images[0];
                    const params = new URLSearchParams({ filename: img.filename, type: img.type, subfolder: img.subfolder || "" });
                    newUrl = api.apiURL(`/view?${params.toString()}`);
                } else if (outputData.gifs && outputData.gifs.length > 0) {
                    const video = outputData.gifs[0]; 
                    const params = new URLSearchParams({ filename: video.filename, type: video.type, subfolder: video.subfolder || "" });
                    newUrl = api.apiURL(`/view?${params.toString()}`);
                }
                
                if (newUrl) {
                    if (!area.history) area.history = [];
                    if (area.history.length === 0 || area.history[area.history.length - 1] !== newUrl) {
                        area.history.push(newUrl);
                    }
                    area.historyIndex = area.history.length - 1;
                }
            }
        });
    });

    const handleCached = (e) => {
        const pid = e.detail?.prompt_id;
        if (pid && !window._slTaskMap[pid] && window._slLastGeneratedTask) {
            window._slTaskMap[pid] = window._slLastGeneratedTask;
            window._slLastGeneratedTask = null;
        }
        const task = window._slTaskMap[pid];
        const cardId = task ? task.cardId : currentExecutingCardId;
        if (cardId) {
            setUIProgress(cardId, 100);
            setTimeout(() => setUIProgress(cardId, 0, true), 500);
        }
    };
    api.addEventListener("execution_cached", handleCached);
    api.addEventListener("cached", handleCached);

    api.addEventListener("execution_error", (e) => {
        const pid = e.detail?.prompt_id;
        const task = window._slTaskMap[pid];
        const cardId = task ? task.cardId : currentExecutingCardId;
        if (cardId) setUIProgress(cardId, 100, false, true);
    });

    api.addEventListener("status", (e) => {
        if (e.detail?.exec_info?.queue_remaining === 0) {
            setTimeout(() => {
                document.querySelectorAll('.sl-card-progress-container').forEach(container => {
                    const bar = container.querySelector('.sl-card-progress-bar');
                    if (bar && !bar.classList.contains('error')) {
                        container.style.opacity = '0';
                        setTimeout(() => {
                            bar.style.setProperty('transition', 'none', 'important');
                            bar.style.setProperty('width', '0%', 'important');
                        }, 300);
                    }
                });
            }, 500);
        }
    });

    // ---------------------------------------------------------------------------------

    document.addEventListener("shell_link_update_preview", (e) => {
        const { cardId, areaId, url } = e.detail;
        const areaEl = document.querySelector(`.sl-area[data-area-id="${areaId}"]`);
        if (areaEl) {
            const imgEl = areaEl.querySelector('.sl-preview-img');
            const placeholder = areaEl.querySelector('.sl-preview-placeholder');
            if (imgEl) { imgEl.src = url; imgEl.style.display = "block"; }
            if (placeholder) placeholder.style.display = "none";
        }
    });

    document.addEventListener("shell_link_state_loaded", (e) => {
        const loadedState = e.detail || { cards: [], activeCardId: null, selectedCardIds: [], selectedAreaIds: [] };
        Object.assign(state, loadedState);
        if (!state.selectedCardIds) state.selectedCardIds = state.activeCardId ? [state.activeCardId] : [];
        if (!state.selectedAreaIds) state.selectedAreaIds = [];
        state.painterMode = false;
        state.painterSource = null;
        
        state.cards.forEach(card => {
            if (!card.areas) {
                card.areas = [];
                if (card.previewAreas) { card.areas.push(...card.previewAreas.map(a => ({...a, type: 'preview', matchMedia: false, ratio: '16:9'}))); delete card.previewAreas; }
                if (card.editAreas) { card.areas.push(...card.editAreas.map(a => ({...a, type: 'edit', dataType: 'string', autoHeight: true}))); delete card.editAreas; }
            }
        });

        if(panelContainer.classList.contains('visible')) performRender();
    });

    document.addEventListener("shell_link_state_cleared", () => {
        Object.assign(state, { cards: [], activeCardId: null, selectedCardIds: [], selectedAreaIds: [], painterMode: false, painterSource: null });
        if(panelContainer.classList.contains('visible')) performRender();
    });

    document.addEventListener('sl_enter_binding_mode', (e) => {
        enterBindingModeForSelected(e.detail);
    });
}

function enterBindingModeForSelected(targetType) {
    if (!state.selectedAreaIds || state.selectedAreaIds.length === 0) return;

    appState.isBindingMode = true;
    panelContainer.classList.remove('visible');
    if (backdropContainer) backdropContainer.classList.remove('visible');
    
    showBindingToast("🖱️ 请在工作流中点击节点 (左键=替换，右键=追加，点击空白处取消)...");
    
    if (app.canvas) {
        app.canvas.deselectAllNodes();
        
        if (!app.canvas._slHijackedContextMenu) {
            const origProcessContextMenu = app.canvas.processContextMenu;
            app.canvas.processContextMenu = function() {
                if (appState.isBindingMode) return; 
                return origProcessContextMenu.apply(this, arguments);
            };
            app.canvas._slHijackedContextMenu = true;
        }
    }

    const onPointerUp = (e) => {
        if (e.button !== 0 && e.button !== 2) return;

        const isAppend = (e.button === 2);

        setTimeout(() => {
            hideBindingToast();
            appState.isBindingMode = false;
            panelContainer.classList.add('visible');
            if (backdropContainer) backdropContainer.classList.add('visible');

            let targetNode = null;
            if (app.canvas && app.canvas.graph) {
                const selectedNodes = Object.values(app.canvas.selected_nodes || {});
                if (!isAppend && selectedNodes.length > 0) {
                    targetNode = selectedNodes[0];
                } else {
                    const mx = app.canvas.graph_mouse[0];
                    const my = app.canvas.graph_mouse[1];
                    targetNode = app.canvas.graph.getNodeOnPos(mx, my);
                }
            }

            if (targetNode) {
                let resolvedTargets = [];
                if (targetNode.type === "PrimitiveNode" && targetNode.outputs && targetNode.outputs[0] && targetNode.outputs[0].links) {
                    targetNode.outputs[0].links.forEach(linkId => {
                        const link = app.graph.links[linkId];
                        if (link) {
                            const realNode = app.graph.getNodeById(link.target_id);
                            if (realNode && realNode.inputs && realNode.inputs[link.target_slot]) {
                                resolvedTargets.push({
                                    nodeIdStr: String(realNode.id),
                                    widgetName: realNode.inputs[link.target_slot].name
                                });
                            }
                        }
                    });
                }
                
                if (resolvedTargets.length === 0) {
                    resolvedTargets.push({
                        nodeIdStr: String(targetNode.id),
                        widgetName: null
                    });
                }

                state.selectedAreaIds.forEach(id => {
                    state.cards.forEach(c => {
                        const a = c.areas?.find(x => x.id === id);
                        if (a && a.type === targetType) {
                            if (targetType === 'edit') {
                                
                                let ids = Array.isArray(a.targetNodeIds) ? [...a.targetNodeIds] : (a.targetNodeId ? [String(a.targetNodeId)] : []);
                                let widgets = Array.isArray(a.targetWidgets) ? [...a.targetWidgets] : (a.targetWidget && a.targetNodeId ? [`${a.targetNodeId}||${a.targetWidget}`] : []);
                                
                                if (!isAppend) {
                                    ids = [];
                                    widgets = [];
                                }

                                let firstValidWidgetDef = null;

                                resolvedTargets.forEach(rt => {
                                    if (!ids.includes(rt.nodeIdStr)) {
                                        ids.push(rt.nodeIdStr);
                                    }
                                    if (rt.widgetName) {
                                        const wVal = `${rt.nodeIdStr}||${rt.widgetName}`;
                                        if (!widgets.includes(wVal)) {
                                            widgets.push(wVal);
                                        }
                                        if (!firstValidWidgetDef) {
                                            firstValidWidgetDef = getWidgetDef(rt.nodeIdStr, rt.widgetName);
                                        }
                                    }
                                });

                                a.targetNodeIds = ids;
                                a.targetNodeId = ids.length > 0 ? ids[0] : null;
                                
                                a.targetWidgets = widgets;
                                a.targetWidget = widgets.length > 0 ? widgets[0].split('||')[1] : null;

                                if (firstValidWidgetDef) {
                                    let isManual = true;
                                    if (Array.isArray(firstValidWidgetDef.type) || firstValidWidgetDef.type === "combo" || Array.isArray(firstValidWidgetDef.options?.values)) isManual = false;
                                    if (firstValidWidgetDef.type === "toggle" || typeof firstValidWidgetDef.value === "boolean") isManual = false;
                                    
                                    const hasVal = (a.value !== undefined && a.value !== null && a.value !== '');
                                    
                                    if (!isManual || !hasVal) {
                                        a.value = firstValidWidgetDef.value;
                                    }

                                    if (firstValidWidgetDef.type === "toggle" || typeof firstValidWidgetDef.value === "boolean") {
                                        a.dataType = 'boolean';
                                    } else if (typeof firstValidWidgetDef.value === "number") {
                                        a.dataType = 'number';
                                    } else {
                                        a.dataType = 'string';
                                    }
                                }
                            } else {
                                a.targetNodeId = resolvedTargets[0].nodeIdStr;
                            }
                        }
                    });
                });
                saveAndRender();
            }
        }, 150); 
        
        window.removeEventListener("pointerup", onPointerUp, true);
    };
    
    setTimeout(() => {
        window.addEventListener("pointerup", onPointerUp, true);
    }, 100);
}

// =====================================================================================
// 🌟 终极架构飞升：外科手术级局部更新引擎
// =====================================================================================
export function updateSelectionUI() {
    // 1. 遍历卡片 DOM，修改高亮
    document.querySelectorAll('.sl-card:not(.sl-add-card-inline)').forEach(card => {
        const cardId = card.dataset.cardId;
        if (state.selectedCardIds && state.selectedCardIds.includes(cardId)) {
            card.classList.add('active', 'selected'); // 增加对齐 CSS 的 active 类
            card.style.borderColor = '#4CAF50'; 
        } else {
            card.classList.remove('active', 'selected');
            card.style.borderColor = ''; 
        }
    });

    // 2. 遍历模块 DOM，修改高亮
    document.querySelectorAll('.sl-area').forEach(area => {
        const areaId = area.dataset.areaId;
        if (state.selectedAreaIds && state.selectedAreaIds.includes(areaId)) {
            area.classList.add('active', 'selected');
            area.style.borderColor = '#2196F3'; 
        } else {
            area.classList.remove('active', 'selected');
            area.style.borderColor = ''; 
        }
    });

    // 3. 刷新动态工具栏
    const toolbarHandle = document.querySelector('#sl-toolbar-handle');
    if (toolbarHandle) {
        renderDynamicToolbar(toolbarHandle);
        attachDynamicToolbarEvents(toolbarHandle);
    }

    // 4. 静默保存数据到节点 (绝不触发全局渲染事件)
    if (window.ShellLink && window.ShellLink.saveState) {
        window.ShellLink.saveState(state);
    } else if (window.StateManager && window.StateManager.syncToNode) {
        window.StateManager.syncToNode(app.graph);
    }
}

// 将更新 UI 引擎暴露给全局，方便其他组件调用
window.ShellLink = window.ShellLink || {};
window.ShellLink.updateSelectionUI = updateSelectionUI;