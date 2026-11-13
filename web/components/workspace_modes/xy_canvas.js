import { attachXYGestures } from './xy_gestures.js';
import { projectXYCanvas } from './xy_axes.js';

export function fitXYCanvas(container,xy) {
    const world=container.querySelector('.clab-cards-wrapper'),left=24;
    const floating=container.closest('#clab-panel')?.querySelector('.clab-tool-dock[data-dock=float]');
    let bottom=40;
    if(floating){
        const canvas=container.getBoundingClientRect(),dock=floating.getBoundingClientRect();
        if(dock.top>=canvas.top+canvas.height*2/3&&dock.top<canvas.bottom)bottom=Math.max(bottom,canvas.bottom-dock.top+12);
    }
    const minX=Number(world.dataset.xyMinX)||0,minY=Number(world.dataset.xyMinY)||0,width=world.offsetWidth-minX,height=world.offsetHeight-minY;
    xy.zoom=Math.max(.025,Math.min(1,(container.clientWidth-left-24)/width,(container.clientHeight-bottom-40)/height));
    xy.panX=left-minX*xy.zoom+Math.max(0,container.clientWidth-left-24-width*xy.zoom)*.55;
    xy.panY=(xy.origin==='bottom'?Math.max(40,container.clientHeight-height*xy.zoom-bottom):40)-minY*xy.zoom;
    projectXYCanvas(container,xy);
}
export function attachXYCanvas(container,getView,save,run,scheduleSave) {
    let menu,point,spaceHeld=false,frame=0;
    const world=()=>container.querySelector('.clab-cards-wrapper');
    const panel=container.closest('#clab-panel'),toolbar=panel.querySelector('.clab-tool-dock');
    const active=()=>panel.dataset.workspaceMode==='xy'&&panel.classList.contains('visible');
    const background=target=>target===container||target===world()||target.matches('[data-xy-part="axes"]');
    const canvasTarget=target=>container.contains(target)&&!target.closest('.clab-xy-context');
    const workspaceTarget=target=>canvasTarget(target)||toolbar.contains(target);
    const overWorkspace=p=>p&&workspaceTarget(document.elementFromPoint(p.x,p.y));
    const transform=()=>{frame=0;if(active())projectXYCanvas(container,getView().xy);};
    const scheduleTransform=()=>{if(!frame)frame=requestAnimationFrame(transform);};
    const pan=(x,y)=>{const xy=getView().xy;xy.panX+=x;xy.panY+=y;scheduleTransform();};
    const cursor=()=>container.classList.toggle('clab-xy-grabbing',spaceHeld);
    const stop=()=>{
        const changed=spaceHeld;spaceHeld=false;gestures.stop();cursor();
        if(frame){cancelAnimationFrame(frame);transform();}
        if(changed)save();
    };
    window.addEventListener('pointerdown',event=>{
        if(!active())return;
        if(menu&&!menu.contains(event.target)){menu.remove();menu=null;}
        if(spaceHeld&&workspaceTarget(event.target)){event.preventDefault();event.stopImmediatePropagation();return;}
        if(!canvasTarget(event.target))return;
        point={x:event.clientX,y:event.clientY};
    },true);
    window.addEventListener('pointermove',event=>{
        const previous=point;point={x:event.clientX,y:event.clientY};
        if(!active()){stop();return;}
        if(spaceHeld){if(previous&&canvasTarget(event.target)){pan(point.x-previous.x,point.y-previous.y);event.preventDefault();event.stopImmediatePropagation();}return;}
    },true);
    const gestures=attachXYGestures(container,()=>getView().xy,scheduleTransform,save,scheduleSave,active);
    for(const type of ['mousedown','mouseup','click','auxclick'])window.addEventListener(type,event=>{
        if(active()&&spaceHeld&&workspaceTarget(event.target)){event.preventDefault();event.stopImmediatePropagation();}
    },true);
    window.addEventListener('keydown',event=>{
        if(event.code!=='Space'||!active()||event.ctrlKey||event.metaKey||event.altKey||event.isComposing||event.target.closest?.('input,textarea,select,[contenteditable=true],[role=dialog],[role=menu]')||(!spaceHeld&&!overWorkspace(point)))return;
        event.preventDefault();event.stopImmediatePropagation();event.target.closest?.('button')?.blur();if(!spaceHeld){stop();spaceHeld=true;cursor();}
    },true);
    window.addEventListener('keyup',event=>{if(event.code==='Space'&&spaceHeld){event.preventDefault();event.stopImmediatePropagation();stop();}},true);
    window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
    container.addEventListener('contextmenu',event=>{
        if(!active()||!background(event.target))return;event.preventDefault();event.stopImmediatePropagation();menu?.remove();
        menu=document.createElement('div');menu.className='clab-xy-context';menu.innerHTML='<button data-canvas-run="selected">运行选中任务</button><button data-canvas-run="all">运行矩阵任务</button><button data-canvas-reset>恢复视角</button>';
        const rect=container.getBoundingClientRect();menu.style.left=`${Math.min(event.clientX-rect.left,rect.width-165)}px`;menu.style.top=`${Math.min(event.clientY-rect.top,rect.height-120)}px`;container.append(menu);
        menu.onclick=event=>{const button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-canvas-reset')){fitXYCanvas(container,getView().xy);save();}else run(button.dataset.canvasRun);menu.remove();menu=null;};
    },true);
    document.addEventListener('keydown',event=>{if(event.key==='Escape'){menu?.remove();menu=null;stop();}});
    return {stop};
}
