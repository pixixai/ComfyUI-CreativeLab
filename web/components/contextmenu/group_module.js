/**
 * 文件名: group_module.js
 * 路径: web/components/contextmenu/group_module.js
 * 职责: 模块分组菜单渲染与事件绑定（控制模块的选中、删除、移动等相关操作）。
 */
import { state } from "../ui_state.js";
import { execSelectSameModules, execDeleteSameModules, execMoveBackward, execMoveForward } from "../actions/action_batch_sync.js";

export function renderModuleGroup() {
    return `
        <div class="clab-context-menu-title">模块</div>
        <div class="clab-context-menu-item" id="clab-ctx-select-same">选择相同模块</div>
        <div class="clab-context-menu-item clab-danger" id="clab-ctx-del-same">删除相同模块</div>
        <div class="clab-context-menu-divider"></div>
        <div class="clab-context-menu-item" id="clab-ctx-move-back">批量向后移动</div>
        <div class="clab-context-menu-item" id="clab-ctx-move-fwd">批量向前移动</div>
    `;
}

export function bindModuleGroup({ menuEl, selectedAreaObjs, closeMenu }) {
    const selectSameEl = menuEl.querySelector("#clab-ctx-select-same");
    if (selectSameEl) {
        selectSameEl.onclick = () => {
            closeMenu();
            execSelectSameModules(selectedAreaObjs);
        };
    }

    const delSameEl = menuEl.querySelector("#clab-ctx-del-same");
    if (delSameEl) {
        delSameEl.onclick = () => {
            closeMenu();
            selectedAreaObjs.forEach((o) => execDeleteSameModules(o.area, o.card));
        };
    }

    const moveBackEl = menuEl.querySelector("#clab-ctx-move-back");
    if (moveBackEl) {
        moveBackEl.onclick = () => {
            closeMenu();
            execMoveBackward(state.selectedAreaIds);
        };
    }

    const moveFwdEl = menuEl.querySelector("#clab-ctx-move-fwd");
    if (moveFwdEl) {
        moveFwdEl.onclick = () => {
            closeMenu();
            execMoveForward(state.selectedAreaIds);
        };
    }
}
