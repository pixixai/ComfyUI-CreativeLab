import { detailOutputRecords } from './preview_detail_model.js';
import { escapeHtml as esc } from './shared.js';

const icon=content=>`<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${content}</svg>`;
export const detailCoverIcon=icon('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8" cy="9" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/>');
export const detailOutputIcon=icon('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 8 6 4-6 4z"/>');
export const detailApplyIcon=icon('<path d="M7 3H3v14h4M10 6H6v14h9v-4M15 3h6v8M11 13 21 3"/>');

export function createDetailRecordPool(root,{onSelect,onApply,coverApplied}) {
    let popover,card,role,area,selectedKey,observer,trigger,records=[];
    function close(restoreFocus=true){
        observer?.disconnect();observer=null;
        popover?.querySelectorAll('video').forEach(video=>{video.pause();video.removeAttribute('src');video.load();});
        popover?.remove();popover=null;
        trigger?.setAttribute('aria-expanded','false');
        if(restoreFocus&&trigger?.isConnected)trigger.focus({preventScroll:true});trigger=null;
    }
    function position(){
        if(!popover||!trigger?.isConnected)return;
        const anchor=trigger.getBoundingClientRect(),bounds=(root.querySelector('.clab-preview-modal-panel')||root).getBoundingClientRect();
        const viewport=trigger.closest('.clab-preview-modal-center')?.getBoundingClientRect();
        if(viewport&&(anchor.bottom<=viewport.top||anchor.top>=viewport.bottom||anchor.right<=viewport.left||anchor.left>=viewport.right)){close(false);return;}
        const left=Math.max(8,bounds.left+8),right=Math.min(window.innerWidth-8,bounds.right-8),top=Math.max(8,bounds.top+8),bottom=Math.min(window.innerHeight-8,bounds.bottom-8);
        const spaceBelow=Math.max(80,bottom-anchor.bottom-6),spaceAbove=Math.max(80,anchor.top-top-6);
        popover.style.width=`${Math.min(340,right-left)}px`;
        popover.style.setProperty('--detail-pool-height',`${Math.min(300,bottom-top)}px`);
        const below=popover.offsetHeight<=spaceBelow||spaceBelow>=spaceAbove;
        popover.style.setProperty('--detail-pool-height',`${Math.min(300,below?spaceBelow:spaceAbove)}px`);
        popover.style.left=`${Math.max(left,Math.min(right-popover.offsetWidth,anchor.right-popover.offsetWidth))}px`;
        popover.style.top=`${Math.max(top,Math.min(bottom-popover.offsetHeight,below?anchor.bottom+6:anchor.top-popover.offsetHeight-6))}px`;
        popover.style.setProperty('--detail-pool-list-height',`${Math.max(60,Math.min(220,bottom-popover.querySelector('header').getBoundingClientRect().bottom-12))}px`);
    }
    function render(){
        observer?.disconnect();
        popover.querySelectorAll('video').forEach(video=>{video.removeAttribute('src');video.load();});
        const outputs=card.areas.filter(area=>area.type==='preview'),index=outputs.indexOf(area),label=area?area.title||`##${index+1}`:'未设置封面';records=detailOutputRecords(card,area);
        const sources=outputs.map((output,i)=>{
            const title=output.title||`##${i+1}`,clear=role==='cover'&&coverApplied(title,{cardId:card.id,areaId:output.id}),action=role==='cover'?(clear?'取消所有任务封面':'应用到所有任务封面'):'应用到所有任务';
            return `<div class="clab-detail-pool-source"><button data-detail-pool-source="${esc(output.id)}" aria-pressed="${output===area}">${esc(title)}</button><button data-detail-pool-apply="${esc(title)}" data-area-id="${esc(output.id)}" data-detail-pool-apply-role="${clear?'clear-cover':role}" title="${action}" aria-label="${action}">${detailApplyIcon}</button></div>`;
        }).join('');
        popover.innerHTML=`<section class="clab-detail-pool" role="dialog" aria-label="${role==='cover'?'封面记录':'生成记录'}"><header><strong>${role==='cover'?'封面记录':'生成记录'}</strong><details class="clab-detail-pool-sources"><summary>${esc(label)} ▾</summary><div>${sources}</div></details><button data-detail-pool-close aria-label="关闭记录池">×</button></header><div class="clab-detail-pool-grid">${records.map((record,index)=>`<button data-detail-pool-record="${index}" class="${record.key===selectedKey?'selected':''}" title="${esc(record.name)} · ${index+1}/${records.length}" aria-label="选择记录 ${index+1}" aria-pressed="${record.key===selectedKey}">${record.type==='image'?`<img loading="lazy" draggable="false" src="${esc(record.url)}" alt="">`:record.type==='video'?`<video data-pool-src="${esc(record.url.split('#')[0])}#t=0.01" muted playsinline preload="metadata"></video>`:`<span>${record.type==='text'?esc(record.text?.slice(0,160)||'文本'):({audio:'音频',model:'3D',file:'文件'})[record.type]||'文件'}</span>`}<small>${index+1}</small></button>`).join('')||`<p>${area?'该模块尚无生成记录':'尚未设置封面，可在上方选择输出模块'}</p>`}</div></section>`;
        const grid=popover.querySelector('.clab-detail-pool-grid');
        observer=new IntersectionObserver(entries=>{for(const {target,isIntersecting}of entries)if(isIntersecting&&target.dataset.poolSrc){target.src=target.dataset.poolSrc;delete target.dataset.poolSrc;observer.unobserve(target);}},{root:grid});
        grid.querySelectorAll('video').forEach(video=>observer.observe(video));
        position();
        const selected=grid.querySelector('.selected');if(selected)grid.scrollTop=selected.offsetTop-(grid.clientHeight-selected.offsetHeight)/2;
    }
    document.addEventListener('pointerdown',event=>{if(popover&&!popover.contains(event.target)&&!trigger?.contains(event.target))close(false);},true);
    document.addEventListener('focusin',event=>{if(popover&&!popover.contains(event.target)&&!trigger?.contains(event.target))close(false);});
    root.addEventListener('scroll',event=>{if(popover&&!popover.contains(event.target))position();},true);
    window.addEventListener('resize',position);
    root.addEventListener('click',event=>{
        if(!popover||!popover.contains(event.target))return;
        event.stopPropagation();
        const button=event.target.closest('button');
        if(event.target===popover||button?.hasAttribute('data-detail-pool-close')){close();return;}
        if(button?.hasAttribute('data-detail-pool-source')){area=card.areas.find(area=>area.id===button.dataset.detailPoolSource);render();popover?.querySelector('summary').focus({preventScroll:true});return;}
        if(button?.hasAttribute('data-detail-pool-apply')){onApply(button.dataset.detailPoolApply,button.dataset.detailPoolApplyRole,{cardId:card.id,areaId:button.dataset.areaId});close();return;}
        if(button?.hasAttribute('data-detail-pool-record')){
            const key=records[Number(button.dataset.detailPoolRecord)]?.key,record=detailOutputRecords(card,area).find(record=>record.key===key);if(!record){render();return;}
            selectedKey=key;onSelect(card,area,record,role);
            popover.querySelectorAll('[data-detail-pool-record]').forEach(button=>{const selected=records[Number(button.dataset.detailPoolRecord)].key===selectedKey;button.classList.toggle('selected',selected);button.setAttribute('aria-pressed',String(selected));});
            if(role==='cover')popover.querySelectorAll('[data-detail-pool-apply]').forEach(button=>{
                const clear=coverApplied(button.dataset.detailPoolApply,{cardId:card.id,areaId:button.dataset.areaId}),action=clear?'取消所有任务封面':'应用到所有任务封面';
                button.dataset.detailPoolApplyRole=clear?'clear-cover':'cover';button.title=action;button.setAttribute('aria-label',action);
            });
            position();
        }
    });
    document.addEventListener('keydown',event=>{
        if(!popover)return;
        if(event.key==='Escape'){event.preventDefault();event.stopImmediatePropagation();close();}
        else if(['ArrowLeft','ArrowRight',' '].includes(event.key)){event.stopImmediatePropagation();}
    },true);
    return {
        open(item,nextRole,button){
            if(popover&&trigger===button){close();return;}
            close(false);card=item.card;role=nextRole;area=role==='cover'?(item.customCover?item.coverArea:null):item.area;selectedKey=(role==='cover'?(item.customCover?item.coverRecord:null):item.record)?.key;
            if(!area&&role!=='cover')return;
            trigger=button;trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-expanded','true');popover=document.createElement('div');popover.className='clab-detail-pool-popover';root.append(popover);render();
            (popover.querySelector('.selected')||popover.querySelector('[data-detail-pool-close]')).focus({preventScroll:true});
        },
        close,isOpen:()=>!!popover,
    };
}

