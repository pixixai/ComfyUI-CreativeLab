import { renderOutputMenu } from './output_menu.js';
import { getMediaType } from '../../modules/media_types/media_utils.js';
import { state } from '../../ui_state.js';
import { editHistory } from '../../edit_history_runtime.js';
import { uploadImageToServer } from '../../actions/action_data_io.js';
import { attachInputFileBrowser } from '../../modules/input_file_browser.js';
import { openXYPopover } from '../../workspace_modes/xy_popover.js';
import { addExternalMedia,externalMediaRecords,externalMediaPath } from './preview_external_records.js';
import { injectExternalStyles } from './preview_external_styles.js';
import { createExternalGallery } from './preview_external_gallery.js';

export function createPreviewExternal(root,callbacks){
    injectExternalStyles();
    const center=root.querySelector('.clab-preview-modal-center');
    const notice=text=>{root.querySelector('.clab-review-notice').textContent=text;};
    const allowed=()=>root.classList.contains('visible');
    const outputMode=()=>['detail','table','xy'].includes(root.dataset.reviewMode);
    const targets=(element,selected=false)=>outputMode()?callbacks.outputs.targets(element,selected):[];
    const accepted=file=>!!externalMediaPath(file?.name||'');
    const computerTypes='.png,.jpg,.jpeg,.webp,.gif,.bmp,.tif,.tiff,.svg,.avif,.mp4,.webm,.mov,.avi,.mkv,.m4v,.mp3,.wav,.ogg,.flac,.aac,.m4a,.opus,.glb,.gltf,.fbx,.obj,.stl,.ply,.bvh,.txt,.md,.markdown,.json,.yaml,.yml,.xml,.csv,.tsv,.log';
    const owner=()=>callbacks.workspaces().find(workspace=>workspace.id===root.dataset.editWorkspaceId)||callbacks.workspaces()[0];
    let picker,sequence=0,uploading=false;
    const closePicker=()=>{picker?.close();picker=null;};
    const save=(workspace,viewOnly=false)=>{
        const persist=()=>window.CLab?.saveState(state,{createAnchor:false,workspaceIds:[workspace.id]});
        if(viewOnly)editHistory.withoutRecording(persist);else persist();
    };
    const keyFor=(workspace,image)=>JSON.stringify(['external',workspace.id,image.id]);
    const add=(workspace,paths,slot,token,outputs=[])=>editHistory.transaction(()=>{
        if(!state.workspaces.includes(workspace))return;
        const images=addExternalMedia(workspace,paths);if(!images.length)return;
        if(outputs.length){
            if(token===sequence&&allowed()&&callbacks.workspaces().some(workspace=>workspace.id===outputs[0].workspaceId))root.dataset.editWorkspaceId=outputs[0].workspaceId;
            const urls=new Map(externalMediaRecords([workspace],callbacks.label).map(record=>[record.areaId,record.url])),assets=images.map(image=>({id:image.id,url:urls.get(image.id)}));
            const changed=callbacks.outputs.append(assets,workspace,outputs);
            for(const id of new Set([workspace.id,...changed])){const target=state.workspaces.find(workspace=>workspace.id===id);if(target)save(target);}
            return;
        }
        save(workspace);
        if(!outputMode()&&token===sequence&&allowed()&&callbacks.workspaces().includes(workspace)){
            const record=externalMediaRecords([workspace],callbacks.label).find(record=>images.some(image=>image.id===record.areaId)&&(root.dataset.reviewMode!=='compare'||['image','video'].includes(record.type)));
            if(record)callbacks.open(record.key,slot);else callbacks.refresh();
        }else if(allowed()&&callbacks.workspaces().includes(workspace))callbacks.refresh();
    });
    function chooseServer(anchor,slot,outputs=[]){
        if(picker?.anchor===anchor){closePicker();return;}
        const multiple=!slot,direct=!!slot;
        slot??=root.dataset.reviewMode==='compare'?callbacks.slot():undefined;
        const workspace=owner(),token=sequence;if(!workspace)return;
        const chosen=new Set();let browser;
        closePicker();
        const handle=openXYPopover(()=>anchor,'选择服务器媒体','<input type="search" data-external-search placeholder="输入名称筛选…" aria-label="筛选服务器媒体"><div class="clab-input-files-tree"></div><div class="clab-external-picker-footer"><button type="button" data-external-refresh>刷新列表</button>'+(multiple?'<button type="button" data-external-confirm disabled>添加已选媒体</button>':'')+'</div><p class="clab-review-note" data-external-error></p>','clab-input-files clab-external-picker','',root.querySelector('.clab-preview-modal-panel'),undefined,()=>{browser?.destroy();if(picker===handle)picker=null;});
        picker=handle;handle.anchor=anchor;
        const confirm=handle.popup.querySelector('[data-external-confirm]');
        const current=slot&&callbacks.records().find(record=>record.key===callbacks.assignment(slot))?.externalPath;
        browser=attachInputFileBrowser(handle.popup.querySelector('.clab-input-files-tree'),{kind:'file',multiple,accept:path=>!!externalMediaPath(path)&&(!direct||['image','video'].includes(getMediaType(path))),getSelected:()=>multiple?[...chosen]:current?[current]:[],
            onChange:(paths,checked)=>{if(!multiple){handle.close();add(workspace,paths,slot,token,outputs);return;}for(const path of paths)if(checked)chosen.add(path);else chosen.delete(path);confirm.disabled=!chosen.size;confirm.textContent=chosen.size?'添加 '+chosen.size+' 个媒体':'添加已选媒体';},
            onBusy:()=>{if(confirm)confirm.disabled=browser?.busy||!chosen.size;},onError:error=>{handle.popup.querySelector('[data-external-error]').textContent=error.message;}});
        handle.popup.querySelector('[data-external-search]').oninput=event=>browser.filter(event.target.value);
        handle.popup.querySelector('[data-external-refresh]').onclick=()=>browser.refresh();
        if(confirm)confirm.onclick=()=>{if(browser.busy)return;handle.close();add(workspace,[...chosen],slot,token,outputs);};
    }
    function removeReferences(keys){
        const selected=new Set(keys),workspaces=callbacks.workspaces();
        for(const workspace of workspaces){
            const settings=workspace.view.previewExternal;if(!settings)continue;
            const retained=settings.images.filter(image=>!selected.has(keyFor(workspace,image)));
            if(retained.length!==settings.images.length){settings.images=retained;save(workspace);}
        }
        callbacks.refresh();notice('已移除引用，服务器文件保留。');
    }
    function purgeReferences(record){
        const workspace=state.workspaces.find(workspace=>workspace.id===root.dataset.editWorkspaceId)||owner();if(!workspace)return;
        const selected=gallery.selectedKeys(),records=callbacks.records().filter(item=>item.externalWorkspaceId&&(selected.has(record.key)?selected.has(item.key):item.key===record.key));
        const references=records.map(item=>({workspaceId:item.externalWorkspaceId,assetId:item.areaId}));
        const result=callbacks.outputs.remove(workspace,references);
        if(!window.confirm(`将从当前工作区移除此素材引用及 ${result.count} 条导入记录，其中包含 ${result.covers} 处封面引用。服务器文件不会删除。`))return;
        editHistory.transaction(()=>{
        callbacks.outputs.remove(workspace,references,true);
        if(workspace.view.previewExternal)workspace.view.previewExternal.images=workspace.view.previewExternal.images.filter(image=>!references.some(reference=>reference.workspaceId===workspace.id&&reference.assetId===image.id));
        save(workspace);callbacks.refresh();
        });notice('已移除当前工作区的素材引用及导入记录，服务器文件保留。');
    }
    const gallery=createExternalGallery(root,{...callbacks,owner:()=>callbacks.workspaces().find(workspace=>workspace.id===state.activeWorkspaceId)||callbacks.workspaces()[0],remove:removeReferences,
        toggle(enabled,id){
            for(const workspace of callbacks.workspaces().filter(workspace=>!id||workspace.id===id)){
                const settings=workspace.view.previewExternal??={images:[],enabled:true};settings.enabled=enabled;save(workspace,true);
            }callbacks.refresh();
        },
        resize(workspace,height){if(!state.workspaces.includes(workspace))return;const settings=workspace.view.previewExternal??={images:[],enabled:true};settings.height=height;save(workspace,true);},
        columns(workspace,columns,persist=true){if(!state.workspaces.includes(workspace))return;const settings=workspace.view.previewExternal??={images:[],enabled:true};settings.columns=columns;if(persist)save(workspace,true);}
    });
    const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept=computerTypes;fileInput.multiple=true;fileInput.hidden=true;root.append(fileInput);
    let uploadTarget;
    function upload(slot,outputs=[]){fileInput.accept=slot?'image/*,video/*':computerTypes;uploadTarget={outputs,workspace:owner(),slot:slot??(root.dataset.reviewMode==='compare'?callbacks.slot():undefined),token:sequence};fileInput.value='';fileInput.click();}
    async function uploadFiles(files,target={workspace:owner(),slot:undefined,token:sequence}){
        const images=[...files].filter(file=>accepted(file));
        if(!images.length){notice('请选择支持的图片、视频、音频、3D 或文本文件。');return;}
        if(uploading){notice('正在添加媒体，请等待本次上传完成。');return;}
        if(!target.workspace)return;
        uploading=true;notice('正在添加 '+images.length+' 个媒体…');
        const paths=[],errors=[];
        try{
            for(const file of images)try{const result=await uploadImageToServer(file,'clab_references');paths.push([result.subfolder,result.name].filter(Boolean).join('/'));}catch(error){errors.push(file.name+'：'+error.message);}
            add(target.workspace,paths,target.slot,target.token,target.outputs);
            notice(errors.length?'已添加 '+paths.length+' 个；'+errors.join('；'):'已添加 '+paths.length+' 个外部媒体。');
        }finally{uploading=false;}
    }
    fileInput.onchange=()=>{if(fileInput.files.length)void uploadFiles(fileInput.files,uploadTarget);fileInput.value='';uploadTarget=null;};
    const menu=document.createElement('div');menu.className='clab-filmstrip-cover-menu clab-external-menu';menu.setAttribute('popover','auto');root.append(menu);let menuAnchor;
    function showMenu(anchor,slot,event,record,outputs=[]){
        if(!event&&menuAnchor===anchor&&menu.matches(':popover-open')){menu.hidePopover();return;}menuAnchor=anchor;
        closePicker();menu.style.removeProperty('display');
        menu.innerHTML=record?(outputMode()?'<button type="button" data-external-apply'+(targets(null,true).length?'':' disabled')+'>应用到所选输出</button>':'')+'<button type="button" data-external-remove>移除此素材引用</button><button type="button" data-external-purge>移除引用及所有导入记录…</button>':'<button type="button" data-external-upload>添加计算机媒体</button><button type="button" data-external-server>添加服务器媒体</button>'+(root.dataset.reviewMode==='detail'?'<button type="button" data-external-cover>设为封面</button>':'');
        if(!record&&outputs.length&&['table','xy'].includes(root.dataset.reviewMode)){
            const selected=targets(null,true),scope=selected.some(item=>outputs.some(target=>target.workspaceId===item.workspaceId&&target.areaId===item.areaId))?[...outputs,...selected.filter(item=>!outputs.some(target=>target.workspaceId===item.workspaceId&&target.areaId===item.areaId))]:outputs;
            menu.insertAdjacentHTML('beforeend','<div class="clab-context-menu-divider"></div>'+renderOutputMenu({downloads:false}));
            callbacks.outputs.bindMenu(menu,scope);
        }
        menu.onclick=e=>{
            const button=e.target.closest('button');if(!button)return;menu.hidePopover();
            if(button.matches('[data-external-cover]'))callbacks.outputs.cover(outputs);
            if(button.matches('[data-external-upload]'))upload(slot,outputs);
            if(button.matches('[data-external-server]'))chooseServer(anchor,slot,outputs);
            if(button.matches('[data-external-apply]'))editHistory.transaction(()=>{
                const selected=gallery.selectedKeys(),records=callbacks.records().filter(item=>item.externalWorkspaceId&&(selected.has(record.key)?selected.has(item.key):item.key===record.key));
                const destination=targets(null,true);for(const workspace of callbacks.workspaces()){
                    const own=records.filter(item=>item.externalWorkspaceId===workspace.id);if(own.length)add(workspace,own.map(item=>item.externalPath),undefined,sequence,destination);
                }
            });
            if(button.matches('[data-external-purge]'))purgeReferences(record);
            if(button.matches('[data-external-remove]')){
                const selected=gallery.selectedKeys();removeReferences(selected.has(record.key)?[...selected]:[record.key]);
            }
        };
        if(!menu.matches(':popover-open'))menu.showPopover();
        const box=anchor.getBoundingClientRect();menu.style.left=Math.max(4,Math.min(event?.clientX??box.left,innerWidth-menu.offsetWidth-4))+'px';menu.style.top=Math.max(4,Math.min(event?.clientY??box.bottom,innerHeight-menu.offsetHeight-4))+'px';
    }
    root.addEventListener('click',event=>{
        const button=event.target.closest('[data-external-pick]');if(!button||!allowed())return;
        event.preventDefault();event.stopPropagation();
        if(menu.matches(':popover-open'))menu.hidePopover();
        if(button.dataset.externalPick==='computer')upload(button.dataset.externalTarget);
        else chooseServer(button,button.dataset.externalTarget);
    },true);
    root.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.matches(':popover-open')){event.preventDefault();event.stopPropagation();menu.hidePopover();}});
    const contextMenu=event=>{
        if(!allowed()||event.target.closest('input,textarea,select,[contenteditable=true]'))return;
        const thumb=event.target.closest('[data-external-key]'),slot=event.target.closest('.clab-compare-stage');
        let record=thumb?callbacks.records().find(item=>item.key===thumb.dataset.externalKey):root.dataset.reviewMode==='browse'&&center.contains(event.target)&&callbacks.active()?.externalWorkspaceId?callbacks.active():null;
        const outputs=targets(event.target);
        if(!record&&!slot&&!outputs.length)return;
        event.preventDefault();event.stopImmediatePropagation();
        if(record)showMenu(thumb||center,undefined,event,record);
        else showMenu(slot||event.target,slotAt(event),event,null,outputs);
    };
    root.addEventListener('contextmenu',event=>{if(!event.target.closest('.clab-glb-viewer'))contextMenu(event);},true);
    center.addEventListener('contextmenu',event=>{if(event.target.closest('.clab-glb-viewer'))contextMenu(event);});
    function slotAt(event){
        if(root.dataset.reviewMode!=='compare')return;
        const stage=center.querySelector('.clab-compare-stage');if(!stage)return callbacks.slot();
        const label=event.target.closest('[data-compare-slot]');if(label)return label.dataset.compareSlot;
        const bounds=stage.getBoundingClientRect();return (event.clientX-bounds.left)/bounds.width<callbacks.split()?'a':'b';
    }
    for(const region of [center,gallery.dock]){
    region.addEventListener('dragover',event=>{
        if(!allowed()||!([...event.dataTransfer.types].includes('Files')||outputMode()&&[...event.dataTransfer.types].includes('application/x-clab-external-images')))return;
        if(region===center&&outputMode()&&!targets(event.target).length){event.preventDefault();event.dataTransfer.dropEffect='none';return;}
        event.preventDefault();region.dataset.externalDrop='';const stage=region===center?center.querySelector('.clab-compare-stage'):null;if(stage)stage.dataset.dropSlot=slotAt(event);
    });
    region.addEventListener('dragleave',event=>{if(!region.contains(event.relatedTarget))delete region.dataset.externalDrop;});
    region.addEventListener('drop',event=>{
        if(!allowed())return;
        const outputs=region===center?targets(event.target):[];
        const internal=event.dataTransfer.getData('application/x-clab-external-images');
        if(outputMode()&&region===center&&!outputs.length){
            if(internal||[...event.dataTransfer.types].includes('Files')){event.preventDefault();event.stopImmediatePropagation();delete region.dataset.externalDrop;notice('请拖到已有任务的输出单元格、矩阵格子或明细表内容区。');}return;
        }
        if(internal&&outputMode()&&outputs.length){
            event.preventDefault();event.stopImmediatePropagation();delete region.dataset.externalDrop;
            let keys;try{keys=new Set(JSON.parse(internal));}catch{return;}
            for(const workspace of callbacks.workspaces()){const paths=callbacks.records().filter(record=>record.externalWorkspaceId===workspace.id&&keys.has(record.key)).map(record=>record.externalPath);if(paths.length)add(workspace,paths,undefined,sequence,outputs);}
            return;
        }
        if(![...event.dataTransfer.types].includes('Files'))return;
        event.preventDefault();event.stopImmediatePropagation();delete region.dataset.externalDrop;
        const slot=region===center?slotAt(event):undefined,stage=center.querySelector('.clab-compare-stage');if(stage)delete stage.dataset.dropSlot;
        void uploadFiles(event.dataTransfer.files,{workspace:owner(),slot,outputs,token:sequence});
    },true);
    }
    window.addEventListener('paste',event=>{
        if(!allowed()||!event.clipboardData||!root.contains(event.target)&&event.target!==document.body&&event.target!==document.documentElement||event.target.closest('input,textarea,select,[contenteditable=true]')||document.activeElement?.closest('input,textarea,select,[contenteditable=true]'))return;
        const files=[...event.clipboardData.files].filter(file=>accepted(file));if(!files.length)return;
        const outputs=outputMode()?targets(null,true):[];if(outputMode()&&!outputs.length){notice('请先选中已有任务的输出单元格、矩阵格子或明细表卡片。');return;}
        event.preventDefault();event.stopImmediatePropagation();void uploadFiles(files,{outputs,workspace:owner(),slot:root.dataset.reviewMode==='compare'?callbacks.slot():undefined,token:sequence});
    },true);
    return {render:gallery.render,hide:gallery.hide,entries:(all=false)=>externalMediaRecords(callbacks.workspaces().filter(workspace=>all||workspace.view.previewExternal?.enabled!==false),callbacks.label),
        suspend(){sequence++;closePicker();if(menu.matches(':popover-open'))menu.hidePopover();delete center.dataset.externalDrop;gallery.hide();}};
}
