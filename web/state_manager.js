/**
 * State manager for CLab workspace persistence.
 */
import {
    state,
    buildPersistedState,
    hydrateStateFromPersisted,
    ensureWorkspaceRuntime,
    WORKSPACE_SCHEMA_VERSION,
} from "./components/ui_state.js";
import { loadAllTextHistory, ensureInputSnapshotState } from "./components/modules/media_types/media_utils.js";
import { prepareConfigStorage } from "./config_storage.js";

function placeConfigNode(node, graph, canvas) {
    const view = canvas.ds?.visible_area;
    const visible = view && view[2] > 0 && view[3] > 0;
    const [x, y, width, height] = visible ? view : [0, 0, window.innerWidth || 1100, window.innerHeight || 800];
    const [nodeWidth, nodeHeight] = node.size || [300, 100];
    const center = [x + (width - nodeWidth) / 2, y + (height - nodeHeight) / 2];
    const gap = 24;
    const overlaps = ([left, top]) => graph._nodes.some(other => other.pos && other.size &&
        left < other.pos[0] + other.size[0] + gap && left + nodeWidth + gap > other.pos[0] &&
        top < other.pos[1] + other.size[1] + gap && top + nodeHeight + gap > other.pos[1]);
    if (!overlaps(center)) return center;
    for (let step = 1; step <= 3; step++) {
        const dx = step * (nodeWidth + gap), dy = step * (nodeHeight + gap);
        const offsets = [[0,dy],[dx,0],[-dx,0],[0,-dy],[dx,dy],[-dx,dy],[dx,-dy],[-dx,-dy]];
        for (const [offsetX, offsetY] of offsets) {
            const pos = [center[0] + offsetX, center[1] + offsetY];
            if (pos[0] >= x && pos[1] >= y && pos[0] + nodeWidth <= x + width &&
                pos[1] + nodeHeight <= y + height && !overlaps(pos)) return pos;
        }
    }
    return center;
}

