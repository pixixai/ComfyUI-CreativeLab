import { paintWorkspaceHighlights } from './workspace_tab_highlight.js';
import {
    state,
    appState,
    syncStateToActiveWorkspace,
    applyWorkspaceToState,
    createEmptyWorkspace,
    normalizeWorkspace,
    saveAndRender,
    makeId,
    deepClone,
} from "./ui_state.js";
import { escapeHtml } from "./contextmenu/content/shared.js";
import { newWorkspaceView } from "./workspace_preferences.js";

function workspaceStructureMatches(currentWorkspace, targetWorkspace) {
    const currentCards = currentWorkspace?.cards || [];
    const targetCards = targetWorkspace?.cards || [];
    if (currentCards.length !== targetCards.length) return false;

    return currentCards.every((card, cardIndex) => {
        const targetCard = targetCards[cardIndex];
        const currentAreas = card?.areas || [];
        const targetAreas = targetCard?.areas || [];
        if (currentAreas.length !== targetAreas.length) return false;
        return currentAreas.every((area, areaIndex) => area?.type === targetAreas[areaIndex]?.type);
    });
}

function collectAllAreaIds(cards) {
    return (cards || []).flatMap((card) => (card.areas || []).map((area) => area.id));
}

const modeLabels = { cards: "任务卡片", table: "参数表", xy: "XY 矩阵" };

function getWorkspaceModeLabel(workspace) {
    return modeLabels[workspace.view?.mode] || modeLabels.cards;
}

export function getWorkspaceLabel(workspace) {
    return workspace.autoName ? `${getWorkspaceModeLabel(workspace)}·${workspace.name}` : workspace.name;
}

export function renderWorkspaceBar(container) {
    if (!container) return;

    const menuId=container.closest('.clab-workspace-strip')?.querySelector('.clab-mode-menu')?.id||'clab-workspace-mode-menu';
    const workspaces = state.workspaces || [];
    const activeWorkspaceId = state.activeWorkspaceId;
    const selectedIds = appState.selectedWorkspaceIds || [];

    // --- Optimization: Stable DOM for double-click reliability ---
    const existingTabs = Array.from(container.querySelectorAll(".clab-workspace-tab[data-workspace-id]"));
    if (existingTabs.length === workspaces.length) {
        let isStructureSame = true;
        for (let i = 0; i < workspaces.length; i++) {
            if (existingTabs[i].dataset.workspaceId !== workspaces[i].id) {
                isStructureSame = false;
                break;
            }
        }

        if (isStructureSame) {
            workspaces.forEach((ws, i) => {
                const tabEl = existingTabs[i];
                const isActive = ws.id === activeWorkspaceId;
                const isSelected = selectedIds.includes(ws.id);

                tabEl.classList.toggle("active", isActive);
                tabEl.classList.toggle("selected", isSelected);

                const nameSpan = tabEl.querySelector(".clab-workspace-tab-name");
                if (nameSpan && nameSpan.contentEditable !== "true") {
                    const label = getWorkspaceLabel(ws);
                    if (nameSpan.textContent !== label) nameSpan.textContent = label;
                    tabEl.title = label;
                }
                const modeSpan = tabEl.querySelector(".clab-workspace-tab-mode");
                const mode = getWorkspaceModeLabel(ws);
                if (modeSpan && modeSpan.textContent !== mode) modeSpan.textContent = mode;
            });
            if(!container.hasAttribute('data-review-workspaces'))paintWorkspaceHighlights(container,selectedIds);
            return;
        }
    }
    // -----------------------------------------------------------

    const tabsHtml = workspaces.map(workspace => {
        const isActive = workspace.id === activeWorkspaceId;
        const isSelected = selectedIds.includes(workspace.id);
        const classes = ["clab-workspace-tab"];
        if (isActive) classes.push("active");
        if (isSelected) classes.push("selected");

        const label = getWorkspaceLabel(workspace);
        return `
            <div class="${classes.join(" ")}" data-workspace-id="${escapeHtml(workspace.id)}" title="${escapeHtml(label)}" draggable="true">
                <button type="button" class="clab-workspace-tab-select"><span class="clab-workspace-tab-name">${escapeHtml(label)}</span></button>
                <button type="button" data-mode-toggle aria-label="切换工作区模式" aria-haspopup="menu" aria-expanded="false" aria-controls="${menuId}" title="切换工作区模式"><span class="clab-workspace-tab-mode">${getWorkspaceModeLabel(workspace)}</span></button>
            </div>
        `;
    }).join("");

    container.innerHTML = `
        ${tabsHtml}
        <button class="clab-workspace-tab clab-workspace-add" data-workspace-add id="${container.hasAttribute('data-review-workspaces')?'clab-preview-workspace-add':'clab-workspace-add'}" title="新建工作区">+</button>
    `;
    if(!container.hasAttribute('data-review-workspaces'))paintWorkspaceHighlights(container,selectedIds);
}

