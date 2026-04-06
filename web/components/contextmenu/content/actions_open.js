/**
 * 文件名: actions_open.js
 * 路径: web/components/contextmenu/content/actions_open.js
 * 内容：预览模式、系统默认应用打开、在资源管理器显示
 */
export function bindOpenActions({
    menuEl,
    mainObj,
    mainCurrentUrl,
    mainHistoryIdx,
    previewModalApi,
    openAssetWithSystem,
    showAutoToast,
} = {}) {
    if (!menuEl) return;

    const previewEl = menuEl.querySelector("#clab-ctx-preview-mode");
    if (previewEl) {
        previewEl.onclick = () => {
            menuEl.style.display = "none";
            if (!mainCurrentUrl) {
                showAutoToast("No previewable asset in current module.", true);
                return;
            }
            previewModalApi.openPreviewModal(mainObj.card, mainObj.area, mainCurrentUrl, mainHistoryIdx);
        };
    }

    const openDefaultEl = menuEl.querySelector("#clab-ctx-open-default");
    if (openDefaultEl) {
        openDefaultEl.onclick = async () => {
            menuEl.style.display = "none";
            if (!mainCurrentUrl) {
                showAutoToast("No asset available to open.", true);
                return;
            }
            try {
                await openAssetWithSystem("open", mainCurrentUrl);
            } catch (error) {
                showAutoToast(`Open with default app failed: ${error.message || error}`, true);
            }
        };
    }

    const openExplorerEl = menuEl.querySelector("#clab-ctx-open-explorer");
    if (openExplorerEl) {
        openExplorerEl.onclick = async () => {
            menuEl.style.display = "none";
            if (!mainCurrentUrl) {
                showAutoToast("No asset available to reveal.", true);
                return;
            }
            try {
                await openAssetWithSystem("reveal", mainCurrentUrl);
            } catch (error) {
                showAutoToast(`资源管理器定位失败: ${error.message || error}`, true);
            }
        };
    }
}

