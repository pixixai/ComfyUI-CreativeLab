export function attachCardWheel(panel,container){
    let owner=null,last=0,direction=0,target=container.scrollLeft,frame=0,time=0;
    const forwarded=new WeakSet();
    const active=()=>!panel.dataset.workspaceMode||panel.dataset.workspaceMode==='cards';
    const stop=()=>{owner=null;direction=0;last=0;cancelAnimationFrame(frame);frame=0;target=container.scrollLeft;};
    const animate=now=>{
        frame=0;if(!active())return;
        const elapsed=time?Math.max(1,Math.min(32,now-time)):16;
        const factor=1-Math.exp(-elapsed/65);time=now;
        const before=container.scrollLeft,remaining=target-before;
        container.scrollLeft=Math.abs(remaining)<.6?target:container.scrollLeft+remaining*factor;
        if(container.scrollLeft===before&&Math.abs(remaining)>0)container.scrollLeft=before+Math.sign(remaining)*Math.min(1,Math.abs(remaining));
        if(Math.abs(target-container.scrollLeft)>.6)frame=requestAnimationFrame(animate);
    };
    const choose=event=>{
        const media=event.target.closest('.clab-video-player,.clab-audio-player,.clab-glb-viewer');
        if(media)return {kind:'media',element:media,target:event.target};
        for(let node=event.target;node&&node!==container;node=node.parentElement){
            if(node.scrollHeight<=node.clientHeight+1)continue;
            if(['auto','scroll','overlay'].includes(getComputedStyle(node).overflowY)){
                const can=event.deltaY<0?node.scrollTop>0:node.scrollTop+node.clientHeight<node.scrollHeight-1;
                if(can)return {kind:'vertical',element:node};
            }
        }
        return {kind:'outer'};
    };
    container.addEventListener('wheel',event=>{
        if(!active()||event.ctrlKey||event.metaKey||event.altKey||forwarded.has(event))return;
        if(container.hasAttribute('data-clab-card-jump'))container.dispatchEvent(new Event('clab_scroll_jump'));
        const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;if(!delta)return;
        const now=performance.now(),interval=now-last,nextDirection=Math.sign(delta);
        if(!owner||interval>300)owner=choose(event);
        if(owner.kind==='media'){
            last=now;
            if(owner.element.contains(event.target))return;
            event.preventDefault();event.stopImmediatePropagation();
            if(owner.target.isConnected){const copy=new WheelEvent('wheel',{bubbles:true,cancelable:true,deltaX:event.deltaX,deltaY:event.deltaY,deltaMode:event.deltaMode,shiftKey:event.shiftKey});forwarded.add(copy);owner.target.dispatchEvent(copy);}
            return;
        }
        event.preventDefault();event.stopImmediatePropagation();
        if(owner.kind==='vertical'){if(owner.element.isConnected)owner.element.scrollTop+=event.deltaY*(event.deltaMode===1?18:event.deltaMode===2?owner.element.clientHeight:1);last=now;return;}
        if(direction!==nextDirection)target=container.scrollLeft;
        direction=nextDirection;last=now;
        // Keep pixel/trackpad input continuous; line and page wheels use their own units.
        const distance=delta*(event.deltaMode===1?18:event.deltaMode===2?container.clientWidth:1);
        if(!frame)target=container.scrollLeft;
        target=Math.max(0,Math.min(container.scrollWidth-container.clientWidth,target+distance));
        if(!frame){time=0;frame=requestAnimationFrame(animate);}
    },{capture:true,passive:false});
    container.addEventListener('clab_scroll_jump',stop);container.addEventListener('pointerdown',stop,{capture:true});window.addEventListener('blur',stop);
    return {stop};
}
