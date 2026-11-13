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
export function showXYMode(wrapper,cards,xy,parameters,{preview=false,layerViews} = {}) {
    const all=matrixCells(cards,xy),items=visibleMatrixCells(cards,xy);
    const elements=new Map([...wrapper.querySelectorAll(':scope > .clab-card')].map(element=>[element.dataset.cardId,element])),byId=new Map(items.map(item=>[item.card.id,item]));
    for(const [id,element]of elements){
        element.hidden=!byId.has(id);
        const output=byId.has(id)?matrixOutput(byId.get(id).card,xy):null;
        element.querySelectorAll('.clab-area').forEach(area=>{area.hidden=area.dataset.areaId!==output?.id;});
    }
    if (!preview) {
        const outputs=new Set(items.map(item=>matrixOutput(item.card,xy)?.id));
        hydrateWorkspaceAreas(wrapper,(card,area)=>outputs.has(area.id));
    }
    const ratio=xyMediaRatio(wrapper,all,xy),g=geometry(xy,ratio),columns=Math.max(1,xy.x.values.length),rows=Math.max(1,xy.y.values.length),layers=matrixLayers(xy,g);
    for(const layer of layers){layer.view=layerViews?.(layer.z)||xy;layer.geometry=geometry(layer.view,ratio);layer.gridWidth=(columns-1)*layer.geometry.stepX+g.width;}
    if(layerViews&&layers.length>1){
        const count=Math.max(1,Math.min(layers.length,xy.tiling?.columns||Math.ceil(Math.sqrt(layers.length))));
        const width=Math.max(...layers.map(layer=>layer.gridWidth)),height=Math.max(...layers.map(layer=>(rows-1)*layer.geometry.stepY+g.height));
        layers.forEach((layer,index)=>{layer.dx=index%count*(width+(xy.tiling?.columnGap??360));layer.dy=Math.floor(index/count)*(height+(xy.tiling?.rowGap??240));});
    }
    const layerByZ=new Map(layers.map(layer=>[layer.z,layer]));
    const position=(layer,x,y)=>{const shape=layer.geometry;return [shape.left+layer.dx+x*shape.stepX,shape.top+layer.dy+(layer.view.origin==='bottom'?rows-1-y:y)*shape.stepY];};
    wrapper.style.setProperty('--xy-media-height',`${g.height}px`);
    wrapper.style.setProperty('--xy-cell-width',`${g.width}px`);
    const occupied=new Set();
    for(const [id,element]of elements){
        const item=byId.get(id);element.hidden=!item;element.draggable=false;if(!item)continue;
        const layer=layerByZ.get(item.z??layers[0].z);occupied.add(`${item.x},${item.y},${layer.z}`);element.dataset.xyLayer=layer.z;
        at(element,...position(layer,item.x,item.y),g.width);
        const output=matrixOutput(item.card,xy);
        updateXYHistoryLabel(element,output);
        element.querySelectorAll('.clab-area').forEach(area=>{area.hidden=area.dataset.areaId!==output?.id;area.draggable=false;if(!preview&&!area.hidden)refreshModuleBindingSummary(area,output);});
    }
    const placeholders=new Map([...wrapper.querySelectorAll('.clab-xy-empty')].map(element=>[element.dataset.xyPlaceholder,element]));
    for(const layer of layers)for(let y=0;y<rows;y++)for(let x=0;x<columns;x++)if(!occupied.has(`${x},${y},${layer.z}`)){
        const key=`${x},${y}${xy.z.enabled?`,${layer.z}`:''}`,empty=placeholders.get(key)||document.createElement('button');placeholders.delete(key);
        empty.classList.add('clab-xy-empty');empty.dataset.xyPlaceholder=key;empty.setAttribute('aria-label','图像占位');empty.title=preview?'当前组合没有生成记录':'设置轴参数和取值后，自动建立对应任务';
        at(empty,...position(layer,x,y),g.width,g.height);if(!empty.isConnected)wrapper.append(empty);
    }
    placeholders.forEach(element=>element.remove());
    const bounds=layers.map(layer=>{const own=layer.geometry,shape={...own,left:own.left+layer.dx,top:own.top+layer.dy};return renderXYAxes(wrapper,layer.view,shape,layer.gridWidth,shape.top+(rows-1)*own.stepY+own.height,parameters,layer.z);});
    const overlay=bounds[0].overlay,z=renderZAxis(overlay,xy,bounds[0].axisX,bounds[0].axisY,parameters);
    bounds.forEach((axes,index)=>{
        const layer=layers[index],binding=axes.group.querySelector('[data-xy-part=y-binding]');
        let title=axes.group.querySelector('.clab-xy-layer-title');
        if(xy.z.enabled&&xy.z.values.length){
            if(!title){title=document.createElement('button');title.className='clab-xy-layer-title';axes.group.append(title);}
            title.dataset.xyZLayer=layer.z;title.setAttribute('aria-pressed',String(layer.z===currentZLayer(xy)));
            title.textContent=zLayerTitle(xy,layer.z);title.title=String(xy.z.values[layer.z]);
            title.style.width=`${layer.gridWidth*xy.zoom}px`;title.style.height='auto';
            const yTop=binding.xyPosition.y-(layer.view.origin==='bottom'?binding.offsetHeight/xy.zoom:0);
            const ceiling=layer.view.origin==='bottom'?yTop:Math.min(yTop,axes.axisY-z.extent-overlay.querySelector('.clab-xy-z-binding').offsetHeight/xy.zoom/2);
            const bottom=ceiling-12;
            xyPosition(title,layer.geometry.left+layer.dx,bottom,layer.gridWidth);axes.top=Math.min(axes.top,bottom-title.getBoundingClientRect().height/xy.zoom);
        } else title?.remove();
    });
    if(xy.z.enabled&&xy.z.display==='all'){
        const binding=overlay.querySelector('.clab-xy-z-binding'),height=binding.offsetHeight/xy.zoom;
        const top=Math.min(...bounds.map(axes=>axes.top))-16-height;
        xyPosition(binding,g.left,top);binding.style.transform='none';
        Object.assign(z,{left:g.left,top,right:g.left+binding.offsetWidth/xy.zoom,bottom:top+height});
    }
    bounds.push(z);
    overlay.querySelectorAll('.clab-xy-layer-axes').forEach(group=>{if(!layerByZ.has(Number(group.dataset.xyLayer)))group.remove();});
    wrapper.dataset.xyMinX=Math.min(0,...bounds.map(b=>b.left));wrapper.dataset.xyMinY=Math.min(0,...bounds.map(b=>b.top));
    wrapper.style.width=`${Math.max(...bounds.map(b=>b.right))}px`;wrapper.style.height=`${Math.max(...bounds.map(b=>b.bottom))}px`;projectXYCanvas(wrapper.parentElement,xy);
    return items.map(item=>item.card.id);
}
