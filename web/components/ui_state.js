/**
 * ui_state.js: runtime state container and workspace helpers.
 */
import { syncTextContentWithSelection, remapPreviewHistory } from "./modules/media_types/media_utils.js";

const DEFAULT_WORKSPACE_NAME = "工作区 1";
export const WORKSPACE_SCHEMA_VERSION = 4;
const DEFAULT_PREVIEW_FILL_MODE = "显示全部";
const LEGACY_BINDING_KEYS = [
    "targetNodeId",
    "targetWidget",
    "targetNodeIds",
    "targetWidgets",
    "runtimeNodeBypassed",
    "runtimeNodeDisabled",
    "dataType",
    "autoHeight",
    "ratio",
    "width",
    "height",
    "matchMedia",
    "fillMode",
];

export function makeId(prefix) {
    return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

export function deepClone(value) {
    if (typeof structuredClone === "function") {
        try {
            return structuredClone(value);
        } catch (_) { }
    }
    return JSON.parse(JSON.stringify(value));
}

function resetAreaBindingFields(area) {
    if (!area || typeof area !== "object") return;

    area.targetNodeId = null;
    area.targetWidget = null;
    area.targetNodeIds = [];
    area.targetWidgets = [];
    area.runtimeNodeBypassed = false;
    area.runtimeNodeDisabled = false;

    if (area.type === "edit") {
        area.dataType = "string";
        area.autoHeight = true;
    } else if (area.type === "preview") {
        area.ratio = "16:9";
        area.width = null;
        area.height = null;
        area.matchMedia = true;
        area.fillMode = DEFAULT_PREVIEW_FILL_MODE;
    }
}

function applyLegacyChannel(cards, channel) {
    for (const card of cards) {
        for (const area of card.areas || []) {
            resetAreaBindingFields(area);
            const binding = channel?.bindings?.[area.id];
            if (!binding || typeof binding !== "object") continue;
            for (const key of LEGACY_BINDING_KEYS) {
                if (Object.hasOwn(binding, key)) area[key] = deepClone(binding[key]);
            }
        }
    }
}

function upgradeLegacyCards(cards) {
    for (const card of cards) {
        if (Array.isArray(card.areas)) continue;
        card.areas = [
            ...(card.previewAreas || []).map(area => ({ ...area, type:"preview", matchMedia:false, ratio:"16:9" })),
            ...(card.editAreas || []).map(area => ({ ...area, type:"edit", dataType:"string", autoHeight:true })),
        ];
        delete card.previewAreas;
        delete card.editAreas;
    }
}

export function createEmptyWorkspace(name = DEFAULT_WORKSPACE_NAME, seed = {}) {
    const workspaceName = seed.name || name;
    return {
        id: seed.id || makeId("workspace"),
        name: workspaceName,
        autoName: typeof seed.autoName === 'boolean' ? seed.autoName : /^工作区 [1-9]\d*$/.test(workspaceName),
        cards: Array.isArray(seed.cards) ? seed.cards : [],
        view: seed.view && typeof seed.view === 'object' ? deepClone(seed.view) : { mode: 'cards' },
        activeCardId: seed.activeCardId || null,
        selectedCardIds: Array.isArray(seed.selectedCardIds) ? seed.selectedCardIds : [],
        selectedAreaIds: Array.isArray(seed.selectedAreaIds) ? seed.selectedAreaIds : [],
        painterMode: !!seed.painterMode,
        painterSource: seed.painterSource || null,
        scrollLeft: Number.isFinite(seed.scrollLeft) ? seed.scrollLeft : 0,
    };
}

export function normalizeWorkspace(workspace, index = 0) {
    return createEmptyWorkspace(workspace?.name || `工作区 ${index + 1}`, workspace || {});
}

function migrateWorkspaces(entries) {
    const normalized = entries.map((entry, index) => normalizeWorkspace(entry, index));
    const ids = new Set(normalized.map(workspace => workspace.id));
    const workspaces = normalized.flatMap((workspace, index) => {
        const channels = entries[index]?.channels;
        if (!Array.isArray(channels) || !channels.length) {
            upgradeLegacyCards(workspace.cards);
            return [workspace];
        }

        const selected = Math.max(0, channels.findIndex(channel => channel?.id === entries[index]?.activeChannelId));
        return channels.map((channel, channelIndex) => {
            const copy = channels.length === 1 ? workspace : deepClone(workspace);
            upgradeLegacyCards(copy.cards);
            applyLegacyChannel(copy.cards, channel);
            if (channels.length > 1) {
                copy.name = `${workspace.name} · ${channel?.name || `通道 ${channelIndex + 1}`}`;
                copy.autoName = false;
                if (channelIndex !== selected) {
                    const base = `${workspace.id}_channel_${channelIndex + 1}`;
                    copy.id = base;
                    let suffix = 1;
                    while (ids.has(copy.id)) copy.id = `${base}_${suffix++}`;
                    ids.add(copy.id);
                }
            }
            return copy;
        });
    });
    return { workspaces, firstId: normalized[0].id };
}

const initialWorkspace = createEmptyWorkspace(DEFAULT_WORKSPACE_NAME);

// Runtime mirror: legacy code still reads/writes state.cards and friends.
export const state = {
    schemaVersion: WORKSPACE_SCHEMA_VERSION,
    activeWorkspaceId: initialWorkspace.id,
    workspaces: [initialWorkspace],

    // active workspace mirror
    cards: initialWorkspace.cards,
    activeCardId: initialWorkspace.activeCardId,
    selectedCardIds: initialWorkspace.selectedCardIds,
    selectedAreaIds: initialWorkspace.selectedAreaIds,
    painterMode: initialWorkspace.painterMode,
    painterSource: initialWorkspace.painterSource,
};

export const dragState = {
    type: null,
    cardId: null,
    areaId: null,
    cardIds: null,
    areaIds: null,
    anchorAreaId: null,
    sourceInfo: null,
    isClone: false,
};

export const appState = {
    isBindingMode: false,
    lastClickedCardId: null,
    lastClickedAreaId: null,
    selectedWorkspaceIds: [],
    lastClickedWorkspaceId: null,
};

export function getWorkspaceIndexById(workspaceId = state.activeWorkspaceId) {
    return state.workspaces.findIndex((workspace) => workspace.id === workspaceId);
}

export function getActiveWorkspace() {
    const idx = getWorkspaceIndexById();
    if (idx === -1) return null;
    return state.workspaces[idx];
}

export function getActiveWorkspaceIndex() {
    return getWorkspaceIndexById();
}

export function syncStateToActiveWorkspace() {
    const workspace = getActiveWorkspace();
    if (!workspace) return null;

    workspace.cards = Array.isArray(state.cards) ? state.cards : [];
    workspace.activeCardId = state.activeCardId || null;
    workspace.selectedCardIds = [];
    workspace.selectedAreaIds = [];
    workspace.painterMode = false;
    workspace.painterSource = null;

    return workspace;
}

export function applyWorkspaceToState(workspace) {
    const normalized = normalizeWorkspace(workspace);
    state.activeWorkspaceId = normalized.id;
    state.cards = normalized.cards;
    state.activeCardId = normalized.activeCardId;
    state.selectedCardIds = [];
    state.selectedAreaIds = [];
    state.painterMode = false;
    state.painterSource = null;
    appState.lastClickedCardId = null;
    appState.lastClickedAreaId = null;
    return normalized;
}

export function resetTransientState() {
    state.activeCardId = null;
    state.selectedCardIds = [];
    state.selectedAreaIds = [];
    state.painterMode = false;
    state.painterSource = null;
    appState.lastClickedCardId = null;
    appState.lastClickedAreaId = null;
}

export function ensureWorkspaceRuntime() {
    if (!Array.isArray(state.workspaces) || state.workspaces.length === 0) {
        const workspace = createEmptyWorkspace(DEFAULT_WORKSPACE_NAME);
        state.workspaces = [workspace];
        state.activeWorkspaceId = workspace.id;
        applyWorkspaceToState(workspace);
        return;
    }

    let active = getActiveWorkspace();
    if (!active) {
        state.activeWorkspaceId = state.workspaces[0].id;
        active = state.workspaces[0];
    }
    applyWorkspaceToState(active);
}

export function buildPersistedState() {
    syncStateToActiveWorkspace();
    return {
        schemaVersion: WORKSPACE_SCHEMA_VERSION,
        activeWorkspaceId: state.activeWorkspaceId,
        workspaces: state.workspaces.map((workspace, index) => normalizeWorkspace(workspace, index)),
    };
}

export function hydrateStateFromPersisted(persisted = {}) {
    const entries = Array.isArray(persisted.workspaces) && persisted.workspaces.length > 0
        ? persisted.workspaces
        : [persisted];
    const { workspaces, firstId } = migrateWorkspaces(entries);

    state.schemaVersion = WORKSPACE_SCHEMA_VERSION;
    state.workspaces = workspaces;
    const previousId = persisted.activeWorkspaceId || firstId;
    state.activeWorkspaceId = workspaces.some(workspace => workspace.id === previousId)
        ? previousId
        : firstId;
    appState.selectedWorkspaceIds = [state.activeWorkspaceId];
    appState.lastClickedWorkspaceId = state.activeWorkspaceId;

    ensureWorkspaceRuntime();
    return state;
}

export function saveAndRender() {
    if (window.CLab) window.CLab.saveState(state);
    document.dispatchEvent(new CustomEvent("clab_render_ui"));
}

// =========================================================================
// Global asset cleanup helper: remove URLs from all output areas.
// =========================================================================
export const removeUrlsGlobally = (urlsToRemove) => {
    if (!urlsToRemove || urlsToRemove.length === 0) return;

    const getPathAndQuery = (urlStr) => {
        if (!urlStr) return "";
        try {
            return new URL(urlStr, window.location.origin).pathname + new URL(urlStr, window.location.origin).search;
        } catch (e) {
            return urlStr;
        }
    };

    const pathsToRemove = urlsToRemove.map(getPathAndQuery);

    state.cards.forEach((card) => {
        card.areas?.forEach((area) => {
            if (area.type !== "preview") return;

            if (area.history && area.history.length > 0) {
                const keepIndices = [];
                area.history.forEach((historyUrl, index) => {
                    if (!pathsToRemove.includes(getPathAndQuery(historyUrl))) keepIndices.push(index);
                });
                const originalLength = area.history.length;
                if (keepIndices.length === originalLength) return;
                const preservedIndex = remapPreviewHistory(area, keepIndices);

                if (area.history.length !== originalLength) {
                    if (area.history.length === 0) {
                        area.resultUrl = "";
                        area.historyIndex = 0;
                        area.selectedThumbIndices = [];
                        if (Array.isArray(area.textHistory)) area.textContent = "";
                        area.textLoadState = "idle";
                    } else {
                        let newActiveIdx = preservedIndex;
                        if (newActiveIdx === -1) newActiveIdx = Math.max(0, area.history.length - 1);
                        area.historyIndex = newActiveIdx;
                        area.resultUrl = area.history[newActiveIdx];
                        syncTextContentWithSelection(area);
                        if (area.selectedThumbIndices) {
                            area.selectedThumbIndices = area.selectedThumbIndices.filter((i) => i < area.history.length);
                        }
                    }
                }
            } else if (area.resultUrl && pathsToRemove.includes(getPathAndQuery(area.resultUrl))) {
                area.resultUrl = "";
            }
        });
    });

    saveAndRender();
};
