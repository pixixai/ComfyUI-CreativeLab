import { state } from "../../ui_state.js";
import { ensureTextAreaState } from "./media_utils.js";
import { onModuleRemoved } from "../module_lifecycle.js";

function escapeHtml(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
}

function escapeAttr(value) {
    return escapeHtml(value).replace(/"/g, "&quot;");
}

function sanitizeHref(url) {
    try {
        const resolved = new URL(url, window.location.origin);
        if (["http:", "https:", "mailto:"].includes(resolved.protocol)) {
            return resolved.href;
        }
    } catch (_) {}
    return "";
}

function highlightCodeHtml(source) {
    const text = String(source ?? "");
    const pattern = /("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(\/\*[\s\S]*?(?:\*\/|$)|#[^\n]*|\/\/[^\n]*)|\b(true|false|null|undefined|True|False|None)\b|\b(\d+(?:\.\d+)?)\b|\b(function|return|const|let|var|if|else|for|while|class|import|export|from|async|await|try|catch|def|lambda)\b/g;
    let html = "";
    let offset = 0;
    for (const match of text.matchAll(pattern)) {
        const kind = match[1] ? "string" : match[2] ? "comment" : match[3] ? "boolean" : match[4] ? "number" : "keyword";
        html += escapeHtml(text.slice(offset, match.index));
        html += `<span class="clab-text-token-${kind}">${escapeHtml(match[0])}</span>`;
        offset = match.index + match[0].length;
    }
    return html + escapeHtml(text.slice(offset));
}

function renderInlineMarkup(text, syntaxHighlight = false) {
    const codeTokens = [];
    const source = String(text ?? "").replace(/`([^`]+)`/g, (_match, code) => {
        const inner = syntaxHighlight ? highlightCodeHtml(code) : escapeHtml(code);
        codeTokens.push(`<code class="clab-text-inline-code">${inner}</code>`);
        return `\u0000${codeTokens.length - 1}\u0000`;
    });
    const parts = source.split(/(\[[^\]]+\]\([^)]+\))/g);
    let html = parts.map((part, index) => {
        if (index % 2) {
            const [, label, href] = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
            const safeHref = sanitizeHref(href);
            const safeLabel = escapeHtml(label);
            if (!safeHref) return safeLabel;
            return `<a class="clab-text-link" href="${escapeAttr(safeHref)}" target="_blank" rel="noopener noreferrer">${safeLabel}</a>`;
        }
        return escapeHtml(part)
            .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
            .replace(/\*([^*]+)\*/g, "<em>$1</em>")
            .replace(/~~([^~]+)~~/g, "<del>$1</del>");
    }).join("");

    html = html.replace(/\u0000(\d+)\u0000/g, (_match, index) => codeTokens[Number(index)] || "");
    return html;
}

function renderInlineWithBreaks(text, syntaxHighlight = false) {
    return String(text ?? "")
        .split("\n")
        .map((line) => renderInlineMarkup(line, syntaxHighlight))
        .join("<br>");
}

function renderMarkdownHtml(source, syntaxHighlight = false) {
    const lines = String(source ?? "").replace(/\r\n?/g, "\n").split("\n");
    const htmlBlocks = [];
    const startsBlock = (line) => /^\s*(?:`{3,}|#{1,6}\s|>\s?|[-*+]\s+|\d+\.\s+)/.test(line);
    let i = 0;
    while (i < lines.length) {
        const line = lines[i++];
        if (!line.trim()) continue;
        const fence = line.match(/^\s*(`{3,})([^`]*)$/);
        if (fence) {
            const codeLines = [];
            const closingFence = new RegExp("^\\s*`{" + fence[1].length + ",}\\s*$");
            while (i < lines.length && !closingFence.test(lines[i])) codeLines.push(lines[i++]);
            const code = codeLines.join("\n") + (codeLines.length && i < lines.length ? "\n" : "");
            if (i < lines.length) i++;
            const codeHtml = syntaxHighlight ? highlightCodeHtml(code) : escapeHtml(code);
            const language = fence[2].trim();
            const langHtml = language ? `<div class="clab-text-code-lang">${escapeHtml(language)}</div>` : "";
            htmlBlocks.push(`<div class="clab-text-code-block">${langHtml}<pre class="clab-text-code-pre"><code>${codeHtml}</code></pre></div>`);
            continue;
        }
        const heading = line.match(/^\s*(#{1,6})\s+(.*)$/);
        if (heading) {
            const level = heading[1].length;
            htmlBlocks.push(`<h${level} class="clab-text-heading h${level}">${renderInlineMarkup(heading[2], syntaxHighlight)}</h${level}>`);
            continue;
        }
        if (/^\s*>/.test(line)) {
            const quote = [line.replace(/^\s*>\s?/, "")];
            while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ""));
            htmlBlocks.push(`<blockquote class="clab-text-quote">${renderInlineWithBreaks(quote.join("\n"), syntaxHighlight)}</blockquote>`);
            continue;
        }
        const listMarker = /^\s*\d+\.\s+/.test(line) ? /^\s*\d+\.\s+/ : /^\s*[-*+]\s+/;
        if (listMarker.test(line)) {
            const tag = /^\s*\d/.test(line) ? "ol" : "ul";
            const items = [line.replace(listMarker, "")];
            while (i < lines.length && listMarker.test(lines[i])) items.push(lines[i++].replace(listMarker, ""));
            htmlBlocks.push(`<${tag} class="clab-text-list">${items.map(item => `<li>${renderInlineMarkup(item, syntaxHighlight)}</li>`).join("")}</${tag}>`);
            continue;
        }
        const paragraph = [line];
        while (i < lines.length && lines[i].trim() && !startsBlock(lines[i])) paragraph.push(lines[i++]);
        htmlBlocks.push(`<p class="clab-text-paragraph">${renderInlineWithBreaks(paragraph.join("\n"), syntaxHighlight)}</p>`);
    }
    return htmlBlocks.join("");
}

