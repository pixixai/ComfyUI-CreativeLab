/**
 * 状态管理器 (Model / Controller)
 * 负责管理面板的卡片数据，以及与画布上的 ShellLinkSystemConfig 节点进行 JSON 同步
 */

export const StateManager = {
    // 内存中的插件状态
    state: {
        cards: [],          
        activeCardId: null  
    },
    
    // 内部缓存，用于侦测外部数据变化（如撤销、粘贴节点）
    _lastSyncedJSON: "", 
    _watchdogTimer: null, 

    /**
     * 🐶 启动数据看门狗：智能监听来自 ComfyUI 画布的外部改变（粘贴、删除、撤销）
     */
    startWatchdog(graph) {
        if (this._watchdogTimer) return;
        
        this._watchdogTimer = setInterval(() => {
            if (!graph) return;
            const node = this.getConfigNode(graph);
            
            // 场景 1：节点被用户在画布上删除了，立即清空面板
            if (!node && this._lastSyncedJSON !== "") {
                console.log("[ShellLink] 🐶 看门狗侦测到配置节点被删除，正在清空面板...");
                this.loadFromNode(graph);
                return;
            }
            
            // 场景 2：节点还在，但里面的数据被外部修改了（比如被粘贴覆盖，或按了 Ctrl+Z 撤销）
            if (node) {
                const widget = node.widgets?.find(w => w.name === "scenes_data");
                if (widget && widget.value && widget.value !== this._lastSyncedJSON) {
                    console.log("[ShellLink] 🐶 看门狗侦测到配置节点数据被外部修改(粘贴/撤销等)，正在热更新面板...");
                    this.loadFromNode(graph);
                }
            }
        }, 800); // 800ms 检查一次，对性能零损耗
    },

    /**
     * 在当前工作流中寻找配置节点
     */
    getConfigNode(graph) {
        if (!graph) return null;
        const nodes = graph._nodes.filter(n => n.type === "ShellLinkSystemConfig");
        if (nodes.length === 0) return null;

        // 【优化点】：当画布上有多个配置节点时（比如新建了一个空的，又粘贴了一个有数据的）
        // 优先从后往前寻找带有实际“有效数据”的节点，防止空节点阻挡了有效节点
        for (let i = nodes.length - 1; i >= 0; i--) {
            const w = nodes[i].widgets?.find(w => w.name === "scenes_data");
            if (w && w.value && w.value.includes('"cards":') && w.value.length > 20) {
                return nodes[i];
            }
        }
        
        // 如果都没有有效数据，兜底返回最新创建的那一个
        return nodes[nodes.length - 1];
    },

    /**
     * 【存】将内存状态序列化并写入画布节点
     */
    syncToNode(graph) {
        const node = this.getConfigNode(graph);
        if (node) {
            const widget = node.widgets?.find(w => w.name === "scenes_data");
            if (widget) {
                const jsonStr = JSON.stringify(this.state);
                widget.value = jsonStr;
                this._lastSyncedJSON = jsonStr; // 同步后更新看门狗记录
            }
        }
        this.startWatchdog(graph); // 确保看门狗在运行
    },

    /**
     * 【取】从画布节点读取 JSON，并恢复或清空内存状态
     */
    loadFromNode(graph) {
        const node = this.getConfigNode(graph);
        if (node) {
            const widget = node.widgets?.find(w => w.name === "scenes_data");
            if (widget && widget.value) {
                try {
                    this._lastSyncedJSON = widget.value; // 更新看门狗记录
                    const parsedData = JSON.parse(widget.value);
                    
                    // 如果是手动新建的空节点（默认值为 {}），也视为空，执行清空操作
                    if (Object.keys(parsedData).length === 0 || !parsedData.cards) {
                        console.log("[ShellLink] 读取到空配置节点，执行面板复位");
                        this.state = { cards: [], activeCardId: null, selectedCardIds: [], selectedAreaIds: [] };
                        document.dispatchEvent(new CustomEvent("shell_link_state_cleared"));
                    } else {
                        // 有效数据，执行恢复
                        this.state = parsedData;
                        console.log("[ShellLink] 成功从节点恢复卡片数据");
                        document.dispatchEvent(new CustomEvent("shell_link_state_loaded", { detail: this.state }));
                    }
                } catch (e) {
                    console.error("[ShellLink] 解析配置节点数据失败:", e);
                }
            }
        } else {
            // 没有找到节点，清空面板
            console.log("[ShellLink] 当前工作流无配置节点，隔离并清空面板");
            this._lastSyncedJSON = "";
            this.state = { cards: [], activeCardId: null, selectedCardIds: [], selectedAreaIds: [] };
            document.dispatchEvent(new CustomEvent("shell_link_state_cleared"));
        }
        this.startWatchdog(graph); // 确保看门狗在运行
    },

    /**
     * 内置轻量级 Toast 提示函数 (自动消失)
     */
    showToast(msg, bg = "rgba(76, 175, 80, 0.95)") {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; top: 30px; left: 50%; transform: translateX(-50%);
            background: ${bg}; color: white; padding: 12px 24px;
            border-radius: 8px; z-index: 10005; font-size: 14px; font-weight: bold;
            box-shadow: 0 4px 15px rgba(0,0,0,0.4); pointer-events: none;
            opacity: 0; transition: opacity 0.3s ease; backdrop-filter: blur(4px);
        `;
        toast.innerText = msg;
        document.body.appendChild(toast);
        
        // 渐显 -> 等待 -> 渐隐 -> 销毁
        requestAnimationFrame(() => toast.style.opacity = '1');
        setTimeout(() => {
            toast.style.opacity = '0';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    },

    /**
     * 辅助方法：一键在画布上创建配置节点
     */
    createConfigNode(graph) {
        if (this.getConfigNode(graph)) {
            // 节点存在时，也顺便用这个好看的提示替换掉生硬的 alert
            this.showToast("⚠️ 配置节点已存在于画布中！", "rgba(255, 152, 0, 0.95)");
            return;
        }
        
        const node = LiteGraph.createNode("ShellLinkSystemConfig");
        
        let posX = 400; let posY = 300;
        try {
            posX = (window.innerWidth / 2) - 150;
            posY = (window.innerHeight / 2) - 100;
        } catch (e) {}

        node.pos = [posX, posY];
        graph.add(node);
        
        // 创建完毕后立马同步现有面板数据进去
        this.syncToNode(graph);
        console.log("[ShellLink] ⚓ 配置节点已成功创建并绑定当前数据！");
        
        // 弹出成功提示
        this.showToast("✅ 配置节点已创建");
    },

    /**
     * 获取当前选中的待运行的卡片
     */
    getActiveCard() {
        return this.state.cards.find(c => c.id === this.state.activeCardId);
    }
};