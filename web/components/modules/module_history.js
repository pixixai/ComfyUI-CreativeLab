import { saveAndRender } from '../ui_state.js';
import { selectPreviewHistory, loadSelectedTextContent } from './media_types/media_utils.js';

export function selectOutputHistory(card, area, index, options) {
    const { outputAreaIds, restored } = selectPreviewHistory(card, area, index, options);
    if (outputAreaIds.length === 0) return;
    for (const id of outputAreaIds) {
        const output = card.areas.find(item => item.id === id);
        if (!output.missingHistoryRun) void loadSelectedTextContent(output, { refresh: true });
    }
    if (restored.createdAreaIds.length > 0) {
        if (window._clabRefreshContextView) window._clabRefreshContextView();
        else saveAndRender();
    } else if (window._clabSurgicallyUpdateArea) {
        for (const id of new Set([...outputAreaIds, ...restored.touchedAreaIds])) window._clabSurgicallyUpdateArea(id);
    } else {
        saveAndRender();
    }
    if (window._clabJustSave) window._clabJustSave();
}
