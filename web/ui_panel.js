/**
 * ui_panel.js: panel composition entry.
 */
import { state, appState,getActiveWorkspace } from "./components/ui_state.js";
import { injectCSS } from "./components/ui_utils.js";
import { setupStaticToolbarEvents } from "./components/comp_toolbar.js";
import { renderDynamicToolbar, attachDynamicToolbarEvents } from "./components/comp_toolbar.js";
import { renderCardsList, attachCardEvents,createCardsWrapper } from "./components/comp_taskcard.js";
import { attachAreaEvents } from "./components/comp_modulearea.js";
import { observeModuleRemoval } from "./components/modules/module_lifecycle.js";
import { renderWorkspaceBar, attachWorkspaceEvents } from "./components/comp_workspace.js";
import { setupWorkspaceModes, refreshWorkspaceModes,restoreWorkspaceModes } from './components/workspace_modes/workspace_modes.js';
import { cardWindow,hasCardWindow,revealWorkspaceTarget } from './components/workspace_modes/card_window.js';
import { appendWorkspaceTasks } from './components/workspace_modes/task_dom.js';
import { createPanelLoading } from './components/panel_loading.js';

import { setupGlobalEvents } from "./components/events/event_global.js";
import { setupExecutionEvents } from "./components/events/event_execution.js";
import { setupPanelEvents } from "./components/events/event_panel.js";

console.log("[CLab] UI split version loaded (entry/composition mode)");

let panelContainer = null;
let backdropContainer = null;
let panelLoading = null;
document.addEventListener('clab_edit_history_restored',event=>{
    if(!panelContainer)return;
    if(event.detail.destination?.surface==='workspace'){panelContainer.classList.add('visible');backdropContainer?.classList.add('visible');}
    const container=panelContainer.querySelector('#clab-cards-container'),left=container.scrollLeft,top=container.scrollTop;
    appendWorkspaceTasks(container,state.cards);
    refreshCardsInPlace(container,event.detail.areaIds);
    restoreWorkspaceModes(panelContainer);
    renderDynamicToolbar(panelContainer.querySelector('#clab-toolbar-handle'));
    attachDynamicToolbarEvents(panelContainer.querySelector('#clab-toolbar-handle'));
    renderWorkspaceBar(panelContainer.querySelector('#clab-workspace-bar'));
    container.scrollLeft=left;container.scrollTop=top;
    if(event.detail.destination?.surface==='workspace'){
        const {areaId,cardId}=event.detail.focus;
        const target=revealWorkspaceTarget(container,cardId,areaId);
        if(target&&!target.hidden)target.scrollIntoView({block:'nearest',inline:'nearest'});
        if(event.detail.destination.panel==='maintenance')panelContainer.querySelector('#clab-config-dropdown-trigger').click();
    }
});


function ensureMiniVault() {
    if (window._clabMiniVault) return window._clabMiniVault;
    const vault = document.createElement("div");
    vault.id = "clab-mini-vault";
    vault.style.cssText = "position: fixed; top: 0; left: 0; width: 1px; height: 1px; opacity: 0.01; pointer-events: none; z-index: -9999; overflow: hidden;";
    document.body.appendChild(vault);
    window._clabMiniVault = vault;
    return vault;
}

