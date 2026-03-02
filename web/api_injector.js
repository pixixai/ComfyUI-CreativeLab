/**
 * API 注入器 (Service)
 * 负责拦截 ComfyUI 的运行请求并注入卡片参数，安全管理发包队列
 */
import { api } from "../../scripts/api.js";
import { StateManager } from "./state_manager.js";
import { showBindingToast, hideBindingToast } from "./components/ui_utils.js";

export function setupAPIInjector(app) {
    console.log("[ShellLink] 初始化 API 拦截、动态剪枝与回传系统...");

    window.ShellLink = window.ShellLink || {};
    window._slExecQueue = window._slExecQueue || []; // 安全的任务队列
    window._slTaskMap = window._slTaskMap || {};     // 记录 prompt_id -> 任务映射
    window._slLastGeneratedTask = null;              // 桥接前后端的暂存任务
    window._slCurrentBatchPromptIds = [];            // 【新增】：记录当前批次的所有 prompt_id

    // =========================================================================
    // 【核弹级 UI 渲染器】：支持报错红灯模式，最高权限 (!important) 压制闪烁
    // =========================================================================
    const setUIProgress = (cardId, percentage, isHide = false, isError = false) => {
        const progContainer = document.querySelector(`.sl-card-progress-container[data-card-prog-id="${cardId}"]`);
        if (progContainer) {
            const bar = progContainer.querySelector('.sl-card-progress-bar');
            if (!bar) return;

            if (isError) {
                progContainer.style.opacity = '1';
                bar.classList.add('error');
                bar.style.setProperty('transition', 'none', 'important'); 
                bar.style.setProperty('width', '100%', 'important');
            } else if (isHide) {
                if (!bar.classList.contains('error')) {
                    progContainer.style.opacity = '0';
                    setTimeout(() => {
                        if (!bar.classList.contains('error')) {
                            bar.style.setProperty('transition', 'none', 'important');
                            bar.style.setProperty('width', '0%', 'important');
                        }
                    }, 300);
                }
            } else {
                progContainer.style.opacity = '1';
                if (!bar.classList.contains('error')) {
                    bar.style.setProperty('transition', 'width 0.3s ease-out', 'important');
                    bar.style.setProperty('width', `${percentage}%`, 'important');
                }
            }
        }
    };

    // 【新增】：监听后端的运行报错，弹出 Toast 提示并直接中断当前批次的后续任务！
    api.addEventListener("execution_error", (e) => {
        showBindingToast("❌ 工作流后台运行报错！请关闭面板，查看详细错误提示。", true);
        setTimeout(() => hideBindingToast(), 6000);
        
        const pid = e.detail?.prompt_id;
        const task = window._slTaskMap[pid];
        
        if (task) {
            // 1. 将当前后端报错的卡片瞬间标红 100%
            setUIProgress(task.cardId, 100, false, true);

            // 2. 将当前批次中的其他后续任务全部从 ComfyUI 后端队列中直接删除（强力拦截）
            if (window._slCurrentBatchPromptIds && window._slCurrentBatchPromptIds.length > 0) {
                const toDelete = window._slCurrentBatchPromptIds.filter(id => id !== pid);
                
                if (toDelete.length > 0) {
                    api.fetchApi('/queue', {
                        method: 'POST',
                        body: JSON.stringify({ delete: toDelete })
                    }).catch(err => console.error("[ShellLink] 无法删除后续队列", err));

                    // 3. 隐藏被成功拦截（删除）的无辜排队任务的 5% 蓝条
                    toDelete.forEach(delPid => {
                        const delTask = window._slTaskMap[delPid];
                        if (delTask) {
                            setUIProgress(delTask.cardId, 0, true);
                        }
                    });
                }
                // 清空当前批次记录
                window._slCurrentBatchPromptIds = [];
            }
        }
    });

    // =========================================================================
    // 1. 坚如磐石的异步执行队列 (彻底解决报错刷屏、且只红第一个)
    // =========================================================================
    window.ShellLink.executeTasks = async function(tasks) {
        window._slCurrentBatchPromptIds = []; // 每次发车前清空批次追踪

        // 先把所有选中的任务推入排队队列，并瞬间点亮 5%
        for (let task of tasks) {
            window._slExecQueue.push(task);
            
            const bar = document.querySelector(`.sl-card-progress-container[data-card-prog-id="${task.cardId}"] .sl-card-progress-bar`);
            if (bar) bar.classList.remove('error'); // 拔掉可能残留的红灯
            setUIProgress(task.cardId, 5);
        }

        const count = tasks.length;
        for (let i = 0; i < count; i++) {
            try {
                // 发送排队请求给服务器 (ComfyUI 会在此刻进行前端图谱连线校验)
                await app.queuePrompt(0, 1); 
            } catch (submitErr) {
                console.warn("[ShellLink] 🚫 前端图谱校验未通过，触发阻断！", submitErr);
                
                // 弹出一次友好的提示框告知用户
                showBindingToast("❌ 节点前端校验失败！请检查工作流连线或必填参数。", true);
                setTimeout(() => hideBindingToast(), 6000);
                
                // 【多任务阻断：只红当前报错的这一个】
                if (window._slLastGeneratedTask) {
                    setUIProgress(window._slLastGeneratedTask.cardId, 100, false, true);
                    window._slLastGeneratedTask = null;
                }

                // 【清理剩余】：将剩下的无辜排队任务全部取消（不再发包、也不变红）
                while (window._slExecQueue.length > 0) {
                    let skippedTask = window._slExecQueue.shift();
                    setUIProgress(skippedTask.cardId, 0, true);
                }

                // 彻底中断循环，ComfyUI 官方的错误提示框只会弹一次！
                break;
            }
        }
    };

    // 拦截 api.queuePrompt 以精准捕获生成的 prompt_id
    const origQueuePrompt = api.queuePrompt;
    api.queuePrompt = async function() {
        const res = await origQueuePrompt.apply(this, arguments);
        // 成功突破前端校验，拿到了真实发往后端的 id！
        if (res && res.prompt_id && window._slLastGeneratedTask) {
            window._slTaskMap[res.prompt_id] = window._slLastGeneratedTask;
            window._slCurrentBatchPromptIds.push(res.prompt_id); // 加入批次追踪
            window._slLastGeneratedTask = null; // 消费掉暂存任务
        }
        return res;
    };

    // =========================================================================
    // 2. 拦截队列请求 (Input 参数注入 & Output 动态剪枝)
    // =========================================================================
    const originalGraphToPrompt = app.graphToPrompt;
    app.graphToPrompt = async function () {
        const result = await originalGraphToPrompt.apply(this, arguments);
        
        // 使用安全队列弹出任务上下文
        let execTask = window._slExecQueue.shift();

        if (!execTask) {
            console.log(`[ShellLink] 🟢 原生运行模式：完全隔离 (不注入参数、不修改路径、不剪枝)`);
            return result; 
        }

        // 暂存为最新生成成功的任务，等待 HTTP 返回结果映射 ID
        window._slLastGeneratedTask = execTask;

        console.log(`[ShellLink] 🚀 插件运行模式：当前注入任务卡片: ${execTask.cardId}`);

        const activeCard = StateManager.state.cards.find(c => c.id === execTask.cardId);
        if (!activeCard) return result;

        // 【深拷贝】保护 ComfyUI 图谱内存免受污染
        const promptOutput = JSON.parse(JSON.stringify(result.output));
        result.output = promptOutput;

        // --- 阶段 A: 参数注入 ---
        if (activeCard.areas && activeCard.areas.length > 0) {
            activeCard.areas.filter(a => a.type === 'edit').forEach(area => {
                // 读取全部被多选绑定的参数列表
                let targets = [];
                if (Array.isArray(area.targetWidgets) && area.targetWidgets.length > 0) {
                    targets = area.targetWidgets.map(tw => {
                        const [nId, wName] = tw.split('||');
                        return { nodeId: nId, widget: wName };
                    });
                } else if (area.targetNodeId && area.targetWidget) {
                    targets = [{ nodeId: area.targetNodeId, widget: area.targetWidget }];
                }

                // 循环将值注入到每一个被绑定的节点参数中
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
                        console.log(`[ShellLink] 注入 -> 节点 ${t.nodeId} [${t.widget}] =`, injectValue);
                    }
                });
            });
        }

        // --- 阶段 A.5: 偷天换日 (修改保存节点) ---
        if (activeCard.areas) {
            activeCard.areas.forEach(area => {
                if (area.type === 'preview') {
                    if (execTask.previewAreaIds.includes(area.id) && area.targetNodeId && promptOutput[area.targetNodeId]) {
                        const nodeData = promptOutput[area.targetNodeId];
                        let prefix = `ShellLink/Pix`;
                        
                        // 【核心修改】：拦截 PreviewImage 和原版 SaveImage，悄悄替换为我们后端的专属无下划线节点！
                        if (nodeData.class_type === 'PreviewImage' || nodeData.class_type === 'SaveImage') {
                            nodeData.class_type = 'ShellLinkSaveImage';
                            if (!nodeData.inputs) nodeData.inputs = {};
                            nodeData.inputs.filename_prefix = prefix;
                        } else if (nodeData.class_type === 'ShellLinkSaveImage' || nodeData.class_type.includes('VideoCombine')) {
                            if (!nodeData.inputs) nodeData.inputs = {};
                            if (nodeData.inputs.filename_prefix !== undefined) nodeData.inputs.filename_prefix = prefix;
                            else if (nodeData.inputs.save_prefix !== undefined) nodeData.inputs.save_prefix = prefix;
                            else nodeData.inputs.filename_prefix = prefix;
                        }
                    }
                }
            });
        }

        // --- 阶段 B: 动态剪枝 ---
        const targetPreviewAreas = activeCard.areas?.filter(a => a.type === 'preview' && a.targetNodeId && execTask.previewAreaIds.includes(a.id)) || [];
        
        if (targetPreviewAreas.length > 0) {
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
            targetPreviewAreas.forEach(area => traceDependencies(area.targetNodeId));
            
            const allNodeIds = Object.keys(promptOutput);
            allNodeIds.forEach(id => {
                if (!keepNodes.has(id)) delete promptOutput[id];
            });
        }
        return result;
    };

    // =========================================================================
    // 3. 监听引擎执行完成事件 (Output 路由回传)
    // =========================================================================
    api.addEventListener("executed", (event) => {
        const detail = event.detail;
        const executedNodeId = detail.node;     
        const outputData = detail.output;       
        const prompt_id = detail.prompt_id; 

        const task = (window._slTaskMap && prompt_id) ? window._slTaskMap[prompt_id] : null;
        if (!task) return;

        const card = StateManager.state.cards.find(c => c.id === task.cardId);
        if (!card || !card.areas) return;

        card.areas.filter(a => a.type === 'preview').forEach(area => {
            if (task.previewAreaIds && task.previewAreaIds.length > 0) {
                if (!task.previewAreaIds.includes(area.id)) return;
            }

            if (String(area.targetNodeId) === String(executedNodeId)) {
                if (outputData.images && outputData.images.length > 0) {
                    const img = outputData.images[0];
                    const params = new URLSearchParams({ filename: img.filename, type: img.type, subfolder: img.subfolder || "" });
                    const imageUrl = api.apiURL(`/view?${params.toString()}`);
                    area.resultUrl = imageUrl;

                    if (area.matchMedia) {
                        const tempImg = new Image();
                        tempImg.onload = () => {
                            area.ratio = '自定义比例';
                            area.width = tempImg.naturalWidth;
                            area.height = tempImg.naturalHeight;
                            StateManager.syncToNode(app.graph);
                            document.dispatchEvent(new CustomEvent("sl_render_ui"));
                        };
                        tempImg.src = imageUrl; 
                    } else {
                        StateManager.syncToNode(app.graph);
                        document.dispatchEvent(new CustomEvent("shell_link_update_preview", {
                            detail: { cardId: card.id, areaId: area.id, url: imageUrl, type: 'image' }
                        }));
                    }
                } 
                else if (outputData.gifs && outputData.gifs.length > 0) {
                    const video = outputData.gifs[0]; 
                    const params = new URLSearchParams({ filename: video.filename, type: video.type, subfolder: video.subfolder || "" });
                    area.resultUrl = api.apiURL(`/view?${params.toString()}`);
                    StateManager.syncToNode(app.graph);
                    document.dispatchEvent(new CustomEvent("sl_render_ui"));
                }
            }
        });
    });
}