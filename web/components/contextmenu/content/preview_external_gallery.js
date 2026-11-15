import { escapeHtml as esc } from './shared.js';
import { externalImageRecords } from './preview_external_records.js';

const addIcon='<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><rect x="3" y="5" width="15" height="15" rx="2"/><path d="m4 17 4-5 5 5 3-3 2 3M18 1v8m-4-4h8"/><circle cx="8" cy="9" r="1"/></svg>';
export function createExternalGallery(root,callbacks){
    const body=root.querySelector('.clab-preview-modal-body'),left=root.querySelector('.clab-preview-modal-left');
    const dock=document.createElement('section');dock.className='clab-external-dock';dock.hidden=true;
    dock.innerHTML='<div class="clab-external-resize" role="separator" tabindex="0" aria-label="调整外部参考媒体区域高度" aria-orientation="horizontal"><i></i></div><header class="clab-external-head"><input type="checkbox" data-external-visible aria-label="显示外部参考图"><span class="clab-external-add-icon">'+addIcon+'</span><button type="button" data-external-pick="computer">计算机</button><span>与</span><button type="button" data-external-pick="server">服务器▾</button><span>媒体</span></header><div class="clab-external-scroll"></div>';
    dock.insertAdjacentHTML('beforeend','<label class="clab-browse-thumb-size clab-external-columns" hidden><button type="button" data-external-columns-reset title="恢复默认四列" aria-label="恢复默认四列"><svg viewBox="0 0 20 16" width="16" height="14" aria-hidden="true"><path d="M1 1h8v6H1Zm10 0h8v6h-8ZM1 9h8v6H1Zm10 0h8v6h-8Z" fill="none" stroke="currentColor"/></svg></button><input type="range" min="1" max="8" step="1" value="4" data-external-columns aria-label="参考媒体缩略图列数"><output data-external-columns-label>4 列</output></label>');
    body.append(dock);
    const scroll=dock.querySelector('.clab-external-scroll'),handle=dock.firstElementChild,selected=new Set();
    const footer=dock.querySelector('.clab-external-columns'),slider=footer.querySelector('input'),count=footer.querySelector('output');
    const columnCount=value=>Math.max(1,Math.min(8,Math.round(Number(value)||4)));
    const applyColumns=value=>{const columns=columnCount(value);dock.style.setProperty('--clab-external-columns',columns);slider.value=columns;count.textContent=columns+' 列';return columns;};
    slider.oninput=()=>callbacks.columns(callbacks.owner(),applyColumns(slider.value),false);
    slider.onchange=()=>callbacks.columns(callbacks.owner(),applyColumns(slider.value));
    footer.querySelector('[data-external-columns-reset]').onclick=event=>{event.preventDefault();callbacks.columns(callbacks.owner(),applyColumns(4));};
    let records=[],visible=[],anchor='',signature='',ownerId='',autoHeight=0,drag;
    const maximum=()=>Math.max(44,body.clientHeight-(left.querySelector('.clab-source-controls')?.offsetHeight||100)-32);
    const size=height=>{height=Math.max(44,Math.min(maximum(),height));root.style.setProperty('--clab-external-height',height+'px');root.style.setProperty('--clab-external-ruler-center',(body.clientHeight-height)/2+'px');root.style.setProperty('--clab-external-ruler-height',(body.clientHeight-height)*2/3+'px');footer.hidden=scroll.hidden||height<=44;handle.setAttribute('aria-valuenow',String(Math.round(height)));return height;};
    function paint(){
        for(const item of dock.querySelectorAll('[data-external-key]'))item.classList.toggle('selected',selected.has(item.dataset.externalKey));
        for(const button of dock.querySelectorAll('[data-external-delete]'))button.title=selected.has(button.dataset.externalDelete)&&selected.size>1?'移除所选 '+selected.size+' 张图像的引用':'移除此图像的引用';
    }
    dock.addEventListener('click',event=>{
        const remove=event.target.closest('[data-external-delete]');
        if(remove){event.preventDefault();event.stopPropagation();const key=remove.dataset.externalDelete;callbacks.remove(selected.has(key)?[...selected]:[key]);return;}
        const thumb=event.target.closest('[data-external-key]');if(!thumb)return;
        const key=thumb.dataset.externalKey;
        if(event.shiftKey&&anchor){
            const first=visible.findIndex(record=>record.key===anchor),last=visible.findIndex(record=>record.key===key);
            if(first>=0){selected.clear();for(const record of visible.slice(Math.min(first,last),Math.max(first,last)+1))selected.add(record.key);}
            event.preventDefault();event.stopPropagation();
        }else if(event.ctrlKey||event.metaKey){selected.has(key)?selected.delete(key):selected.add(key);anchor=key;event.preventDefault();event.stopPropagation();}
        else{selected.clear();selected.add(key);anchor=key;}
        paint();
    });
    dock.addEventListener('change',event=>{
        if(!event.target.matches('[data-external-visible],[data-external-enabled]'))return;
        callbacks.toggle(event.target.checked,event.target.dataset.externalEnabled);
    });
    dock.addEventListener('dragstart',event=>{
        const thumb=event.target.closest('[data-external-key]');if(!thumb)return;
        event.dataTransfer.setData('application/x-clab-preview-record',thumb.dataset.externalKey);event.dataTransfer.setData('text/plain',thumb.dataset.externalKey);event.dataTransfer.effectAllowed='copy';event.stopPropagation();
    });
    const finish=()=>{
        if(!drag)return;
        const {height,workspace}=drag;drag=null;root.classList.remove('clab-sidebar-resizing');callbacks.resize(workspace,height);
    };
    handle.addEventListener('pointerdown',event=>{
        if(event.button!==0)return;event.preventDefault();event.stopPropagation();handle.setPointerCapture(event.pointerId);
        drag={y:event.clientY,start:dock.getBoundingClientRect().height,height:dock.getBoundingClientRect().height,workspace:callbacks.owner()};
        root.classList.add('clab-sidebar-resizing');
    });
    handle.addEventListener('pointermove',event=>{if(drag)drag.height=size(drag.start+drag.y-event.clientY);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])handle.addEventListener(type,finish);
    handle.addEventListener('keydown',event=>{if(!['ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();callbacks.resize(callbacks.owner(),size(dock.getBoundingClientRect().height+(event.key==='ArrowUp'?16:-16)));});
    handle.addEventListener('dblclick',()=>{const height=autoHeight||180;size(height);callbacks.resize(callbacks.owner(),height);});
    window.addEventListener('blur',finish);
    return {dock,render(entries,active,comparison,search,filter){
        dock.hidden=false;root.dataset.externalDock='';
        const workspaces=callbacks.workspaces(),owner=callbacks.owner(),query=search.trim().toLowerCase();
        records=externalImageRecords(workspaces,callbacks.label);
        if(ownerId!==owner?.id){ownerId=owner?.id;autoHeight=0;selected.clear();signature='';}
        for(const key of selected)if(!records.some(record=>record.key===key))selected.delete(key);
        const columns=applyColumns(owner?.view.previewExternal?.columns);
        if(records.length&&!autoHeight)autoHeight=44+Math.max(70,(dock.getBoundingClientRect().width-24-8*(columns-1))/columns)+60;
        const toggles=workspaces.map(workspace=>workspace.view.previewExternal?.enabled!==false),checkbox=dock.querySelector('[data-external-visible]');
        checkbox.checked=toggles.every(Boolean);checkbox.indeterminate=toggles.some(Boolean)&&!checkbox.checked;
        const expanded=records.length&&toggles.some(Boolean);
        scroll.hidden=!expanded;size(expanded?owner?.view.previewExternal?.height??autoHeight:44);
        visible=records.filter(record=>(!filter||filter==='image')&&(!query||(record.name+' '+record.cardLabel).toLowerCase().includes(query)));
        const indices=new Map(entries.map((record,index)=>[record.key,index]));
        const next=JSON.stringify([visible.map(record=>[record.key,record.name,indices.get(record.key)]),workspaces.map(workspace=>[workspace.id,workspace.view.previewExternal?.enabled]),active,comparison?[comparison.a,comparison.b]:null]);
        if(next!==signature){
            const top=scroll.scrollTop;
            scroll.innerHTML=workspaces.map(workspace=>{
                const images=visible.filter(record=>record.externalWorkspaceId===workspace.id);if(!images.length)return '';
                return '<section class="clab-external-group" data-external-workspace="'+esc(workspace.id)+'">'+(workspaces.length>1?'<label class="clab-external-workspace"><input type="checkbox" data-external-enabled="'+esc(workspace.id)+'" '+(workspace.view.previewExternal?.enabled!==false?'checked':'')+'><span>'+esc(callbacks.label(workspace))+'</span></label>':'')+'<div class="clab-external-grid">'+images.map(record=>{
                    const slots=comparison?['a','b'].filter(slot=>comparison[slot]===record.key):[];
                    return '<div class="clab-external-item"><button type="button" class="clab-preview-modal-thumb clab-external-thumb '+(record.key===active?'active':'')+'" draggable="true" data-index="'+(indices.get(record.key)??-1)+'" data-external-key="'+esc(record.key)+'" title="'+esc(record.externalPath)+'"><div class="clab-external-thumb-media"><img loading="lazy" src="'+esc(record.url)+'" alt="'+esc(record.name)+'">'+(slots.length?'<span class="clab-filmstrip-assignment" data-external-assignment>'+slots.map(slot=>'<span>'+slot.toUpperCase()+'</span>').join('')+'</span>':'')+'</div><span>'+esc(record.name)+'</span></button><button type="button" data-external-delete="'+esc(record.key)+'" aria-label="移除图像引用">×</button></div>';
                }).join('')+'</div></section>';
            }).join('');
            signature=next;scroll.scrollTop=top;paint();
        }
    },hide(){finish();dock.hidden=true;delete root.dataset.externalDock;selected.clear();anchor='';signature='';},selectedKeys:()=>new Set(selected)};
}