function renderPlainTextHtml(text, syntaxHighlight = false) {
    const body = syntaxHighlight ? highlightCodeHtml(text) : escapeHtml(text);
    return `<pre class="clab-text-plain"><code>${body}</code></pre>`;
}

const renderedTextCache = new WeakMap();

function getRenderedTextHtml(area) {
    ensureTextAreaState(area);
    if (area.textLoadState === "missing") {
        return `<div class="clab-text-state clab-text-state-missing">媒体丢失</div>`;
    }
    if ((area.textLoadState === "loading" || area.textLoadState === "idle") && area.resultUrl && !area.textContent) {
        return `<div class="clab-text-state">正在读取文字...</div>`;
    }
    const source = area.textContent || "";
    const cached = renderedTextCache.get(area);
    if (cached && cached.source === source && cached.markdown === area.textPreviewMarkdown && cached.syntax === area.textSyntaxHighlight) return cached.html;
    const html = area.textPreviewMarkdown ? renderMarkdownHtml(source, area.textSyntaxHighlight) : renderPlainTextHtml(source, area.textSyntaxHighlight);
    renderedTextCache.set(area, { source, markdown: area.textPreviewMarkdown, syntax: area.textSyntaxHighlight, html });
    return html;
}

function findArea(areaId) {
    for (const card of state.cards) {
        const area = card?.areas?.find((item) => item.id === areaId);
        if (area) return area;
    }
    return null;
}

function requestAreaRefresh(areaId) {
    if (window._clabSurgicallyUpdateArea) {
        window._clabSurgicallyUpdateArea(areaId);
        if (window._clabJustSave) window._clabJustSave();
        return;
    }
    if (window.CLab && typeof window.CLab.saveState === "function") {
        window.CLab.saveState(state);
    }
}

async function copyAreaText(areaId, button) {
    const area = findArea(areaId);
    if (!area) return;

    ensureTextAreaState(area);
    const text = String(area.textContent || "");
    if (!text) return;

    const originalLabel = "复制";
    const markCopied = () => {
        if (!button) return;
        button.textContent = "已复制";
        button.disabled = true;
        setTimeout(() => {
            button.textContent = originalLabel;
            button.disabled = false;
        }, 1200);
    };
    const markFailed = () => {
        if (!button) return;
        button.textContent = "复制失败";
        setTimeout(() => {
            if (button.textContent === "复制失败") button.textContent = originalLabel;
        }, 1200);
    };

    try {
        await navigator.clipboard.writeText(text);
        markCopied();
    } catch (_) {
        const textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly", "true");
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        try {
            document.body.appendChild(textarea);
            textarea.select();
            if (document.execCommand("copy")) {
                markCopied();
            } else {
                markFailed();
            }
        } catch (_) {
            markFailed();
        } finally {
            textarea.remove();
        }
    }
}