function setupPanelMediaVault() {
    window.CLab = window.CLab || {};

    window.CLab.stashMedia = () => {
        window._clabGlobalVaultMap = new Map();
        const miniVault = ensureMiniVault();

        document.querySelectorAll(".clab-video-player .clab-media-target, .clab-audio-player .clab-media-target").forEach((media) => {
            const areaEl = media.closest(".clab-area");
            if (!areaEl || !areaEl.dataset.areaId) return;

            const info = {
                el: media,
                src: media.getAttribute("src") || "",
                time: media.currentTime || 0,
                paused: media.paused,
            };
            window._clabGlobalVaultMap.set(areaEl.dataset.areaId, info);
            miniVault.appendChild(media);
        });
    };

    window.CLab.restoreMedia = () => {
        if (!window._clabGlobalVaultMap) return;

        document.querySelectorAll(".clab-area").forEach((areaEl) => {
            const areaId = areaEl.dataset.areaId;
            if (!window._clabGlobalVaultMap.has(areaId)) return;

            const info = window._clabGlobalVaultMap.get(areaId);
            const newMedia = areaEl.querySelector(".clab-media-target");
            if (newMedia) {
                const newSrc = newMedia.getAttribute("src") || "";
                const shouldRestoreStashed = (() => {
                    if (!info.src || !newSrc) return false;
                    try {
                        const oldUrl = new URL(info.src, window.location.origin);
                        const newUrl = new URL(newSrc, window.location.origin);

                        oldUrl.hash = newUrl.hash = '';
                        oldUrl.searchParams.sort();
                        newUrl.searchParams.sort();
                        return oldUrl.href === newUrl.href;
                    } catch (_) {
                        return info.src === newSrc;
                    }
                })();

                if (shouldRestoreStashed) {
                    newMedia.replaceWith(info.el);
                    if (Math.abs(info.el.currentTime - info.time) > 0.1) {
                        info.el.currentTime = info.time;
                    }
                    if (info.el instanceof HTMLVideoElement) {
                        info.el.autoplay = false;
                        info.el.removeAttribute("autoplay");
                    }
                    if (!info.paused) info.el.play().catch(()=>{});
                    else info.el.pause();
                } else {
                    info.el.remove();
                }
            } else {
                info.el.remove();
            }

            window._clabGlobalVaultMap.delete(areaId);
        });

        window._clabGlobalVaultMap.forEach((info) => info.el.remove());
        window._clabGlobalVaultMap.clear();
    };
}

function getRenderedCardsState(cardsContainer) {
    const wrapper = cardsContainer?.querySelector(".clab-cards-wrapper");
    if (!wrapper) return { wrapper: null, cardEls: [] };
    const cardEls = Array.from(wrapper.querySelectorAll(":scope > .clab-card[data-card-id]"));
    if (wrapper.getAttribute('role') === 'table') {
        const order = new Map(state.cards.map((card, index) => [card.id, index]));
        cardEls.sort((a, b) => (order.get(a.dataset.cardId) ?? Infinity) - (order.get(b.dataset.cardId) ?? Infinity));
    }
    return { wrapper, cardEls };
}

function syncCardShellInPlace(cardEl, card, index) {
    if (!cardEl || !card) return;

    const isSelected = !!state.selectedCardIds?.includes(card.id);
    const defaultTitle = `#${index + 1}`;
    const displayTitle = card.title || defaultTitle;

    cardEl.dataset.cardId = card.id;
    cardEl.classList.toggle("active", isSelected);
    cardEl.classList.toggle("selected", isSelected);
    cardEl.style.borderColor = isSelected ? "var(--clab-theme-card, #4CAF50)" : "";

    const titleInput = cardEl.querySelector(".clab-card-title-input");
    if (titleInput) {
        titleInput.dataset.id = card.id;
        titleInput.dataset.default = defaultTitle;
        titleInput.placeholder = defaultTitle;
        if (document.activeElement !== titleInput) {
            titleInput.value = displayTitle;
            titleInput.size = Math.max(displayTitle.length, 2);
        }
    }

    const deleteBtn = cardEl.querySelector(".clab-del-card-btn");
    if (deleteBtn) deleteBtn.dataset.id = card.id;

    const progressEl = cardEl.querySelector(".clab-card-progress-container");
    if (progressEl) progressEl.dataset.cardProgId = card.id;

    const bodyEl = cardEl.querySelector(".clab-card-body");
    if (bodyEl) bodyEl.dataset.cardId = card.id;

    const areaListEl = cardEl.querySelector(".clab-area-list");
    if (areaListEl) areaListEl.dataset.cardId = card.id;
}

