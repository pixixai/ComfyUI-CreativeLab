import { xyPosition } from './xy_axes.js';
import { bindingButton } from './xy_settings.js';
import { axisValueLabel, axisValueDescription } from './axis_labels.js';
import { currentZLayer } from './xy_model.js';

export function renderZAxis(overlay,xy,x,y,parameters) {
    let group=overlay.querySelector('[data-xy-part=z-axis]');if(!group){group=document.createElement('div');group.dataset.xyPart='z-axis';group.className='clab-xy-z-axis';overlay.append(group);}
    const count=xy.z.enabled?xy.z.values.length:0,current=currentZLayer(xy),indices=count<=5?Array.from({length:count},(_,i)=>i):[...new Set([0,current-1,current,current+1,count-1].filter(i=>i>=0&&i<count))].sort((a,b)=>a-b),marks=[];
    indices.forEach((index,i)=>{if(i&&index-indices[i-1]>1)marks.push(null);marks.push(index);});
    const extent=count>5?168:Math.max(80,(marks.length+1)*24),html=`<button class="clab-xy-axis axis-z" data-xy-edit-values="z" title="Z轴设置"><i></i></button><button class="clab-axis-label clab-z-letter" data-xy-edit-values="z" title="Z轴设置">Z</button><div class="clab-xy-z-binding"><button data-xy-toggle-layers aria-label="平铺全部层" aria-pressed="false"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="2" y="2" width="6" height="6" rx="1"/><rect x="12" y="2" width="6" height="6" rx="1"/><rect x="2" y="12" width="6" height="6" rx="1"/><rect x="12" y="12" width="6" height="6" rx="1"/></svg></button>${bindingButton('z',xy.z.bindings,parameters)}</div>`;
    if(group.dataset.content!==html){group.innerHTML=html;group.dataset.content=html;}group.classList.toggle('is-disabled',!xy.z.enabled);
    const line=group.querySelector('.axis-z'),letter=group.querySelector('.clab-z-letter'),binding=group.querySelector('.clab-xy-z-binding');
    const summary=binding.querySelector('.clab-xy-binding'),bindingY=y-extent;
    const toggle=binding.querySelector('[data-xy-toggle-layers]');toggle.setAttribute('aria-pressed',String(xy.z.display==='all'));toggle.title=xy.z.display==='all'?'切回单层显示':'平铺全部层';
    xyPosition(line,x,y-10,extent*Math.SQRT2,20);xyPosition(letter,x-extent-4,y-extent-20,18,18);xyPosition(binding,x-extent-12,bindingY-summary.offsetHeight/xy.zoom/2);binding.style.transform='translateX(-100%)';
    const previous=new Map([...group.querySelectorAll('[data-xy-z-layer],.clab-z-more')].map(tick=>[tick.dataset.zMark,tick]));
    marks.forEach((index,position)=>{
        const key=index===null?`more:${position}`:String(index),tick=previous.get(key)||document.createElement('button'),distance=extent*(position+1)/(marks.length+1);previous.delete(key);tick.dataset.zMark=key;tick.className='clab-axis-label clab-z-tick';
        if(index===null){tick.classList.add('clab-z-more');tick.dataset.xyZMore='';tick.setAttribute('aria-haspopup','menu');tick.setAttribute('aria-expanded','false');tick.textContent='…';tick.title='查看全部 Z 取值';}
        else{let text=tick.querySelector('span');if(!text){text=document.createElement('span');tick.append(text);}text.textContent=axisValueLabel(xy.z,index);tick.dataset.xyZLayer=index;tick.setAttribute('aria-pressed',String(index===current));tick.title=axisValueDescription(xy.z.values[index],xy.z.bindings.map(key=>parameters.find(parameter=>parameter.key===key)));}
        if(!tick.isConnected)group.append(tick);
        xyPosition(tick,x-distance-9,y-distance,undefined,18);tick.style.transform='translate(-100%,-50%)';
    });
    previous.forEach(tick=>tick.remove());
    return {left:x-extent-12-binding.offsetWidth/xy.zoom,top:y-extent-30,right:x+18,bottom:y+18,extent};
}
