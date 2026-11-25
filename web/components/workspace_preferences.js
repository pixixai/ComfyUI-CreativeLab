import { tableSizes } from './workspace_modes/table_layout.js';

export const workspacePreferences = {
    defaultMode: 'cards',
    cardGap: 5,
    cardBuffer: 5,
    moduleGap: 3,
    cardPadding: 6,
    cardWidth: 320,
    columnWidth: tableSizes.width.default,
    rowHeight: tableSizes.height.default,
    cellPadding: 10,
    xyOrigin: 'bottom',
    xyGap: 4,
    xyMargin: 10,
};

export function newWorkspaceView(mode = workspacePreferences.defaultMode) {
    const settings = workspacePreferences;
    return {
        mode, creationMode: mode,
        table: { columnWidth: settings.columnWidth, rowHeight: settings.rowHeight, padding: settings.cellPadding },
        xy: {
            origin: settings.xyOrigin,
            x: { gap: settings.xyGap, margin: settings.xyMargin },
            y: { gap: settings.xyGap, margin: settings.xyMargin },
        },
    };
}
