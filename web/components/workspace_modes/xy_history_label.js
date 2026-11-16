import { outputImportIcon } from '../modules/media_types/external_import_icon.js';
import { xyPosition } from './xy_axes.js';

export function updateXYHistoryLabel(element,area) {
    let label=element.querySelector(':scope > .clab-xy-history');
    if(!area?.history?.length){label?.xyDisplay?.remove();label?.remove();return;}
    if(!label){label=document.createElement('span');label.className='clab-xy-history';element.append(label);}
    const index=area.missingHistoryRun?-1:area.historyIndex??area.history.length-1;
    const html=outputImportIcon(area)+`${index<0?'—':index+1}/${area.history.length}`;
    if(label.innerHTML!==html)label.innerHTML=html;
    label.title='历史记录 · 选中后按 ← / → 切换';
    const overlay=element.parentElement.parentElement.querySelector('.clab-xy-overlay');if(!overlay)return;
    // Keep the tooltip hit target on the card; repaint its visible badge outside the scaled media layer.
    let display=label.xyDisplay;
    if(!display?.isConnected){display=document.createElement('span');display.className='clab-xy-history';display.setAttribute('aria-hidden','true');display.xyCard=element;overlay.append(display);label.xyDisplay=display;}
    if(display.innerHTML!==html)display.innerHTML=html;
    display.hidden=!!element.querySelector('.clab-history-grid');
    xyPosition(display,parseFloat(element.style.left)+parseFloat(element.style.width)-7,parseFloat(element.style.top)+7);
}
