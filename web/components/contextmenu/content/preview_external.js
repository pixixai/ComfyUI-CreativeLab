import { state } from '../../ui_state.js';
import { editHistory } from '../../edit_history_runtime.js';
import { uploadImageToServer } from '../../actions/action_data_io.js';
import { isUploadTypeMatch } from '../../modules/module_clipboard.js';
import { attachInputFileBrowser } from '../../modules/input_file_browser.js';
import { openXYPopover } from '../../workspace_modes/xy_popover.js';
import { addExternalImages,externalImageRecords } from './preview_external_records.js';
import { injectExternalStyles } from './preview_external_styles.js';
import { createExternalGallery } from './preview_external_gallery.js';

export function createPreviewExternal(root,callbacks){
    injectExternalStyles();
    const center=root.querySelector('.clab-preview-modal-center');
    const notice=text=>{root.querySelector('.clab-review-notice').textContent=text;};
    const allowed=()=>root.classList.contains('visible')&&['browse','compare'].includes(root.dataset.reviewMode);
    const owner=()=>callbacks.workspaces().find(workspace=>workspace.id===root.dataset.editWorkspaceId)||callbacks.workspaces()[0];
    let picker,sequence=0,uploading=false;
    const closePicker=()=>{picker?.close();picker=null;};
    const save=(workspace,viewOnly=false)=>{
        const persist=()=>window.CLab?.saveState(state,{createAnchor:false,workspaceIds:[workspace.id]});
        if(viewOnly)editHistory.withoutRecording(persist);else persist();
    };
    const keyFor=(workspace,image)=>JSON.stringify(['external',workspace.id,image.id]);
    const add=(workspace,paths,slot,token)=>{
        if(!state.workspaces.includes(workspace))return;
        const images=addExternalImages(workspace,paths);if(!images.length)return;
        save(workspace);
        if(token===sequence&&allowed()&&callbacks.workspaces().includes(workspace))callbacks.open(keyFor(workspace,images[0]),slot);
    };
    function chooseServer(anchor,slot){
        if(picker?.anchor===anchor){closePicker();return;}
        const multiple=!slot;
        slot??=root.dataset.reviewMode==='compare'?callbacks.slot():undefined;
        const workspace=owner(),token=sequence;if(!workspace)return;
        const chosen=new Set();let browser;
        closePicker();
        const handle=openXYPopover(()=>anchor,'选择服务器图像','<input type="search" data-external-search placeholder="输入名称筛选…" aria-label="筛选服务器图像"><div class="clab-input-files-tree"></div><div class="clab-external-picker-footer"><button type="button" data-external-refresh>刷新列表</button>'+(multiple?'<button type="button" data-external-confirm disabled>添加已选图像</button>':'')+'</div><p class="clab-review-note" data-external-error></p>','clab-input-files clab-external-picker','',root.querySelector('.clab-preview-modal-panel'),undefined,()=>{browser?.destroy();if(picker===handle)picker=null;});
        picker=handle;handle.anchor=anchor;
        const confirm=handle.popup.querySelector('[data-external-confirm]');
        const current=slot&&callbacks.records().find(record=>record.key===callbacks.assignment(slot))?.externalPath;
        browser=attachInputFileBrowser(handle.popup.querySelector('.clab-input-files-tree'),{kind:'image',multiple,getSelected:()=>multiple?[...chosen]:current?[current]:[],
            onChange:(paths,checked)=>{if(!multiple){handle.close();add(workspace,paths,slot,token);return;}for(const path of paths)if(checked)chosen.add(path);else chosen.delete(path);confirm.disabled=!chosen.size;confirm.textContent=chosen.size?'添加 '+chosen.size+' 张图像':'添加已选图像';},
            onBusy:()=>{if(confirm)confirm.disabled=browser?.busy||!chosen.size;},onError:error=>{handle.popup.querySelector('[data-external-error]').textContent=error.message;}});
        handle.popup.querySelector('[data-external-search]').oninput=event=>browser.filter(event.target.value);
        handle.popup.querySelector('[data-external-refresh]').onclick=()=>browser.refresh();
        if(confirm)confirm.onclick=()=>{if(browser.busy)return;handle.close();add(workspace,[...chosen],slot,token);};
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
    const gallery=createExternalGallery(root,{...callbacks,owner:()=>callbacks.workspaces().find(workspace=>workspace.id===state.activeWorkspaceId)||callbacks.workspaces()[0],remove:removeReferences,
        toggle(enabled,id){
            for(const workspace of callbacks.workspaces().filter(workspace=>!id||workspace.id===id)){
                const settings=workspace.view.previewExternal??={images:[],enabled:true};settings.enabled=enabled;save(workspace,true);
            }callbacks.refresh();
        },
        resize(workspace,height){if(!state.workspaces.includes(workspace))return;const settings=workspace.view.previewExternal??={images:[],enabled:true};settings.height=height;save(workspace,true);},
        columns(workspace,columns,persist=true){if(!state.workspaces.includes(workspace))return;const settings=workspace.view.previewExternal??={images:[],enabled:true};settings.columns=columns;if(persist)save(workspace,true);}
    });
    const fileInput=document.createElement('input');fileInput.type='file';fileInput.accept='image/*';fileInput.multiple=true;fileInput.hidden=true;root.append(fileInput);
    let uploadTarget;
    function upload(slot){uploadTarget={workspace:owner(),slot:slot??(root.dataset.reviewMode==='compare'?callbacks.slot():undefined),token:sequence};fileInput.value='';fileInput.click();}
    async function uploadFiles(files,target={workspace:owner(),slot:undefined,token:sequence}){
        const images=[...files].filter(file=>isUploadTypeMatch(file,'image'));
        if(!images.length){notice('请选择图片文件。');return;}
        if(uploading){notice('正在添加图像，请等待本次上传完成。');return;}
        if(!target.workspace)return;
        uploading=true;notice('正在添加 '+images.length+' 张图像…');
        const paths=[],errors=[];
        try{
            for(const file of images)try{const result=await uploadImageToServer(file,'clab_references');paths.push([result.subfolder,result.name].filter(Boolean).join('/'));}catch(error){errors.push(file.name+'：'+error.message);}
            add(target.workspace,paths,target.slot,target.token);
            notice(errors.length?'已添加 '+paths.length+' 张；'+errors.join('；'):'已添加 '+paths.length+' 张外部参考图。');
        }finally{uploading=false;}
    }
    fileInput.onchange=()=>{if(fileInput.files.length)void uploadFiles(fileInput.files,uploadTarget);fileInput.value='';uploadTarget=null;};
    const menu=document.createElement('div');menu.className='clab-filmstrip-cover-menu clab-external-menu';menu.setAttribute('popover','auto');root.append(menu);let menuAnchor;
    function showMenu(anchor,slot,event,record){
        if(!event&&menuAnchor===anchor&&menu.matches(':popover-open')){menu.hidePopover();return;}menuAnchor=anchor;
        closePicker();
        menu.innerHTML=record?'<button type="button" data-external-remove>移除外部图像引用</button>':'<button type="button" data-external-upload>上传本地图像</button><button type="button" data-external-server>选择服务器图像</button>';
        menu.onclick=e=>{
            const button=e.target.closest('button');if(!button)return;menu.hidePopover();
            if(button.matches('[data-external-upload]'))upload(slot);
            if(button.matches('[data-external-server]'))chooseServer(anchor,slot);
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
    root.addEventListener('contextmenu',event=>{
        if(!allowed()||event.target.closest('input,textarea,select,[contenteditable=true]'))return;
        const thumb=event.target.closest('[data-external-key]'),slot=event.target.closest('.clab-compare-stage');
        let record=thumb?callbacks.records().find(item=>item.key===thumb.dataset.externalKey):root.dataset.reviewMode==='browse'&&center.contains(event.target)&&callbacks.active()?.externalWorkspaceId?callbacks.active():null;
        if(!record&&!slot)return;
        event.preventDefault();event.stopImmediatePropagation();
        if(record)showMenu(thumb||center,undefined,event,record);
        else showMenu(slot,slotAt(event),event);
    },true);
    function slotAt(event){
        if(root.dataset.reviewMode!=='compare')return;
        const stage=center.querySelector('.clab-compare-stage');if(!stage)return callbacks.slot();
        const label=event.target.closest('[data-compare-slot]');if(label)return label.dataset.compareSlot;
        const bounds=stage.getBoundingClientRect();return (event.clientX-bounds.left)/bounds.width<callbacks.split()?'a':'b';
    }
    for(const region of [center,gallery.dock]){
    region.addEventListener('dragover',event=>{
        if(!allowed()||![...event.dataTransfer.types].includes('Files'))return;
        event.preventDefault();region.dataset.externalDrop='';const stage=region===center?center.querySelector('.clab-compare-stage'):null;if(stage)stage.dataset.dropSlot=slotAt(event);
    });
    region.addEventListener('dragleave',event=>{if(!region.contains(event.relatedTarget))delete region.dataset.externalDrop;});
    region.addEventListener('drop',event=>{
        if(!allowed()||![...event.dataTransfer.types].includes('Files'))return;
        event.preventDefault();event.stopImmediatePropagation();delete region.dataset.externalDrop;
        const slot=region===center?slotAt(event):undefined,stage=center.querySelector('.clab-compare-stage');if(stage)delete stage.dataset.dropSlot;
        void uploadFiles(event.dataTransfer.files,{workspace:owner(),slot,token:sequence});
    },true);
    }
    window.addEventListener('paste',event=>{
        if(!allowed()||!event.clipboardData||!root.contains(event.target)&&event.target!==document.body&&event.target!==document.documentElement||event.target.closest('input,textarea,select,[contenteditable=true]')||document.activeElement?.closest('input,textarea,select,[contenteditable=true]'))return;
        const files=[...event.clipboardData.files].filter(file=>isUploadTypeMatch(file,'image'));if(!files.length)return;
        event.preventDefault();event.stopImmediatePropagation();void uploadFiles(files,{workspace:owner(),slot:root.dataset.reviewMode==='compare'?callbacks.slot():undefined,token:sequence});
    },true);
    return {render:gallery.render,hide:gallery.hide,entries:()=>externalImageRecords(callbacks.workspaces().filter(workspace=>workspace.view.previewExternal?.enabled!==false),callbacks.label),
        suspend(){sequence++;closePicker();if(menu.matches(':popover-open'))menu.hidePopover();delete center.dataset.externalDrop;gallery.hide();}};
}