function updateTextPreviewLayout(shell) {
    if (!shell || shell._clabLayoutFrame) return;

    const viewport = shell.querySelector(".clab-text-body-scroll");
    const content = shell.querySelector(".clab-text-body-content");
    if (!viewport || !content) return;

    const shellWidth = Math.max(160, Math.floor(shell.clientWidth || 0));
    if (!shellWidth) return;

    const maxHeight = shellWidth;
    shell._clabLayoutFrame = requestAnimationFrame(() => {
        shell._clabLayoutFrame = 0;
        if (!shell.isConnected) return;
        viewport.style.maxHeight = `${maxHeight}px`;
        const totalHeight = Math.ceil(content.scrollHeight || 0);
        if (!totalHeight || totalHeight <= maxHeight) {
            viewport.style.height = `${Math.max(totalHeight, 32)}px`;
            viewport.style.overflowY = "hidden";
        } else {
            viewport.style.height = `${maxHeight}px`;
            viewport.style.overflowY = "auto";
        }
    });
}

function bindTextShell(shell) {
    if (!shell || shell.dataset.clabTextBound === "1") return;
    shell.dataset.clabTextBound = "1";

    const areaId = shell.dataset.area;
    const textBody = shell.querySelector(".clab-text-body-scroll");
 
    if (textBody) {
        textBody.setAttribute("draggable", "false");
        textBody.addEventListener("dragstart", (event) => {
            event.preventDefault();
        });
        textBody.addEventListener("mousedown", (event) => {
            event.stopPropagation();
        });
        textBody.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    shell.querySelectorAll(".clab-text-option input[type='checkbox']").forEach((input) => {
        input.addEventListener("change", (event) => {
            const area = findArea(areaId);
            if (!area) return;

            ensureTextAreaState(area);
            if (event.target.dataset.option === "syntax") {
                area.textSyntaxHighlight = !!event.target.checked;
            }
            if (event.target.dataset.option === "markdown") {
                area.textPreviewMarkdown = !!event.target.checked;
            }
            requestAreaRefresh(areaId);
        });
    });

    if (!window._clabTextPreviewResizeObserver) {
        window._clabTextPreviewResizeObserver = new ResizeObserver((entries) => {
            entries.forEach(({ target, contentRect }) => {
                if (target._clabLayoutWidth === contentRect.width) return;
                target._clabLayoutWidth = contentRect.width;
                updateTextPreviewLayout(target);
            });
        });
    }
    window._clabTextPreviewResizeObserver.observe(shell);
    onModuleRemoved(shell, () => {
        window._clabTextPreviewResizeObserver.unobserve(shell);
        cancelAnimationFrame(shell._clabLayoutFrame);
        delete shell.dataset.clabTextBound;
    });
}

export function renderText(area) {
    ensureTextAreaState(area);
    const historyPosition = area.missingHistoryRun ? '—' : area.historyIndex >= 0 ? area.historyIndex + 1 : area.history.length;

    return `
        <div class="clab-text-preview-shell" data-area="${area.id}" data-history-url="${escapeAttr(area.resultUrl || '')}">
            <div class="clab-text-body-scroll">
                <div class="clab-text-body-content">${getRenderedTextHtml(area)}</div>
            </div>
            <div class="clab-text-toolbar">
                <label class="clab-text-option" title="语法高亮">
                    <input type="checkbox" data-option="syntax" ${area.textSyntaxHighlight ? "checked" : ""}>
                    <span>语法高亮</span>
                </label>
                <label class="clab-text-option" title="预览Markdown">
                    <input type="checkbox" data-option="markdown" ${area.textPreviewMarkdown ? "checked" : ""}>
                    <span>预览Markdown</span>
                </label>
                ${area.history.length > 1 ? `<span class="clab-text-history-position" title="历史记录：${historyPosition} / ${area.history.length}；← / → 关联切换；Shift + ← / → 仅切换当前输出模块">${historyPosition} / ${area.history.length}</span>` : ''}
            </div>
        </div>
    `;
}

export function attachTextEvents(container) {
    container.querySelectorAll(".clab-text-preview-shell").forEach((shell) => {
        bindTextShell(shell);
        updateTextPreviewLayout(shell);
    });
    container.querySelectorAll(".clab-text-copy-btn").forEach((button) => {
        if (button.dataset.clabTextCopyBound === "1") return;
        button.dataset.clabTextCopyBound = "1";
        button.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            void copyAreaText(button.dataset.area, button);
        });
    });
}