function canRefreshCardsInPlace(cardsContainer) {
    if (!cardsContainer || !window._clabSurgicallyUpdateArea) return false;

    if(hasCardWindow(cardsContainer))return getActiveWorkspace()?.view?.mode==='cards';
    const { wrapper, cardEls } = getRenderedCardsState(cardsContainer);
    if (!wrapper || cardEls.length !== state.cards.length) return false;

    return state.cards.every((card, index) => {
        const cardEl = cardEls[index];
        if (!cardEl || cardEl.dataset.cardId !== card.id) return false;

        const areaEls = Array.from(cardEl.querySelectorAll(".clab-area-list > .clab-area[data-area-id]"));
        const stateAreas = Array.isArray(card.areas) ? card.areas : [];
        return areaEls.length === stateAreas.length && areaEls.every((el, i) => el.dataset.areaId === stateAreas[i].id);
    });
}

function refreshCardsInPlace(cardsContainer, areaIds = null) {
    if (!canRefreshCardsInPlace(cardsContainer)) return false;
    if(hasCardWindow(cardsContainer))cardWindow(cardsContainer).update();

    const panel = cardsContainer.closest("#clab-panel");
    if (panel) {
        panel.classList.toggle("clab-painter-active", !!state.painterMode);
    }

    const { cardEls } = getRenderedCardsState(cardsContainer);
    const cardsById=new Map(state.cards.map((card,index)=>[card.id,{card,index}]));

    cardEls.forEach(cardEl => {
        const item=cardsById.get(cardEl.dataset.cardId);if(!item)return;const {card,index:cardIndex}=item;
        syncCardShellInPlace(cardEl, card, cardIndex);

        const areaEls = Array.from(cardEl.querySelectorAll(".clab-area-list > .clab-area[data-area-id]"));
        areaEls.forEach((areaEl, areaIndex) => {
            const area = card.areas?.[areaIndex];
            if (!area) return;
            areaEl.dataset.cardId = card.id;
            areaEl.dataset.areaId = area.id;
        });
    });

    const targetAreaIds = Array.isArray(areaIds) ? new Set(areaIds) : null;
    if (!targetAreaIds || targetAreaIds.size > 0) {
        state.cards.forEach((card) => {
            (card.areas || []).forEach((area) => {
                if (targetAreaIds && !targetAreaIds.has(area.id)) return;
                if (window._clabRefreshAreaForContext) window._clabRefreshAreaForContext(area.id);
                else window._clabSurgicallyUpdateArea(area.id);
            });
        });
    }

    if (!hasCardWindow(cardsContainer)&&window._clabUpdateCardsLayout) window._clabUpdateCardsLayout();
    if (window._clabUpdateAllDefaultTitles) window._clabUpdateAllDefaultTitles();
    return true;
}

function performPanelRender({refreshAreas=true,chrome=true}={}) {
    if (!panelContainer) return;

    const toolbarHandle = panelContainer.querySelector("#clab-toolbar-handle");
    const cardsContainer = panelContainer.querySelector("#clab-cards-container");
    const workspaceBar = panelContainer.querySelector("#clab-workspace-bar");

    let savedScrollLeft = 0;
    const savedCardScrolls = new Map();
    if (cardsContainer) {
        savedScrollLeft = cardsContainer.scrollLeft;
        cardsContainer.querySelectorAll(".clab-card-body").forEach((body) => {
            if (!body.dataset.cardId) return;
            savedCardScrolls.set(body.dataset.cardId, body.scrollTop);
        });
    }

    const canReuse = canRefreshCardsInPlace(cardsContainer);
    if (!canReuse && window.CLab?.stashMedia) window.CLab.stashMedia();

    if(chrome)renderDynamicToolbar(toolbarHandle);
    const reused = canReuse && refreshCardsInPlace(cardsContainer,refreshAreas?null:[]);
    if (!reused) renderCardsList(cardsContainer);
    if(chrome)renderWorkspaceBar(workspaceBar);

    if (cardsContainer) {
        cardsContainer.scrollLeft = savedScrollLeft;
        cardsContainer.querySelectorAll(".clab-card-body").forEach((body) => {
            if (!body.dataset.cardId || !savedCardScrolls.has(body.dataset.cardId)) return;
            body.scrollTop = savedCardScrolls.get(body.dataset.cardId);
        });
    }

    if (!reused && window.CLab?.restoreMedia) window.CLab.restoreMedia();

    if(chrome)attachDynamicToolbarEvents(toolbarHandle);
    if (!reused) {
        attachCardEvents(cardsContainer);
        attachAreaEvents(cardsContainer);
    }
    if(chrome)attachWorkspaceEvents(workspaceBar);

    if (!reused&&window._clabUpdateAllDefaultTitles) window._clabUpdateAllDefaultTitles();
    refreshWorkspaceModes(panelContainer);
}

