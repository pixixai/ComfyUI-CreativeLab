/**
 * 文件名: shared.js
 * 路径: web/components/contextmenu/content/shared.js
 * 职责: 在内容分组（content）上下文中共享调用的常见纯函数及常量等，供内部各模块低耦合导入调用。
 * 通用工具（toast、url 解析、下载命名、escape 等）
 */

export function sanitizeDownloadNamePart(value) {
    if (value == null) return "";
    return String(value)
        .replace(/[\\/:*?"<>|]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

export function toSnapshotValueString(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    try {
        return JSON.stringify(value);
    } catch (_) {
        return String(value);
    }
}

export function trimSnapshotValue(value) {
    const safe = sanitizeDownloadNamePart(toSnapshotValueString(value));
    return safe.length > 10 ? safe.slice(0, 10) : safe;
}

export function parseNumberedDefaultTitle(title) {
    const text = (title || "").trim();
    if (!text) return null;
    const match = text.match(/^#+\s*(\d+)$/);
    return match ? match[1] : null;
}

export function normalizeHistoryUrl(urlStr) {
    if (!urlStr) return "";
    try {
        const u = new URL(urlStr, window.location.origin);
        const params = new URLSearchParams(u.search);
        params.delete("t");
        return `${u.pathname}?${params.toString()}`;
    } catch (_) {
        return String(urlStr).replace(/([?&])t=[^&]*/g, "").replace(/[?&]$/, "");
    }
}

export function getPreviewOrderInCard(card, areaId) {
    if (!card || !Array.isArray(card.areas)) return 1;
    let previewOrder = 0;
    for (const area of card.areas) {
        if (area?.type !== "preview") continue;
        previewOrder += 1;
        if (area.id === areaId) return previewOrder;
    }
    return Math.max(1, previewOrder);
}

export function parseExtFromUrl(urlStr) {
    try {
        const urlObj = new URL(urlStr, window.location.origin);
        const filename = urlObj.searchParams.get("filename") || "";
        const match = filename.match(/(\.[^./\\]+)$/);
        return match ? match[1] : "";
    } catch (_) {
        return "";
    }
}

export function buildParamTokensFromSnapshot(snapshotEntries) {
    if (!Array.isArray(snapshotEntries) || snapshotEntries.length === 0) return [];
    const tokens = [];

    snapshotEntries.forEach((entry, entryIndex) => {
        if (!entry || typeof entry !== "object") return;

        const rawValue = trimSnapshotValue(entry.value);
        const widgetNames = [];

        if (Array.isArray(entry.targetWidgets) && entry.targetWidgets.length > 0) {
            entry.targetWidgets.forEach((item) => {
                const parts = String(item).split("||");
                const widget = parts[1] == null ? "" : String(parts[1]).trim();
                if (widget) widgetNames.push(widget);
            });
        }

        if (widgetNames.length === 0 && entry.targetWidget) {
            const singleWidget = String(entry.targetWidget).trim();
            if (singleWidget) widgetNames.push(singleWidget);
        }

        if (widgetNames.length === 0 && entry.title) {
            const titleName = String(entry.title).trim();
            if (titleName) widgetNames.push(titleName);
        }

        const uniqueNames = [...new Set(widgetNames)];
        if (uniqueNames.length === 0) return;

        uniqueNames.forEach((name, nameIndex) => {
            const safeName = sanitizeDownloadNamePart(name) || `param${entryIndex + 1}_${nameIndex + 1}`;
            tokens.push(`[${safeName}-${rawValue}]`);
        });
    });

    return tokens;
}

export function ensureUniqueDownloadName(filename, usedNames) {
    const safe = filename || `media_${Date.now()}`;
    const dotIndex = safe.lastIndexOf(".");
    const hasExt = dotIndex > 0;
    const base = hasExt ? safe.slice(0, dotIndex) : safe;
    const ext = hasExt ? safe.slice(dotIndex) : "";
    const keyOf = (name) => String(name).toLowerCase();

    let candidate = safe;
    let suffix = 2;
    const maxLength = 120;
    while (usedNames.has(keyOf(candidate))) {
        const suffixText = `_${suffix++}`;
        const keepLen = Math.max(1, maxLength - ext.length - suffixText.length);
        const nextBase = base.slice(0, keepLen).replace(/[_\s]+$/g, "").trim() || "media";
        candidate = `${nextBase}${suffixText}${ext}`;
    }
    usedNames.add(keyOf(candidate));
    return candidate;
}

export function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

export function parseAssetMetaFromUrl(url) {
    if (!url) return { filename: "", subfolder: "", type: "output" };
    try {
        const resolved = new URL(url, window.location.origin);
        return {
            filename: resolved.searchParams.get("filename") || "",
            subfolder: resolved.searchParams.get("subfolder") || "",
            type: resolved.searchParams.get("type") || "output",
        };
    } catch (_) {
        return { filename: "", subfolder: "", type: "output" };
    }
}

export function formatSnapshotValue(value) {
    if (value == null) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    try {
        return JSON.stringify(value, null, 2);
    } catch (_) {
        return String(value);
    }
}

export function getSnapshotRows(snapshotEntries) {
    if (!Array.isArray(snapshotEntries) || snapshotEntries.length === 0) return [];
    const rows = [];

    snapshotEntries.forEach((entry, entryIndex) => {
        if (!entry || typeof entry !== "object") return;

        const names = [];
        if (Array.isArray(entry.targetWidgets) && entry.targetWidgets.length > 0) {
            entry.targetWidgets.forEach((item) => {
                const [, widget] = String(item || "").split("||");
                const safeName = String(widget || "").trim();
                if (safeName) names.push(safeName);
            });
        }
        if (names.length === 0 && entry.targetWidget) {
            const name = String(entry.targetWidget).trim();
            if (name) names.push(name);
        }
        if (names.length === 0 && entry.title) {
            const name = String(entry.title).trim();
            if (name) names.push(name);
        }

        rows.push({
            key: [...new Set(names)].join(", ") || `参数 ${entryIndex + 1}`,
            node: entry.targetNodeId == null ? "" : String(entry.targetNodeId),
            type: entry.dataType || "string",
            value: formatSnapshotValue(entry.value),
        });
    });

    return rows;
}

export function clampValue(value, min, max) {
    return Math.min(max, Math.max(min, value));
}

export function getTextFileExtension(entryUrl) {
    try {
        const url = new URL(entryUrl || "", window.location.origin);
        const filename = url.searchParams.get("filename") || "";
        const fromName = filename.match(/\.([^.]+)$/);
        if (fromName) return String(fromName[1] || "").toLowerCase();
        const fromPath = url.pathname.match(/\.([^.\/]+)$/);
        return fromPath ? String(fromPath[1] || "").toLowerCase() : "";
    } catch (_) {
        const match = String(entryUrl || "").match(/\.([^.?\s/\\]+)(?:\?|$)/);
        return match ? String(match[1] || "").toLowerCase() : "";
    }
}

export function getCodeMirrorLanguageExtension(cmLib, entry) {
    const ext = getTextFileExtension(entry?.url || "");
    if (ext === "py" || ext === "pyw") return cmLib.python();
    if (ext === "json" || ext === "jsonl") return cmLib.json();
    if (ext === "md" || ext === "markdown") return cmLib.markdown();
    if (ext === "ts") return cmLib.javascript({ typescript: true });
    if (ext === "tsx") return cmLib.javascript({ typescript: true, jsx: true });
    if (ext === "jsx") return cmLib.javascript({ jsx: true });
    if (["js", "mjs", "cjs"].includes(ext)) return cmLib.javascript();
    return cmLib.javascript();
}

export function sanitizeHref(url) {
    try {
        const resolved = new URL(url, window.location.origin);
        if (["http:", "https:", "mailto:"].includes(resolved.protocol)) return resolved.href;
    } catch (_) { }
    return "";
}

