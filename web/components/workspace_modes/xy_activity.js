let sequence=0;
function progressRing(card) {
    let ring=card.querySelector(':scope > .clab-xy-progress-ring');if(ring)return ring;
    const ns='http://www.w3.org/2000/svg',gradient=`clab-xy-rainbow-${++sequence}`;
    ring=document.createElementNS(ns,'svg');ring.classList.add('clab-xy-progress-ring');ring.setAttribute('aria-hidden','true');
    ring.innerHTML=`<defs><linearGradient id="${gradient}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff5370"/><stop offset=".16" stop-color="#ff9f43"/><stop offset=".33" stop-color="#ffe66d"/><stop offset=".5" stop-color="#6be585"/><stop offset=".66" stop-color="#48dbfb"/><stop offset=".83" stop-color="#668cff"/><stop offset="1" stop-color="#c678dd"/></linearGradient></defs><rect class="clab-xy-progress-path" x="1" y="1" fill="none" stroke="url(#${gradient})" stroke-width="2" pathLength="100"/>`;
    card.append(ring);return ring;
}
export function refreshXYActivity(container,workspaceId) {
    const running=new Map((window.CLab?.getRunningCardProgress?.(workspaceId)||[]).map(task=>[task.cardId,task.progress]));
    container.querySelectorAll('.clab-card').forEach(card=>{
        const progress=running.get(card.dataset.cardId);card.classList.toggle('clab-xy-running',progress!==undefined);
        if(progress===undefined){card.querySelector(':scope > .clab-xy-progress-ring')?.remove();return;}
        const width=card.offsetWidth,height=card.offsetHeight;
        if(!width||!height){card.querySelector(':scope > .clab-xy-progress-ring')?.remove();return;}
        const ring=progressRing(card),path=ring.querySelector('rect');
        ring.setAttribute('viewBox',`0 0 ${width} ${height}`);path.setAttribute('width',Math.max(0,width-2));path.setAttribute('height',Math.max(0,height-2));path.setAttribute('stroke-dasharray',`${progress} 100`);
        ring.dataset.progress=progress;
    });
}