function refreshContextView(options = {}) {
    if (!panelContainer) return;

    if (window.CLab && typeof window.CLab.saveState === "function") {
        window.CLab.saveState(state, { createAnchor:false });
    } else if (window.StateManager && typeof window.StateManager.syncToNode === "function" && window.app?.graph) {
        window.StateManager.syncToNode(window.app.graph);
    }

    const toolbarHandle = panelContainer.querySelector("#clab-toolbar-handle");
    const cardsContainer = panelContainer.querySelector("#clab-cards-container");
    const workspaceBar = panelContainer.querySelector("#clab-workspace-bar");

    if (toolbarHandle) {
        renderDynamicToolbar(toolbarHandle);
        attachDynamicToolbarEvents(toolbarHandle);
    }
    if (workspaceBar) {
        renderWorkspaceBar(workspaceBar);
        attachWorkspaceEvents(workspaceBar);
    }

    if (refreshCardsInPlace(cardsContainer, options.areaIds)) { refreshWorkspaceModes(panelContainer); return; }

    performPanelRender();
}

export function setupUI() {
    injectCSS();
    setupPanelMediaVault();

    const overrideStyle = document.createElement("style");
    overrideStyle.innerHTML = `
        #clab-panel {
            --clab-card-width: 320px;
        }
        #clab-panel .clab-card {
            width: var(--clab-card-width) !important;
            min-width: var(--clab-card-width) !important;
            max-width: var(--clab-card-width) !important;
            transition: width 0.1s ease, min-width 0.1s ease, max-width 0.1s ease;
        }
        #clab-panel.clab-zooming .clab-card {
            transition: none !important;
        }
        #clab-card-width-input::-webkit-outer-spin-button,
        #clab-card-width-input::-webkit-inner-spin-button,
        #clab-run-batch-count::-webkit-outer-spin-button,
        #clab-run-batch-count::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
        }
        #clab-card-width-input[type=number],
        #clab-run-batch-count[type=number] {
            -moz-appearance: textfield;
        }

    `;
    document.head.appendChild(overrideStyle);

    try {
        if (!panelContainer) {
            createPanelDOM();
            if (backdropContainer) document.body.appendChild(backdropContainer);
            document.body.appendChild(panelContainer);
            observeModuleRemoval(panelContainer);
            if (window._clabApplyPanelLayout) window._clabApplyPanelLayout();

            setupGlobalEvents(panelContainer, backdropContainer, togglePanel, performRender);
            setupExecutionEvents();
            panelLoading=createPanelLoading(panelContainer,{
                toolbar(){const root=panelContainer.querySelector('#clab-toolbar-handle');renderDynamicToolbar(root);attachDynamicToolbarEvents(root);},
                tabs(){const root=panelContainer.querySelector('#clab-workspace-bar');renderWorkspaceBar(root);attachWorkspaceEvents(root);},
                content:()=>performPanelRender({refreshAreas:false,chrome:false}),
                refresh:id=>window._clabSurgicallyUpdateArea?.(id,{notify:false})
            });

            import("./components/comp_contextmenu.js").then((module) => {
                module.setupContextMenu(panelContainer);
            }).catch((err) => {
                console.warn("[CLab] context menu module failed to load:", err);
            });
        }
    } catch (error) {
        console.error("[CLab] UI panel init failed:", error);
    }
}

