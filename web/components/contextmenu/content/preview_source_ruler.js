import { rulerHoverScale } from '../../ruler_wave.js';
export { rulerHoverScale } from '../../ruler_wave.js';
export function attachPreviewSourceRuler(root) {
    const left=root.querySelector('.clab-preview-modal-left'),body=left.parentElement;
    const ruler=document.createElement('nav');ruler.className='clab-source-ruler';ruler.setAttribute('aria-label','来源定位');ruler.hidden=true;body.append(ruler);
    const tooltip=document.createElement('div');tooltip.className='clab-source-ruler-tooltip';tooltip.setAttribute('role','tooltip');tooltip.hidden=true;root.append(tooltip);
    let entries=[],frame=0,scrollFrame=0,hoverTimer,current;
    let wave=[];
    const paintWave=(index=-10)=>{
        for(const button of wave)button.style.removeProperty('--clab-ruler-scale');wave=[];
        for(let offset=-2;offset<=2;offset++){const button=entries[index+offset]?.button;if(button){button.style.setProperty('--clab-ruler-scale',rulerHoverScale(offset));wave.push(button);}}
    };
    const hideTooltip=()=>{clearTimeout(hoverTimer);tooltip.hidden=true;};
    const showTooltip=(entry)=>{
        hideTooltip();hoverTimer=setTimeout(()=>{
            const groupId=entry.element.dataset.previewGridWorkspace;
            const region=groupId?root.querySelector(`.clab-preview-modal-center [data-preview-grid-workspace="${CSS.escape(groupId)}"]`):entry.element.matches('input')?root.querySelector(`[data-review-row="${CSS.escape(entry.element.value)}"]`):entry.element;
            const image=region?.querySelector('img[src]:not([src=""])'),poster=image?.currentSrc||image?.src||region?.querySelector('video[poster]')?.poster;
            const title=document.createElement('div');title.textContent=entry.title;tooltip.replaceChildren(title);
            if(poster){const preview=new Image();preview.src=poster;preview.alt='来源预览';tooltip.append(preview);}
            tooltip.hidden=false;const box=entry.button.getBoundingClientRect();
            tooltip.style.left=`${Math.min(innerWidth-tooltip.offsetWidth-8,box.right+8)}px`;tooltip.style.top=`${Math.max(8,Math.min(innerHeight-tooltip.offsetHeight-8,box.top-tooltip.offsetHeight/2))}px`;
        },180);
    };
    const topInset=()=>12+(left.querySelector('.clab-source-controls')?.offsetHeight||0);
    const paint=()=>{
        scrollFrame=0;const top=left.getBoundingClientRect().top+topInset();let next;
        for(const entry of entries){const rect=entry.target.getBoundingClientRect();if(rect.height&&rect.top<=top+8)next=entry;}
        for(const entry of entries){entry.button.classList.toggle('active',entry===next);if(entry===next)entry.button.setAttribute('aria-current','location');else entry.button.removeAttribute('aria-current');}
        if(next&&next!==current){const button=next.button;if(button.offsetTop<ruler.scrollTop)ruler.scrollTop=button.offsetTop;else if(button.offsetTop+button.offsetHeight>ruler.scrollTop+ruler.clientHeight)ruler.scrollTop=button.offsetTop+button.offsetHeight-ruler.clientHeight;}
        current=next;
    };
    const refresh=()=>{
        frame=0;hideTooltip();paintWave();entries=[];
        for(const element of left.querySelectorAll('.clab-preview-source-workspace,[data-browse-card],[data-detail-source],[data-grid-filter=row]')){
            const workspace=element.classList.contains('clab-preview-source-workspace');
            const target=element.matches('input')?element.closest('label'):element.querySelector(':scope>summary');
            if(!target)continue;
            const title=(target.querySelector('[data-browse-card-name],[data-detail-task-name]')?.textContent||target.textContent).trim();
            const button=document.createElement('button');button.type='button';button.dataset.sourceTitle=title;button.setAttribute('aria-label',`定位${workspace?'工作区':'任务'}：${title}`);button.classList.toggle('is-workspace',workspace);
            const entry={element,target,button,title},index=entries.length;
            button.onpointerenter=button.onfocus=()=>{paintWave(index);showTooltip(entry);};button.onpointerleave=button.onblur=()=>{paintWave();hideTooltip();};
            button.onclick=()=>{
                hideTooltip();
                for(let parent=target.parentElement;parent&&parent!==left;parent=parent.parentElement)if(parent.matches('details'))parent.open=true;
                requestAnimationFrame(()=>{left.scrollTo({top:Math.max(0,left.scrollTop+target.getBoundingClientRect().top-left.getBoundingClientRect().top-topInset()),behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});});
            };
            entries.push(entry);
        }
        ruler.replaceChildren(...entries.map(entry=>entry.button));ruler.hidden=!entries.length||left.clientWidth<32;paint();
    };
    const schedule=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(refresh);};
    new MutationObserver(schedule).observe(left,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['open']});
    new ResizeObserver(schedule).observe(left);
    ruler.addEventListener('wheel',event=>{event.preventDefault();event.stopPropagation();ruler.scrollTop+=event.deltaY;},{passive:false});
    ruler.addEventListener('scroll',()=>{paintWave();hideTooltip();},{passive:true});
    left.addEventListener('scroll',()=>{if(!scrollFrame)scrollFrame=requestAnimationFrame(paint);},{passive:true});
    schedule();
}
