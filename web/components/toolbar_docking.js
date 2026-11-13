const sides = ['top', 'bottom', 'float'];
const layoutKey = 'clab-toolbar-dock-v1';
const clampValue = (value, max) => Math.min(Math.max(0, max), Math.max(0, value));

export function attachToolbarDocking(dock, panel, contextual, { fit, closeMenus }) {
    const layout = {side:'top', x:.5, y:.8};
    let legacy;
    try {
        const {side, x, y, relative} = JSON.parse(localStorage.getItem(layoutKey)) || {};
        if (sides.includes(side)) layout.side = side;
        if (Number.isFinite(x) && Number.isFinite(y)) {
            if (relative) { layout.x=x;layout.y=y; }
            else if (side === 'float') legacy={x,y};
        }
    } catch {}
    let gesture, suppressClick = false;

    const clamp = () => {
        if (layout.side !== 'float' || !panel.clientWidth || !dock.offsetWidth) return;
        if (legacy) {
            layout.x=(legacy.x+dock.offsetWidth/2)/panel.clientWidth;
            layout.y=(legacy.y+dock.offsetHeight/2)/panel.clientHeight;
            legacy=null;
        }
        const x=clampValue(layout.x*panel.clientWidth-dock.offsetWidth/2,panel.clientWidth-dock.offsetWidth);
        const y=clampValue(layout.y*panel.clientHeight-dock.offsetHeight/2,panel.clientHeight-dock.offsetHeight);
        dock.style.left=x+'px';
        dock.style.top=y+'px';
        if (!contextual.getClientRects().length) return;

        const gap=8;
        contextual.style.maxWidth=Math.max(0,panel.clientWidth-gap*2)+'px';
        contextual.style.maxHeight=Math.max(0,panel.clientHeight-gap*2)+'px';
        const {offsetWidth:w,offsetHeight:h}=contextual;
        const above=y-h-gap;
        const contextX=x+(dock.offsetWidth-w)/2;
        const contextY=above>=0||y>panel.clientHeight-y-dock.offsetHeight?above:y+dock.offsetHeight+gap;
        contextual.style.left=clampValue(contextX,panel.clientWidth-w)-x-dock.clientLeft+'px';
        contextual.style.top=clampValue(contextY,panel.clientHeight-h)-y-dock.clientTop+'px';
    };
    const setSide = side => {
        layout.side=side;
        dock.dataset.dock=side;
        if (side!=='float') {
            dock.style.removeProperty('top');
            dock.style.removeProperty('left');
            for (const property of ['top','left','max-width','max-height']) contextual.style.removeProperty(property);
        }
        clamp();
        fit();
    };
    const save=()=>localStorage.setItem(layoutKey,JSON.stringify({...layout,relative:true}));
    const snap=(x,y)=>{
        const rect=panel.getBoundingClientRect();
        if(x<rect.left-20||x>rect.right+20)return;
        if(Math.abs(y-rect.top)<=23)return 'top';
        if(Math.abs(y-rect.bottom)<=23)return 'bottom';
    };
    dock.setAttribute('aria-orientation','horizontal');
    dock.addEventListener('pointerdown',event=>{
        if(event.button!==0||gesture)return;
        const target=event.target;
        const floatingContext=layout.side==='float'&&target===contextual;
        if(target!==dock&&!floatingContext&&!target.matches('.clab-toolbar-left,.clab-toolbar-right,.clab-xy-toolbar,.clab-xy-toolbar-start,.clab-xy-toolbar-center'))return;
        const captureTarget=floatingContext?target:dock,rect=dock.getBoundingClientRect();
        event.preventDefault();
        captureTarget.setPointerCapture(event.pointerId);
        gesture={
            id:event.pointerId,x:event.clientX,y:event.clientY,captureTarget,started:false,previous:{...layout},
            offsetX:event.clientX-(rect.left+rect.right)/2,offsetY:event.clientY-(rect.top+rect.bottom)/2,
        };
    });
    window.addEventListener('pointermove',event=>{
        if(gesture?.id!==event.pointerId)return;
        if(!gesture.started){
            if(Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<5)return;
            gesture.started=true;
            closeMenus();
        }
        event.preventDefault();
        if(layout.side!=='float'){
            setSide('float');
            gesture.offsetX=gesture.offsetY=0;
        }
        const bounds=panel.getBoundingClientRect();
        layout.x=clampValue((event.clientX-bounds.left-gesture.offsetX)/bounds.width,1);
        layout.y=clampValue((event.clientY-bounds.top-gesture.offsetY)/bounds.height,1);
        clamp();
        gesture.snap=snap(event.clientX,event.clientY);
        if(gesture.snap)panel.dataset.toolbarSnap=gesture.snap;
        else delete panel.dataset.toolbarSnap;
    });
    const finish=event=>{
        if(gesture?.id!==event.pointerId)return;
        const ended=gesture;
        gesture=null;
        if(!ended.started)return;
        delete panel.dataset.toolbarSnap;
        if(event.type==='pointerup'){
            suppressClick=true;
            setTimeout(()=>{suppressClick=false;},0);
            if(ended.snap)setSide(ended.snap);
            save();
        }else{
            Object.assign(layout,ended.previous);
            setSide(layout.side);
        }
        if(ended.captureTarget.hasPointerCapture(event.pointerId))ended.captureTarget.releasePointerCapture(event.pointerId);
    };
    window.addEventListener('pointerup',finish);
    window.addEventListener('pointercancel',finish);
    dock.addEventListener('lostpointercapture',finish);
    window.addEventListener('click',event=>{
        if(!suppressClick||event.detail===0)return;
        event.preventDefault();
        event.stopImmediatePropagation();
    },true);
    dock.addEventListener('dragstart',event=>event.preventDefault());
    dock.addEventListener('dblclick',event=>{
        if(layout.side!=='float'||event.target!==dock)return;
        closeMenus();
        setSide('top');
        save();
    });
    setSide(layout.side);
    return {clamp};
}
