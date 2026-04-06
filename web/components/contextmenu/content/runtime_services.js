/**
 * 文件名: runtime_services.js
 * 路径: web/components/contextmenu/content/runtime_services.js
 * 职责: 封装和处理浏览器能力级功能调用，如下载、发送 API 请求和响应预处理，或调用全局的弹出 Toast 事件等。
 */
import { state } from "../../ui_state.js";
import { showBindingToast, hideBindingToast } from "../../ui_utils.js";
import {
    sanitizeDownloadNamePart,
    parseNumberedDefaultTitle,
    getPreviewOrderInCard,
    parseExtFromUrl,
    buildParamTokensFromSnapshot,
    parseAssetMetaFromUrl,
} from "./shared.js";

export function showAutoToast(msg, isError = false) {
    if (window.CLab && window.CLab.showAutoToast) {
        window.CLab.showAutoToast(msg, isError);
    } else {
        showBindingToast(msg, isError);
        setTimeout(hideBindingToast, 3000);
    }
}

function showMediaMissingFallback(areaId) {
    const areaEl = document.querySelector(`.clab-area[data-area-id="${areaId}"]`);
    if (!areaEl) return;

    const mediaEl = areaEl.querySelector(".clab-preview-img, .clab-media-target, video, audio, img");
    if (!mediaEl) return;

    mediaEl.style.display = "none";
    const parent = mediaEl.parentElement;
    if (parent && !parent.querySelector(".clab-media-dead-fallback")) {
        parent.insertAdjacentHTML("beforeend", `
            <div class="clab-media-dead-fallback" style="position:absolute; inset:0; display:flex; flex-direction:column; justify-content:center; align-items:center; background:#1e1e1e; color:#ff5555; z-index:10; pointer-events:none;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                <span style="font-size:10px; margin-top:4px; color:#ccc;">资源文件不存在</span>
            </div>
        `);
    }
}

export async function probeMissingAndFallback(areaProbes) {
    const checks = areaProbes.map(async (item) => {
        if (!item || !item.url) return;
        try {
            const res = await fetch(item.url, { method: "HEAD", cache: "no-store" });
            if (!res.ok && res.status === 404) showMediaMissingFallback(item.areaId);
        } catch (_) {
            // ignore transient network errors here
        }
    });
    await Promise.all(checks);
}

function resolveCardLabel(card) {
    const cardIndex = state.cards.findIndex((c) => c.id === card?.id);
    const fallback = String((cardIndex >= 0 ? cardIndex : 0) + 1);
    const numbered = parseNumberedDefaultTitle(card?.title || "");
    if (numbered) return numbered;
    const safe = sanitizeDownloadNamePart(card?.title || "");
    return safe || fallback;
}

function resolveOutputLabel(card, area) {
    const previewOrder = getPreviewOrderInCard(card, area?.id);
    const fallback = String(previewOrder);
    const numbered = parseNumberedDefaultTitle(area?.title || "");
    if (numbered) return numbered;
    const safe = sanitizeDownloadNamePart(area?.title || "");
    return safe || fallback;
}

export function buildDownloadFilename({ card, area, historyIndex, url }) {
    const cardPart = resolveCardLabel(card);
    const outputPart = resolveOutputLabel(card, area);
    const historyPart = String((historyIndex >= 0 ? historyIndex : 0) + 1);
    const prefix = `${cardPart}_${outputPart}_${historyPart}`;

    const snapshot = (Array.isArray(area?.inputHistorySnapshots) && historyIndex >= 0)
        ? area.inputHistorySnapshots[historyIndex]
        : null;
    const tokens = buildParamTokensFromSnapshot(snapshot);
    const ext = parseExtFromUrl(url);
    const maxLength = 120;

    let paramBlock = "";
    for (const token of tokens) {
        const candidateParamBlock = `${paramBlock}${token}`;
        const candidateName = `${prefix}_${candidateParamBlock}`;
        if ((candidateName + ext).length > maxLength) break;
        paramBlock = candidateParamBlock;
    }

    let baseName = paramBlock ? `${prefix}_${paramBlock}` : prefix;
    if ((baseName + ext).length > maxLength) {
        const keepLen = Math.max(1, maxLength - ext.length);
        baseName = baseName.slice(0, keepLen).replace(/[_\s]+$/g, "").trim();
    }
    if (!baseName) baseName = `media_${Date.now()}`;
    return `${baseName}${ext}`;
}

export async function downloadFile(url, filename = "") {
    if (!url) return;
    try {
        const finalName = filename || (() => {
            const urlObj = new URL(url, window.location.origin);
            return urlObj.searchParams.get("filename") || `image_${Date.now()}.png`;
        })();
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = blobUrl;
        a.download = finalName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(blobUrl);
    } catch (error) {
        console.error("下载文件失败", error);
    }
}

export async function parseApiResponse(response) {
    const raw = await response.text();
    if (raw) {
        try {
            const data = JSON.parse(raw);
            if (!response.ok && data?.status !== "error") {
                return {
                    ...data,
                    status: "error",
                    error: data?.error || `HTTP ${response.status}`,
                };
            }
            return data;
        } catch (_) {
            // fall through
        }
    }
    if (response.ok) return { status: "success" };
    const firstLine = String(raw || "").trim().split(/\r?\n/)[0];
    return {
        status: "error",
        error: firstLine || `HTTP ${response.status}`,
    };
}

export async function openAssetWithSystem(action, url) {
    const meta = parseAssetMetaFromUrl(url);
    const payload = {
        action,
        media_url: url,
        filename: meta.filename,
        subfolder: meta.subfolder,
        type: meta.type,
    };

    let response = await fetch("/clab/open_asset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    let data = await parseApiResponse(response);

    // Compatibility fallback: some runtimes may expose only GET route.
    if ((data?.status !== "success") && response.status === 405) {
        const params = new URLSearchParams();
        Object.entries(payload).forEach(([key, value]) => {
            params.set(key, value == null ? "" : String(value));
        });
        response = await fetch(`/clab/open_asset?${params.toString()}`, { method: "GET" });
        data = await parseApiResponse(response);
    }

    if (data?.status !== "success") {
        throw new Error(data?.error || `open_asset failed (HTTP ${response.status})`);
    }
}