export function switchWorkspace(workspaceId, isMultiSelect = false) {
    if (!isMultiSelect) {
        appState.selectedWorkspaceIds = [workspaceId];
    }
    appState.lastClickedWorkspaceId = workspaceId;

    const current = syncStateToActiveWorkspace();
    const target = (state.workspaces || []).find((workspace) => workspace.id === workspaceId);
    if (!target || target === current) {
        if (window._clabRefreshContextView) window._clabRefreshContextView({ areaIds: [] });
        else saveAndRender();
        return;
    }

    const canRefreshInPlace = workspaceStructureMatches(current, target);
    applyWorkspaceToState(target);
    if (window._clabRefreshContextView) {
        if (canRefreshInPlace) window._clabRefreshContextView({ areaIds: collectAllAreaIds(state.cards) });
        else window._clabRefreshContextView();
    }
    else saveAndRender();
}

function addWorkspace(insertAfterId = null) {
    syncStateToActiveWorkspace();
    const workspace = createEmptyWorkspace(`工作区 ${(state.workspaces || []).length + 1}`, { view: newWorkspaceView() });

    if (insertAfterId) {
        const index = state.workspaces.findIndex(w => w.id === insertAfterId);
        if (index !== -1) {
            state.workspaces.splice(index + 1, 0, workspace);
        } else {
            state.workspaces.push(workspace);
        }
    } else {
        state.workspaces = [...(state.workspaces || []), workspace];
    }

    state.activeWorkspaceId = workspace.id;
    appState.selectedWorkspaceIds = [workspace.id];
    appState.lastClickedWorkspaceId = workspace.id;

    applyWorkspaceToState(workspace);
    saveAndRender();
}

function duplicateSelectedWorkspaces() {
    syncStateToActiveWorkspace();
    const targetIds = (appState.selectedWorkspaceIds || []).length > 0
        ? appState.selectedWorkspaceIds
        : [state.activeWorkspaceId];

    const sortedTargets = targetIds
        .map(id => state.workspaces.find(w => w.id === id))
        .filter(Boolean)
        .sort((a, b) => state.workspaces.indexOf(a) - state.workspaces.indexOf(b));

    sortedTargets.reverse();

    let lastCreatedId = null;
    for (const ws of sortedTargets) {
        const index = state.workspaces.indexOf(ws);
        const dup = normalizeWorkspace(deepClone(ws));
        dup.id = makeId("workspace");
        dup.name = `${getWorkspaceLabel(ws)} 副本`;
        dup.autoName = false;

        state.workspaces.splice(index + 1, 0, dup);
        lastCreatedId = dup.id;
    }

    if (lastCreatedId) {
        state.activeWorkspaceId = lastCreatedId;
        appState.selectedWorkspaceIds = [lastCreatedId];
        appState.lastClickedWorkspaceId = lastCreatedId;
        applyWorkspaceToState(state.workspaces.find(w => w.id === lastCreatedId));
    }
    saveAndRender();
}

function deleteSelectedWorkspaces() {
    if (!state.workspaces || state.workspaces.length <= 1) return;

    const targetIds = (appState.selectedWorkspaceIds || []).length > 0
        ? appState.selectedWorkspaceIds
        : [state.activeWorkspaceId];

    if (targetIds.length >= state.workspaces.length) {
        alert("无法删除所有工作区，至少需要保留一个。");
        return;
    }

    if (targetIds.length > 1 && !confirm(`确认删除选中的 ${targetIds.length} 个工作区吗？`)) {
        return;
    }

    const activeIndex = state.workspaces.findIndex(w => w.id === state.activeWorkspaceId);
    let nextWorkspaces = state.workspaces.filter(w => !targetIds.includes(w.id));

    let newActiveId = state.activeWorkspaceId;
    if (targetIds.includes(state.activeWorkspaceId)) {
        newActiveId = nextWorkspaces[Math.min(activeIndex, nextWorkspaces.length - 1)].id;
    }

    state.workspaces = nextWorkspaces;
    state.activeWorkspaceId = newActiveId;
    appState.selectedWorkspaceIds = [newActiveId];
    appState.lastClickedWorkspaceId = newActiveId;

    applyWorkspaceToState(state.workspaces.find(w => w.id === newActiveId));
    saveAndRender();
}