export const StateManager = {
    state,
    _lastSyncedJSON: "",
    _watchdogTimer: null,
    _saveTimer: null,
    _pendingAnchorCanvas: null,
    _loadTimer: null,

    scheduleLoadFromNode(graph) {
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
        this._pendingAnchorCanvas = null;
        clearTimeout(this._loadTimer);
        // Graph configure clears and repopulates nodes in the same turn.
        this._loadTimer = setTimeout(() => {
            this._loadTimer = null;
            this.loadFromNode(graph);
        }, 0);
    },

    scheduleSyncToNode(graph, canvas) {
        if (canvas) this._pendingAnchorCanvas = canvas;
        if (this._saveTimer !== null) return;
        this._saveTimer = setTimeout(() => this.syncToNode(graph), 250);
    },

    scheduleViewSyncToNode(graph) {
        clearTimeout(this._saveTimer);
        this._saveTimer = setTimeout(() => this.syncToNode(graph), 200);
    },

    flushPendingSave(graph) {
        if (this._saveTimer !== null) this.syncToNode(graph);
    },

    startWatchdog(graph) {
        if (this._watchdogTimer) return;

        this._watchdogTimer = setInterval(() => {
            if (!graph) return;
            const node = this.getConfigNode(graph);

            if (!node && this._lastSyncedJSON !== "") {
                this.loadFromNode(graph);
                return;
            }

            if (node) {
                const widget = node.widgets?.find((w) => w.name === "scenes_data");
                if (widget && widget.value && widget.value !== this._lastSyncedJSON) {
                    this.loadFromNode(graph);
                }
            }
        }, 800);
    },

    getConfigNode(graph) {
        if (!graph) return null;
        const nodes = graph._nodes.filter((n) => n.type === "CLab_SystemConfig");
        if (nodes.length === 0) return null;

        for (let i = nodes.length - 1; i >= 0; i -= 1) {
            const widget = nodes[i].widgets?.find((w) => w.name === "scenes_data");
            if (widget && widget.value && widget.value.length > 20) {
                return nodes[i];
            }
        }

        return nodes[nodes.length - 1];
    },

    syncToNode(graph, canvas) {
        const anchorCanvas = canvas || this._pendingAnchorCanvas;
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
        this._pendingAnchorCanvas = null;
        if (this._loadTimer !== null) return;
        const node = this.getConfigNode(graph) || (anchorCanvas && this.createConfigNode(graph, anchorCanvas));
        if (node) {
            const widget = node.widgets?.find((w) => w.name === "scenes_data");
            if (widget) {
                const persisted = buildPersistedState();
                const jsonStr = JSON.stringify(persisted);
                if (widget.value !== jsonStr) widget.value = jsonStr;
                this._lastSyncedJSON = jsonStr;
            }
        }

        this.startWatchdog(graph);
    },

    async loadFromNode(graph) {
        clearTimeout(this._loadTimer);
        this._loadTimer = null;
        clearTimeout(this._saveTimer);
        this._saveTimer = null;
        this._pendingAnchorCanvas = null;
        const widget = this.getConfigNode(graph)?.widgets?.find((w) => w.name === "scenes_data");
        if (!widget?.value) {
            hydrateStateFromPersisted();
            this._lastSyncedJSON = "";
            document.dispatchEvent(new CustomEvent("clab_state_cleared"));
            this.startWatchdog(graph);
            return;
        }

        try {
            this._lastSyncedJSON = widget.value;
            const parsed = JSON.parse(widget.value);
            hydrateStateFromPersisted(parsed);
            if (parsed.schemaVersion !== WORKSPACE_SCHEMA_VERSION) this.scheduleSyncToNode(graph);

            await this.syncLocalHistoryToOutputAreas();
            await this.reloadTextHistoriesFromFiles();
            document.dispatchEvent(new CustomEvent("clab_state_loaded", { detail: state }));
        } catch (e) {
            console.error("[CLab] Failed to parse saved state:", e);
        }

        this.startWatchdog(graph);
    },

    async syncLocalHistoryToOutputAreas() {
        try {
            const resp = await fetch("/clab/get_local_history");
            const data = await resp.json();

            if (data.status !== "success" || !data.history || data.history.length === 0) return;

            const localUrls = data.history.map((item) => item.url);
            if (!state.cards) return;

            state.cards.forEach((card) => {
                card.areas?.forEach((area) => {
                    if (area.type !== "output" && area.type !== "preview") return;
                    if (!area.history) area.history = [];

                    const newUrls = localUrls.filter((url) => !area.history.some((historyUrl) => historyUrl.split("&t=")[0] === url.split("&t=")[0]));

                    if (newUrls.length > 0) {
                        area.history = [...area.history, ...newUrls];
                        ensureInputSnapshotState(area);
                        if (!area.resultUrl && area.history.length > 0) {
                            area.historyIndex = area.history.length - 1;
                            area.resultUrl = area.history[area.historyIndex];
                        }
                    }
                });
            });
        } catch (e) {
            console.error("[CLab] syncLocalHistoryToOutputAreas failed:", e);
        }
    },

    async reloadTextHistoriesFromFiles() {
        if (!Array.isArray(state.cards) || state.cards.length === 0) return;

        const tasks = [];
        state.cards.forEach((card) => {
            card.areas?.forEach((area) => {
                if (area.type !== "preview") return;
                tasks.push(loadAllTextHistory(area, { force: true, refresh: false }));
            });
        });

        if (tasks.length === 0) return;

        try {
            await Promise.all(tasks);
        } catch (e) {
            console.error("[CLab] reloadTextHistoriesFromFiles failed:", e);
        }
    },

    createConfigNode(graph, canvas) {
        const node = LiteGraph.createNode("CLab_SystemConfig");
        if (!node) return null;
        prepareConfigStorage(node);
        node.pos = placeConfigNode(node, graph, canvas);
        graph.add(node);

        // The node-created callback queues a load; this fresh node has no saved data yet.
        clearTimeout(this._loadTimer);
        this._loadTimer = null;
        return node;
    },

    getActiveCard() {
        return this.state.cards.find((card) => card.id === this.state.activeCardId);
    },

    getActiveWorkspace() {
        const idx = this.state.workspaces.findIndex((workspace) => workspace.id === this.state.activeWorkspaceId);
        return idx === -1 ? null : this.state.workspaces[idx];
    },

    ensureRuntime() {
        ensureWorkspaceRuntime();
    },
};

if (typeof window !== "undefined") {
    window.StateManager = StateManager;
}
