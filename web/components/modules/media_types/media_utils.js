/**
 * 文件名: media_utils.js
 * 职责: 提供多媒体组件共用的纯函数 (时间格式化、类型探测等)
 */

function requestAreaRefresh(areaId, persist = false) {
    if (!areaId) return;
    if (window._clabSurgicallyUpdateArea) {
        window._clabSurgicallyUpdateArea(areaId);
        if (persist && window._clabJustSave) window._clabJustSave();
        return;
    }
    document.dispatchEvent(new CustomEvent("clab_render_ui"));
}

function normalizeTextValue(text) {
    if (Array.isArray(text)) return text.join("\n\n");
    if (text == null) return "";
    return String(text);
}

function appendCacheBust(url) {
    try {
        const resolved = new URL(url, window.location.origin);
        resolved.searchParams.set("t", Date.now());
        return `${resolved.pathname}${resolved.search}${resolved.hash}`;
    } catch (_) {
        return url;
    }
}

function ensureArrayLength(target, length, fillValue) {
    while (target.length < length) target.push(fillValue);
    if (target.length > length) target.length = length;
}

function deepCloneValue(value) {
    if (typeof structuredClone === "function") {
        try {
            return structuredClone(value);
        } catch (_) {}
    }
    try {
        return JSON.parse(JSON.stringify(value));
    } catch (_) {
        return value;
    }
}

function sanitizeIdList(values) {
    if (!Array.isArray(values)) return [];
    return values
        .map((value) => (value == null ? "" : String(value)))
        .filter((value) => value !== "");
}

function sanitizeWidgetList(values) {
    if (!Array.isArray(values)) return [];
    return values
        .map((value) => (value == null ? "" : String(value)))
        .filter((value) => value !== "");
}

