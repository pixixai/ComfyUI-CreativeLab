/**
 * 文件名: group_shared.js
 * 路径: web/components/contextmenu/group_shared.js
 * 职责: 右键菜单的通用辅助逻辑共享模块（例如显示通知 Toast 等）。
 */
import { showBindingToast, hideBindingToast } from "../ui_utils.js";

export function showAutoToast(msg, isError = false) {
    if (window.CLab && typeof window.CLab.showAutoToast === "function") {
        window.CLab.showAutoToast(msg, isError);
        return;
    }
    showBindingToast(msg, isError);
    setTimeout(hideBindingToast, 3000);
}
