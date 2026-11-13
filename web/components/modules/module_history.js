import { saveAndRender } from '../ui_state.js';
import { selectPreviewHistory, loadSelectedTextContent } from './media_types/media_utils.js';
import { editHistory } from '../edit_history_runtime.js';

export function selectOutputHistory(card, area, index, options) {
    editHistory.withoutRecording(()=>{
    const { outputAreaIds, restored } = selectPreviewHistory(card, area, index, options);
    if (outputAreaIds.length === 0) return;
    for (const id of outputAreaIds) {
        const output = card.areas.find(item => item.id === id);
        if (!output.missingHistoryRun) void loadSelectedTextContent(output, { refresh: true });
    }
    if (restored.createdAreaIds.length > 0 || document.querySelector('#clab-panel')?.dataset.workspaceMode==='table') {
        if (window._clabRefreshContextView) window._clabRefreshContextView({areaIds:[...outputAreaIds,...restored.touchedAreaIds]});
        else saveAndRender();
    } else if (window._clabSurgicallyUpdateArea) {
        for (const id of new Set([...outputAreaIds, ...restored.touchedAreaIds])) window._clabSurgicallyUpdateArea(id);
    } else {
        saveAndRender();
    }
    if (window._clabJustSave) window._clabJustSave();
    });
}
