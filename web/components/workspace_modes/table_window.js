import { tableRenderedRowHeight,tableColumnWidth } from './table_layout.js';
import { workspaceViewport } from './viewport_components.js';
import { releaseModuleTree } from '../modules/module_lifecycle.js';
import { revealDelta } from './viewport_geometry.js';
import { getActiveWorkspace } from '../ui_state.js';

const controllers=new WeakMap();
export function tableTrackOffsets(items,size){
    const offsets=[0];for(const item of items)offsets.push(offsets.at(-1)+size(item));return offsets;
}
export function tableTrackRange(offsets,start,length,buffer=240){
    const count=offsets.length-1;
    const search=value=>{let low=0,high=count;while(low<high){const mid=(low+high)>>1;if(offsets[mid+1]<=value)low=mid+1;else high=mid;}return low;};
    return {start:search(Math.max(0,start-buffer)),end:Math.min(count,search(start+length+buffer)+1)};
}
export function tableRenderRange(offsets,start,length,buffer,previous){
    const nearby=tableTrackRange(offsets,start,length,buffer/2);
    if(previous&&previous.end<offsets.length&&previous.start<=nearby.start&&previous.end>=nearby.end)return previous;
    return tableTrackRange(offsets,start,length,buffer);
}

export function tableWindow(container){
    if(controllers.has(container))return controllers.get(container);
    let rows=[],columns=[],vertical=[0],horizontal=[0],paint,owner,lastY,lastX,frame=0,key='',enabled=false;
    const active=()=>container.closest('#clab-panel.visible')?.dataset.workspaceMode==='table';
    const wrapper=()=>container.querySelector('.clab-cards-wrapper');
    const pinned=element=>element.contains(document.activeElement)||element.matches('.is-reordering')||!!element.querySelector('.is-reordering,.clab-custom-select.open,.clab-upload-status,[aria-expanded=true],[data-table-row-title]');
    const drop=element=>{workspaceViewport(container).releaseCard(element);element.remove();releaseModuleTree(element);};
    const update=(force=false)=>{
        cancelAnimationFrame(frame);frame=0;if(!paint||!active())return;
        const node=wrapper();if(!node)return;
        // Keep the scroll extent stable while replacing rows and gap nodes.
        if(enabled)node.style.minHeight=`${40+vertical.at(-1)}px`;else node.style.removeProperty('min-height');
        const y=enabled?tableRenderRange(vertical,Math.max(0,container.scrollTop-40),container.clientHeight,Math.max(480,container.clientHeight),force?null:lastY):{start:0,end:rows.length};
        const x=enabled?tableRenderRange(horizontal,container.scrollLeft,container.clientWidth,Math.max(320,container.clientWidth/2),force?null:lastX):{start:0,end:columns.length};
        lastY=y;lastX=x;
        const rowIds=new Set(rows.slice(y.start,y.end).map(row=>row.id)),columnIds=new Set(columns.slice(x.start,x.end).map(column=>column.id));
        for(const element of node.querySelectorAll('[data-table-row]'))if(pinned(element)){
            rowIds.add(element.dataset.tableRow);
            for(const cell of element.querySelectorAll('[data-table-column]'))if(pinned(cell))columnIds.add(cell.dataset.tableColumn);
        }
        for(const header of node.querySelectorAll('.clab-table-column'))if(pinned(header))columnIds.add(header.dataset.tableColumn);
        const next=[...rowIds,...columnIds].join('|');if(!force&&key===next)return;key=next;
        const visibleRows=rows.filter(row=>rowIds.has(row.id)),visibleColumns=columns.filter(column=>columnIds.has(column.id));
        for(const element of node.querySelectorAll(':scope>.clab-card,:scope>.clab-table-draft-row'))if(!rowIds.has(element.dataset.cardId))drop(element);
        for(const cell of node.querySelectorAll('.clab-area,.clab-table-draft-cell'))if(cell.dataset.tableColumn&&!columnIds.has(cell.dataset.tableColumn))drop(cell);
        node.querySelectorAll('[data-table-spacer]').forEach(element=>element.remove());
        const settled=paint(visibleRows,visibleColumns);
        if(enabled){
            let offset=0;
            const indices=new Map(rows.map((row,index)=>[row.id,index]));
            for(const row of visibleRows){
                const index=indices.get(row.id),element=node.querySelector(`:scope>[data-card-id="${CSS.escape(row.id)}"]`);
                if(vertical[index]>offset){const spacer=document.createElement('div');spacer.dataset.tableSpacer='';spacer.setAttribute('aria-hidden','true');spacer.style.height=`${vertical[index]-offset}px`;element.before(spacer);}
                offset=vertical[index+1];
            }
            if(vertical.at(-1)>offset){const spacer=document.createElement('div');spacer.dataset.tableSpacer='';spacer.setAttribute('aria-hidden','true');spacer.style.height=`${vertical.at(-1)-offset}px`;node.append(spacer);}
        }
        node.toggleAttribute('data-clab-table-window',enabled);
        settled?.();
    };
    const schedule=()=>{if(paint&&active()&&!frame)frame=requestAnimationFrame(()=>update());};
    container.addEventListener('scroll',event=>{
        if(event.target!==container||!paint||!active())return;
        const y=tableTrackRange(vertical,Math.max(0,container.scrollTop-40),container.clientHeight,0),x=tableTrackRange(horizontal,container.scrollLeft,container.clientWidth,0);
        if(enabled&&(!lastY||y.start<lastY.start||y.end>lastY.end||!lastX||x.start<lastX.start||x.end>lastX.end))update();else schedule();
    });
    container.addEventListener('focusout',schedule);
    const reveal=(cardId,areaId,rowIndex,columnIndex)=>{
        if(!paint||!active())return;
        const row=rowIndex??rows.findIndex(row=>row.id===cardId||row.areas.some(area=>area.id===areaId));
        if(row<0||row>=rows.length)return;
        const column=columnIndex??(areaId?rows[row].areas.findIndex(area=>area.id===areaId):-1);
        container.scrollTop-=revealDelta(40+vertical[row]-container.scrollTop,40+vertical[row+1]-container.scrollTop,44,container.clientHeight-28);
        if(column>=0){const gutter=parseFloat(wrapper().style.getPropertyValue('--clab-table-row-width'))||44;container.scrollLeft-=revealDelta(gutter+horizontal[column]-container.scrollLeft,gutter+horizontal[column+1]-container.scrollLeft,gutter,container.clientWidth-28);}
        update(true);
        return wrapper().querySelector(areaId?`[data-area-id="${CSS.escape(areaId)}"]`:`[data-table-row="${CSS.escape(rows[row].id)}"]`);
    };
    container.addEventListener('clab_table_reveal',event=>{event.detail.element=reveal(event.detail.cardId,event.detail.areaId);});
    const api={
        render(allRows,allColumns,view,render){
            const current=getActiveWorkspace();if(owner&&owner!==current)for(const root of wrapper()?.querySelectorAll(':scope>.clab-card,:scope>.clab-table-draft-row')||[])drop(root);owner=current;
            rows=allRows;columns=allColumns;paint=render;
            vertical=tableTrackOffsets(rows,row=>tableRenderedRowHeight(view,row));horizontal=tableTrackOffsets(columns,column=>tableColumnWidth(column,view));
            enabled=rows.length>=40||rows.length*columns.length>=160;update(true);
        },
        reveal,
        leave(){cancelAnimationFrame(frame);frame=0;paint=null;lastY=lastX=null;rows=[];columns=[];vertical=horizontal=[0];key='';const node=wrapper();node?.querySelectorAll('[data-table-spacer]').forEach(element=>element.remove());node?.removeAttribute('data-clab-table-window');node?.style.removeProperty('min-height');}
    };
    controllers.set(container,api);return api;
}
