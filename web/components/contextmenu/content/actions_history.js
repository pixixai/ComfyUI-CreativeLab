/**
 * 文件名: actions_history.js
 * 路径: web/components/contextmenu/content/actions_history.js
 * 内容：移除当前记录、清空所有历史记录
 */
export function bindHistoryActions({
    menuEl,
    selectedAreaObjs,
    getHistoryArr,
    getHistoryIdx,
    removePreviewHistoryIndex,
    loadSelectedTextContent,
    clearPreviewHistory,
    saveAndRender,
} = {}) {
    if (!menuEl) return;

    const removeEl = menuEl.querySelector("#clab-ctx-remove");
    if (removeEl) {
        removeEl.onclick = () => {
            menuEl.style.display = "none";
            (selectedAreaObjs || []).forEach((o) => {
                const arr = getHistoryArr(o.area);
                if (arr.length > 0) {
                    const idx = getHistoryIdx(o.area);
                    removePreviewHistoryIndex(o.area, idx);
                    const newIdx = Math.max(0, (o.area.history || []).length - 1);
                    if (o.area.historyIndex === undefined && o.area.currentRecordIndex !== undefined) {
                        o.area.currentRecordIndex = newIdx;
                    }
                    void loadSelectedTextContent(o.area, { refresh: false });
                } else {
                    o.area.resultUrl = null;
                }
                if (o.area.selectedThumbIndices) o.area.selectedThumbIndices = [];

                if (window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(o.area.id);
            });
            if (window._clabJustSave) window._clabJustSave(); else saveAndRender();
        };
    }

    const clearEl = menuEl.querySelector("#clab-ctx-clear");
    if (clearEl) {
        clearEl.onclick = () => {
            menuEl.style.display = "none";
            (selectedAreaObjs || []).forEach((o) => {
                clearPreviewHistory(o.area);
                o.area.resultUrl = null;
                if (o.area.historyUrls) o.area.historyUrls = [];
                if (o.area.results) o.area.results = [];
                if (o.area.historyIndex !== undefined) o.area.historyIndex = 0;
                if (o.area.currentRecordIndex !== undefined) o.area.currentRecordIndex = 0;
                if (o.area.selectedThumbIndices) o.area.selectedThumbIndices = [];

                if (window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(o.area.id);
            });
            if (window._clabJustSave) window._clabJustSave(); else saveAndRender();
        };
    }
}

