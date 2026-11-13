import { xyPosition, projectXYCanvas } from '../../workspace_modes/xy_axes.js';
import { escapeHtml as esc } from './shared.js';

export function renderXYRecordTable(stage,wrapper,xy,rows) {
    const overlay=stage.querySelector('.clab-xy-overlay');if(!overlay)return;
    let table=overlay.querySelector('.clab-review-xy-records');
    if(!rows.length){if(table){table.remove();overlay._clabPositions=null;}return;}
    if(!table){table=document.createElement('div');table.className='clab-review-xy-records';table.setAttribute('role','table');table.setAttribute('aria-label','附加记录参数');overlay.append(table);}
    const html='<div role="row" class="clab-review-xy-records-head"><span role="columnheader">节点名称</span><span role="columnheader">参数名称</span><span role="columnheader">参数值</span></div>'+rows.map(row=>`<div role="row"><span role="cell" data-record-node title="${esc(row.nodeName)}">${esc(row.nodeName)}</span><span role="cell" data-record-parameter title="${esc(row.parameterName)}">${esc(row.parameterName)}</span><span role="cell" data-record-value title="${esc((row.mixed?'当前显示的历史包含多种记录值\n':'')+row.value)}">${esc(row.value)}</span></div>`).join('');
    if(table.innerHTML!==html)table.innerHTML=html;
    table.classList.toggle('is-expanded',!!xy.previewRecordsExpanded);
    const width=xy.previewRecordsExpanded?480:360;table.style.width=`${width*xy.zoom}px`;table.style.transform='translateX(-100%)';
    const binding=overlay.querySelector('.clab-xy-z-binding'),yBinding=overlay.querySelector('[data-xy-part=y-binding]');
    const measureKey=html+String(xy.previewRecordsExpanded);
    if(table._worldMeasureKey!==measureKey){
        table.style.setProperty('--xy-ui-scale',1);table.style.width=`${width}px`;table._worldHeight=table.offsetHeight;
        table.style.removeProperty('--xy-ui-scale');table.style.width=`${width*xy.zoom}px`;table._worldMeasureKey=measureKey;
    }
    const right=binding.xyAxisAnchor.x,height=table._worldHeight;
    const zTop=binding.xyAxisAnchor.y,zBottom=zTop+binding.xyAxisAnchor.height;
    const alignedTop=xy.origin==='bottom'?yBinding.xyPosition.y-yBinding.xyWorldHeight:yBinding.xyPosition.y+yBinding.xyWorldHeight-height;
    const top=xy.origin==='bottom'?Math.min(alignedTop,zTop-height-12):Math.max(alignedTop,zBottom+12);
    xyPosition(table,right,top,width);
    wrapper.dataset.xyMinX=Math.min(Number(wrapper.dataset.xyMinX),right-width);
    wrapper.dataset.xyMinY=Math.min(Number(wrapper.dataset.xyMinY),top);
    wrapper.style.width=`${Math.max(wrapper.offsetWidth,right)}px`;wrapper.style.height=`${Math.max(wrapper.offsetHeight,top+height)}px`;
    projectXYCanvas(stage,xy);
}