export function togglePanel() {
    if (!panelContainer) return;

    const isVisible = panelContainer.classList.contains("visible");
    if (isVisible) {
        panelLoading?.cancel();
        panelContainer.querySelector('#clab-cards-container').dispatchEvent(new Event('clab_panel_closed'));
        panelContainer.classList.remove("visible");
        if (backdropContainer) backdropContainer.classList.remove("visible");
        state.painterMode = false;
        state.painterSource = null;
        window.CLab?.flushPendingSave?.();
        return;
    }

    panelContainer.classList.add("visible");
    if (backdropContainer) backdropContainer.classList.add("visible");
    panelLoading.open();
}

document.addEventListener("clab_render_ui", () => {
    performRender();
});

window._clabRefreshContextView = refreshContextView;

function performRender() {
    panelLoading?.cancel();
    performPanelRender();
}

function createPanelDOM() {
    backdropContainer = document.createElement("div");
    backdropContainer.id = "clab-backdrop";
    backdropContainer.onclick = () => {
        if (!appState.isBindingMode) togglePanel();
    };

    panelContainer = document.createElement("div");
    panelContainer.id = "clab-panel";

    panelContainer.innerHTML = `
        <div class="clab-tool-dock" data-dock="top" role="toolbar" aria-label="工作区工具栏">
        <div class="clab-xy-toolbar" role="group" aria-label="矩阵工具"></div>
        <div class="clab-toolbar" id="clab-toolbar-handle">
            <div class="clab-toolbar-left">
                <button class="clab-btn" id="clab-global-add-card" title="新建空白任务卡片">+ 新建任务</button>
                <button class="clab-btn" id="clab-global-add-module" title="在当前任务内添加新模块">+ 新建模块</button>
            </div>
            <div id="clab-module-toolbar" role="group" aria-label="选中项工具" style="display:none;"></div>

            <div class="clab-toolbar-right">
                <div id="clab-run-group">
                    <div id="clab-run-count-control" title="循环运行次数（排队执行）">
                        <input type="number" id="clab-run-batch-count" value="1" min="1" max="999" style="width: 24px; background: transparent; border: none; color: #eee; font-size: 14px; text-align: center; outline: none; font-family: sans-serif; -moz-appearance: textfield; padding: 0;">
                        <div style="display:flex; flex-direction:column; justify-content:center; align-items:center; height: 100%; margin-left: 2px; gap: 2px;">
                            <div id="clab-run-count-up" style="cursor:pointer; display:flex; align-items:center; justify-content:center; padding: 2px 6px;" onmouseover="this.querySelector('svg').style.stroke='#fff'" onmouseout="this.querySelector('svg').style.stroke='#aaa'">
                                <svg width="14" height="8" viewBox="0 7 24 10" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block; transition: stroke 0.2s;"><polyline points="18 15 12 9 6 15"></polyline></svg>
                            </div>
                            <div id="clab-run-count-down" style="cursor:pointer; display:flex; align-items:center; justify-content:center; padding: 2px 6px;" onmouseover="this.querySelector('svg').style.stroke='#fff'" onmouseout="this.querySelector('svg').style.stroke='#aaa'">
                                <svg width="14" height="8" viewBox="0 7 24 10" fill="none" stroke="#aaa" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:block; transition: stroke 0.2s;"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            </div>
                        </div>
                    </div>
                    <div id="clab-run-btn-wrapper" class="clab-run-wrapper" style="border-top-right-radius: 0; border-bottom-right-radius: 0; height: 100%;">
                        <button class="clab-btn run-btn-main" id="clab-btn-run" title="运行所选任务；未选中时运行全部任务" style="height: 100%;">运行</button>
                        <button class="clab-btn run-btn-toggle" id="clab-run-dropdown-toggle" title="展开更多运行选项" style="height: 100%;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="6 9 12 15 18 9"></polyline>
                            </svg>
                        </button>
                        <div id="clab-run-dropdown-menu" class="clab-custom-select-dropdown clab-toolbar-menu" style="display:none; top: calc(100% + 4px); right: 0; left: auto; min-width: 140px; z-index: 10002;">
                            <div class="clab-custom-select-item" id="clab-btn-run-all">
                                <svg width="15" height="15" viewBox="0 0 19.6 15.01" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19.26,6.77L11.55.23c-.63-.53-1.59-.09-1.59.74v13.07c0,.82.96,1.27,1.59.74l7.72-6.54c.46-.39.46-1.09,0-1.48Z"/>
                                    <path d="M9.31,6.77L1.59.23C.96-.3,0,.15,0,.97v13.07c0,.82.96,1.27,1.59.74l7.72-6.54c.46-.39.46-1.09,0-1.48Z"/>
                                </svg>
                                运行全部
                            </div>
                        </div>
                    </div>

                    <button type="button" class="clab-run-stop" id="clab-btn-interrupt" title="打断插件当前及后续所有运行批次" aria-label="打断运行" disabled>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="m6 6 12 12M18 6 6 18"/></svg>
                    </button>
                </div>
                <div id="clab-maintenance-slot"></div>
                <div id="clab-preview-mode-switch" class="clab-toolbar-type" role="group" aria-label="工作区与预览切换">
                    <button type="button" class="clab-type-btn" aria-pressed="true">工作区</button>
                    <button type="button" class="clab-type-btn" id="clab-btn-preview" aria-pressed="false" aria-haspopup="dialog">预览</button>
                </div>
            </div>
        </div>
        </div>
        <div class="clab-workspace-strip">
            <div class="clab-workspace-shell">
                <div class="clab-workspace-tabs" id="clab-workspace-bar"></div>
            </div>
            <div class="clab-mode-menu" id="clab-workspace-mode-menu" role="menu" aria-label="工作区模式" hidden>
                <button type="button" data-workspace-mode="cards" role="menuitemradio" aria-checked="true">任务卡片</button>
                <button type="button" data-workspace-mode="table" role="menuitemradio" aria-checked="false">参数表</button>
                <button type="button" data-workspace-mode="xy" role="menuitemradio" aria-checked="false">XY 矩阵</button>
            </div>
        </div>
        <div class="clab-cards-container" id="clab-cards-container"></div>
        <div id="clab-card-width-ctrl" class="clab-card-width-ctrl">
            <svg id="clab-card-width-reset" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" title="恢复默认宽度" style="cursor: pointer; transition: stroke 0.2s;" onmouseover="this.style.stroke='#fff'" onmouseout="this.style.stroke='#888'">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="3" x2="9" y2="21"></line>
            </svg>
            <input type="range" id="clab-card-width-slider" min="260" max="600" value="320" style="width: 80px; accent-color: #888; cursor: pointer; height: 4px; background: rgba(255,255,255,0.2); outline: none; border-radius: 2px; -webkit-appearance: none;">
            <input type="number" id="clab-card-width-input" title="手动输入宽度（回车确认）" style="width: 36px; background: transparent; border: none; color: #888; font-size: 12px; outline: none; text-align: left; padding: 0; margin: 0; font-family: monospace; transition: color 0.2s;" onfocus="this.style.color='#fff'" onblur="this.style.color='#888'">
        </div>
    `;

    createCardsWrapper(panelContainer.querySelector('#clab-cards-container'));
    setupStaticToolbarEvents(panelContainer);
    setupPanelEvents(panelContainer);
    setupWorkspaceModes(panelContainer);
    // Bind the permanent toolbar once during setup, so first-open actions work
    // even before the progressive content jobs have had their first frame.
    const toolbar=panelContainer.querySelector('#clab-toolbar-handle');
    renderDynamicToolbar(toolbar);attachDynamicToolbarEvents(toolbar);
}
