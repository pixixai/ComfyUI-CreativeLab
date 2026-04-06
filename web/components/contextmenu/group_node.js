/**
 * 文件名: group_node.js
 * 路径: web/components/contextmenu/group_node.js
 * 职责: 节点分组菜单渲染与事件绑定（对节点跳转或工作流图进行操作的右键逻辑）。
 */
import { saveAndRender } from "../ui_state.js";
import { showAutoToast } from "./group_shared.js";

function getAreaAssociatedNodeIds(area) {
    if (!area || typeof area !== "object") return [];

    const nodeIds = new Set();
    const pushNodeId = (raw) => {
        const id = raw == null ? "" : String(raw).trim();
        if (id) nodeIds.add(id);
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
}

function isAreaNodeBypassed(area) {
    if (!area || typeof area !== "object") return false;
    return area.runtimeNodeBypassed === true || area.runtimeNodeDisabled === true;
}

function setAreaNodeBypassed(area, bypassed) {
    if (!area || typeof area !== "object") return;
    area.runtimeNodeBypassed = bypassed;
    area.runtimeNodeDisabled = bypassed;
}

export function buildNodeGroupState(selectedAreaObjs) {
    const selectedAreaInfos = selectedAreaObjs.map((item) => ({
        ...item,
        nodeIds: getAreaAssociatedNodeIds(item.area),
    }));

    const selectedAreaInfosWithNodes = selectedAreaInfos.filter((item) => item.nodeIds.length > 0);
    const allSelectedAreasBypassed = selectedAreaInfosWithNodes.length > 0
        && selectedAreaInfosWithNodes.every((item) => isAreaNodeBypassed(item.area));

    return {
        selectedAreaInfosWithNodes,
        allSelectedAreasBypassed,
        toggleNodeBypassLabel: allSelectedAreasBypassed ? "取消绕过节点" : "绕过节点",
        toggleNodeBypassClass: allSelectedAreasBypassed ? "" : "clab-danger",
    };
}

export function renderNodeGroup(nodeState) {
    return `
        <div class="clab-context-menu-title">节点</div>
        <div class="clab-context-menu-item ${nodeState.toggleNodeBypassClass}" id="clab-ctx-toggle-node-bypass">${nodeState.toggleNodeBypassLabel}</div>
    `;
}

export function bindNodeGroup({ menuEl, nodeState, closeMenu }) {
    const toggleEl = menuEl.querySelector("#clab-ctx-toggle-node-bypass");
    if (!toggleEl) return;

    toggleEl.onclick = () => {
        closeMenu();

        const selectedAreaInfosWithNodes = nodeState.selectedAreaInfosWithNodes;
        const allSelectedAreasBypassed = nodeState.allSelectedAreasBypassed;
        if (selectedAreaInfosWithNodes.length === 0) {
            showAutoToast("选中模块未关联节点，无法切换绕过状态。", true);
            return;
        }

        const shouldBypass = !allSelectedAreasBypassed;
        let affectedNodeCount = 0;

        selectedAreaInfosWithNodes.forEach((item) => {
            setAreaNodeBypassed(item.area, shouldBypass);
            affectedNodeCount += item.nodeIds.length;
            if (window._clabRefreshAreaForContext) {
                window._clabRefreshAreaForContext(item.area.id);
            } else if (window._clabSurgicallyUpdateArea) {
                window._clabSurgicallyUpdateArea(item.area.id);
            }
        });

        if (window._clabJustSave) window._clabJustSave(); else saveAndRender();
        if (shouldBypass) {
            showAutoToast(`已将 ${selectedAreaInfosWithNodes.length} 个模块关联的 ${affectedNodeCount} 个节点设为绕过（仅插件运行时生效）。`);
        } else {
            showAutoToast(`已取消 ${selectedAreaInfosWithNodes.length} 个模块关联节点的绕过状态。`);
        }
    };
}