export const DETAIL_POOL_CSS=`
.clab-detail-pool-popover{position:fixed;z-index:50;width:340px;max-width:calc(100vw - 16px);box-sizing:border-box}
.clab-detail-pool{width:100%;max-height:var(--detail-pool-height,300px);box-sizing:border-box;display:flex;flex-direction:column;background:#242424;border:1px solid #444;border-radius:6px;color:#bbb;font:11px/1.5 sans-serif}
.clab-detail-pool>header{display:flex;align-items:center;gap:8px;padding:8px;border-bottom:1px solid #151515}.clab-detail-pool>header strong{font-size:11px;font-weight:600;flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.clab-detail-pool button{border:0;background:transparent;color:#aaa;font:inherit;cursor:pointer}.clab-detail-pool button:hover{color:#fff}.clab-detail-pool button:focus-visible{outline:1px solid #999;outline-offset:-2px}
.clab-detail-pool [data-detail-pool-close]{font-size:20px;padding:0 4px}
.clab-detail-pool-sources{position:relative;min-width:90px;max-width:55%}.clab-detail-pool-sources summary{cursor:pointer;list-style:none;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.clab-detail-pool-sources>div{position:absolute;right:0;top:calc(100% + 8px);z-index:2;min-width:200px;max-height:var(--detail-pool-list-height,220px);overflow:auto;padding:5px;background:#242424;border:1px solid #444;border-radius:5px}
.clab-detail-pool-source{display:flex;align-items:center;gap:6px}.clab-detail-pool-source [data-detail-pool-source]{flex:1;text-align:left;min-width:0;padding:6px 8px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.clab-detail-pool-source button[aria-pressed=true]{color:#fff;background:#151515;border-radius:3px}
.clab-detail-pool-source [data-detail-pool-apply]{padding:4px;display:flex;align-items:center;opacity:0;pointer-events:none}.clab-detail-pool-source:hover [data-detail-pool-apply],.clab-detail-pool-source:focus-within [data-detail-pool-apply]{opacity:1;pointer-events:auto}
.clab-detail-pool-grid{position:relative;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:8px;overflow:auto;min-height:60px;scrollbar-width:thin;scrollbar-color:#444 transparent}.clab-detail-pool-grid>p{grid-column:1/-1;margin:8px 0;color:#888}
.clab-detail-pool-grid>button{position:relative;aspect-ratio:1.25;border:1px solid #444;border-radius:4px;overflow:hidden;padding:0;background:#171717}.clab-detail-pool-grid>button.selected{border:2px solid #aaa}.clab-detail-pool-grid img,.clab-detail-pool-grid video{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none}.clab-detail-pool-grid>button>span{display:block;padding:10px;font-size:11px;white-space:pre-wrap;overflow-wrap:anywhere;max-height:100%;box-sizing:border-box}.clab-detail-pool-grid small{position:absolute;bottom:3px;right:5px;color:#ddd;background:#111b;padding:0 3px;border-radius:2px;font-size:10px}
.clab-detail-apply-menu{position:fixed;z-index:60;min-width:170px;max-width:calc(100vw - 16px);padding:5px;background:#242424;border:1px solid #444;border-radius:5px;display:flex;flex-direction:column;gap:2px}.clab-detail-apply-menu button{padding:7px 10px;text-align:left;border:0;border-radius:3px;background:transparent;color:#bbb;font:12px/1.5 sans-serif;cursor:pointer}.clab-detail-apply-menu button:hover,.clab-detail-apply-menu button:focus-visible{background:#151515;color:#fff}
@media(hover:none){.clab-detail-pool-source [data-detail-pool-apply]{opacity:1;pointer-events:auto}}
`;
