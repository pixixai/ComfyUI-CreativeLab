import { reorderAxisValues } from './value_parser.js';

export const axisOrderHandleHTML=()=>'<button type="button" data-xy-order-handle aria-label="拖动调整顺序" title="拖动调整顺序"><svg viewBox="0 0 12 16" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="1.2"/><circle cx="9" cy="3" r="1.2"/><circle cx="3" cy="8" r="1.2"/><circle cx="9" cy="8" r="1.2"/><circle cx="3" cy="13" r="1.2"/><circle cx="9" cy="13" r="1.2"/></svg></button>';

const rowSelector='[data-xy-order-index]';
const duration=()=>matchMedia('(prefers-reduced-motion: reduce)').matches?0:160;

export function attachAxisValueSort(list,getValues,reorder,swap=false) {
    let drag,frame;
    const ghostAt=()=>{
        const ghost=drag.ghost;if(!ghost)return;
        ghost.style.transform=`translate3d(${drag.x-drag.offsetX}px,${drag.y-drag.offsetY}px,0)`;
    };
    const lift=()=>{
        const ghost=drag.rows[drag.from].cloneNode(true);
        ghost.removeAttribute('data-xy-order-index');ghost.removeAttribute('data-xy-axis-source');ghost.removeAttribute('title');ghost.setAttribute('aria-hidden','true');ghost.setAttribute('popover','manual');
        ghost.classList.remove('is-drag-source');ghost.classList.add('clab-axis-drag-ghost');ghost.style.width=`${drag.positions[drag.from].width}px`;
        ghost.querySelectorAll('button').forEach(button=>{button.disabled=true;button.tabIndex=-1;});
        document.body.append(ghost);ghost.showPopover();drag.ghost=ghost;ghostAt();
    };
    const clear=previous=>{
        cancelAnimationFrame(frame);list.classList.remove('is-dragging');
        previous.rows.forEach(row=>{row.style.transform='';row.classList.remove('is-drag-source','is-swap-target');});
        if(list.hasPointerCapture(previous.id))list.releasePointerCapture(previous.id);
    };
    const stop=(apply=false)=>{
        if(!drag)return;const previous=drag;drag=null;clear(previous);
        const valid=apply&&previous.moved&&previous.before>=0&&previous.before!==previous.from&&(swap||previous.before!==previous.from+1);
        let nextList=list,index=previous.from;
        if(valid){
            const next=[...getValues()];
            if(swap)[next[previous.from],next[previous.before]]=[next[previous.before],next[previous.from]];
            nextList=reorder(swap?next:reorderAxisValues(next,previous.from,previous.before))||list;
            index=swap?previous.before:previous.before-(previous.before>previous.from?1:0);
            const rows=[...nextList.querySelectorAll(rowSelector)],low=Math.min(previous.from,index),high=Math.max(previous.from,index);
            rows.forEach((row,i)=>{if((swap?i===previous.from||i===index:i>=low&&i<=high)&&duration())row.animate([{opacity:.5},{opacity:1}],{duration:duration(),easing:'ease-out'});});
            rows[index]?.querySelector('button')?.focus({preventScroll:true});
        }
        if(!previous.ghost)return;
        const target=nextList.querySelector(`[data-xy-order-index="${index}"]`);
        if(!apply||!target||!duration()){previous.ghost.remove();return;}
        const r=target.getBoundingClientRect(),animation=previous.ghost.animate([{transform:previous.ghost.style.transform,opacity:.78},{transform:`translate3d(${r.left}px,${r.top}px,0)`,opacity:0}],{duration:duration(),easing:'ease-out',fill:'forwards'});
        animation.finished.then(()=>previous.ghost.remove(),()=>previous.ghost.remove());
    };
    const place=()=>{
        cancelAnimationFrame(frame);if(!drag?.moved)return;if(!list.isConnected){stop();return;}
        ghostAt();
        const bounds=list.getBoundingClientRect(),old=list.scrollTop,step=drag.y<bounds.top+24?-10:drag.y>bounds.bottom-24?10:0;list.scrollTop+=step;
        const index=drag.positions.findIndex(r=>{const top=bounds.top+r.top-list.scrollTop;return swap?drag.x>=bounds.left+r.left&&drag.x<=bounds.left+r.left+r.width&&drag.y>=top&&drag.y<=top+r.height:drag.y<top+r.height/2;});
        drag.before=index<0&&!swap?drag.rows.length:index;
        const next=[...drag.rows];
        if(swap&&index>=0)[next[drag.from],next[index]]=[next[index],next[drag.from]];
        const order=swap?next:reorderAxisValues(next,drag.from,drag.before);
        drag.rows.forEach((row,i)=>{
            const destination=order.indexOf(row);row.style.transform=`translateY(${drag.positions[destination].top-drag.positions[i].top}px)`;
            row.classList.toggle('is-swap-target',swap&&index>=0&&index!==drag.from&&i===drag.from);
        });
        if(list.scrollTop!==old)frame=requestAnimationFrame(place);
    };
    list.addEventListener('pointerdown',event=>{
        const handle=event.target.closest('[data-xy-order-handle]');if(event.button!==0||!handle||getValues().length<2)return;
        event.preventDefault();handle.focus({preventScroll:true});const row=handle.closest(rowSelector),r=row.getBoundingClientRect(),bounds=list.getBoundingClientRect(),rows=[...list.querySelectorAll(rowSelector)];
        drag={id:event.pointerId,from:Number(row.dataset.xyOrderIndex),before:Number(row.dataset.xyOrderIndex),start:event.clientY,x:event.clientX,y:event.clientY,offsetX:event.clientX-r.left,offsetY:event.clientY-r.top,moved:false,rows,
            positions:rows.map(row=>{const r=row.getBoundingClientRect();return{left:r.left-bounds.left,top:r.top-bounds.top+list.scrollTop,width:r.width,height:r.height};})};
        list.setPointerCapture(event.pointerId);row.classList.add('is-drag-source');list.classList.add('is-dragging');
    });
    list.addEventListener('pointermove',event=>{
        if(!drag||event.pointerId!==drag.id)return;if(!event.buttons){stop();return;}event.preventDefault();drag.x=event.clientX;drag.y=event.clientY;
        if(!drag.moved&&Math.abs(drag.y-drag.start)>4){drag.moved=true;lift();}place();
    });
    list.addEventListener('pointerup',event=>{if(drag&&event.pointerId===drag.id){event.preventDefault();stop(true);}});
    for(const type of ['pointercancel','lostpointercapture'])list.addEventListener(type,()=>stop());
    list.addEventListener('keydown',event=>{if(event.key==='Escape')stop();});
}
