let active;
export function closeXYPopover(){active?.close();}
export function openXYPopover(getAnchor,title,body,className='',side='',boundary) {
    active?.close();
    const popup=document.createElement('div');popup.className=`clab-module-binding-popover ${className}`;popup.setAttribute('popover','auto');popup.setAttribute('role','dialog');popup.setAttribute('aria-label',title);
    popup.innerHTML=`<div class="clab-binding-panel-head"><span></span><button class="clab-xy-popup-close" title="关闭">×</button></div>${body}`;popup.querySelector('.clab-binding-panel-head>span').textContent=title;document.body.append(popup);
    const controller=new AbortController();let frame;
    const close=()=>{controller.abort();cancelAnimationFrame(frame);getAnchor()?.setAttribute('aria-expanded','false');popup.remove();if(active?.popup===popup)active=null;};
    const position=()=>{
        const anchor=getAnchor();if(!anchor?.isConnected){close();return;}
        anchor.setAttribute('aria-expanded','true');const r=anchor.getBoundingClientRect(),w=document.documentElement.clientWidth,h=document.documentElement.clientHeight,b=boundary?.getBoundingClientRect();
        const bounds={left:Math.max(0,b?.left??0)+8,top:Math.max(0,b?.top??0)+8,right:Math.min(w,b?.right??w)-8,bottom:Math.min(h,b?.bottom??h)-8};
        if(b){popup.style.maxWidth=`${Math.max(0,bounds.right-bounds.left)}px`;popup.style.maxHeight=`${Math.max(0,Math.min(440,bounds.bottom-bounds.top))}px`;}
        else{
            if(side==='left')popup.style.maxWidth=`${Math.max(180,Math.min(400,r.left-16))}px`;
            const available=side==='top'?r.top-16:side==='bottom'?h-r.bottom-16:0;
            if(side==='top'||side==='bottom')popup.style.maxHeight=`${available>=110?Math.min(440,available):440}px`;
        }
        const p=popup.getBoundingClientRect();let left=r.left,top=r.bottom+p.height+4<bounds.bottom?r.bottom+4:r.top-p.height-4;
        if(side==='left'){left=r.left-p.width-8;top=(r.top+r.bottom-p.height)/2;}
        if(side==='end')left=r.right-p.width;
        if(side==='top'||side==='bottom'){left=(r.left+r.right-p.width)/2;top=side==='top'?r.top-p.height-8:r.bottom+8;}
        popup.style.left=`${Math.max(bounds.left,Math.min(left,bounds.right-p.width))}px`;popup.style.top=`${Math.max(bounds.top,Math.min(top,bounds.bottom-p.height))}px`;
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(position);};
    popup.querySelector('.clab-xy-popup-close').onclick=close;
    popup.addEventListener('toggle',event=>{if(event.newState==='closed')close();});
    popup.addEventListener('keydown',event=>{event.stopPropagation();if(event.key==='Escape'){event.preventDefault();const anchor=getAnchor();close();anchor?.focus({preventScroll:true});}});
    for(const type of ['pointerdown','mousedown','mouseup','click','contextmenu','wheel'])popup.addEventListener(type,event=>event.stopPropagation());
    window.addEventListener('resize',schedule,{signal:controller.signal});document.addEventListener('scroll',schedule,{capture:true,signal:controller.signal});
    const observer=new ResizeObserver(schedule);observer.observe(popup);if(boundary)observer.observe(boundary);controller.signal.addEventListener('abort',()=>observer.disconnect(),{once:true});
    popup.showPopover();position();active={popup,close,position};return active;
}
