/**
 * 文件名: preview_modal.js
 * 路径: web/components/contextmenu/content/preview_modal.js
 * 内容：预览弹窗（左中右布局、图片/音频/视频切换、键盘切换等）
 */
import { getMediaType } from "../../modules/media_types/media_utils.js";
import { previewModalStore } from "./state.js";
import {
    parseAssetMetaFromUrl,
    escapeHtml,
    normalizeHistoryUrl,
    clampValue,
    getSnapshotRows,
} from "./shared.js";

export function createPreviewModalApi({
    setupAudioWaveform,
    bindPreviewTextEditor,
    getPreviewTextState,
    renderPreviewTextHtml,
} = {}) {
    const safeSetupAudioWaveform = typeof setupAudioWaveform === "function" ? setupAudioWaveform : () => { };
    const safeBindPreviewTextEditor = typeof bindPreviewTextEditor === "function" ? bindPreviewTextEditor : () => { };
    const safeGetPreviewTextState = typeof getPreviewTextState === "function"
        ? getPreviewTextState
        : (_cacheKey, fallbackText = "") => ({
            text: String(fallbackText ?? ""),
            syntaxHighlight: false,
            previewMarkdown: false,
            dirty: false,
        });
    const safeRenderPreviewTextHtml = typeof renderPreviewTextHtml === "function"
        ? renderPreviewTextHtml
        : (text) => `<pre class="clab-text-plain"><code>${escapeHtml(String(text ?? ""))}</code></pre>`;

    function getActivePreviewEntry() {
        if (!Array.isArray(previewModalStore.entries) || previewModalStore.entries.length === 0) return null;
        if (previewModalStore.activeIndex < 0 || previewModalStore.activeIndex >= previewModalStore.entries.length) return null;
        return previewModalStore.entries[previewModalStore.activeIndex] || null;
    }

    function isEditableTarget(target) {
        if (!target) return false;
        const el = target instanceof Element ? target : null;
        if (!el) return false;
        if (el.closest("input, textarea, select, [contenteditable='true']")) return true;
        if (el.classList?.contains("clab-preview-modal-text-editor-input")) return true;
        return false;
    }

    function resetPreviewImageTransform() {
        previewModalStore.imageZoom = 1;
        previewModalStore.imagePanX = 0;
        previewModalStore.imagePanY = 0;
        previewModalStore.imageDragging = false;
    }

    function syncPreviewImageCursor(root) {
        const stage = root.querySelector(".clab-preview-modal-image-stage");
        if (!stage) return;
        stage.classList.toggle("hand-ready", previewModalStore.imageSpacePressed || previewModalStore.imageDragging);
        stage.classList.toggle("dragging", previewModalStore.imageDragging);
    }

    function teardownPreviewEnhancers() {
        if (typeof previewModalStore.activeAudioCleanup === "function") {
            try { previewModalStore.activeAudioCleanup(); } catch (_) { }
        }
        previewModalStore.activeAudioCleanup = null;
        if (typeof previewModalStore.activeTextCleanup === "function") {
            try { previewModalStore.activeTextCleanup(); } catch (_) { }
        }
        previewModalStore.activeTextCleanup = null;
        previewModalStore.imageDragging = false;
    }

    function switchPreviewEntry(step) {
        const total = previewModalStore.entries.length;
        if (total <= 1) return;
        previewModalStore.activeIndex = (previewModalStore.activeIndex + step + total) % total;
        resetPreviewImageTransform();
        renderPreviewModal();
    }

    function applyPreviewImageTransform(root) {
        const image = root.querySelector(".clab-preview-modal-main-image");
        if (!image) {
            syncPreviewImageCursor(root);
            return;
        }
        image.style.transform = `translate(${previewModalStore.imagePanX}px, ${previewModalStore.imagePanY}px) scale(${previewModalStore.imageZoom})`;
        syncPreviewImageCursor(root);
    }

    function buildPreviewEntries(area) {
        if (!area || typeof area !== "object") return [];
        const history = Array.isArray(area.history) ? area.history.filter(Boolean) : [];
        if (history.length > 0) {
            return history.map((url, index) => ({
                url,
                index,
                name: parseAssetMetaFromUrl(url).filename || `#${index + 1}`,
                type: getMediaType(url),
            }));
        }
        if (area.resultUrl) {
            return [{
                url: area.resultUrl,
                index: -1,
                name: parseAssetMetaFromUrl(area.resultUrl).filename || "当前资源",
                type: getMediaType(area.resultUrl),
            }];
        }
        return [];
    }

    function ensurePreviewModal() {
        if (previewModalStore.root && document.body.contains(previewModalStore.root)) {
            return previewModalStore.root;
        }

        const root = document.createElement("div");
        root.className = "clab-preview-modal";
        root.innerHTML = `
            <div class="clab-preview-modal-backdrop"></div>
            <div class="clab-preview-modal-panel">
                <div class="clab-preview-modal-head">
                    <div class="clab-preview-modal-title">预览模式</div>
                    <button class="clab-preview-modal-close" type="button">关闭</button>
                </div>
                <div class="clab-preview-modal-body">
                    <div class="clab-preview-modal-left"></div>
                    <div class="clab-preview-modal-center"></div>
                    <div class="clab-preview-modal-right"></div>
                </div>
            </div>
        `;
        document.body.appendChild(root);
        previewModalStore.root = root;

        const close = () => {
            root.classList.remove("visible");
            teardownPreviewEnhancers();
            previewModalStore.imageSpacePressed = false;
            resetPreviewImageTransform();
        };
        root.querySelector(".clab-preview-modal-backdrop").addEventListener("click", close);
        root.querySelector(".clab-preview-modal-close").addEventListener("click", close);
        root.addEventListener("click", (event) => {
            const thumb = event.target.closest(".clab-preview-modal-thumb");
            if (!thumb) return;
            const nextIndex = Number(thumb.dataset.index);
            if (!Number.isFinite(nextIndex) || nextIndex < 0 || nextIndex >= previewModalStore.entries.length) return;
            resetPreviewImageTransform();
            previewModalStore.activeIndex = nextIndex;
            renderPreviewModal();
        });

        const centerEl = root.querySelector(".clab-preview-modal-center");
        centerEl.addEventListener("wheel", (event) => {
            if (!root.classList.contains("visible")) return;
            const active = getActivePreviewEntry();
            if (!active || active.type !== "image") return;
            event.preventDefault();
            const factor = event.deltaY < 0 ? 1.12 : 0.9;
            previewModalStore.imageZoom = clampValue(previewModalStore.imageZoom * factor, 0.2, 6);
            applyPreviewImageTransform(root);
        }, { passive: false });

        centerEl.addEventListener("mousedown", (event) => {
            if (!root.classList.contains("visible")) return;
            const active = getActivePreviewEntry();
            if (!active || active.type !== "image") return;

            const middleButton = event.button === 1;
            const spaceDrag = event.button === 0 && previewModalStore.imageSpacePressed;
            if (!middleButton && !spaceDrag) return;

            event.preventDefault();
            event.stopPropagation();

            previewModalStore.imageDragging = true;
            previewModalStore.imageDragStartX = event.clientX;
            previewModalStore.imageDragStartY = event.clientY;
            previewModalStore.imageDragOriginX = previewModalStore.imagePanX;
            previewModalStore.imageDragOriginY = previewModalStore.imagePanY;
            applyPreviewImageTransform(root);
        });

        centerEl.addEventListener("auxclick", (event) => {
            if (!root.classList.contains("visible")) return;
            if (event.button !== 1) return;
            const active = getActivePreviewEntry();
            if (!active || active.type !== "image") return;
            event.preventDefault();
        });

        const stopImageDrag = () => {
            if (!previewModalStore.imageDragging) return;
            previewModalStore.imageDragging = false;
            applyPreviewImageTransform(root);
        };

        window.addEventListener("mousemove", (event) => {
            if (!root.classList.contains("visible")) return;
            if (!previewModalStore.imageDragging) return;
            const deltaX = event.clientX - previewModalStore.imageDragStartX;
            const deltaY = event.clientY - previewModalStore.imageDragStartY;
            previewModalStore.imagePanX = previewModalStore.imageDragOriginX + deltaX;
            previewModalStore.imagePanY = previewModalStore.imageDragOriginY + deltaY;
            applyPreviewImageTransform(root);
        });

        window.addEventListener("mouseup", stopImageDrag);
        window.addEventListener("blur", stopImageDrag);

        document.addEventListener("keydown", (event) => {
            if (!root.classList.contains("visible")) return;
            const active = getActivePreviewEntry();
            const typing = isEditableTarget(event.target) || isEditableTarget(document.activeElement);

            if ((event.key === " " || event.key === "Spacebar") && active?.type === "image" && !typing) {
                event.preventDefault();
                previewModalStore.imageSpacePressed = true;
                applyPreviewImageTransform(root);
                return;
            }

            if (event.key === "Escape") {
                event.preventDefault();
                close();
                return;
            }

            if ((event.ctrlKey || event.metaKey) && String(event.key || "").toLowerCase() === "s" && active?.type === "text") {
                event.preventDefault();
                const saveBtn = root.querySelector(".clab-preview-modal-text-save");
                if (saveBtn && !saveBtn.disabled) {
                    saveBtn.click();
                }
                return;
            }

            if (typing) return;

            if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
                event.preventDefault();
                switchPreviewEntry(-1);
                return;
            }
            if (event.key === "ArrowRight" || event.key === "ArrowDown") {
                event.preventDefault();
                switchPreviewEntry(1);
            }
        });

        document.addEventListener("keyup", (event) => {
            if (!root.classList.contains("visible")) return;
            if (event.key !== " " && event.key !== "Spacebar") return;
            if (!previewModalStore.imageSpacePressed) return;
            previewModalStore.imageSpacePressed = false;
            applyPreviewImageTransform(root);
        });

        return root;
    }

    function renderPreviewCenter(entry) {
        if (!entry) return `<div class="clab-preview-modal-empty">No preview resource</div>`;

        const safeUrl = escapeHtml(entry.url || "");
        const safeName = escapeHtml(entry.name || "");
        if (entry.type === "image") {
            return `
                <div class="clab-preview-modal-image-stage">
                    <img class="clab-preview-modal-main-image" src="${safeUrl}" alt="${safeName}" />
                </div>
            `;
        }
        if (entry.type === "video") {
            return `<video class="clab-preview-modal-main-video" src="${safeUrl}" controls autoplay loop muted playsinline></video>`;
        }
        if (entry.type === "audio") {
            return `
                <div class="clab-preview-modal-audio-wrap">
                    <div class="clab-preview-modal-audio-wave-wrap">
                        <canvas class="clab-preview-modal-audio-wave"></canvas>
                    </div>
                    <div class="clab-preview-modal-audio-name">${safeName || "Audio"}</div>
                    <audio class="clab-preview-modal-main-audio" src="${safeUrl}" controls></audio>
                </div>
            `;
        }
        if (entry.type === "text") {
            const cacheKey = normalizeHistoryUrl(entry.url || "");
            const cached = previewModalStore.textCache.get(cacheKey);
            if (!cached || cached.state === "loading") {
                if (!cached) {
                    previewModalStore.textCache.set(cacheKey, { state: "loading", text: "" });
                    fetch(entry.url, { cache: "no-store" })
                        .then((response) => response.ok ? response.text() : Promise.reject(new Error(`HTTP ${response.status}`)))
                        .then((text) => {
                            previewModalStore.textCache.set(cacheKey, { state: "ready", text });
                            renderPreviewModal();
                        })
                        .catch((error) => {
                            previewModalStore.textCache.set(cacheKey, { state: "error", text: String(error?.message || error || "load failed") });
                            renderPreviewModal();
                        });
                }
                return `<div class="clab-preview-modal-loading">文本加载中...</div>`;
            }
            if (cached.state === "error") {
                return `<div class="clab-preview-modal-error">文本加载失败: ${escapeHtml(cached.text || "未知错误")}</div>`;
            }

            const editorState = safeGetPreviewTextState(cacheKey, cached.text || "");
            const textValue = String(editorState.text ?? "");
            const body = `
                <div class="clab-preview-modal-text-editor-host clab-preview-modal-text-editor-code-host hidden"></div>
                <div class="clab-preview-modal-text-editor-host clab-preview-modal-text-editor-markdown-host hidden"></div>
                <textarea class="clab-preview-modal-text-editor-input" spellcheck="false">${escapeHtml(textValue)}</textarea>
            `;

            return `
                <div class="clab-preview-modal-text-editor" data-cache-key="${escapeHtml(cacheKey)}">
                    <div class="clab-preview-modal-text-toolbar">
                        <label class="clab-preview-modal-text-option">
                            <input type="checkbox" class="clab-preview-modal-text-opt-syntax" ${editorState.syntaxHighlight ? "checked" : ""}>
                            <span>语法高亮</span>
                        </label>
                        <label class="clab-preview-modal-text-option">
                            <input type="checkbox" class="clab-preview-modal-text-opt-markdown" ${editorState.previewMarkdown ? "checked" : ""}>
                            <span>预览Markdown</span>
                        </label>
                        <button type="button" class="clab-preview-modal-text-copy">复制</button>
                        <button type="button" class="clab-preview-modal-text-save" ${editorState.dirty ? "" : "disabled"}>保存</button>
                    </div>
                    <div class="clab-preview-modal-text-body">${body}</div>
                </div>
            `;
        }
        return `
            <div class="clab-preview-modal-file-wrap">
                <div class="clab-preview-modal-file-name">${safeName || "File"}</div>
                <a class="clab-preview-modal-file-link" href="${safeUrl}" target="_blank" rel="noopener noreferrer">Open resource link</a>
            </div>
        `;
    }

    function renderPreviewModal() {
        const root = ensurePreviewModal();
        const left = root.querySelector(".clab-preview-modal-left");
        const center = root.querySelector(".clab-preview-modal-center");
        const right = root.querySelector(".clab-preview-modal-right");
        const title = root.querySelector(".clab-preview-modal-title");

        const entries = previewModalStore.entries || [];
        if (entries.length === 0) {
            left.innerHTML = `<div class="clab-preview-modal-empty">No history records</div>`;
            center.innerHTML = `<div class="clab-preview-modal-empty">无可预览资源</div>`;
            right.innerHTML = `<div class="clab-preview-modal-empty">No parameter snapshots</div>`;
            return;
        }

        if (previewModalStore.activeIndex < 0 || previewModalStore.activeIndex >= entries.length) {
            previewModalStore.activeIndex = 0;
        }

        const active = entries[previewModalStore.activeIndex];
        title.textContent = `预览模式 - ${active.name || `#${previewModalStore.activeIndex + 1}`}`;

        left.innerHTML = entries.map((entry, index) => {
            const activeClass = index === previewModalStore.activeIndex ? "active" : "";
            const safeName = escapeHtml(entry.name || `#${index + 1}`);
            let thumbBody = `<div class="clab-preview-modal-thumb-label">${safeName}</div>`;
            if (entry.type === "image") {
                thumbBody = `<img src="${escapeHtml(entry.url)}" alt="${safeName}" />`;
            } else if (entry.type === "video") {
                thumbBody = `<video src="${escapeHtml(entry.url)}#t=0.01" muted></video>`;
            } else if (entry.type === "audio") {
                thumbBody = `<div class="clab-preview-modal-thumb-badge">AUDIO</div>`;
            } else if (entry.type === "text") {
                thumbBody = `<div class="clab-preview-modal-thumb-badge">TEXT</div>`;
            } else if (entry.type === "file") {
                thumbBody = `<div class="clab-preview-modal-thumb-badge">FILE</div>`;
            }
            return `
                <button class="clab-preview-modal-thumb ${activeClass}" data-index="${index}" type="button" title="${safeName}">
                    <div class="clab-preview-modal-thumb-media">${thumbBody}</div>
                    <div class="clab-preview-modal-thumb-name">${safeName}</div>
                </button>
            `;
        }).join("");

        teardownPreviewEnhancers();
        center.innerHTML = renderPreviewCenter(active);
        if (active.type === "image") {
            applyPreviewImageTransform(root);
        } else {
            resetPreviewImageTransform();
            applyPreviewImageTransform(root);
        }
        if (active.type === "audio") {
            safeSetupAudioWaveform(center, active);
        }
        if (active.type === "text") {
            safeBindPreviewTextEditor(center, active);
        }

        const snapshotEntry = active.index >= 0 ? previewModalStore.snapshots[active.index] : null;
        const rows = getSnapshotRows(snapshotEntry);
        if (rows.length === 0) {
            right.innerHTML = `<div class="clab-preview-modal-empty">No parameter snapshot for current resource</div>`;
        } else {
            right.innerHTML = rows.map((row) => `
                <div class="clab-preview-modal-param">
                    <div class="clab-preview-modal-param-key">${escapeHtml(row.key)}</div>
                    <div class="clab-preview-modal-param-meta">Node: ${escapeHtml(row.node || "-")} | Type: ${escapeHtml(row.type || "string")}</div>
                    <pre class="clab-preview-modal-param-value">${escapeHtml(row.value || "")}</pre>
                </div>
            `).join("");
        }
    }

    function openPreviewModal(card, area, preferredUrl, preferredIndex) {
        const root = ensurePreviewModal();
        teardownPreviewEnhancers();
        previewModalStore.activeCardId = card?.id || "";
        previewModalStore.activeAreaId = area?.id || "";
        previewModalStore.entries = buildPreviewEntries(area);
        previewModalStore.snapshots = Array.isArray(area?.inputHistorySnapshots) ? area.inputHistorySnapshots : [];
        previewModalStore.activeIndex = 0;
        previewModalStore.imageSpacePressed = false;
        resetPreviewImageTransform();

        if (previewModalStore.entries.length > 0) {
            if (Number.isFinite(preferredIndex) && preferredIndex >= 0 && preferredIndex < previewModalStore.entries.length) {
                previewModalStore.activeIndex = preferredIndex;
            } else if (preferredUrl) {
                const normalized = normalizeHistoryUrl(preferredUrl);
                const found = previewModalStore.entries.findIndex((entry) => normalizeHistoryUrl(entry.url) === normalized);
                if (found >= 0) previewModalStore.activeIndex = found;
            }
        }

        renderPreviewModal();
        root.classList.add("visible");
    }

    return {
        openPreviewModal,
        renderPreviewModal,
    };
}

