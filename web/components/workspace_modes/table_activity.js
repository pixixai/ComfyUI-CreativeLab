import { createProgressOutline, sizeProgressOutline, updateProgressOutline } from './progress_outline.js';

export function createTableActivity(container) {
    const outlines = new Map(), completed = new Map();
    const remove = id => {
        outlines.get(id)?.remove();
        outlines.delete(id);
    };
    const clearCompletion = id => {
        clearTimeout(completed.get(id));
        completed.delete(id);
    };
    const paint = (id, progress, layout) => {
        let ring = outlines.get(id);
        if (progress === undefined) { remove(id); return; }
        if (layout || !ring?.isConnected) {
            const row = container.querySelector(`.clab-card[data-table-row="${CSS.escape(id)}"]:not([hidden])`);
            const cells = row?.querySelectorAll('[role=cell].is-effective');
            if (!cells?.length) { remove(id); return; }
            const bounds = row.getBoundingClientRect();
            let left = bounds.right, right = bounds.left;
            for (const cell of cells) {
                const rect = cell.getBoundingClientRect();
                left = Math.min(left, rect.left);
                right = Math.max(right, rect.right);
            }
            const width = right - left, height = bounds.height;
            if (width <= 0 || height <= 0) { remove(id); return; }
            if (!ring?.isConnected) {
                ring = createProgressOutline('clab-table-progress-ring', 'clab-table-progress-path');
                row.append(ring);
                outlines.set(id, ring);
            }
            ring.style.left = `${left - bounds.left}px`;
            ring.style.width = `${width}px`;
            sizeProgressOutline(ring, width, height);
        }
        if (ring.dataset.progress !== String(progress)) updateProgressOutline(ring, progress);
    };
    const refresh = (workspaceId, cardId, success = false) => {
        const running = new Map((window.CLab?.getRunningCardProgress?.(workspaceId) || []).map(({cardId,progress}) => [cardId,progress]));
        if (cardId !== undefined) {
            if (running.has(cardId)) clearCompletion(cardId);
            else if (success) {
                clearCompletion(cardId);
                completed.set(cardId, setTimeout(() => { completed.delete(cardId); remove(cardId); }, 320));
            }
            paint(cardId, running.get(cardId) ?? (completed.has(cardId) ? 100 : undefined), false);
            return;
        }
        for (const id of new Set([...outlines.keys(), ...running.keys(), ...completed.keys()])) {
            paint(id, running.get(id) ?? (completed.has(id) ? 100 : undefined), true);
        }
    };
    return {refresh, clear() {
        for (const id of completed.keys()) clearCompletion(id);
        for (const id of outlines.keys()) remove(id);
    }};
}
