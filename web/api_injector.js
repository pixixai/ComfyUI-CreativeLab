/**
 * API 注入器 (Service)
 * 负责拦截 ComfyUI 的运行请求并注入卡片参数，安全管理发包队列
 */
import { api } from "../../scripts/api.js";
import { StateManager } from "./state_manager.js";
import { showBindingToast, hideBindingToast } from "./components/ui_utils.js";
import {
    captureCardInputSnapshot,
    pushPreviewHistoryEntry,
    syncTextContentWithSelection,
} from "./components/modules/media_types/media_utils.js";

export function setupAPIInjector(app) {
    console.log("[CLab] 初始化 API 拦截、动态剪枝与回传系统...");

    window.CLab = window.CLab || {};
    window._clabExecQueue = window._clabExecQueue || []; 
    window._clabTaskMap = window._clabTaskMap || {};     
    window._clabLastGeneratedTask = null;              
    window._clabCardProgress = window._clabCardProgress || {}; 
    window._clabHideTimers = window._clabHideTimers || {};     
    window._clabDoneTasks = window._clabDoneTasks || new Set();
    let submitting = false;
    let currentTask = null;

    const getTaskCard = (task) => {
        const workspace = task.workspaceRef.deref();
        if (!StateManager.state.workspaces.includes(workspace)) return null;
        const cards = StateManager.state.activeWorkspaceId === task.workspaceId
            ? StateManager.state.cards
            : workspace.cards;
        return cards.find((card) => card.id === task.cardId);
    };

    const cancelBatch = (task) => {
        const batch = task.batch;
        if (batch.cancelled) return;
        batch.cancelled = true;
        window._clabExecQueue = window._clabExecQueue.filter((queuedTask) => {
            if (queuedTask.batch !== batch) return true;
            setUIProgress(queuedTask.cardId, 0, true);
            return false;
        });
        const toDelete = batch.promptIds.filter((id) => id !== task.promptId);
        if (toDelete.length > 0) {
            api.fetchApi('/queue', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ delete: toDelete }),
            }).catch((err) => console.error("[CLab] 无法删除后续队列", err));
            toDelete.forEach((id) => {
                const skippedTask = window._clabTaskMap[id];
                if (skippedTask) setUIProgress(skippedTask.cardId, 0, true);
            });
        }
    };

    const normalizeTextResult = (value) => {
        if (Array.isArray(value)) return value.map((item) => String(item ?? "")).join("\n\n");
        if (value == null) return "";
        if (typeof value === "string") return value;
        if (typeof value === "number" || typeof value === "boolean") return String(value);
        if (typeof value === "object") {
            try {
                return JSON.stringify(value, null, 2);
            } catch (_) {
                return String(value);
            }
        }
        return String(value);
    };

    const extractTextFromOutputData = (outputData) => {
        if (!outputData || typeof outputData !== "object") return "";
        const directKeys = ["text", "texts", "string", "strings", "markdown", "value"];
        for (const key of directKeys) {
            if (!(key in outputData)) continue;
            const candidate = normalizeTextResult(outputData[key]);
            if (candidate.trim()) return candidate;
        }
        return "";
    };

    const extractTextFromNodeWidgets = (node) => {
        const widgets = node?.widgets || [];
        if (!widgets.length) return "";

        const candidates = [];
        widgets.forEach((widget) => {
            const value = normalizeTextResult(widget?.value);
            if (!value.trim()) return;

            const name = String(widget?.name || "");
            const score =
                (/^preview_(markdown|text)$/i.test(name) ? 100 : 0) +
                (/(markdown|text|preview|result|output)/i.test(name) ? 20 : 0) +
                ((widget?.options?.read_only || widget?.element?.readOnly) ? 10 : 0) +
                Math.min(10, Math.floor(value.length / 200));

            candidates.push({ score, value });
        });

        candidates.sort((left, right) => right.score - left.score);
        return candidates[0]?.value || "";
    };

    const saveTextAsset = async (text) => {
        const response = await fetch("/clab/save_text", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                text,
                archive_dir: window._clabArchiveDir || "CLab",
                file_prefix: window._clabFilePrefix || "pix",
            }),
        });

        const data = await response.json();
        if (data.status !== "success") {
            throw new Error(data.error || "save_text failed");
        }

        const params = new URLSearchParams({
            filename: data.new_filename,
            type: data.new_type,
            subfolder: data.new_subfolder || "",
        });
        return api.apiURL(`/view?${params.toString()}`);
    };

    const NODE_MODE_BYPASS = (() => {
        const eventMode = (typeof globalThis !== "undefined" && globalThis.LGraphEventMode)
            ? globalThis.LGraphEventMode
            : null;
        if (eventMode && Number.isFinite(eventMode.BYPASS)) return eventMode.BYPASS;
        if (typeof LiteGraph !== "undefined" && Number.isFinite(LiteGraph.BYPASS)) return LiteGraph.BYPASS;
        return 4;
    })();

    const collectAreaAssociatedNodeIds = (area) => {
        if (!area || typeof area !== "object") return [];

        const nodeIds = new Set();
        const pushNodeId = (raw) => {
            const value = raw == null ? "" : String(raw).trim();
            if (value) nodeIds.add(value);
        };

        if (Array.isArray(area.targetNodeIds)) {
            area.targetNodeIds.forEach(pushNodeId);
        }
        if (Array.isArray(area.targetWidgets)) {
            area.targetWidgets.forEach((item) => {
                const [nodeId] = String(item || "").split("||");
                pushNodeId(nodeId);
            });
        }
        pushNodeId(area.targetNodeId);
        return [...nodeIds];
    };

    const collectBypassedNodeIdsFromCard = (card) => {
        if (!card || !Array.isArray(card.areas)) return [];
        const nodeIds = new Set();
        card.areas.forEach((area) => {
            if (!area) return;
            const isBypassed = area.runtimeNodeBypassed === true || area.runtimeNodeDisabled === true;
            if (!isBypassed) return;
            collectAreaAssociatedNodeIds(area).forEach((nodeId) => nodeIds.add(nodeId));
        });
        return [...nodeIds];
    };

    const applyTemporaryNodeBypass = (targetNodeIds) => {
        const graph = app?.graph;
        if (!graph || typeof graph.getNodeById !== "function") return () => {};

        if (targetNodeIds.length === 0) return () => {};

        const rollbackList = [];
        targetNodeIds.forEach((nodeId) => {
            const node = graph.getNodeById(Number(nodeId));
            if (!node) return;
            rollbackList.push({ node, mode: node.mode });
            node.mode = NODE_MODE_BYPASS;
        });

        if (rollbackList.length === 0) return () => {};
        return () => {
            rollbackList.forEach((item) => {
                item.node.mode = item.mode;
            });
        };
    };

    // =========================================================================
    // 【神级修复】：全局媒体加载监听器，实现切换历史记录时动态适配尺寸
    // =========================================================================
    if (!window._clabMediaLoadHijacked) {
        const handleMediaLoad = (element, width, height) => {
            if (!width || !height) return;
            const areaEl = element.closest('.clab-area');
            if (!areaEl) return;
            const cardId = areaEl.dataset.cardId;
            const areaId = areaEl.dataset.areaId;
            const card = StateManager.state.cards.find(c => c.id === cardId);
            const area = card?.areas.find(a => a.id === areaId);
            
            if (area && area.matchMedia) {
                if (area.width !== width || area.height !== height || area.ratio !== '自定义比例') {
                    area.ratio = '自定义比例';
                    area.width = width;
                    area.height = height;
                    StateManager.syncToNode(app.graph);
                    
                    // 【点穴修复】：读取完自适应尺寸后，放弃全局核弹，改用点穴更新
                    if (window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(areaId);
                    else document.dispatchEvent(new CustomEvent("clab_render_ui"));
                }
            }
        };

        document.addEventListener('load', (e) => {
            if (e.target && e.target.tagName === 'IMG' && e.target.classList && e.target.classList.contains('clab-preview-img')) {
                handleMediaLoad(e.target, e.target.naturalWidth, e.target.naturalHeight);
            }
        }, true);

        document.addEventListener('loadeddata', (e) => {
            if (e.target && e.target.tagName === 'VIDEO' && e.target.classList && e.target.classList.contains('clab-preview-img')) {
                handleMediaLoad(e.target, e.target.videoWidth, e.target.videoHeight);
            }
        }, true);

        window._clabMediaLoadHijacked = true;
    }

    // =========================================================================
    // 【核弹级 UI 渲染器】：支持报错红灯模式
    // =========================================================================
    const setUIProgress = (cardId, percentage, isHide = false, isError = false, isRestore = false) => {
        if (window._clabDoneTasks.has(cardId) && !isHide && !isRestore && percentage < 100) return; 

        if (!isRestore) {
            if (isHide) {
                delete window._clabCardProgress[cardId];
            } else {
                window._clabCardProgress[cardId] = { percentage, isHide, isError };
                if (window._clabHideTimers[cardId]) {
                    clearTimeout(window._clabHideTimers[cardId]);
                    delete window._clabHideTimers[cardId];
                }
            }
        }

        const progContainer = document.querySelector(`.clab-card-progress-container[data-card-prog-id="${cardId}"]`);
        if (!progContainer) return;
        const bar = progContainer.querySelector('.clab-card-progress-bar');
        if (!bar) return;

        if (isError) {
            progContainer.style.display = 'block';
            progContainer.style.opacity = '1';
            bar.classList.add('error');
            bar.style.setProperty('transition', 'none', 'important'); 
            bar.style.setProperty('width', '100%', 'important');
        } else if (isHide) {
            bar.classList.remove('error');
            progContainer.style.opacity = '0';
            setTimeout(() => {
                const freshContainer = document.querySelector(`.clab-card-progress-container[data-card-prog-id="${cardId}"]`);
                if (freshContainer) freshContainer.style.display = 'none';
                const freshBar = document.querySelector(`.clab-card-progress-container[data-card-prog-id="${cardId}"] .clab-card-progress-bar`);
                if (freshBar) {
                    freshBar.style.setProperty('transition', 'none', 'important');
                    freshBar.style.setProperty('width', '0%', 'important');
                }
            }, 300);
        } else {
            progContainer.style.display = 'block';
            progContainer.style.opacity = '1';
            if (isRestore) {
                bar.style.setProperty('transition', 'none', 'important');
                bar.style.setProperty('width', `${percentage}%`, 'important');
                void bar.offsetWidth; 
            }
            bar.style.setProperty('transition', 'width 0.3s ease-out', 'important');
            bar.style.setProperty('width', `${percentage}%`, 'important');
        }
    };

    document.addEventListener("clab_render_ui", () => {
        setTimeout(() => {
            const allContainers = document.querySelectorAll('.clab-card-progress-container');
            allContainers.forEach(container => {
                const cardId = container.getAttribute('data-card-prog-id');
                const state = window._clabCardProgress[cardId];
                
                if (state && !state.isHide) {
                    setUIProgress(cardId, state.percentage, state.isHide, state.isError, true);
                } else {
                    container.style.display = 'none';
                    container.style.opacity = '0';
                    const bar = container.querySelector('.clab-card-progress-bar');
                    if (bar) {
                        bar.style.setProperty('transition', 'none', 'important');
                        bar.style.setProperty('width', '0%', 'important');
                    }
                }
            });
        }, 100);
    });

    api.addEventListener("status", (e) => {
        if (e.detail && e.detail.exec_info && e.detail.exec_info.queue_remaining === 0) {
            for (const cardId in window._clabCardProgress) {
                const state = window._clabCardProgress[cardId];
                if (state && !state.isHide) {
                    setUIProgress(cardId, 100);
                    if (window._clabHideTimers[cardId]) clearTimeout(window._clabHideTimers[cardId]);
                    window._clabHideTimers[cardId] = setTimeout(() => {
                        setUIProgress(cardId, 0, true);
                    }, 800);
                }
            }
        }
    });

    api.addEventListener("execution_error", (e) => {
        showBindingToast("❌ 工作流后台运行报错！请关闭面板，查看详细错误提示。", true);
        setTimeout(() => hideBindingToast(), 6000);
        
        const pid = e.detail?.prompt_id;
        const task = window._clabTaskMap[pid];
        
        if (task) {
            setUIProgress(task.cardId, 100, false, true);
            
            if (window._clabHideTimers[task.cardId]) clearTimeout(window._clabHideTimers[task.cardId]);
            window._clabHideTimers[task.cardId] = setTimeout(() => {
                setUIProgress(task.cardId, 0, true);
            }, 6000);

            // 【核心】：根据 HaltOnError 设置决定是否清空后续队列
            if (window._clabHaltOnError !== false) {
                cancelBatch(task);
            }
        }
    });

    // =========================================================================
    // 1. 坚如磐石的异步执行队列
    // =========================================================================
    window.CLab.executeTasks = async function(tasks) {
        const workspace = StateManager.state.workspaces.find((item) => item.id === StateManager.state.activeWorkspaceId);
        const batch = { cancelled: false, promptIds: [] };

        for (const task of tasks) {
            const card = StateManager.state.cards.find((item) => item.id === task.cardId);
            if (!workspace || !card) continue;
            window._clabDoneTasks.delete(task.cardId);
            window._clabExecQueue.push({
                cardId: task.cardId,
                workspaceRef: new WeakRef(workspace),
                workspaceId: workspace.id,
                batch,
                inputSnapshot: captureCardInputSnapshot(card),
                previewTargets: card.areas.filter((area) => area.type === 'preview' && task.previewAreaIds.includes(area.id))
                    .map((area) => ({ areaId: area.id, nodeId: area.targetNodeId })),
                bypassedNodeIds: collectBypassedNodeIdsFromCard(card),
            });
            
            const bar = document.querySelector(`.clab-card-progress-container[data-card-prog-id="${task.cardId}"] .clab-card-progress-bar`);
            if (bar) bar.classList.remove('error'); 
            setUIProgress(task.cardId, 5);
        }

        if (submitting) return;
        submitting = true;
        try {
            while (window._clabExecQueue.length > 0) {
                const task = window._clabExecQueue.shift();
                while (app.processingQueue && !task.batch.cancelled) {
                    await new Promise((resolve) => setTimeout(resolve, 50));
                }
                if (task.batch.cancelled) {
                    setUIProgress(task.cardId, 0, true);
                    continue;
                }
                currentTask = task;
                try {
                    await app.queuePrompt(0, 1);
                    if (task.submissionError || !task.promptId) {
                        throw task.submissionError || new Error("Task was not submitted");
                    }
                } catch (submitErr) {
                    console.warn("[CLab] 任务提交失败:", submitErr);
                    showBindingToast("❌ 任务提交失败，请检查工作流连线或必填参数。", true);
                    setTimeout(() => hideBindingToast(), 6000);
                    setUIProgress(task.cardId, 100, false, true);
                    if (window._clabHideTimers[task.cardId]) clearTimeout(window._clabHideTimers[task.cardId]);
                    window._clabHideTimers[task.cardId] = setTimeout(() => setUIProgress(task.cardId, 0, true), 6000);
                    if (window._clabHaltOnError !== false) cancelBatch(task);
                } finally {
                    currentTask = null;
                    window._clabLastGeneratedTask = null;
                }
            }
        } finally {
            submitting = false;
        }
    };

    const origQueuePrompt = api.queuePrompt;
    api.queuePrompt = async function() {
        const task = window._clabLastGeneratedTask;
        try {
            if (task?.batch.cancelled) throw new Error("Batch cancelled");
            const res = await origQueuePrompt.apply(this, arguments);
            if (task) {
                if (res?.prompt_id) {
                    task.promptId = res.prompt_id;
                    window._clabTaskMap[res.prompt_id] = task;
                    task.batch.promptIds.push(res.prompt_id);
                    window._clabLastGeneratedTask = null;
                    if (task.batch.cancelled) {
                        await api.fetchApi('/queue', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ delete: [res.prompt_id] }),
                        });
                    }
                }
                if (!res?.prompt_id || res.error || Object.keys(res.node_errors || {}).length > 0) {
                    task.submissionError = new Error("Workflow validation failed");
                }
            }
            return res;
        } catch (err) {
            if (task) task.submissionError = err;
            throw err;
        }
    };

    // =========================================================================
    // 2. 拦截队列请求 (Input 参数注入 & Output 动态剪枝)
    // =========================================================================
    const originalGraphToPrompt = app.graphToPrompt;
    app.graphToPrompt = async function () {
        const execTask = currentTask;
        if (!execTask || execTask.promptGenerated) return originalGraphToPrompt.apply(this, arguments);
        execTask.promptGenerated = true;
        window._clabLastGeneratedTask = execTask;
        if (execTask.batch.cancelled || !getTaskCard(execTask)) throw new Error("Task is no longer available");
        const rollbackTemporaryBypass = applyTemporaryNodeBypass(execTask.bypassedNodeIds);

        let result;
        try {
            result = await originalGraphToPrompt.apply(this, arguments);
        } finally {
            rollbackTemporaryBypass();
        }
        
        if (execTask.batch.cancelled || !getTaskCard(execTask)) throw new Error("Task is no longer available");

        const promptOutput = JSON.parse(JSON.stringify(result.output));
        result.output = promptOutput;

        // --- 阶段 A: 参数注入 ---
        execTask.inputSnapshot.forEach(area => {
            let targets = [];
            if (Array.isArray(area.targetWidgets) && area.targetWidgets.length > 0) {
                targets = area.targetWidgets.map(tw => {
                    const [nId, wName] = tw.split('||');
                    return { nodeId: nId, widget: wName };
                });
            } else if (area.targetNodeId && area.targetWidget) {
                targets = [{ nodeId: area.targetNodeId, widget: area.targetWidget }];
            }

            targets.forEach(t => {
                const nodeData = promptOutput[t.nodeId];
                if (nodeData && nodeData.inputs) {
                    let injectValue = area.value;
                    if (area.dataType === 'number') injectValue = Number(injectValue);
                    else if (area.dataType === 'boolean') injectValue = (injectValue === 'true' || injectValue === true);
                    else if (area.dataType === 'json') {
                        try { injectValue = JSON.parse(injectValue); } catch (e) {}
                    }
                    nodeData.inputs[t.widget] = injectValue;
                }
            });
        });

        // --- 阶段 B: 动态剪枝 ---
        const targetPreviewAreas = execTask.previewTargets.filter((target) => target.nodeId);
        if (targetPreviewAreas.length === 0) throw new Error("No output nodes are bound to this task");
        
        const keepNodes = new Set();
        function traceDependencies(nodeId) {
            const strId = String(nodeId);
            if (keepNodes.has(strId)) return;
            const nodeData = promptOutput[strId];
            if (!nodeData) return;
            keepNodes.add(strId);
            if (nodeData.inputs) {
                for (const key in nodeData.inputs) {
                    const val = nodeData.inputs[key];
                    if (Array.isArray(val) && val.length > 0) traceDependencies(val[0]);
                }
            }
        }
        targetPreviewAreas.forEach(target => traceDependencies(target.nodeId));

        const allNodeIds = Object.keys(promptOutput);
        allNodeIds.forEach(id => {
            if (!keepNodes.has(id)) delete promptOutput[id];
        });
        return result;
    };

    // =========================================================================
    // 3. 全局进度监听
    // =========================================================================
    api.addEventListener("progress_state", (e) => {
        const pid = e.detail?.prompt_id;
        const nodes = e.detail?.nodes;
        const task = window._clabTaskMap[pid];
        
        if (task && nodes) {
            let total = 0;
            let done = 0;
            for (const nid in nodes) {
                const nodeState = nodes[nid];
                total += nodeState.max || 0;
                done += nodeState.value || 0;
            }
            if (total > 0) {
                const percent = Math.max(5, (done / total) * 100);
                setUIProgress(task.cardId, percent);
            }
        }
    });

    api.addEventListener("executing", (e) => {
        const pid = e.detail?.prompt_id;
        const task = window._clabTaskMap[pid];
        
        if (task && !e.detail.node) {
            window._clabDoneTasks = window._clabDoneTasks || new Set();
            window._clabDoneTasks.add(task.cardId); 

            setUIProgress(task.cardId, 100);
            
            if (window._clabHideTimers[task.cardId]) clearTimeout(window._clabHideTimers[task.cardId]);
            window._clabHideTimers[task.cardId] = setTimeout(() => {
                setUIProgress(task.cardId, 0, true);
            }, 800);
        }
    });

    // =========================================================================
    // 4. 监听引擎执行完成事件 (增强版：截胡转存与状态回写闭环)
    // =========================================================================
    api.addEventListener("executed", async (event) => {
        const { node: executedNodeId, output: outputData, prompt_id } = event.detail;
        const task = window._clabTaskMap[prompt_id];
        if (!task) return;
        const card = getTaskCard(task);
        if (!card?.areas) return;

        const targetItems = [outputData.videos, outputData.audio, outputData.gifs, outputData.images]
            .find((items) => items?.length > 0);
        const archivedMedia = new Map();
        for (const target of task.previewTargets) {
            if (String(target.nodeId) !== String(executedNodeId)) continue;
            const area = card.areas.find((item) => item.id === target.areaId && item.type === 'preview');
            if (!area) continue;

            const persistAndRefresh = () => {
                if (getTaskCard(task) !== card || !card.areas.includes(area)) return;
                StateManager.syncToNode(app.graph);
                if (StateManager.state.activeWorkspaceId !== task.workspaceId) return;
                if (window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(area.id);
                else document.dispatchEvent(new CustomEvent("clab_render_ui"));
            };

            if (targetItems?.length > 0) {
                let firstUrl = null;
                let firstKind = null;
                for (const sourceMedia of targetItems) {
                    const sourceKey = JSON.stringify([sourceMedia.type, sourceMedia.subfolder, sourceMedia.filename]);
                    let media = archivedMedia.get(sourceKey);
                    const ext = sourceMedia.filename.split('.').pop().toLowerCase();
                    const kind = ['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext) || sourceMedia.format?.startsWith('video/')
                        ? 'video'
                        : ['mp3', 'wav', 'ogg', 'flac', 'aac', 'm4a'].includes(ext) || sourceMedia.format?.startsWith('audio/')
                            ? 'audio' : 'image';

                    if (!media) {
                        media = { ...sourceMedia };
                        if (media.type === 'temp' || media.type === 'output') {
                            try {
                                const response = await fetch('/clab/copy_temp_asset', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                        filename: media.filename,
                                        subfolder: media.subfolder || '',
                                        asset_type: kind,
                                        source_type: media.type,
                                        archive_dir: window._clabArchiveDir || 'CLab',
                                        delete_temp: window._clabDeleteTemp === true,
                                        file_prefix: window._clabFilePrefix || 'pix',
                                    }),
                                });
                                const data = await response.json();
                                if (data.status === 'success') {
                                    media = { filename: data.new_filename, subfolder: data.new_subfolder, type: data.new_type };
                                } else {
                                    console.error('[CLab] 截胡资产失败:', data.error);
                                }
                            } catch (err) {
                                console.error('[CLab] 截胡资产网络请求失败:', err);
                            }
                        }
                        archivedMedia.set(sourceKey, media);
                    }
                    const params = new URLSearchParams({ filename: media.filename, type: media.type, subfolder: media.subfolder || '' });
                    const url = api.apiURL(`/view?${params.toString()}`);
                    pushPreviewHistoryEntry(area, url, { kind, inputSnapshot: task.inputSnapshot });
                    if (!firstUrl) {
                        firstUrl = url;
                        firstKind = kind;
                    }
                }

                const firstIndex = area.history.indexOf(firstUrl);
                if (firstIndex !== -1) {
                    area.historyIndex = firstIndex;
                    area.resultUrl = firstUrl;
                    area.resultKind = firstKind;
                }
                persistAndRefresh();
                if (area.matchMedia) {
                    if (firstKind === 'video') {
                        const video = document.createElement('video');
                        video.muted = true;
                        video.playsInline = true;
                        video.onloadeddata = () => {
                            area.ratio = '自定义比例';
                            area.width = video.videoWidth;
                            area.height = video.videoHeight;
                            persistAndRefresh();
                        };
                        video.src = area.resultUrl;
                        video.load();
                    } else if (firstKind === 'audio') {
                        area.ratio = 'auto';
                        persistAndRefresh();
                    } else {
                        const image = new Image();
                        image.onload = () => {
                            area.ratio = '自定义比例';
                            area.width = image.naturalWidth;
                            area.height = image.naturalHeight;
                            persistAndRefresh();
                        };
                        image.src = area.resultUrl;
                    }
                }
            } else {
                const node = app.graph?.getNodeById(Number(executedNodeId));
                const text = (extractTextFromOutputData(outputData) || extractTextFromNodeWidgets(node) || '').trim();
                if (!text) continue;
                try {
                    const url = await saveTextAsset(text);
                    pushPreviewHistoryEntry(area, url, { kind: 'text', text, inputSnapshot: task.inputSnapshot });
                    syncTextContentWithSelection(area);
                    persistAndRefresh();
                } catch (err) {
                    console.error('[CLab] Text capture failed:', err);
                }
            }
        }
    });
}
