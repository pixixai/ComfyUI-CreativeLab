import { tableSizes } from './workspace_modes/table_layout.js';

export const workspacePreferences = {
    defaultMode: 'cards',
    cardGap: 20,
    cardBuffer: 5,
    moduleGap: 10,
    cardPadding: 10,
    cardWidth: 320,
    columnWidth: tableSizes.width.default,
    rowHeight: tableSizes.height.default,
    cellPadding: 10,
    xyOrigin: 'bottom',
    xyGap: 4,
    xyMargin: 10,
};

export function newWorkspaceView() {
    const settings = workspacePreferences;
    return {
        mode: settings.defaultMode,
        table: { columnWidth: settings.columnWidth, rowHeight: settings.rowHeight, padding: settings.cellPadding },
        xy: {
            origin: settings.xyOrigin,
            x: { gap: settings.xyGap, margin: settings.xyMargin },
            y: { gap: settings.xyGap, margin: settings.xyMargin },
        },
    };
}
