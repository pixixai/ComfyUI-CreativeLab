import { handleDeselectAll } from '../ui_selection.js';
import { projectXYCanvas } from './xy_axes.js';

export function fitXYCanvas(container,xy) {
    const world=container.querySelector('.clab-cards-wrapper'),left=24,bottom=(container.querySelector('.clab-xy-toolbar')?.offsetHeight||46)+40;
    const minX=Number(world.dataset.xyMinX)||0,minY=Number(world.dataset.xyMinY)||0,width=world.offsetWidth-minX,height=world.offsetHeight-minY;
    xy.zoom=Math.max(.025,Math.min(1,(container.clientWidth-left-24)/width,(container.clientHeight-bottom-40)/height));
    xy.panX=left-minX*xy.zoom+Math.max(0,container.clientWidth-left-24-width*xy.zoom)*.55;
    xy.panY=(xy.origin==='bottom'?Math.max(40,container.clientHeight-height*xy.zoom-bottom):40)-minY*xy.zoom;
    projectXYCanvas(container,xy);
}
export function attachXYCanvas(container,getView,save,run) {
    let drag,menu,point,spaceHeld=false,clickGuard=false;
    const world=()=>container.querySelector('.clab-cards-wrapper');
    const active=()=>{const panel=container.closest('#clab-panel');return panel.dataset.workspaceMode==='xy'&&panel.classList.contains('visible');};
    const background=target=>target===container||target===world()||target.matches('[data-xy-part="axes"]');
    const canvasTarget=target=>container.contains(target)&&!target.closest('.clab-xy-toolbar,.clab-xy-context');
    const overCanvas=p=>p&&canvasTarget(document.elementFromPoint(p.x,p.y));
    const transform=()=>projectXYCanvas(container,getView().xy);
    const pan=(x,y)=>{const xy=getView().xy;xy.panX+=x;xy.panY+=y;transform();};
    const cursor=()=>container.classList.toggle('clab-xy-grabbing',spaceHeld||!!drag);
    const stop=()=>{
        const previous=drag,changed=!!drag||spaceHeld;drag=null;spaceHeld=false;cursor();
        if(previous&&container.hasPointerCapture(previous.id))container.releasePointerCapture(previous.id);
        if(changed)save();
    };
    window.addEventListener('pointerdown',event=>{
        if(!active())return;
        if(menu&&!menu.contains(event.target)){menu.remove();menu=null;}
        if(!canvasTarget(event.target))return;
        point={x:event.clientX,y:event.clientY};
        if(spaceHeld){event.preventDefault();event.stopImmediatePropagation();return;}
        if(event.button!==1&&!(event.button===0&&background(event.target)))return;
        event.preventDefault();event.stopImmediatePropagation();drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,button:event.button,moved:false};container.setPointerCapture(event.pointerId);cursor();
    },true);
    window.addEventListener('pointermove',event=>{
        const previous=point;point={x:event.clientX,y:event.clientY};
        if(!active()){stop();return;}
        if(spaceHeld){if(previous&&overCanvas(point)){pan(point.x-previous.x,point.y-previous.y);event.preventDefault();event.stopImmediatePropagation();}return;}
        if(!drag)return;pan(event.clientX-drag.x,event.clientY-drag.y);drag.moved||=Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)>3;drag.x=event.clientX;drag.y=event.clientY;event.preventDefault();event.stopImmediatePropagation();
    },true);
    window.addEventListener('pointerup',event=>{
        if(!drag)return;const previous=drag;event.preventDefault();event.stopImmediatePropagation();
        if(!previous.moved&&previous.button===0){handleDeselectAll();container.querySelectorAll('.clab-xy-empty.is-selected').forEach(element=>element.classList.remove('is-selected'));}
        if(previous.moved&&previous.button===0){clickGuard=true;setTimeout(()=>{clickGuard=false;},0);}stop();
    },true);
    window.addEventListener('pointercancel',stop,true);container.addEventListener('lostpointercapture',()=>{if(drag)stop();});
    for(const type of ['mousedown','mouseup','click','auxclick'])window.addEventListener(type,event=>{
        if(active()&&canvasTarget(event.target)&&(spaceHeld||(type==='click'&&clickGuard)||(type==='auxclick'&&event.button===1))){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    window.addEventListener('keydown',event=>{
        if(event.code!=='Space'||!active()||event.ctrlKey||event.metaKey||event.altKey||event.isComposing||event.target.closest?.('input,textarea,select,[contenteditable=true],[role=dialog],[role=menu],[data-xy-toggle-layers],.clab-xy-toolbar')||(!spaceHeld&&!overCanvas(point)))return;
        event.preventDefault();event.stopImmediatePropagation();if(!spaceHeld){stop();spaceHeld=true;cursor();}
    },true);
    window.addEventListener('keyup',event=>{if(event.code==='Space'&&spaceHeld){event.preventDefault();event.stopImmediatePropagation();stop();}},true);
    window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    window.addEventListener('wheel',event=>{
        if(!active()||!canvasTarget(event.target))return;
        if(event.target.closest('.clab-video-player,.clab-audio-player,.clab-glb-viewer,.clab-text-body-scroll')&&!event.ctrlKey)return;
        event.preventDefault();event.stopImmediatePropagation();
        const xy=getView().xy,rect=container.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top,old=xy.zoom;
        xy.zoom=Math.max(.025,Math.min(4,old*Math.exp(-event.deltaY*.0015)));const ratio=xy.zoom/old;
        xy.panX=x-(x-xy.panX)*ratio;xy.panY=y-(y-xy.panY)*ratio;transform();save();
    },{passive:false,capture:true});
    container.addEventListener('contextmenu',event=>{
        if(!active()||!background(event.target))return;event.preventDefault();event.stopImmediatePropagation();menu?.remove();
        menu=document.createElement('div');menu.className='clab-xy-context';menu.innerHTML='<button data-canvas-run="selected">运行选中任务</button><button data-canvas-run="all">运行矩阵任务</button><button data-canvas-reset>恢复视角</button>';
        const rect=container.getBoundingClientRect();menu.style.left=`${Math.min(event.clientX-rect.left,rect.width-165)}px`;menu.style.top=`${Math.min(event.clientY-rect.top,rect.height-120)}px`;container.append(menu);
        menu.onclick=event=>{const button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-canvas-reset')){fitXYCanvas(container,getView().xy);save();}else run(button.dataset.canvasRun);menu.remove();menu=null;};
    },true);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){menu?.remove();menu=null;stop();}});
    return {stop};
}
