import { app } from '../../../../scripts/app.js';
import { state,appState } from '../ui_state.js';
import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { openXYPopover } from '../workspace_modes/xy_popover.js';
import { onModuleRemoved } from './module_lifecycle.js';
import { attachInputFileBrowser } from './input_file_browser.js';
import { ensureInputFileStyles } from './input_file_styles.js';
import { requestInputFileAction } from './input_file_actions.js';

const contexts=new WeakMap();
export function fileSelectHTML(area,card,kind){
    return `<div class="clab-custom-select clab-file-select" data-type="module-file" data-file-kind="${kind}" data-area-id="${esc(area.id)}" data-card-id="${esc(card.id)}" style="width:100%">
        <input type="text" class="clab-custom-select-value clab-upload-filename" value="${esc(area.value||'')}" title="${esc(area.value||'选择 input 文件夹中的文件')}" placeholder="选择或输入名称筛选…" aria-label="选择或筛选服务器文件" aria-haspopup="dialog" autocomplete="off"><span class="clab-custom-select-icon">▾</span>
    </div>`;
}

function nodeFileOptions(area){
    const [id,name]=area.targetWidgets?.[0]?.split('||')||[area.targetNodeId,area.targetWidget];
    const node=app.graph?.getNodeById(Number(id)),widget=node?.widgets?.find(widget=>widget.name===name);
    const definition={...node?.constructor?.nodeData?.input?.required,...node?.constructor?.nodeData?.input?.optional}[name];
    const options={...widget?.options,...definition?.[1]};
    const values=Array.isArray(definition?.[0])?definition[0]:Array.isArray(widget?.type)?widget.type:options.values||options.options;
    return Array.isArray(values)?values:[];
}

function openFiles(anchor){
    const context=contexts.get(anchor),card=context?.card||state.cards.find(card=>card.id===anchor.dataset.cardId),area=context?.area||card?.areas.find(area=>area.id===anchor.dataset.areaId);if(!area)return;
    const field=anchor.querySelector('input'),scope=requestInputFileAction(anchor,'file');let browser;
    const restore=()=>{browser?.destroy();field.value=scope?.mixed?'':area.value||'';field.title=scope?.label||field.value||'选择 input 文件夹中的文件';};
    const handle=openXYPopover(()=>anchor,'选择服务器文件'+(scope&&scope.targets.length+scope.skipped>1?' · '+scope.label:''),'<div class="clab-input-files-tree" role="radiogroup"></div>','clab-input-files','',anchor.closest('#clab-panel'),undefined,restore);
    const refresh=document.createElement('button');refresh.type='button';refresh.dataset.fileRefresh='';refresh.title='刷新文件列表';refresh.setAttribute('aria-label','刷新文件列表');refresh.textContent='↻';handle.popup.querySelector('.clab-binding-panel-head>span').after(refresh);
    browser=attachInputFileBrowser(handle.popup.querySelector('.clab-input-files-tree'),{
        kind:anchor.dataset.fileKind,options:nodeFileOptions(area),getSelected:()=>scope?.mixed?[]:area.value?[area.value]:[],
        onChange:values=>{
            if(scope){handle.close();field.blur();scope.apply(values[0]);return;}
            if(!context&&(!state.cards.includes(card)||!card.areas.includes(area)))return;
            area.value=values[0];handle.close();
            if(context){context.select(area.value);return;}
            state.selectedAreaIds=[area.id];state.selectedCardIds=[];appState.lastClickedAreaId=area.id;
            window._clabSurgicallyUpdateArea?.(area.id);window._clabJustSave?.();
        }
    });
    handle.popup.querySelector('[data-file-refresh]').onclick=()=>browser.refresh();return {...handle,filter:browser.filter};
}

export function attachFilePickers(container,context){
    ensureInputFileStyles();
    for(const anchor of container.querySelectorAll('.clab-file-select')){
        if(context)contexts.set(anchor,context);
        if(anchor.dataset.clabFileBound)continue;anchor.dataset.clabFileBound='1';let opened,skipClick=false;
        const field=anchor.querySelector('input'),show=()=>{if(!opened?.popup.isConnected)opened=openFiles(anchor);return opened;};
        const toggle=()=>{if(opened?.popup.isConnected){opened.close();opened=null;}else show();};
        anchor.onpointerdown=event=>{skipClick=event.target!==field&&!!opened?.popup.isConnected;if(skipClick){event.preventDefault();event.stopPropagation();opened.close();opened=null;}};
        anchor.addEventListener('mousedown',event=>event.stopPropagation());anchor.onclick=event=>{event.stopPropagation();if(skipClick){skipClick=false;return;}if(event.target===field){const wasOpen=!!opened?.popup.isConnected;show();field.focus({preventScroll:true});if(!wasOpen)field.select();}else toggle();};
        field.oninput=()=>show()?.filter(field.value);
        field.onkeydown=event=>{
            const item=()=>[...opened?.popup.querySelectorAll('[data-input-file]:not([hidden])')||[]].find(item=>item.getClientRects().length);
            if(event.key==='ArrowDown'){event.preventDefault();show();item()?.focus();}
            if(event.key==='Escape'){event.preventDefault();event.stopPropagation();opened?.close();}
            if(event.key==='Enter'){event.preventDefault();event.stopPropagation();if(opened?.popup.isConnected)item()?.click();else show();}
        };
        field.onblur=event=>{if(!opened?.popup.isConnected&&!anchor.contains(event.relatedTarget)){const scope=requestInputFileAction(anchor,'file'),area=contexts.get(anchor)?.area||state.cards.find(card=>card.id===anchor.dataset.cardId)?.areas.find(area=>area.id===anchor.dataset.areaId);field.value=scope?.mixed?'':area?.value||'';}};
        onModuleRemoved(anchor,()=>opened?.close());
    }
}
