import { remapPreviewHistory } from '../../modules/media_types/media_utils.js';
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
    saveAndRender,syncTextContentWithSelection,onChanged,
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

                if (!onChanged && window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(o.area.id);
            });
            if(onChanged)onChanged(selectedAreaObjs);else if (window._clabJustSave) window._clabJustSave(); else saveAndRender();
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

                if (!onChanged && window._clabSurgicallyUpdateArea) window._clabSurgicallyUpdateArea(o.area.id);
            });
            if(onChanged)onChanged(selectedAreaObjs);else if (window._clabJustSave) window._clabJustSave(); else saveAndRender();
        };
    }
    const externalEl=menuEl.querySelector('#clab-ctx-remove-external');
    if(externalEl)externalEl.onclick=()=>{
        menuEl.style.display='none';
        for(const {area}of selectedAreaObjs||[]){
            const indices=(area.history||[]).map((_,index)=>index).filter(index=>!area.historyRuns?.[index]?.externalImport);
            if(indices.length===(area.history?.length||0))continue;
            const active=remapPreviewHistory(area,indices);
            area.historyIndex=active<0?Math.max(0,area.history.length-1):active;area.resultUrl=area.history[area.historyIndex]||'';
            area.selectedThumbIndices=[];syncTextContentWithSelection(area);void loadSelectedTextContent(area,{refresh:false});
            if(!onChanged&&window._clabSurgicallyUpdateArea)window._clabSurgicallyUpdateArea(area.id);
        }
        if(onChanged)onChanged(selectedAreaObjs);else if(window._clabJustSave)window._clabJustSave();else saveAndRender();
    };

}

