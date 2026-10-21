import { bindingButton } from './xy_settings.js';
import { axisValueLabel, axisValueDescription } from './axis_labels.js';

export function xyPosition(element,x,y,width,height) {
    element.dataset.xyPosition='';element.xyPosition={x,y,width,height};
    const overlay=element.closest('.clab-xy-overlay');if(overlay)overlay._clabPositions=null;
}
function part(overlay,key,html) {
    let element=overlay.querySelector(`[data-xy-part="${key}"]`);
    if(!element){element=document.createElement('div');element.dataset.xyPart=key;overlay.append(element);}
    if(html!==undefined&&element.innerHTML!==html)element.innerHTML=html;return element;
}

// Keep text and borders out of the transformed media layer so zoom repaints them at their display size.
export function projectXYCanvas(container,xy) {
    container.querySelector('.clab-cards-wrapper').style.transform=`translate(${xy.panX}px,${xy.panY}px) scale(${xy.zoom})`;
    const overlay=container.querySelector('.clab-xy-overlay');if(!overlay)return;
    overlay.style.transform=`translate(${xy.panX}px,${xy.panY}px)`;
    if(overlay._clabZoom===xy.zoom&&overlay._clabPositions)return;
    overlay.style.setProperty('--xy-ui-scale',xy.zoom);
    overlay._clabZoom=xy.zoom;
    overlay._clabPositions||=[...overlay.querySelectorAll('[data-xy-position]')];
    for(const element of overlay._clabPositions){
        const {x,y,width,height}=element.xyPosition;
        Object.assign(element.style,{left:`${x*xy.zoom}px`,top:`${y*xy.zoom}px`,...(width===undefined?{}:{width:`${width*xy.zoom}px`}),...(height===undefined?{}:{height:`${height*xy.zoom}px`})});
    }
}

export function renderXYAxes(wrapper,xy,g,gridW,bottom,parameters,layer=0) {
    const container=wrapper.parentElement;let overlay=container.querySelector('.clab-xy-overlay');
    if(!overlay){overlay=document.createElement('div');overlay.className='clab-xy-overlay';container.append(overlay);}
    overlay.style.setProperty('--xy-ui-scale',xy.zoom);
    let group=overlay.querySelector(`.clab-xy-layer-axes[data-xy-layer="${layer}"]`);if(!group){group=document.createElement('div');group.className='clab-xy-layer-axes';group.dataset.xyLayer=layer;overlay.append(group);}
    const up=xy.origin==='bottom',axisX=g.left-(xy.x.margin??10),axisY=up?bottom+(xy.y.margin??10):g.top-(xy.y.margin??10),xEnd=g.left+gridW+42,yEnd=up?Math.min(g.top-38,axisY-38):Math.max(bottom+38,axisY+38);
    const frame=part(group,'axes','<button class="clab-xy-axis axis-x" data-xy-edit-values="x" title="X轴设置"><i></i><b>X</b></button><button class="clab-xy-axis axis-y" data-xy-edit-values="y" title="Y轴设置"><i></i><b>Y</b></button>');
    const xLine=frame.querySelector('.axis-x'),yLine=frame.querySelector('.axis-y');
    xyPosition(xLine,axisX,axisY-10,xEnd-axisX,20);xyPosition(yLine,axisX-10,up?yEnd:axisY,20,Math.abs(axisY-yEnd));yLine.classList.toggle('points-up',up);
    const xb=part(group,'x-binding',bindingButton('x',xy.x.bindings,parameters));xb.className='clab-xy-axis-binding';xyPosition(xb,xEnd+10,axisY);xb.style.transform='translateY(-50%)';
    const yb=part(group,'y-binding',bindingButton('y',xy.y.bindings,parameters));yb.className='clab-xy-axis-binding';xyPosition(yb,axisX,yEnd+(up?-10:10));yb.style.transform=up?'translate(-50%,-100%)':'translateX(-50%)';
    const output=part(group,'output-binding',bindingButton('output',[xy.outputNodeId],parameters,'输出'));output.className='clab-xy-output-binding';xyPosition(output,g.left+gridW+12,up?g.top:bottom);output.style.transform='translateY(-50%)';
    const ticks=part(group,'ticks');ticks.className='clab-xy-ticks';
    const previous=new Map([...ticks.children].map(tick=>[`${tick.dataset.xyEditValues}:${tick.dataset.xyTick}`,tick]));let position=0;
    for(const name of ['x','y'])xy[name].values.forEach((value,index)=>{
        const key=`${name}:${index}`,tick=previous.get(key)||document.createElement('button');previous.delete(key);tick.className='clab-axis-label';tick.dataset.xyEditValues=name;tick.dataset.xyTick=index;
        let text=tick.querySelector('span');if(!text){text=document.createElement('span');tick.append(text);}text.textContent=axisValueLabel(xy[name],index);tick.title=axisValueDescription(value,xy[name].bindings.map(key=>parameters.find(parameter=>parameter.key===key)));
        if(name==='x'){xyPosition(tick,g.left+index*g.stepX+g.width/2,up?axisY+6:axisY-24,undefined,18);tick.style.transform='translateX(-50%)';tick.style.maxWidth=`calc(${g.width-12}px * var(--xy-ui-scale))`;}
        else{xyPosition(tick,axisX-6,g.top+(up?Math.max(1,xy.y.values.length)-1-index:index)*g.stepY+g.height/2,undefined,18);tick.style.transform='translate(-100%,-50%)';}
        if(ticks.children[position]!==tick)ticks.insertBefore(tick,ticks.children[position]||null);position++;
    });
    previous.forEach(tick=>tick.remove());
    const bindingRight=Math.max(xEnd+10+xb.offsetWidth/xy.zoom,g.left+gridW+12+output.offsetWidth/xy.zoom);
    return {overlay,group,axisX,axisY,yBindingY:yEnd-10-yb.offsetHeight/xy.zoom/2,left:Math.min(0,axisX-yb.offsetWidth/xy.zoom/2),top:Math.min(0,yEnd-(up?yb.offsetHeight/xy.zoom+10:0)),right:Math.max(g.left+gridW+260,bindingRight+20),bottom:Math.max(bottom,axisY)+114};
}
