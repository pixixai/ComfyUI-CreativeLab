import { createProgressOutline, sizeProgressOutline, updateProgressOutline } from './progress_outline.js';

function progressRing(card) {
    let ring=card.querySelector(':scope > .clab-xy-progress-ring');if(ring)return ring;
    ring=createProgressOutline('clab-xy-progress-ring','clab-xy-progress-path');
    card.append(ring);return ring;
}
export function refreshXYActivity(container,workspaceId) {
    const running=new Map((window.CLab?.getRunningCardProgress?.(workspaceId)||[]).map(task=>[task.cardId,task.progress]));
    container.querySelectorAll('.clab-card').forEach(card=>{
        const progress=running.get(card.dataset.cardId);card.classList.toggle('clab-xy-running',progress!==undefined);
        if(progress===undefined){card.querySelector(':scope > .clab-xy-progress-ring')?.remove();return;}
        const width=card.offsetWidth,height=card.offsetHeight;
        if(!width||!height){card.querySelector(':scope > .clab-xy-progress-ring')?.remove();return;}
        const ring=progressRing(card);
        sizeProgressOutline(ring,width,height);
        updateProgressOutline(ring,progress);
    });
}