function bulkRenameWorkspaces(container,onChange) {
    const targetIds = (appState.selectedWorkspaceIds || []).length > 0
        ? appState.selectedWorkspaceIds
        : [state.activeWorkspaceId];

    if (targetIds.length === 0) return;

    if (targetIds.length === 1) {
        const tab = container.querySelector(`.clab-workspace-tab[data-workspace-id="${targetIds[0]}"]`);
        if (tab) startInlineRename(tab, targetIds[0],onChange);
        return;
    }

    const baseName = prompt(`批量重命名 ${targetIds.length} 个工作区，请输入新的基础名称:`, "工作区");
    if (baseName === null) return;
    const name = baseName.trim() || "工作区";

    const sortedTargets = targetIds
        .map(id => state.workspaces.find(w => w.id === id))
        .filter(Boolean)
        .sort((a, b) => state.workspaces.indexOf(a) - state.workspaces.indexOf(b));

    sortedTargets.forEach((ws, i) => {
        ws.name = i === 0 ? name : `${name} (${i})`;
        ws.autoName = false;
    });

    saveAndRender();onChange();
}

function startInlineRename(tabEl, workspaceId,onChange) {
    const getTargetWorkspace = () => (state.workspaces || []).find((item) => item.id === workspaceId);
    let workspace = getTargetWorkspace();
    if (!workspace) return;

    const nameSpan = tabEl.querySelector(".clab-workspace-tab-name");
    if (!nameSpan) return;

    appState.selectedWorkspaceIds = [workspaceId];
    appState.lastClickedWorkspaceId = workspaceId;
    saveAndRender();

    const originalDraggable = tabEl.getAttribute("draggable");
    tabEl.setAttribute("draggable", "false");

    nameSpan.contentEditable = "true";
    nameSpan.focus();

    const range = document.createRange();
    range.selectNodeContents(nameSpan);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);

    const finishEdit = () => {
        if (nameSpan.contentEditable !== "true") return;
        nameSpan.contentEditable = "false";
        tabEl.setAttribute("draggable", originalDraggable);
        nameSpan.blur();
        const nextName = nameSpan.textContent.trim().replace(/[\r\n]+/g, "");

        workspace = getTargetWorkspace();
        if (!workspace) return;

        if (nextName && nextName !== getWorkspaceLabel(workspace)) {
            workspace.name = nextName;
            workspace.autoName = false;
            saveAndRender();onChange();
        } else {
            nameSpan.textContent = getWorkspaceLabel(workspace);
        }
    };

    nameSpan.onkeydown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();e.stopPropagation();
            finishEdit();
        } else if (e.key === "Escape") {
            e.preventDefault();e.stopPropagation();
            workspace = getTargetWorkspace();
            nameSpan.textContent = workspace ? getWorkspaceLabel(workspace) : "";
            finishEdit();
        }
    };

    nameSpan.onblur = () => {
        finishEdit();
    };
}

let workspaceMenuEl = null;
const workspaceBarPositionKey = 'clab-workspace-tabs-position';

function setWorkspaceBarPosition(position) {
    document.documentElement.dataset.clabWorkspaceTabs = position;
    try { localStorage.setItem(workspaceBarPositionKey, position); } catch {}
}

function showWorkspaceMenu(event) {
    workspaceMenuEl.style.display = 'block';
    const {width, height} = workspaceMenuEl.getBoundingClientRect();
    workspaceMenuEl.style.left = `${Math.max(0, Math.min(event.clientX, window.innerWidth - width))}px`;
    workspaceMenuEl.style.top = `${Math.max(0, event.clientY + height > window.innerHeight ? event.clientY - height : event.clientY)}px`;
}

export function scrollWorkspaceTabs(container, event) {
    if (!event.deltaY) return;
    container.scrollLeft += event.deltaY * 0.6;
    event.preventDefault();
}

