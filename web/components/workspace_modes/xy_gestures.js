export function attachXYGestures(container,getCamera,paint,save,scheduleSave,active) {
    const controller=new AbortController(),signal=controller.signal;
    const bindingTarget=target=>container.closest('#clab-panel')&&target.closest('[data-xy-bind]');
    let drag,suppressClick=false;
    const stop=()=>{
        const previous=drag;drag=null;
        container.classList.remove('clab-xy-grabbing');
        if(previous&&container.hasPointerCapture(previous.id))container.releasePointerCapture(previous.id);
        if(previous?.moved)save();
    };
    window.addEventListener('pointerdown',event=>{
        if(!active()||!container.contains(event.target)||![0,1].includes(event.button))return;
        if(event.button===1&&bindingTarget(event.target))return;
        if(event.button===0&&(event.target.closest('input,textarea,select,a,[contenteditable=true],.clab-glb-viewer,.clab-video-controls-interactive')||
            event.target.closest('button')&&!event.target.closest('.clab-xy-overlay,.clab-xy-empty')))return;
        event.preventDefault();event.stopImmediatePropagation();
        drag={id:event.pointerId,x:event.clientX,y:event.clientY,startX:event.clientX,startY:event.clientY,button:event.button,moved:false};
        if(event.button===1){container.setPointerCapture(event.pointerId);container.classList.add('clab-xy-grabbing');}
    },{capture:true,signal});
    window.addEventListener('pointermove',event=>{
        if(!drag||drag.id!==event.pointerId)return;
        if(!active()||!event.buttons){stop();return;}
        if(!drag.moved&&Math.hypot(event.clientX-drag.startX,event.clientY-drag.startY)<4)return;
        event.preventDefault();event.stopImmediatePropagation();
        if(!container.hasPointerCapture(event.pointerId))container.setPointerCapture(event.pointerId);
        const camera=getCamera();camera.panX+=event.clientX-drag.x;camera.panY+=event.clientY-drag.y;
        drag.x=event.clientX;drag.y=event.clientY;drag.moved=true;
        container.classList.add('clab-xy-grabbing');paint();
    },{capture:true,signal});
    window.addEventListener('pointerup',event=>{
        if(!drag||drag.id!==event.pointerId)return;
        event.preventDefault();event.stopImmediatePropagation();
        if(drag.moved||drag.button===1){suppressClick=true;setTimeout(()=>{suppressClick=false;},0);}
        stop();
    },{capture:true,signal});
    window.addEventListener('pointercancel',stop,{capture:true,signal});
    container.addEventListener('lostpointercapture',()=>{if(drag)stop();},{signal});
    window.addEventListener('blur',stop,{signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();},{signal});
    for(const type of ['click','auxclick','dragstart'])window.addEventListener(type,event=>{
        if(active()&&container.contains(event.target)&&(suppressClick||type==='dragstart'||type==='auxclick'&&event.button===1&&!bindingTarget(event.target))){
            event.preventDefault();event.stopImmediatePropagation();
        }
    },{capture:true,signal});
    window.addEventListener('wheel',event=>{
        if(!active()||!container.contains(event.target)||event.target.closest('.clab-xy-context'))return;
        if(event.target.closest('.clab-video-player,.clab-audio-player,.clab-glb-viewer,.clab-text-body-scroll')&&!event.ctrlKey)return;
        event.preventDefault();event.stopImmediatePropagation();
        const camera=getCamera(),rect=container.getBoundingClientRect(),x=event.clientX-rect.left,y=event.clientY-rect.top,old=camera.zoom;
        camera.zoom=Math.max(.025,Math.min(4,old*Math.exp(-event.deltaY*.0015)));
        camera.panX=x-(x-camera.panX)*camera.zoom/old;camera.panY=y-(y-camera.panY)*camera.zoom/old;
        paint();scheduleSave();
    },{capture:true,passive:false,signal});
    return {stop,release(){stop();controller.abort();}};
}
