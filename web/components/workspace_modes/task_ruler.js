import { cardWindow } from './card_window.js';
import { state,getActiveWorkspace } from '../ui_state.js';
import { rulerHoverScale } from '../ruler_wave.js';
import { workspacePreferences } from '../workspace_preferences.js';
import { getAreaResultType } from '../modules/media_types/media_utils.js';

export function attachTaskRuler(container){
    const panel=container.closest('#clab-panel'),ruler=document.createElement('nav'),tooltip=document.createElement('div');
    ruler.className='clab-task-ruler';ruler.setAttribute('aria-label','任务定位');ruler.hidden=true;panel.append(ruler);
    tooltip.className='clab-task-ruler-tooltip';tooltip.hidden=true;tooltip.setAttribute('role','tooltip');document.body.append(tooltip);
    const style=document.createElement('style');style.textContent=`
    #clab-panel[data-workspace-mode=cards] #clab-cards-container{padding-bottom:40px}
    .clab-task-ruler{position:absolute;transform:translateX(-50%);display:flex;align-items:flex-end;max-width:66.666%;width:max-content;height:28px;overflow-x:auto;overflow-y:hidden;scrollbar-width:none;z-index:40;overscroll-behavior:contain}
    .clab-task-ruler[hidden],.clab-task-ruler-tooltip[hidden]{display:none}.clab-task-ruler::-webkit-scrollbar{display:none}
    #clab-panel .clab-task-ruler button{display:flex;align-items:flex-end;justify-content:center;flex:0 0 11px;box-sizing:border-box;width:11px;height:27px;padding:0 0 4px;border:0;background:transparent;cursor:pointer;outline:0}
    .clab-task-ruler button::before{content:'';display:block;width:2px;height:6px;background:#888;transform:scaleY(var(--clab-ruler-scale,1));transform-origin:center bottom;transition:background .12s,transform .16s ease-out}
    .clab-task-ruler button:is(:hover,:focus-visible,.active)::before{background:#eee;width:3px}
    .clab-task-ruler-tooltip{position:fixed;z-index:100001;pointer-events:none;width:180px;box-sizing:border-box;padding:8px;background:#242424;border:1px solid #555;border-radius:3px;color:#ddd;font:11px/1.5 sans-serif;overflow-wrap:anywhere}
    .clab-task-ruler-tooltip>div{display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
    .clab-task-ruler-tooltip img{display:block;width:100%;height:100px;object-fit:contain;margin-top:6px;background:#191919}
    `;document.head.append(style);
    let buttons=[],key='',owner,frame=0,hoverTimer,wave=[];
    const hide=()=>{clearTimeout(hoverTimer);tooltip.hidden=true;};
    const paintWave=(index=-10)=>{for(const button of wave)button.style.removeProperty('--clab-ruler-scale');wave=[];for(let offset=-2;offset<=2;offset++){const button=buttons[index+offset];if(button){button.style.setProperty('--clab-ruler-scale',rulerHoverScale(offset));wave.push(button);}}};
    const paint=()=>{
        frame=0;if(ruler.hidden||!panel.classList.contains('visible')){hide();return;}
        const width=parseFloat(getComputedStyle(panel).getPropertyValue('--clab-card-width'))||workspacePreferences.cardWidth;
        const index=Math.min(state.cards.length-1,Math.max(0,Math.floor((container.scrollLeft+1)/(width+workspacePreferences.cardGap))));
        for(const button of ruler.querySelectorAll('.active')){button.classList.remove('active');button.removeAttribute('aria-current');}
        const active=buttons[index];if(active){active.classList.add('active');active.setAttribute('aria-current','location');if(active.offsetLeft<ruler.scrollLeft)ruler.scrollLeft=active.offsetLeft;else if(active.offsetLeft+active.offsetWidth>ruler.scrollLeft+ruler.clientWidth)ruler.scrollLeft=active.offsetLeft+active.offsetWidth-ruler.clientWidth;}
        ruler.style.left=`${container.offsetLeft+container.clientWidth/2}px`;ruler.style.top=`${container.offsetTop+container.clientHeight-31}px`;ruler.style.maxWidth=`${container.clientWidth*2/3}px`;
    };
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(paint);};
    const refresh=()=>{
        const workspace=getActiveWorkspace();ruler.hidden=workspace.view.mode!=='cards'||!state.cards.length;if(ruler.hidden){hide();return;}
        const signature=state.cards.map(card=>card.id+'|'+(card.title||'')).join('\n');
        if(owner!==workspace||key!==signature){owner=workspace;key=signature;hide();paintWave();buttons=state.cards.map((card,index)=>{
            const button=document.createElement('button');button.type='button';button.dataset.taskRuler=card.id;const title=card.title||`#${index+1}`;button.setAttribute('aria-label',`定位任务：${title}`);
            button.onpointerenter=button.onfocus=()=>{paintWave(index);hide();hoverTimer=setTimeout(()=>{
                const label=document.createElement('div');label.textContent=title;tooltip.replaceChildren(label);const area=card.areas.find(area=>area.type==='preview'&&area.resultUrl&&getAreaResultType(area)==='image');if(area){const image=new Image();image.alt='任务预览';image.src=area.resultUrl;tooltip.append(image);}tooltip.hidden=false;const rect=button.getBoundingClientRect();tooltip.style.left=`${Math.max(8,Math.min(innerWidth-188,rect.left-tooltip.offsetWidth/2))}px`;tooltip.style.top=`${Math.max(8,rect.top-tooltip.offsetHeight-8)}px`;
            },180);};
            button.onpointerleave=button.onblur=()=>{paintWave();hide();};
            button.onclick=()=>{hide();cardWindow(container).jump(card.id);};return button;
        });ruler.replaceChildren(...buttons);}
        paint();
    };
    ruler.addEventListener('wheel',event=>{event.preventDefault();event.stopPropagation();ruler.scrollLeft+=event.deltaY||event.deltaX;},{passive:false});
    ruler.addEventListener('scroll',()=>{paintWave();hide();},{passive:true});container.addEventListener('scroll',schedule,{passive:true});new ResizeObserver(schedule).observe(container);
    const dock=panel.querySelector('.clab-tool-dock');if(dock)new MutationObserver(schedule).observe(dock,{attributes:true,attributeFilter:['data-dock']});
    new MutationObserver(schedule).observe(document.documentElement,{attributes:true,attributeFilter:['data-clab-workspace-tabs']});
    new MutationObserver(schedule).observe(panel,{attributes:true,attributeFilter:['class']});
    return {refresh};
}