function makeAreaId() {
    return `area_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
}

function sanitizeInputSnapshotEntry(entry) {
    if (!entry || typeof entry !== "object") return null;

    const title = typeof entry.title === "string" ? entry.title : "";
    const targetNodeId = entry.targetNodeId == null ? null : String(entry.targetNodeId);
    const targetWidget = entry.targetWidget == null ? null : String(entry.targetWidget);

    let targetNodeIds = sanitizeIdList(entry.targetNodeIds);
    let targetWidgets = sanitizeWidgetList(entry.targetWidgets);

    if (targetNodeIds.length === 0 && targetNodeId) targetNodeIds = [targetNodeId];
    if (targetWidgets.length === 0 && targetNodeId && targetWidget) targetWidgets = [`${targetNodeId}||${targetWidget}`];

    return {
        sourceAreaId: entry.sourceAreaId == null ? null : String(entry.sourceAreaId),
        title,
        value: deepCloneValue(entry.value),
        targetNodeId,
        targetWidget,
        targetNodeIds,
        targetWidgets,
        dataType: typeof entry.dataType === "string" && entry.dataType ? entry.dataType : "string",
        autoHeight: entry.autoHeight !== false,
    };
}

function normalizeSnapshotTitle(title) {
    return typeof title === "string" ? title.trim() : "";
}

function getInjectableTargets(area) {
    if (!area || typeof area !== "object") return [];

    const widgetTargets = sanitizeWidgetList(area.targetWidgets)
        .map((item) => {
            const [nodeId, widget] = String(item).split("||");
            return {
                nodeId: nodeId == null ? "" : String(nodeId).trim(),
                widget: widget == null ? "" : String(widget).trim(),
            };
        })
        .filter((target) => target.nodeId !== "" && target.widget !== "");
    if (widgetTargets.length > 0) return widgetTargets;

    const nodeId = area.targetNodeId == null ? "" : String(area.targetNodeId).trim();
    const widget = area.targetWidget == null ? "" : String(area.targetWidget).trim();
    if (nodeId !== "" && widget !== "") {
        return [{ nodeId, widget }];
    }
    return [];
}

function buildBindingSignatureFromArea(area) {
    if (!area || typeof area !== "object") return "";
    const widgets = sanitizeWidgetList(area.targetWidgets);
    if (widgets.length > 0) {
        const sortedWidgets = [...widgets].sort();
        return `widgets:${sortedWidgets.join("|")}`;
    }

    const nodeId = area.targetNodeId == null ? "" : String(area.targetNodeId);
    const widget = area.targetWidget == null ? "" : String(area.targetWidget);
    if (nodeId && widget) return `single:${nodeId}||${widget}`;
    return "";
}

function buildBindingSignatureFromSnapshot(snapshot) {
    if (!snapshot || typeof snapshot !== "object") return "";
    const widgets = sanitizeWidgetList(snapshot.targetWidgets);
    if (widgets.length > 0) {
        const sortedWidgets = [...widgets].sort();
        return `widgets:${sortedWidgets.join("|")}`;
    }

    const nodeId = snapshot.targetNodeId == null ? "" : String(snapshot.targetNodeId);
    const widget = snapshot.targetWidget == null ? "" : String(snapshot.targetWidget);
    if (nodeId && widget) return `single:${nodeId}||${widget}`;
    return "";
}

function getComparableInputFromArea(area) {
    const safe = sanitizeInputSnapshotEntry({
        sourceAreaId: area?.id,
        title: area?.title || "",
        value: area?.value,
        targetNodeId: area?.targetNodeId,
        targetWidget: area?.targetWidget,
        targetNodeIds: area?.targetNodeIds,
        targetWidgets: area?.targetWidgets,
        dataType: area?.dataType,
        autoHeight: area?.autoHeight,
    });
    if (!safe) return null;
    return {
        title: safe.title,
        value: safe.value,
        targetNodeId: safe.targetNodeId,
        targetWidget: safe.targetWidget,
        targetNodeIds: safe.targetNodeIds,
        targetWidgets: safe.targetWidgets,
        dataType: safe.dataType,
        autoHeight: safe.autoHeight,
    };
}

function getComparableInputFromSnapshot(snapshot) {
    const safe = sanitizeInputSnapshotEntry(snapshot);
    if (!safe) return null;
    return {
        title: safe.title,
        value: safe.value,
        targetNodeId: safe.targetNodeId,
        targetWidget: safe.targetWidget,
        targetNodeIds: safe.targetNodeIds,
        targetWidgets: safe.targetWidgets,
        dataType: safe.dataType,
        autoHeight: safe.autoHeight,
    };
}

function isInputSnapshotEqualToArea(area, snapshot) {
    const current = getComparableInputFromArea(area);
    const next = getComparableInputFromSnapshot(snapshot);
    if (!current || !next) return false;
    try {
        return JSON.stringify(current) === JSON.stringify(next);
    } catch (_) {
        return false;
    }
}

export function normalizeHistoryUrl(url) {
    if (!url || typeof url !== "string") return "";
    try {
        const resolved = new URL(url, window.location.origin);
        resolved.searchParams.delete("t");
        return `${resolved.pathname}${resolved.search}${resolved.hash || ""}`;
    } catch (_) {
        return url.replace(/([?&])t=\d+(&)?/g, (_match, prefix, suffix) => (suffix ? prefix : ""))
            .replace(/[?&]$/, "");
    }
}

export function getHistoryIndexForUrl(area, url = area?.resultUrl) {
    if (!area || !Array.isArray(area.history) || area.history.length === 0 || !url) return -1;
    const normalized = normalizeHistoryUrl(url);
    return area.history.findIndex((historyUrl) => normalizeHistoryUrl(historyUrl) === normalized);
}

function getSelectedHistoryIndex(area) {
    if (!area || !Array.isArray(area.history) || area.history.length === 0) return -1;
    let activeIndex = Number.isInteger(area.historyIndex) ? area.historyIndex : -1;
    if (activeIndex < 0 || activeIndex >= area.history.length) {
        activeIndex = getHistoryIndexForUrl(area, area.resultUrl);
    }
    if (activeIndex < 0 && area.resultUrl) activeIndex = area.history.length - 1;
    return activeIndex;
}

export function ensureInputSnapshotState(area) {
    if (!area || typeof area !== "object") return;
    if (!Array.isArray(area.history)) area.history = [];
    if (!Array.isArray(area.inputHistorySnapshots)) area.inputHistorySnapshots = [];
    ensureArrayLength(area.inputHistorySnapshots, area.history.length, null);
}

export function captureCardInputSnapshot(card) {
    if (!card || !Array.isArray(card.areas)) return [];

    const snapshots = [];
    card.areas.forEach((area) => {
        if (!area || area.type !== "edit") return;
        if (getInjectableTargets(area).length === 0) return;

        const snapshot = sanitizeInputSnapshotEntry({
            sourceAreaId: area.id,
            title: area.title || "",
            value: area.value,
            targetNodeId: area.targetNodeId,
            targetWidget: area.targetWidget,
            targetNodeIds: area.targetNodeIds,
            targetWidgets: area.targetWidgets,
            dataType: area.dataType,
            autoHeight: area.autoHeight,
        });
        if (snapshot) snapshots.push(snapshot);
    });

    return snapshots;
}

function applySnapshotToInputArea(area, snapshot) {
    if (!area || !snapshot) return false;
    const safeSnapshot = sanitizeInputSnapshotEntry(snapshot);
    if (!safeSnapshot) return false;

    const didChange = !isInputSnapshotEqualToArea(area, safeSnapshot);

    area.type = "edit";
    area.title = safeSnapshot.title;
    area.value = deepCloneValue(safeSnapshot.value);
    area.targetNodeId = safeSnapshot.targetNodeId;
    area.targetWidget = safeSnapshot.targetWidget;
    area.targetNodeIds = [...safeSnapshot.targetNodeIds];
    area.targetWidgets = [...safeSnapshot.targetWidgets];
    area.dataType = safeSnapshot.dataType;
    area.autoHeight = safeSnapshot.autoHeight;

    return didChange;
}

export function restoreCardInputsFromSnapshot(card, snapshotEntries) {
    if (!card || !Array.isArray(card.areas) || !Array.isArray(snapshotEntries)) {
        return { changed: false, createdAreaIds: [], touchedAreaIds: [] };
    }

    const snapshots = snapshotEntries
        .map((entry) => sanitizeInputSnapshotEntry(entry))
        .filter((entry) => !!entry);
    if (snapshots.length === 0) {
        return { changed: false, createdAreaIds: [], touchedAreaIds: [] };
    }

    const currentInputs = card.areas.filter((area) => area?.type === "edit");
    const usedSnapshotIndexes = new Set();
    const usedAreaIds = new Set();
    const touchedAreaIds = [];
    const createdAreaIds = [];
    let changed = false;

    const markTouched = (areaId) => {
        if (!areaId || touchedAreaIds.includes(areaId)) return;
        touchedAreaIds.push(areaId);
    };

    const tryMatch = (predicate, snapshotIndex) => {
        const targetArea = currentInputs.find((area) => {
            if (!area || usedAreaIds.has(area.id)) return false;
            return predicate(area);
        });
        if (!targetArea) return false;

        usedAreaIds.add(targetArea.id);
        usedSnapshotIndexes.add(snapshotIndex);
        if (applySnapshotToInputArea(targetArea, snapshots[snapshotIndex])) {
            changed = true;
            markTouched(targetArea.id);
        }
        return true;
    };

    snapshots.forEach((snapshot, index) => {
        if (snapshot.sourceAreaId == null) return;
        tryMatch((area) => String(area.id) === snapshot.sourceAreaId, index);
    });

    snapshots.forEach((snapshot, index) => {
        if (usedSnapshotIndexes.has(index)) return;
        const signature = buildBindingSignatureFromSnapshot(snapshot);
        if (!signature) return;
        tryMatch((area) => buildBindingSignatureFromArea(area) === signature, index);
    });

    snapshots.forEach((snapshot, index) => {
        if (usedSnapshotIndexes.has(index)) return;
        const title = normalizeSnapshotTitle(snapshot.title);
        if (!title) return;
        tryMatch((area) => normalizeSnapshotTitle(area.title || "") === title, index);
    });

    const lastInputIndex = card.areas.reduce((lastIndex, area, index) => (area?.type === "edit" ? index : lastIndex), -1);
    let insertIndex = lastInputIndex + 1;

    snapshots.forEach((snapshot, index) => {
        if (usedSnapshotIndexes.has(index)) return;

        const newArea = {
            id: makeAreaId(),
            type: "edit",
            title: "",
            value: "",
            targetNodeId: null,
            targetWidget: null,
            targetNodeIds: [],
            targetWidgets: [],
            dataType: "string",
            autoHeight: true,
        };
        applySnapshotToInputArea(newArea, snapshot);
        card.areas.splice(insertIndex, 0, newArea);
        insertIndex += 1;

        changed = true;
        createdAreaIds.push(newArea.id);
        markTouched(newArea.id);
    });

    return { changed, createdAreaIds, touchedAreaIds };
}

export function restoreCardInputsFromHistorySelection(card, previewArea) {
    if (!card || !previewArea) {
        return { changed: false, createdAreaIds: [], touchedAreaIds: [] };
    }

    ensureInputSnapshotState(previewArea);
    const activeIndex = getSelectedHistoryIndex(previewArea);
    if (activeIndex < 0 || activeIndex >= previewArea.inputHistorySnapshots.length) {
        return { changed: false, createdAreaIds: [], touchedAreaIds: [] };
    }

    const snapshots = previewArea.inputHistorySnapshots[activeIndex];
    if (!Array.isArray(snapshots) || snapshots.length === 0) {
        return { changed: false, createdAreaIds: [], touchedAreaIds: [] };
    }

    return restoreCardInputsFromSnapshot(card, snapshots);
}

export function formatTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
}

export function formatTimeWithFrames(seconds, fps = 30) {
    if (isNaN(seconds) || !isFinite(seconds)) return "00:00:00";
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    const f = Math.floor((seconds % 1) * fps).toString().padStart(2, '0');
    return `${m}:${s}:${f}`;
}

export function getMediaType(url) {
    if (!url) return "none";
    const cleanUrl = url.split("?")[0].toLowerCase();
    
    try {
        const resolved = new URL(url, window.location.origin);
        const filename = resolved.searchParams.get("filename") || "";
        const ext = filename.split(".").pop().toLowerCase();
        if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return "video";
        if (["mp3", "wav", "ogg", "flac", "aac", "m4a"].includes(ext)) return "audio";
        if (["png", "jpg", "jpeg", "webp", "gif", "bmp"].includes(ext)) return "image";
        if (["txt", "md", "markdown", "json", "yaml", "yml", "xml", "csv", "log"].includes(ext)) return "text";
        if (filename !== "") return "file";
    } catch (_) {}

    if (cleanUrl.match(/\.(mp4|webm|mov|avi|mkv)$/)) return "video";
    if (cleanUrl.match(/\.(mp3|wav|ogg|flac|aac|m4a)$/)) return "audio";
    if (cleanUrl.match(/\.(png|jpg|jpeg|webp|gif|bmp)$/)) return "image";
    if (cleanUrl.match(/\.(txt|md|markdown|json|yaml|yml|xml|csv|log)$/)) return "text";
    return "file";
}

export function isTextMediaType(type) {
    return type === "text";
}

export function getAreaResultType(area) {
    if (!area || typeof area !== "object") return "none";
    if (area.resultUrl) {
        const urlType = getMediaType(area.resultUrl);
        if (urlType && urlType !== "none") return urlType;
    }
    if (area.resultKind) return area.resultKind;
    if (Array.isArray(area.history)) {
        const activeIndex = getSelectedHistoryIndex(area);
        if (activeIndex >= 0) return getMediaType(area.history[activeIndex]);
    }
    return "none";
}

export function ensureTextAreaState(area) {
    if (!area || typeof area !== "object") return;
    if (!Array.isArray(area.history)) area.history = [];
    ensureInputSnapshotState(area);
    if (!Array.isArray(area.textHistory)) area.textHistory = [];
    if (!Array.isArray(area.textHistoryStatus)) area.textHistoryStatus = [];
    ensureArrayLength(area.textHistory, area.history.length, "");
    ensureArrayLength(area.textHistoryStatus, area.history.length, "idle");
    if (typeof area.textContent !== "string") {
        area.textContent = area.textContent == null ? "" : String(area.textContent);
    }
    if (typeof area.textLoadState !== "string") area.textLoadState = "idle";
    if (typeof area.textPreviewMarkdown !== "boolean") area.textPreviewMarkdown = false;
    if (typeof area.textSyntaxHighlight !== "boolean") area.textSyntaxHighlight = false;
}

export function syncTextContentWithSelection(area) {
    if (!area || typeof area !== "object") return -1;
    ensureTextAreaState(area);

    const activeIndex = getSelectedHistoryIndex(area);
    if (activeIndex < 0 || getMediaType(area.history[activeIndex]) !== "text") {
        if (area.resultKind === "text") area.resultKind = "";
        area.textLoadState = "idle";
        area.textContent = "";
        return activeIndex;
    }

    area.resultKind = "text";
    area.historyIndex = activeIndex;
    area.resultUrl = area.history[activeIndex];

    const status = area.textHistoryStatus[activeIndex] || "idle";
    area.textLoadState = status;
    area.textContent = status === "ready" ? (area.textHistory[activeIndex] ?? "") : "";
    return activeIndex;
}

export async function loadTextHistoryEntry(area, index, options = {}) {
    if (!area || typeof area !== "object") return false;
    ensureTextAreaState(area);

    if (!Array.isArray(area.history) || index < 0 || index >= area.history.length) return false;
    const sourceUrl = area.history[index];
    if (getMediaType(sourceUrl) !== "text") return false;

    const force = options.force === true;
    const persist = options.persist === true;
    const shouldRefresh = options.refresh !== false;
    const normalizedUrl = normalizeHistoryUrl(sourceUrl);
    const currentIndex = getHistoryIndexForUrl(area, sourceUrl);
    if (currentIndex === -1) return false;

    if (!force && area.textHistoryStatus[currentIndex] === "ready" && typeof area.textHistory[currentIndex] === "string") {
        const selectedIndex = syncTextContentWithSelection(area);
        if (shouldRefresh && selectedIndex === currentIndex) requestAreaRefresh(area.id, persist);
        return false;
    }

    area.textHistoryStatus[currentIndex] = "loading";
    const selectedIndexBefore = syncTextContentWithSelection(area);
    if (shouldRefresh && selectedIndexBefore === currentIndex) requestAreaRefresh(area.id, persist);

    try {
        const response = await fetch(force ? appendCacheBust(sourceUrl) : sourceUrl, { cache: "no-store" });
        const latestIndex = area.history.findIndex((historyUrl) => normalizeHistoryUrl(historyUrl) === normalizedUrl);
        if (latestIndex === -1) return false;

        if (!response.ok) {
            area.textHistory[latestIndex] = "";
            area.textHistoryStatus[latestIndex] = response.status === 404 ? "missing" : "error";
            const selectedIndex = syncTextContentWithSelection(area);
            if (shouldRefresh && selectedIndex === latestIndex) requestAreaRefresh(area.id, persist);
            return true;
        }

        const text = await response.text();
        area.textHistory[latestIndex] = text;
        area.textHistoryStatus[latestIndex] = "ready";
        const selectedIndex = syncTextContentWithSelection(area);
        if (shouldRefresh && (selectedIndex === latestIndex || area.isManageMode)) {
            requestAreaRefresh(area.id, persist);
        }
        return true;
    } catch (_) {
        const latestIndex = area.history.findIndex((historyUrl) => normalizeHistoryUrl(historyUrl) === normalizedUrl);
        if (latestIndex === -1) return false;
        area.textHistory[latestIndex] = "";
        area.textHistoryStatus[latestIndex] = "error";
        const selectedIndex = syncTextContentWithSelection(area);
        if (shouldRefresh && selectedIndex === latestIndex) requestAreaRefresh(area.id, persist);
        return true;
    }
}

export async function loadSelectedTextContent(area, options = {}) {
    if (!area || typeof area !== "object") return false;
    ensureTextAreaState(area);

    const activeIndex = syncTextContentWithSelection(area);
    if (activeIndex < 0 || getMediaType(area.history?.[activeIndex]) !== "text") return false;
    return loadTextHistoryEntry(area, activeIndex, options);
}

export async function loadAllTextHistory(area, options = {}) {
    if (!area || typeof area !== "object") return false;
    ensureTextAreaState(area);

    const textIndices = area.history
        .map((url, historyIndex) => (getMediaType(url) === "text" ? historyIndex : -1))
        .filter((historyIndex) => historyIndex >= 0);

    if (textIndices.length === 0) {
        syncTextContentWithSelection(area);
        return false;
    }

    let changed = false;
    for (const historyIndex of textIndices) {
        const didChange = await loadTextHistoryEntry(area, historyIndex, { ...options, refresh: false });
        if (didChange) changed = true;
    }

    syncTextContentWithSelection(area);
    if (options.refresh !== false && changed) requestAreaRefresh(area.id, options.persist === true);
    return changed;
}

export function clearPreviewHistory(area) {
    if (!area || typeof area !== "object") return;
    area.resultUrl = "";
    area.history = [];
    area.historyIndex = 0;
    area.selectedThumbIndices = [];
    area.inputHistorySnapshots = [];
    area.textHistory = [];
    area.textHistoryStatus = [];
    area.textContent = "";
    area.textLoadState = "idle";
    if (area.resultKind === "text") area.resultKind = "";
}

export function removePreviewHistoryIndex(area, index) {
    if (!area || typeof area !== "object" || !Array.isArray(area.history)) return;
    if (index < 0 || index >= area.history.length) return;

    area.history = area.history.filter((_, historyIndex) => historyIndex !== index);
    if (Array.isArray(area.inputHistorySnapshots)) {
        area.inputHistorySnapshots = area.inputHistorySnapshots.filter((_, historyIndex) => historyIndex !== index);
    }
    if (Array.isArray(area.textHistory)) {
        area.textHistory = area.textHistory.filter((_, historyIndex) => historyIndex !== index);
    }
    if (Array.isArray(area.textHistoryStatus)) {
        area.textHistoryStatus = area.textHistoryStatus.filter((_, historyIndex) => historyIndex !== index);
    }

    area.selectedThumbIndices = [];

    if (area.history.length === 0) {
        area.resultUrl = "";
        area.historyIndex = 0;
        area.textContent = "";
        area.textLoadState = "idle";
        if (area.resultKind === "text") area.resultKind = "";
        return;
    }

    const nextIndex = Math.max(0, Math.min(index, area.history.length - 1));
    area.historyIndex = nextIndex;
    area.resultUrl = area.history[nextIndex];
    syncTextContentWithSelection(area);
}

export function pushPreviewHistoryEntry(area, url, options = {}) {
    if (!area || typeof area !== "object" || !url) return false;
    if (!Array.isArray(area.history)) area.history = [];
    ensureInputSnapshotState(area);

    const kind = options.kind || getMediaType(url);
    const textValue = normalizeTextValue(options.text);
    const inputSnapshot = Array.isArray(options.inputSnapshot)
        ? options.inputSnapshot.map((entry) => sanitizeInputSnapshotEntry(entry)).filter((entry) => !!entry)
        : null;

    if (kind === "text") {
        ensureTextAreaState(area);
        area.resultKind = "text";
    } else if (kind && kind !== "none") {
        area.resultKind = kind;
    }

    const lastUrl = area.history[area.history.length - 1];
    const lastText = Array.isArray(area.textHistory) ? area.textHistory[area.textHistory.length - 1] : "";
    const isDuplicate = kind === "text"
        ? normalizeHistoryUrl(lastUrl) === normalizeHistoryUrl(url) && lastText === textValue
        : normalizeHistoryUrl(lastUrl) === normalizeHistoryUrl(url);

    if (!isDuplicate) {
        area.history.push(url);
        area.inputHistorySnapshots.push(inputSnapshot ? deepCloneValue(inputSnapshot) : null);
        if (kind === "text") {
            area.textHistory.push(textValue);
            area.textHistoryStatus.push("ready");
        }

        const maxLimit = window._clabMaxHistory || 50;
        while (area.history.length > maxLimit) {
            area.history.shift();
            area.inputHistorySnapshots.shift();
            if (kind === "text") {
                area.textHistory.shift();
                area.textHistoryStatus.shift();
            }
        }
    } else if (inputSnapshot && area.history.length > 0) {
        area.inputHistorySnapshots[area.history.length - 1] = deepCloneValue(inputSnapshot);
    }

    area.historyIndex = area.history.length - 1;
    area.resultUrl = area.history[area.historyIndex] || "";

    if (kind === "text") {
        area.textContent = textValue;
        area.textLoadState = "ready";
    }

    return !isDuplicate;
}
