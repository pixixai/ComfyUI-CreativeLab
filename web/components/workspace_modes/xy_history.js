import { matrixCards, matrixOutput } from './xy_model.js';
import { pushPreviewHistoryEntry, getSteppedHistoryIndex } from '../modules/media_types/media_utils.js';
import { selectOutputHistory } from '../modules/module_history.js';

export function ensureXYHistory(cards,xy) {
    for(const card of matrixCards(cards,xy)){
        const area=matrixOutput(card,xy);
        if(!area||area.missingHistoryRun)continue;
        if(!area.resultUrl&&area.history?.length){area.historyIndex=area.history[area.historyIndex]?area.historyIndex:area.history.length-1;area.resultUrl=area.history[area.historyIndex];}
        if(!area.resultUrl)continue;
        const index=area.history?.lastIndexOf(area.resultUrl)??-1;
        if(index<0)pushPreviewHistoryEntry(area,area.resultUrl,{kind:area.resultKind,text:area.textContent});
        else if(area.history[area.historyIndex]!==area.resultUrl)area.historyIndex=index;
    }
}

export function updateXYHistoryLabel(element,area) {
    let label=element.querySelector(':scope > .clab-xy-history');
    if(!area?.history?.length){label?.remove();return;}
    if(!label){label=document.createElement('span');label.className='clab-xy-history';element.append(label);}
    const index=area.missingHistoryRun?-1:area.historyIndex??area.history.length-1;label.textContent=`${index<0?'—':index+1}/${area.history.length}`;label.title='历史记录 · 选中后按 ← / → 切换';
}

export function stepXYHistory(cards,xy,direction) {
    for(const card of cards){
        const area=matrixOutput(card,xy),index=getSteppedHistoryIndex(area,direction);
        if(index>=0)selectOutputHistory(card,area,index,{linked:false});
    }
}

export function attachXYHistoryKeys(container,getXY,selected,render) {
    document.addEventListener('keydown',event=>{
        const panel=container.closest('#clab-panel');
        if(panel.dataset.workspaceMode!=='xy'||!panel.classList.contains('visible')||!['ArrowLeft','ArrowRight'].includes(event.key)||event.ctrlKey||event.metaKey||event.altKey||event.isComposing)return;
        if(event.target.closest?.('input,textarea,select,[contenteditable=true],[role=dialog]'))return;
        const cards=selected();if(!cards.length)return;
        event.preventDefault();event.stopImmediatePropagation();stepXYHistory(cards,getXY(),event.key==='ArrowLeft'?-1:1);render();
    },true);
}
