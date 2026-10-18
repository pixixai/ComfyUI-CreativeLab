/**
 * 文件名: editor_logic.js
 * 路径: web/components/contextmenu/content/editor_logic.js
 * 职责: 提供代码与文本的预览、编辑的核心渲染控制及交互逻辑；
 * 内容：CodeMirror/Vditor 加载与切换、复制/保存/Ctrl+S、dirty 状态
 */
import { previewModalStore, externalEditorStore } from "./state.js";
import {
    normalizeHistoryUrl,
    parseAssetMetaFromUrl,
    escapeHtml,
    getCodeMirrorLanguageExtension,
} from "./shared.js";

export function createEditorLogic({
    state: stateArg,
    saveAndRender: saveAndRenderArg,
    ensureTextAreaState: ensureTextAreaStateArg,
    parseApiResponse: parseApiResponseArg,
    showAutoToast: showAutoToastArg,
} = {}) {
    const safeState = stateArg && typeof stateArg === "object" ? stateArg : { cards: [] };
    const safeSaveAndRender = typeof saveAndRenderArg === "function" ? saveAndRenderArg : () => { };
    const safeEnsureTextAreaState = typeof ensureTextAreaStateArg === "function" ? ensureTextAreaStateArg : () => { };
    const safeShowAutoToast = typeof showAutoToastArg === "function" ? showAutoToastArg : () => { };
    const safeParseApiResponse = typeof parseApiResponseArg === "function"
        ? parseApiResponseArg
        : async (response) => {
            const raw = await response.text();
            if (raw) {
                try { return JSON.parse(raw); } catch (_) { }
            }
            return response.ok ? { status: "success" } : { status: "error", error: HTTP };
        };

    const state = safeState;
    const saveAndRender = safeSaveAndRender;
    const ensureTextAreaState = safeEnsureTextAreaState;
    const parseApiResponse = safeParseApiResponse;
    const showAutoToast = safeShowAutoToast;

    function ensureStylesheetOnce(id, href) {
        if (!id || !href) return Promise.resolve();
        if (document.getElementById(id)) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const link = document.createElement("link");
            link.id = id;
            link.rel = "stylesheet";
            link.href = href;
            link.onload = () => resolve();
            link.onerror = () => reject(new Error(`Failed to load stylesheet: ${href}`));
            document.head.appendChild(link);
        });
    }

    function ensureScriptOnce(id, src) {
        if (!id || !src) return Promise.resolve();
        if (document.getElementById(id)) return Promise.resolve();
        return new Promise((resolve, reject) => {
            const script = document.createElement("script");
            script.id = id;
            script.src = src;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.head.appendChild(script);
        });
    }

    async function loadCodeMirror6Lib() {
        if (!externalEditorStore.codeMirrorPromise) {
            externalEditorStore.codeMirrorPromise = Promise.all([
                import("https://esm.sh/codemirror"),
                import("https://esm.sh/@codemirror/state"),
                import("https://esm.sh/@codemirror/view"),
                import("https://esm.sh/@codemirror/lang-javascript"),
                import("https://esm.sh/@codemirror/lang-python"),
                import("https://esm.sh/@codemirror/lang-json"),
                import("https://esm.sh/@codemirror/lang-markdown"),
                import("https://esm.sh/@codemirror/theme-one-dark"),
            ]).then(([
                cmCore,
                cmState,
                cmView,
                cmLangJs,
                cmLangPy,
                cmLangJson,
                cmLangMarkdown,
                cmThemeOneDark,
            ]) => ({
                basicSetup: cmCore.basicSetup,
                EditorState: cmState.EditorState,
                Compartment: cmState.Compartment,
                EditorView: cmView.EditorView,
                keymap: cmView.keymap,
                javascript: cmLangJs.javascript,
                python: cmLangPy.python,
                json: cmLangJson.json,
                markdown: cmLangMarkdown.markdown,
                oneDark: cmThemeOneDark.oneDark,
            }));
        }
        try {
            return await externalEditorStore.codeMirrorPromise;
        } catch (error) {
            externalEditorStore.codeMirrorPromise = null;
            throw error;
        }
    }

    async function loadVditorLib() {
        if (!externalEditorStore.vditorPromise) {
            externalEditorStore.vditorPromise = (async () => {
                const [, mod] = await Promise.all([
                    ensureStylesheetOnce(
                        "clab-vditor-css",
                        "https://cdn.jsdelivr.net/npm/vditor@3.10.6/dist/index.css"
                    ),
                    import("https://cdn.jsdelivr.net/npm/vditor@3.10.6/+esm")
                ]);

                const ctor = mod?.default || window?.Vditor;
                if (!ctor) {
                    throw new Error("Vditor is not available after loading.");
                }
                return ctor;
            })();
        }
        try {
            return await externalEditorStore.vditorPromise;
        } catch (error) {
            externalEditorStore.vditorPromise = null;
            throw error;
        }
    }


    function findAreaById(areaId) {
        if (!areaId) return null;
        for (const card of state.cards) {
            const area = card?.areas?.find((item) => item.id === areaId);
            if (area) return area;
        }
        return null;
    }

    function getPreviewTextDefaults() {
        const area = findAreaById(previewModalStore.activeAreaId);
        return {
            syntaxHighlight: !!area?.textSyntaxHighlight,
            previewMarkdown: !!area?.textPreviewMarkdown,
        };
    }

    function getPreviewTextState(cacheKey, fallbackText) {
        const key = String(cacheKey || "");
        const defaults = getPreviewTextDefaults();
        const hasFallback = fallbackText !== undefined && fallbackText !== null;
        const safeText = hasFallback ? String(fallbackText) : "";
        let editorState = previewModalStore.textEditorState.get(key);
        if (!editorState) {
            editorState = {
                text: safeText,
                syntaxHighlight: defaults.syntaxHighlight,
                previewMarkdown: defaults.previewMarkdown,
                dirty: false,
                lastLoadedText: safeText,
            };
            previewModalStore.textEditorState.set(key, editorState);
            return editorState;
        }
        if (hasFallback && !editorState.dirty && editorState.lastLoadedText !== safeText) {
            editorState.text = safeText;
            editorState.lastLoadedText = safeText;
        }
        if (hasFallback || typeof editorState.syntaxHighlight !== "boolean") editorState.syntaxHighlight = defaults.syntaxHighlight;
        if (hasFallback || typeof editorState.previewMarkdown !== "boolean") editorState.previewMarkdown = defaults.previewMarkdown;
        return editorState;
    }

    async function copyTextWithFallback(text) {
        const safe = String(text ?? "");
        if (!safe) return false;
        try {
            await navigator.clipboard.writeText(safe);
            return true;
        } catch (_) {
            const textarea = document.createElement("textarea");
            try {
                textarea.value = safe;
                textarea.setAttribute("readonly", "true");
                textarea.style.position = "fixed";
                textarea.style.left = "-9999px";
                document.body.appendChild(textarea);
                textarea.select();
                return !!document.execCommand("copy");
            } catch (_) {
                return false;
            } finally {
                textarea.remove();
            }
        }
    }


    function syncSavedTextToArea(entry, text) {
        const area = findAreaById(previewModalStore.activeAreaId);
        if (!area) return;

        ensureTextAreaState(area);
        const normalizedTarget = normalizeHistoryUrl(entry?.url || "");
        let targetIndex = Number.isInteger(entry?.index) ? entry.index : -1;
        if (targetIndex < 0 || targetIndex >= area.history.length || normalizeHistoryUrl(area.history[targetIndex] || "") !== normalizedTarget) {
            targetIndex = area.history.findIndex((item) => normalizeHistoryUrl(item) === normalizedTarget);
        }

        if (targetIndex >= 0) {
            area.textHistory[targetIndex] = text;
            area.textHistoryStatus[targetIndex] = "ready";
            area.historyIndex = targetIndex;
            area.resultUrl = area.history[targetIndex];
        }

        area.resultKind = "text";
        area.textContent = text;
        area.textLoadState = "ready";

        const cacheKey = normalizeHistoryUrl(entry?.url || "");
        const editorState = previewModalStore.textEditorState.get(cacheKey);
        if (editorState) {
            area.textSyntaxHighlight = !!editorState.syntaxHighlight;
            area.textPreviewMarkdown = !!editorState.previewMarkdown;
        }

        if (window._clabRefreshAreaForContext) {
            window._clabRefreshAreaForContext(area.id);
        } else if (window._clabSurgicallyUpdateArea) {
            window._clabSurgicallyUpdateArea(area.id);
        }
        if (window._clabJustSave) window._clabJustSave(); else saveAndRender();
    }

    async function savePreviewTextEntry(entry, buttonEl) {
        if (!entry || entry.type !== "text") return false;
        const cacheKey = normalizeHistoryUrl(entry.url || "");
        const editorState = getPreviewTextState(cacheKey);
        const nextText = String(editorState.text ?? "");
        const oldLabel = buttonEl?.textContent || "保存";
        if (!editorState.dirty) {
            if (buttonEl) buttonEl.disabled = true;
            return false;
        }

        if (buttonEl) {
            buttonEl.disabled = true;
            buttonEl.textContent = "保存中...";
        }

        try {
            const meta = parseAssetMetaFromUrl(entry.url || "");
            const response = await fetch("/clab/update_text_asset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    media_url: entry.url,
                    filename: meta.filename,
                    subfolder: meta.subfolder,
                    type: meta.type,
                    text: nextText,
                }),
            });
            const data = await parseApiResponse(response);
            if (data?.status !== "success") {
                throw new Error(data?.error || `HTTP ${response.status}`);
            }

            previewModalStore.textCache.set(cacheKey, { state: "ready", text: nextText });
            editorState.dirty = false;
            editorState.lastLoadedText = nextText;
            syncSavedTextToArea(entry, nextText);
            showAutoToast("保存成功");
            return true;
        } catch (error) {
            showAutoToast(`保存失败: ${error?.message || error}`, true);
            return false;
        } finally {
            if (buttonEl) {
                buttonEl.textContent = oldLabel;
                buttonEl.disabled = !editorState.dirty;
            }
        }
    }
    function bindPreviewTextEditor(center, entry) {
        const shell = center.querySelector(".clab-preview-modal-text-editor");
        if (!shell) return;

        if (!document.getElementById("clab-preview-editor-overrides-css")) {
            const style = document.createElement("style");
            style.id = "clab-preview-editor-overrides-css";
            style.textContent = `
                /* 1. Global background color for editors */
                .clab-preview-modal-text-editor-input,
                .clab-preview-modal-text-editor-code-host .cm-editor,
                .clab-preview-modal-markdown-editor-root .vditor,
                .clab-preview-modal-markdown-editor-root .vditor-wysiwyg,
                .clab-preview-modal-markdown-editor-root .vditor-content,
                .clab-preview-modal-markdown-editor-root .vditor-reset {
                    background-color: rgb(15, 15, 15) !important;
                }

                /* 2. CodeMirror row numbers UI tweaks */
                .clab-preview-modal-text-editor-code-host .cm-gutters {
                    background-color: rgb(15, 15, 15) !important;
                    border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
                }
                .clab-preview-modal-text-editor-code-host .cm-lineNumbers .cm-gutterElement {
                    min-width: 25px !important;
                    padding: 0 5px !important;
                    font-size: 11px !important;
                    display: flex;
                    justify-content: flex-end;
                    align-items: center;
                }

                /* 3. Vditor horizontal padding reduction & sticky toolbar removal */
                .clab-preview-modal-markdown-editor-root .vditor-wysiwyg,
                .clab-preview-modal-markdown-editor-root .vditor-reset {
                    padding-left: 5px !important;
                    padding-right: 5px !important;
                    font-size: 13px !important;
                }
                .vditor-panel, 
                .vditor-hint, 
                .vditor-popover, 
                .vditor-ir__menu {
                    display: none !important;
                    opacity: 0 !important;
                    visibility: hidden !important;
                    pointer-events: none !important;
                }

                /* 4. Markdown code block & inline code background */
                .clab-preview-modal-markdown-editor-root .vditor-wysiwyg [data-type="code-block"],
                .clab-preview-modal-markdown-editor-root .vditor-wysiwyg code,
                .clab-preview-modal-markdown-editor-root .vditor-reset code {
                    background-color: rgb(30, 30, 30) !important;
                    color: #d1d1d1 !important;
                }
                .clab-preview-modal-text-no-highlight .hljs,
                .clab-preview-modal-text-no-highlight .hljs * {
                    color: #d1d1d1 !important;
                    font-weight: normal !important;
                    font-style: normal !important;
                }
            `;
            document.head.appendChild(style);
        }

        const cacheKey = shell.dataset.cacheKey || normalizeHistoryUrl(entry?.url || "");
        const editorState = getPreviewTextState(cacheKey);
        const syntaxInput = shell.querySelector(".clab-preview-modal-text-opt-syntax");
        const markdownInput = shell.querySelector(".clab-preview-modal-text-opt-markdown");
        const codeHost = shell.querySelector(".clab-preview-modal-text-editor-code-host");
        const markdownHost = shell.querySelector(".clab-preview-modal-text-editor-markdown-host");
        const fallbackInput = shell.querySelector(".clab-preview-modal-text-editor-input");
        const copyBtn = shell.querySelector(".clab-preview-modal-text-copy");
        const saveBtn = shell.querySelector(".clab-preview-modal-text-save");
        let switchTicket = 0;

        if (fallbackInput) {
            fallbackInput.addEventListener("keydown", (e) => {
                if (e.key === "Tab") {
                    e.preventDefault();
                    const start = fallbackInput.selectionStart;
                    const end = fallbackInput.selectionEnd;
                    fallbackInput.value = fallbackInput.value.substring(0, start) + "    " + fallbackInput.value.substring(end);
                    fallbackInput.selectionStart = fallbackInput.selectionEnd = start + 4;
                    applyDirtyByText(fallbackInput.value);
                }
            });
        }

        const runtime = {
            disposed: false,
            mode: "fallback",
            cmLib: null,
            cmView: null,
            cmLanguageCompartment: null,
            markdownCtor: null,
            markdownEditor: null,
            markdownReady: null,
            markdownValue: null,
            syncing: false,
            markdownSaveKeyHandler: null,
        };

        const syncSaveButtonState = () => {
            if (!saveBtn) return;
            saveBtn.disabled = !editorState.dirty;
        };
        syncSaveButtonState();

        const setHostMode = (mode) => {
            runtime.mode = mode;
            if (codeHost) codeHost.classList.toggle("hidden", mode !== "code");
            if (markdownHost) markdownHost.classList.toggle("hidden", mode !== "markdown");
            if (fallbackInput) fallbackInput.classList.toggle("hidden", mode !== "fallback");
        };

        const getCurrentEditorText = () => {
            // Vditor 会规范化 Markdown；没有实际编辑时仍保留原文和换行。
            if (runtime.mode === "markdown" && runtime.markdownEditor) {
                try {
                    const value = String(runtime.markdownEditor.getValue() ?? "");
                    if (value !== runtime.markdownValue) {
                        runtime.markdownValue = value;
                        return value;
                    }
                } catch (_) { }
            }
            return String(editorState.text ?? "");
        };

        const applyDirtyByText = (nextText) => {
            editorState.text = String(nextText ?? "");
            editorState.dirty = editorState.text !== editorState.lastLoadedText;
            syncSaveButtonState();
        };

        const syncOptionToArea = () => {
            const area = findAreaById(previewModalStore.activeAreaId);
            if (area) {
                area.textSyntaxHighlight = editorState.syntaxHighlight;
                area.textPreviewMarkdown = editorState.previewMarkdown;
                if (window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(area.id);
            }
            if (window._clabJustSave) window._clabJustSave();
        };

        const replaceCodeMirrorDoc = (nextText) => {
            if (!runtime.cmView) return;
            const view = runtime.cmView;
            const current = view.state.doc.toString();
            if (current === nextText) return;
            runtime.syncing = true;
            try {
                view.dispatch({ changes: { from: 0, to: current.length, insert: nextText } });
            } finally {
                runtime.syncing = false;
            }
        };

        const configureCodeMirrorLanguage = () => {
            if (!runtime.cmView || !runtime.cmLanguageCompartment || !runtime.cmLib) return;
            const ext = editorState.syntaxHighlight
                ? getCodeMirrorLanguageExtension(runtime.cmLib, entry)
                : [];
            runtime.cmView.dispatch({
                effects: runtime.cmLanguageCompartment.reconfigure(ext),
            });
        };

        const ensureCodeMirror = async () => {
            if (!codeHost) return false;
            if (runtime.cmView) {
                replaceCodeMirrorDoc(String(editorState.text ?? ""));
                configureCodeMirrorLanguage();
                return true;
            }
            const cmLib = runtime.cmLib || await loadCodeMirror6Lib();
            if (runtime.disposed || !shell.isConnected) return false;
            if (runtime.cmView) {
                replaceCodeMirrorDoc(String(editorState.text ?? ""));
                configureCodeMirrorLanguage();
                return true;
            }

            runtime.cmLib = cmLib;
            runtime.cmLanguageCompartment = new cmLib.Compartment();
            codeHost.innerHTML = "";
            const cmState = cmLib.EditorState.create({
                doc: String(editorState.text ?? ""),
                extensions: [
                    cmLib.basicSetup,
                    cmLib.oneDark,
                    cmLib.EditorView.lineWrapping,
                    runtime.cmLanguageCompartment.of(
                        editorState.syntaxHighlight ? getCodeMirrorLanguageExtension(cmLib, entry) : []
                    ),
                    cmLib.keymap.of([{
                        key: "Mod-s",
                        run: () => {
                            if (saveBtn && !saveBtn.disabled) saveBtn.click();
                            return true;
                        },
                    }]),
                    cmLib.EditorView.updateListener.of((update) => {
                        if (!update.docChanged || runtime.disposed || runtime.syncing) return;
                        applyDirtyByText(update.state.doc.toString());
                        if (fallbackInput) fallbackInput.value = editorState.text;
                    }),
                ],
            });
            runtime.cmView = new cmLib.EditorView({ state: cmState, parent: codeHost });
            return true;
        };

        const ensureMarkdownEditor = async () => {
            if (!markdownHost) return false;
            const EditorCtor = runtime.markdownCtor || await loadVditorLib();
            if (runtime.disposed || !shell.isConnected) return false;

            if (!runtime.markdownReady) {
                runtime.markdownCtor = EditorCtor;
                markdownHost.innerHTML = "";
                const container = document.createElement("div");
                container.id = "clab-vditor-" + Math.random().toString(36).slice(2, 9);
                container.className = "clab-preview-modal-markdown-editor-root";

                const style = document.createElement("style");
                style.textContent = `
                    .clab-preview-modal-markdown-editor-root { height: 100%; display: flex; flex-direction: column; }
                    .clab-preview-modal-markdown-editor-root .vditor-toolbar { display: none !important; }
                    .clab-preview-modal-markdown-editor-root .vditor { border: none !important; margin: 0; box-shadow: none !important; }
                `;
                markdownHost.appendChild(style);
                markdownHost.appendChild(container);

                let ready;
                runtime.markdownReady = new Promise(resolve => { ready = resolve; });
                runtime.markdownEditor = new EditorCtor(container.id, {
                    height: "100%",
                    mode: "wysiwyg",
                    theme: "dark",
                    icon: "material",
                    toolbar: [],
                    value: String(editorState.text ?? ""),
                    preview: { theme: { current: "dark" } },
                    cache: { enable: false },
                    after: () => {
                        if (!runtime.disposed) runtime.markdownValue = String(runtime.markdownEditor.getValue() ?? "");
                        ready();
                    },
                    input: (val) => {
                        if (runtime.disposed || runtime.mode !== "markdown" || runtime.syncing || runtime.markdownValue === null || val === runtime.markdownValue) return;
                        runtime.markdownValue = val;
                        applyDirtyByText(val);
                        if (fallbackInput) fallbackInput.value = editorState.text;
                    }
                });

                runtime.markdownSaveKeyHandler = (event) => {
                    if (!(event.ctrlKey || event.metaKey)) return;
                    if (String(event.key || "").toLowerCase() !== "s") return;
                    event.preventDefault();
                    event.stopPropagation();
                    if (saveBtn && !saveBtn.disabled) saveBtn.click();
                };
                markdownHost.addEventListener("keydown", runtime.markdownSaveKeyHandler, true);
            }
            await runtime.markdownReady;
            if (runtime.disposed || !shell.isConnected) return false;
            runtime.syncing = true;
            try {
                runtime.markdownEditor.setValue(String(editorState.text ?? ""));
                runtime.markdownValue = String(runtime.markdownEditor.getValue() ?? "");
            } finally {
                runtime.syncing = false;
            }
            return true;
        };

        const switchEditorMode = async () => {
            const myTicket = ++switchTicket;
            applyDirtyByText(getCurrentEditorText());
            if (fallbackInput) fallbackInput.value = editorState.text;

            if (editorState.previewMarkdown) {
                try {
                    const ok = await ensureMarkdownEditor();
                    if (runtime.disposed || !shell.isConnected || myTicket !== switchTicket) return;
                    if (ok) {
                        setHostMode("markdown");
                        return;
                    }
                } catch (error) {
                    if (runtime.disposed || !shell.isConnected || myTicket !== switchTicket) return;
                    showAutoToast(`Markdown editor unavailable: ${error?.message || error}`, true);
                }
                setHostMode("fallback");
                return;
            }

            if (editorState.syntaxHighlight) {
                try {
                    const ok = await ensureCodeMirror();
                    if (runtime.disposed || !shell.isConnected || myTicket !== switchTicket) return;
                    if (ok) {
                        setHostMode("code");
                        configureCodeMirrorLanguage();
                        return;
                    }
                } catch (error) {
                    if (runtime.disposed || !shell.isConnected || myTicket !== switchTicket) return;
                    showAutoToast(`Code editor unavailable: ${error?.message || error}`, true);
                }
            }

            setHostMode("fallback");
        };

        previewModalStore.activeTextCleanup = () => {
            runtime.disposed = true;
            if (runtime.cmView) {
                try { runtime.cmView.destroy(); } catch (_) { }
                runtime.cmView = null;
            }
            if (runtime.markdownEditor) {
                try { runtime.markdownEditor.destroy(); } catch (_) { }
                runtime.markdownEditor = null;
            }
            if (runtime.markdownSaveKeyHandler && markdownHost) {
                try { markdownHost.removeEventListener("keydown", runtime.markdownSaveKeyHandler, true); } catch (_) { }
            }
            runtime.markdownSaveKeyHandler = null;
        };

        if (syntaxInput) {
            syntaxInput.addEventListener("change", () => {
                editorState.syntaxHighlight = !!syntaxInput.checked;
                shell.classList.toggle("clab-preview-modal-text-no-highlight", !editorState.syntaxHighlight);
                syncOptionToArea();
                if (!editorState.previewMarkdown) {
                    void switchEditorMode();
                }
            });
        }

        if (markdownInput) {
            markdownInput.addEventListener("change", () => {
                editorState.previewMarkdown = !!markdownInput.checked;
                syncOptionToArea();
                void switchEditorMode();
            });
        }

        if (fallbackInput) {
            fallbackInput.value = String(editorState.text ?? "");
            fallbackInput.addEventListener("input", () => {
                applyDirtyByText(fallbackInput.value);
            });
        }

        if (copyBtn) {
            copyBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                event.stopPropagation();
                applyDirtyByText(getCurrentEditorText());
                const copied = await copyTextWithFallback(editorState.text);
                if (!copied) {
                    showAutoToast("\u590D\u5236\u5931\u8D25\uFF0C\u8BF7\u91CD\u8BD5\u3002", true);
                    return;
                }
                copyBtn.disabled = true;
                const oldLabel = copyBtn.textContent;
                copyBtn.textContent = "\u5DF2\u590D\u5236";
                setTimeout(() => {
                    copyBtn.textContent = oldLabel;
                    copyBtn.disabled = false;
                }, 1200);
                showAutoToast("\u5DF2\u590D\u5236\u5230\u526A\u8D34\u677F\u3002");
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener("click", async (event) => {
                event.preventDefault();
                event.stopPropagation();
                applyDirtyByText(getCurrentEditorText());
                const saved = await savePreviewTextEntry(entry, saveBtn);
                if (saved) syncSaveButtonState();
            });
        }

        setHostMode("fallback");
        shell.classList.toggle("clab-preview-modal-text-no-highlight", !editorState.syntaxHighlight);
        void switchEditorMode();
    }


    return {
        bindPreviewTextEditor,
        getPreviewTextState,
    };
}
