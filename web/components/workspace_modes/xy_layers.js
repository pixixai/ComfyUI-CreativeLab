import { matrixCells, currentZLayer } from './xy_model.js';
import { axisValueLabel } from './axis_labels.js';
import { taskCoordinates } from './task_model.js';

export function matrixLayers(xy,g) {
    const count=xy.z?.enabled&&xy.z.display==='all'?Math.max(1,xy.z.values.length):1,columns=Math.max(1,Math.min(count,xy.tiling?.columns||Math.ceil(Math.sqrt(count))));
    const gridWidth=Math.max(1,xy.x.values.length)*g.width+Math.max(0,xy.x.values.length-1)*(xy.x.gap??4);
    const gridHeight=Math.max(1,xy.y.values.length)*g.height+Math.max(0,xy.y.values.length-1)*(xy.y.gap??4);
    return Array.from({length:count},(_,index)=>({z:xy.z?.enabled&&xy.z.display==='all'?index:currentZLayer(xy),dx:index%columns*(gridWidth+(xy.tiling?.columnGap??360)),dy:Math.floor(index/columns)*(gridHeight+(xy.tiling?.rowGap??240))}));
}
export function matrixRunCards(cards,xy,visibleIds,selected,scope='auto') {
    let cells;
    if (scope !== 'all' && selected.length) {
        cells = selected.map(card => ({card, ...taskCoordinates(card,xy)}));
    } else if (scope === 'selected') {
        return [];
    } else {
        cells = matrixCells(cards,xy);
        if (xy.z?.enabled && (scope === 'layer' || scope === 'auto')) {
            cells = cells.filter(cell => cell.z === currentZLayer(xy));
        } else {
            cells = cells.filter(cell => xy.z?.enabled || visibleIds.has(cell.card.id));
        }
    }
    const first = xy.runAxis === 'y' ? 'y' : 'x';
    const second = first === 'x' ? 'y' : 'x';
    return cells.sort((a,b) => (a.z ?? 0) - (b.z ?? 0) || a[second] - b[second] || a[first] - b[first]).map(cell => cell.card);
}
export function zLayerTitle(xy,index) {
    return `Z ${index+1}/${xy.z.values.length} · ${axisValueLabel(xy.z,index)}`;
}
