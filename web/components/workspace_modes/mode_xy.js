import { matrixCells, matrixOutput, visibleMatrixCells, currentZLayer } from './xy_model.js';
import { refreshModuleBindingSummary } from '../modules/module_binding.js';
import { renderXYAxes, xyPosition, projectXYCanvas } from './xy_axes.js';
import { medianMediaRatio } from './xy_layout.js';
import { updateXYHistoryLabel } from './xy_history.js';
import { matrixLayers, zLayerTitle } from './xy_layers.js';
import { renderZAxis } from './xy_z_axis.js';
import { hydrateWorkspaceAreas } from './task_dom.js';

function at(element,x,y,width,height) {
    Object.assign(element.style,{left:`${x}px`,top:`${y}px`,...(width===undefined?{}:{width:`${width}px`}),...(height===undefined?{}:{height:`${height}px`})});
}
export function xyMediaRatio(wrapper,items,xy) {
    const sizes=[];
    for(const item of items){
        const output=matrixOutput(item.card,xy),known=output?.mediaSize;
        if(known&&known.url===output?.resultUrl&&known.width>0&&known.height>0){sizes.push(known);continue;}
        const area=wrapper.querySelector(`.clab-output-area[data-area-id="${CSS.escape(output?.id||'')}"]`);
        const media=area?.querySelector('.clab-preview-bg img,.clab-preview-bg video');
        const width=media?.naturalWidth||media?.videoWidth,height=media?.naturalHeight||media?.videoHeight;if(width&&height)sizes.push({width,height});
    }
    return medianMediaRatio(sizes);
}
function geometry(xy,ratio) {
    const width=320,height=width/ratio;
    return {width,height,stepX:width+(xy.x.gap??4),stepY:height+(xy.y.gap??4),left:120+(xy.x.margin??10),top:xy.origin==='top'?56+(xy.y.margin??10):76};
}
export function showXYMode(wrapper,cards,xy,parameters) {
    const all=matrixCells(cards,xy),items=visibleMatrixCells(cards,xy);
    const elements=new Map([...wrapper.querySelectorAll(':scope > .clab-card')].map(element=>[element.dataset.cardId,element])),byId=new Map(items.map(item=>[item.card.id,item]));
    for(const [id,element]of elements){
        element.hidden=!byId.has(id);
        const output=byId.has(id)?matrixOutput(byId.get(id).card,xy):null;
        element.querySelectorAll('.clab-area').forEach(area=>{area.hidden=area.dataset.areaId!==output?.id;});
    }
    const outputs=new Set(items.map(item=>matrixOutput(item.card,xy)?.id));
    hydrateWorkspaceAreas(wrapper,(card,area)=>outputs.has(area.id));
    const g=geometry(xy,xyMediaRatio(wrapper,all,xy)),columns=Math.max(1,xy.x.values.length),rows=Math.max(1,xy.y.values.length),layers=matrixLayers(xy,g),layerByZ=new Map(layers.map(layer=>[layer.z,layer]));
    const row=y=>xy.origin==='bottom'?rows-1-y:y,gridW=(columns-1)*g.stepX+g.width;
    wrapper.style.setProperty('--xy-media-height',`${g.height}px`);
    wrapper.style.setProperty('--xy-cell-width',`${g.width}px`);
    const occupied=new Set();
    for(const [id,element]of elements){
        const item=byId.get(id);element.hidden=!item;element.draggable=false;if(!item)continue;
        const layer=layerByZ.get(item.z??layers[0].z);occupied.add(`${item.x},${item.y},${layer.z}`);element.dataset.xyLayer=layer.z;
        at(element,g.left+layer.dx+item.x*g.stepX,g.top+layer.dy+row(item.y)*g.stepY,g.width);
        const output=matrixOutput(item.card,xy);
        updateXYHistoryLabel(element,output);
        element.querySelectorAll('.clab-area').forEach(area=>{area.hidden=area.dataset.areaId!==output?.id;area.draggable=false;if(!area.hidden)refreshModuleBindingSummary(area,output);});
    }
    const placeholders=new Map([...wrapper.querySelectorAll('.clab-xy-empty')].map(element=>[element.dataset.xyPlaceholder,element]));
    for(const layer of layers)for(let y=0;y<rows;y++)for(let x=0;x<columns;x++)if(!occupied.has(`${x},${y},${layer.z}`)){
        const key=`${x},${y}${xy.z.enabled?`,${layer.z}`:''}`,empty=placeholders.get(key)||document.createElement('button');placeholders.delete(key);
        empty.classList.add('clab-xy-empty');empty.dataset.xyPlaceholder=key;empty.setAttribute('aria-label','图像占位');empty.title='设置轴参数和取值后，自动建立对应任务';
        at(empty,g.left+layer.dx+x*g.stepX,g.top+layer.dy+row(y)*g.stepY,g.width,g.height);if(!empty.isConnected)wrapper.append(empty);
    }
    placeholders.forEach(element=>element.remove());
    const bounds=layers.map(layer=>{const shape={...g,left:g.left+layer.dx,top:g.top+layer.dy};return renderXYAxes(wrapper,xy,shape,gridW,shape.top+(rows-1)*g.stepY+g.height,parameters,layer.z);});
    const overlay=bounds[0].overlay,z=renderZAxis(overlay,xy,bounds[0].axisX,bounds[0].axisY,parameters);
    bounds.forEach((axes,index)=>{
        const layer=layers[index],titleY=xy.origin==='bottom'?axes.yBindingY:axes.axisY-z.extent;
        let title=axes.group.querySelector('.clab-xy-layer-title');
        if(xy.z.enabled&&xy.z.values.length){if(!title){title=document.createElement('button');title.className='clab-xy-layer-title';axes.group.append(title);}title.dataset.xyZLayer=layer.z;title.setAttribute('aria-pressed',String(layer.z===currentZLayer(xy)));title.textContent=zLayerTitle(xy,layer.z);title.title=String(xy.z.values[layer.z]);xyPosition(title,g.left+layer.dx,titleY-15,gridW,30);axes.top=Math.min(axes.top,titleY-15);}
        else title?.remove();
    });
    bounds.push(z);
    overlay.querySelectorAll('.clab-xy-layer-axes').forEach(group=>{if(!layerByZ.has(Number(group.dataset.xyLayer)))group.remove();});
    wrapper.dataset.xyMinX=Math.min(0,...bounds.map(b=>b.left));wrapper.dataset.xyMinY=Math.min(0,...bounds.map(b=>b.top));
    wrapper.style.width=`${Math.max(...bounds.map(b=>b.right))}px`;wrapper.style.height=`${Math.max(...bounds.map(b=>b.bottom))}px`;projectXYCanvas(wrapper.parentElement,xy);
    return items.map(item=>item.card.id);
}