export function attachWorkspaceEvents(container,{beforeChange=()=>{},onChange=()=>{},onSelect=()=>false}={}) {
    if (!container || container.dataset.clabWorkspaceBound === "1") return;
    container.dataset.clabWorkspaceBound = "1";
    const strip = container.closest('.clab-workspace-strip');
    const changed=()=>{renderWorkspaceBar(container);onChange();};
    const act=action=>{beforeChange();action();changed();};
    try { document.documentElement.dataset.clabWorkspaceTabs = localStorage.getItem(workspaceBarPositionKey) === 'bottom' ? 'bottom' : 'top'; } catch {}

    if (!workspaceMenuEl) {
        workspaceMenuEl = document.createElement("div");
        workspaceMenuEl.className = "clab-context-menu";
        document.body.appendChild(workspaceMenuEl);

        const closeMenu = (e) => {
            if (workspaceMenuEl.style.display === "block" && !workspaceMenuEl.contains(e.target)) {
                workspaceMenuEl.style.display = "none";
            }
        };
        window.addEventListener("mousedown", closeMenu, true);
        window.addEventListener("contextmenu", closeMenu, true);
    }

    strip.addEventListener("contextmenu", (event) => {
        const tab = event.target.closest(".clab-workspace-tab[data-workspace-id]");
        if (!tab && event.target.closest('button,.clab-mode-menu')) return;
        event.preventDefault();
        event.stopPropagation();

        if (!tab) {
            const current = document.documentElement.dataset.clabWorkspaceTabs;
            workspaceMenuEl.innerHTML = [['top','在上方'],['bottom','在下方']].map(([position, label]) =>
                `<div class="clab-context-menu-item" role="menuitemradio" aria-checked="${position === current}" data-workspace-bar-position="${position}">${position === current ? '✓ ' : ''}${label}</div>`).join('');
            showWorkspaceMenu(event);
            for (const item of workspaceMenuEl.querySelectorAll('[data-workspace-bar-position]')) {
                item.onclick = () => { setWorkspaceBarPosition(item.dataset.workspaceBarPosition); workspaceMenuEl.style.display = 'none'; };
            }
            return;
        }

        const wsId = tab.dataset.workspaceId;
        if (!appState.selectedWorkspaceIds.includes(wsId)) {
            act(()=>switchWorkspace(wsId));
        }

        workspaceMenuEl.innerHTML = `
            <div class="clab-context-menu-title">工作区</div>
            <div class="clab-context-menu-item" id="clab-ctx-ws-add">新建工作区</div>
            <div class="clab-context-menu-item" id="clab-ctx-ws-duplicate">复制</div>
            <div class="clab-context-menu-item" id="clab-ctx-ws-rename">重命名</div>
            <div class="clab-context-menu-divider"></div>
            <div class="clab-context-menu-item clab-danger" id="clab-ctx-ws-delete">删除</div>
        `;

        showWorkspaceMenu(event);

        workspaceMenuEl.querySelector("#clab-ctx-ws-add").onclick = () => { workspaceMenuEl.style.display = "none"; act(()=>addWorkspace(wsId)); };
        workspaceMenuEl.querySelector("#clab-ctx-ws-duplicate").onclick = () => { workspaceMenuEl.style.display = "none"; act(duplicateSelectedWorkspaces); };
        workspaceMenuEl.querySelector("#clab-ctx-ws-rename").onclick = () => { workspaceMenuEl.style.display = "none"; bulkRenameWorkspaces(container,changed); };
        workspaceMenuEl.querySelector("#clab-ctx-ws-delete").onclick = () => { workspaceMenuEl.style.display = "none"; act(deleteSelectedWorkspaces); };
    });

    container.addEventListener("click", (event) => {
        if (event.target.closest("[data-mode-toggle],[contenteditable=true]")) return;
        const tab = event.target.closest(".clab-workspace-tab[data-workspace-id]");
        if (tab) {
            const wsId = tab.dataset.workspaceId;if(onSelect(event,wsId))return;beforeChange();
            if (event.shiftKey && appState.lastClickedWorkspaceId) {
                const startIndex = state.workspaces.findIndex(w => w.id === appState.lastClickedWorkspaceId);
                const endIndex = state.workspaces.findIndex(w => w.id === wsId);
                if (startIndex !== -1 && endIndex !== -1) {
                    const sorted = [startIndex, endIndex].sort((a, b) => a - b);
                    const newRange = state.workspaces.slice(sorted[0], sorted[1] + 1).map(w => w.id);
                    const existing = appState.selectedWorkspaceIds || [];
                    appState.selectedWorkspaceIds = [...new Set([...existing, ...newRange])];
                    appState.lastClickedWorkspaceId = wsId;
                    saveAndRender();
                }
            } else if (event.ctrlKey || event.metaKey) {
                appState.selectedWorkspaceIds = appState.selectedWorkspaceIds || [];
                if (appState.selectedWorkspaceIds.includes(wsId)) {
                    appState.selectedWorkspaceIds = appState.selectedWorkspaceIds.filter(id => id !== wsId);
                } else {
                    appState.selectedWorkspaceIds.push(wsId);
                }
                appState.lastClickedWorkspaceId = wsId;
                saveAndRender();
            } else {
                switchWorkspace(wsId);
            }
            changed();return;
        }

        if (event.target.closest("[data-workspace-add]")) {
            act(addWorkspace);
            return;
        }
    });

    container.addEventListener("dragstart", (e) => {
        const tab = e.target.closest(".clab-workspace-tab[data-workspace-id]");
        if (!tab) return;

        const wsId = tab.dataset.workspaceId;
        const isSelected = (appState.selectedWorkspaceIds || []).includes(wsId);
        const sourceIds = isSelected ? [...appState.selectedWorkspaceIds] : [wsId];

        appState.dragState = { type: 'workspaceTab', sourceIds };

        sourceIds.forEach(id => {
            const el = container.querySelector(`.clab-workspace-tab[data-workspace-id="${id}"]`);
            if (el) el.classList.add("clab-dragging");
        });
    });

    container.addEventListener("dragend", (e) => {
        container.querySelectorAll(".clab-dragging").forEach(el => {
            el.classList.remove("clab-dragging");
        });
        container.querySelectorAll(".clab-drag-over-tab-left, .clab-drag-over-tab-right").forEach(el => {
            el.classList.remove("clab-drag-over-tab-left", "clab-drag-over-tab-right");
        });
        appState.dragState = null;
    });

    container.addEventListener("dragover", (e) => {
        if (!appState.dragState || appState.dragState.type !== 'workspaceTab') return;
        e.preventDefault();
        const tab = e.target.closest(".clab-workspace-tab[data-workspace-id]");
        if (!tab) return;

        const targetId = tab.dataset.workspaceId;
        const sourceIds = appState.dragState.sourceIds || [];
        if (sourceIds.includes(targetId)) return;

        container.querySelectorAll(".clab-drag-over-tab-left, .clab-drag-over-tab-right").forEach(el => {
            el.classList.remove("clab-drag-over-tab-left", "clab-drag-over-tab-right");
        });

        const rect = tab.getBoundingClientRect();
        if (e.clientX < rect.left + rect.width / 2) {
            tab.classList.add("clab-drag-over-tab-left");
        } else {
            tab.classList.add("clab-drag-over-tab-right");
        }
    });

    container.addEventListener("dragleave", (e) => {
        const tab = e.target.closest(".clab-workspace-tab[data-workspace-id]");
        if (tab) {
            tab.classList.remove("clab-drag-over-tab-left", "clab-drag-over-tab-right");
        }
    });

    container.addEventListener("drop", (e) => {
        if (!appState.dragState || appState.dragState.type !== 'workspaceTab') return;
        e.preventDefault();

        const tab = e.target.closest(".clab-workspace-tab[data-workspace-id]");
        if (!tab) return;

        tab.classList.remove("clab-drag-over-tab-left", "clab-drag-over-tab-right");
        const targetId = tab.dataset.workspaceId;
        const sourceIds = appState.dragState.sourceIds || [];
        if (sourceIds.includes(targetId)) return;

        const sourceTabs = sourceIds
            .map(id => state.workspaces.find(w => w.id === id))
            .filter(Boolean)
            .sort((a, b) => state.workspaces.indexOf(a) - state.workspaces.indexOf(b));

        if (sourceTabs.length === 0) return;

        beforeChange();
        state.workspaces = state.workspaces.filter(w => !sourceIds.includes(w.id));

        const targetIndex = state.workspaces.findIndex(w => w.id === targetId);
        if (targetIndex === -1) {
            state.workspaces.push(...sourceTabs);
        } else {
            const rect = tab.getBoundingClientRect();
            const insertAtLeft = e.clientX < rect.left + rect.width / 2;
            const insertIndex = insertAtLeft ? targetIndex : targetIndex + 1;
            state.workspaces.splice(insertIndex, 0, ...sourceTabs);
        }

        appState.dragState=null;saveAndRender();changed();
    });

    container.addEventListener("dblclick", (event) => {
        if (event.target.closest("[data-mode-toggle]")) return;
        const tab = event.target.closest(".clab-workspace-tab[data-workspace-id]");
        if (!tab) return;
        startInlineRename(tab, tab.dataset.workspaceId,changed);
    });

    container.addEventListener("wheel", event => scrollWorkspaceTabs(container, event));
}
