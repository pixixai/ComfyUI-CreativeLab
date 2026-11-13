import { createPreviewParameterGrid } from './preview_parameter_grid.js';
import { createPreviewXYGrid } from './preview_xy_grid.js';
import { attachXYGestures } from '../../workspace_modes/xy_gestures.js';
import { escapeHtml as esc } from './shared.js';

// Each section owns its filters, selection and settings; the viewport/export is shared.
export function createPreviewMultiGrid(center,left,right,changed,exportControls) {
    let groups=[],mode,bundle,selected='',viewport,scene,cellInfo,currentCellOwner='',muteSelection=false,widthObserver,clearSelection=()=>{},camera={zoom:.5,panX:20,panY:20},frame=0,config;
    let fitFrame=0,paintScope=()=>{};
    const scopes=new Set();
    const settingGroups=()=>scopes.size?groups.filter(group=>scopes.has(group.id)):groups;
    function updateLayout(){
        if(!scene)return;
        if(mode==='table'){
            const heights=[];
            for(const group of groups)for(const [index,row]of [...group.center.querySelectorAll('[data-review-row]')].entries())heights[index]=Math.max(heights[index]||0,row.offsetHeight);
            for(const group of groups){
                for(const [index,row]of [...group.center.querySelectorAll('[data-review-row]')].entries())row.style.setProperty('--clab-table-height',`${heights[index]}px`);
                group.element.style.width=`${group.api.tableWidth()}px`;
            }
        }else{
            for(const group of groups){
                const size=group.api.groupLayout();if(!size)continue;
                group.width=size.width;group.height=size.height;
                const heading=group.element.querySelector('.clab-review-workspace-title');
                heading.querySelector('.clab-multi-z-summary')?.remove();
                if(size.tiled&&size.binding){const badge=size.binding.cloneNode(true);badge.className='clab-multi-z-summary';badge.removeAttribute('data-xy-position');badge.removeAttribute('style');badge.querySelectorAll('button').forEach(button=>button.tabIndex=-1);heading.append(badge);}
            }
        }
        if(mode==='xy')paintCamera();
        changed();
    }
    const queueLayout=()=>{cancelAnimationFrame(frame);frame=requestAnimationFrame(updateLayout);};
    const paintCamera=()=>{
        scene.style.transform=`translate(${camera.panX}px,${camera.panY}px)`;
        scene.style.gap=`${64*camera.zoom}px`;scene.style.padding=`${24*camera.zoom}px`;
        for(const group of groups){
            group.api.groupLayout(camera.zoom);
            group.center.style.width=`${group.width*camera.zoom}px`;group.center.style.height=`${group.height*camera.zoom}px`;
            const heading=group.element.firstElementChild;heading.style.setProperty('--xy-ui-scale',camera.zoom);heading.style.fontSize=`${18*camera.zoom}px`;heading.style.minHeight=`${36*camera.zoom}px`;heading.style.gap=`${14*camera.zoom}px`;group.element.style.padding=`${16*camera.zoom}px`;heading.style.marginBottom=`${24*camera.zoom}px`;heading.style.width=`${group.width*camera.zoom}px`;
        }
    };
    function fit(){
        if(mode!=='xy'||!scene)return;
        const stage=center.querySelector('.clab-review-multi-grid');
        const width=groups.reduce((sum,group)=>sum+(group.width||0)+32,48)+Math.max(0,groups.length-1)*64,height=Math.max(0,...groups.map(group=>(group.height||0)+32))+108;
        camera.zoom=Math.min(1,(stage.clientWidth-32)/Math.max(1,width),(stage.clientHeight-32)/Math.max(1,height));
        camera.panX=(stage.clientWidth-width*camera.zoom)/2;camera.panY=(stage.clientHeight-height*camera.zoom)/2;paintCamera();
    }
    const owner=input=>groups.find(group=>group.id===input.closest('[data-preview-grid-workspace]')?.dataset.previewGridWorkspace)||groups.find(group=>group.id===selected)||groups[0];
    return {
        open(nextBundle,nextMode){bundle=nextBundle;mode=nextMode;},
        mount(nextConfig){
            config=nextConfig;widthObserver=new ResizeObserver(queueLayout);groups=[];selected='';scopes.clear();currentCellOwner='';let activate,clear;
            const controls=exportControls(mode==='table');
            center.innerHTML=`<div class="clab-review-multi-grid clab-review-grid-stage${mode==='xy'?' clab-review-matrix-groups':''}"><div class="${mode==='xy'?'clab-review-matrix-scene':'clab-review-table-groups'}"></div></div>`;
            scene=center.firstElementChild.firstElementChild;left.replaceChildren();right.replaceChildren();
            if(mode==='xy'){cellInfo=document.createElement('section');cellInfo.className='clab-review-xy-current';cellInfo.hidden=true;cellInfo.innerHTML='<h3>当前格子</h3><div data-review-xy-cell-info></div>';left.append(cellInfo);}
            for(const source of bundle.groups){
                const element=document.createElement('section');element.className=mode==='table'?'clab-review-table-group':'clab-review-matrix-group';element.dataset.previewGridWorkspace=source.id;
                element.innerHTML=`${mode==='table'?'<button type="button"':'<div role="button" tabindex="0"'} class="clab-review-workspace-title"><span class="clab-multi-workspace-name">${esc(source.name)}</span>${mode==='table'?'</button>':'</div>'}<div class="clab-review-workspace-grid"></div>`;scene.append(element);
                const c=element.lastElementChild,l=document.createElement('div'),r=document.createElement('div');
                const section=document.createElement('details');section.open=true;section.className='clab-preview-source-workspace';section.dataset.previewGridWorkspace=source.id;
                section.innerHTML=`<summary><span class="clab-source-workspace-fold"></span><span>${esc(source.name)}</span></summary><div class="clab-preview-source-workspace-body${mode==='table'?' clab-preview-source-columns':''}"></div>`;
                section.lastElementChild.append(l);left.append(section);
                r.dataset.previewGridWorkspace=source.id;r.classList.add('clab-multi-settings');right.append(r);
                const group={id:source.id,source,element,center:c,left:l,right:r};groups.push(group);
                const api=mode==='table'?createPreviewParameterGrid(c,l,r,queueLayout,controls,{
                    save:()=>bundle.commit(),select:on=>{if(on&&!muteSelection)activate(source.id);},
                    settingsAction:(key,args)=>{for(const target of settingGroups())target.api.applySetting(key,args);bundle.commit();queueLayout();},
                }):createPreviewXYGrid(c,l,r,queueLayout,controls,()=>{},(keys,expanded)=>{
                    Object.assign(source.projected.view.xy,{previewRecords:keys,previewRecordsExpanded:expanded});bundle.commit();
                },layout=>{Object.assign(source.projected.view.xy.tiling,layout.tiling);source.projected.view.xy.z.display=layout.display;bundle.commit();}, {grouped:true,
                    selection:({kind,event})=>{if(muteSelection)return;if(!kind){clear();return;}activate(source.id,event);},
                    axisSetting:(name,values)=>{for(const target of settingGroups())if(target!==group)target.api.applyAxisSettings(name,values);queueLayout();},
                    cellInfo:(html,card)=>{if(!card&&currentCellOwner!==source.id)return;currentCellOwner=card?source.id:'';cellInfo.hidden=!card;cellInfo.lastElementChild.innerHTML=html;},
                });
                group.api=api;
                if(mode==='table')api.open({view:source.projected.view},source.projected.cards);else api.open(source.projected.view.xy,source.projected.cards);
                api.mount(config);if(mode==='table')widthObserver.observe(c.querySelector('.clab-cards-wrapper'));
                element.firstElementChild.onclick=()=>{
                    muteSelection=true;for(const other of groups)if(other!==group)(mode==='table'?other.api.selectWorkspace(false):other.api.clearSelection());
                    group.api.selectWorkspace();muteSelection=false;scopes.clear();scopes.add(source.id);selected=source.id;
                    if(cellInfo)cellInfo.hidden=true;activate(source.id);
                };
            }
            const scope=document.createElement('p');scope.className='clab-review-note';scope.dataset.multiSettingsScope='';right.prepend(scope);
            paintScope=()=>{
                const current=groups.find(group=>group.id===selected)||groups[0];
                for(const group of groups){group.right.hidden=group!==current;group.element.classList.toggle('is-selected',scopes.has(group.id));}
                scope.textContent=scopes.size?`作用于：${settingGroups().map(group=>group.source.name).join('、')}`:'作用于：所有来源工作区';changed();
            };
            clear=()=>{
                muteSelection=true;for(const group of groups)(mode==='table'?group.api.selectWorkspace(false):group.api.clearSelection());muteSelection=false;
                scopes.clear();selected='';currentCellOwner='';if(cellInfo)cellInfo.hidden=true;paintScope();
            };
            clearSelection=clear;
            activate=(id,event)=>{
                if(!event?.ctrlKey&&!event?.metaKey){
                    muteSelection=true;for(const group of groups)if(group.id!==id)(mode==='table'?group.api.selectWorkspace(false):group.api.clearSelection());muteSelection=false;scopes.clear();
                }
                scopes.add(id);selected=id;paintScope();
            };
            const stage=center.firstElementChild;
            stage.addEventListener('click',event=>{if(event.target===stage||event.target===scene||event.target.matches('.clab-review-matrix-group,.clab-review-workspace-grid'))clear();});
            paintScope();updateLayout();
            if(mode==='xy'){
                const stage=center.firstElementChild;
                viewport=attachXYGestures(stage,()=>camera,paintCamera,()=>{},()=>{},()=>stage.isConnected);
                fitFrame=requestAnimationFrame(fit);
            }
        },
        filter(input){owner(input)?.api.filter(input);},
        selectSources(type,all,input){owner(input)?.api.selectSources(type,all);},
        change(input){const group=owner(input);if(!group)return false;const targets=input.closest('.clab-multi-settings')?settingGroups():[group];let changed=false;for(const target of targets)changed=target.api.change(input,config)||changed;if(changed)queueLayout();return changed;},
        selectRange(name,all,input){owner(input)?.api.selectRange(name,all);queueLayout();},
        swap(pair){for(const group of settingGroups())group.api.swap(pair,config);queueLayout();},
        fit,
        revealHistory(id,focus){groups.find(group=>group.id===id)?.api.revealHistory(focus);},
        getViewState(){return {camera:{...camera},selected,scopes:[...scopes],groups:groups.map(group=>[group.id,group.api.getViewState()])};},
        restoreViewState(saved){
            for(const [id,view]of saved.groups)groups.find(group=>group.id===id)?.api.restoreViewState(view);
            selected=saved.selected;scopes.clear();for(const id of saved.scopes)if(groups.some(group=>group.id===id))scopes.add(id);
            if(mode==='xy'){cancelAnimationFrame(fitFrame);camera={...saved.camera};paintCamera();}paintScope();queueLayout();
        },
        clearSelection(){clearSelection();},
        flush(){bundle?.commit();groups.forEach(group=>group.api.flush?.());},
        release(){widthObserver?.disconnect();viewport?.release();cancelAnimationFrame(frame);cancelAnimationFrame(fitFrame);groups.forEach(group=>group.api.release());groups=[];scene=null;},
        downloadRecords(selectedOnly,history){return groups.flatMap(group=>group.api.downloadRecords(selectedOnly,history));},
        jsonCards(){return groups.flatMap(group=>group.api.jsonCards());},
        exportSource(){return {groups:groups.map(group=>({name:group.source.name,stage:group.center.querySelector('.clab-review-grid-stage'),...group.api.exportSource()}))};},
        hasExportData(){return groups.some(group=>group.api.hasExportData());},
    };
}
