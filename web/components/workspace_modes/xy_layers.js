import { matrixCells, currentZLayer } from './xy_model.js';
import { axisValueLabel } from './axis_labels.js';

export function matrixLayers(xy,g) {
    const count=xy.z?.enabled&&xy.z.display==='all'?Math.max(1,xy.z.values.length):1,columns=Math.ceil(Math.sqrt(count));
    const gridWidth=Math.max(1,xy.x.values.length)*g.width+Math.max(0,xy.x.values.length-1)*(xy.x.gap??4);
    const gridHeight=Math.max(1,xy.y.values.length)*g.height+Math.max(0,xy.y.values.length-1)*(xy.y.gap??4);
    return Array.from({length:count},(_,index)=>({z:xy.z?.enabled&&xy.z.display==='all'?index:currentZLayer(xy),dx:index%columns*(gridWidth+360),dy:Math.floor(index/columns)*(gridHeight+240)}));
}
export function matrixRunCards(cards,xy,visibleIds,selected,scope='auto') {
    if(scope!=='all'&&selected.length)return selected;
    if(scope==='selected')return [];
    const cells=matrixCells(cards,xy);
    if(scope==='layer'||(scope==='auto'&&xy.z?.enabled))return cells.filter(cell=>cell.z===currentZLayer(xy)).map(cell=>cell.card);
    return cells.filter(cell=>xy.z?.enabled||visibleIds.has(cell.card.id)).map(cell=>cell.card);
}
export function zLayerTitle(xy,index) {
    return `Z ${index+1}/${xy.z.values.length} · ${axisValueLabel(xy.z,index)}`;
}
