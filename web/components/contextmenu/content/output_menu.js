import { saveAndRender } from '../../ui_state.js';
import { clearPreviewHistory,getMediaType,loadAllTextHistory,loadSelectedTextContent,loadTextHistoryEntry,removePreviewHistoryIndex,syncTextContentWithSelection } from '../../modules/media_types/media_utils.js';
import { getHistoryArr,getHistoryIdx,getCurrentUrl,getHistoryIndexForUrl } from './history_helpers.js';
import { ensureUniqueDownloadName } from './shared.js';
import { buildDownloadFilename,downloadFile,openAssetWithSystem,probeMissingAndFallback,showAutoToast } from './runtime_services.js';
import { bindDownloadActions } from './actions_download.js';
import { bindOpenActions } from './actions_open.js';
import { bindHistoryActions } from './actions_history.js';
import { bindMaintenanceActions } from './actions_maintenance.js';

export function renderOutputMenu({modules=false,node=false,downloads=true}={}){
    const groups=[
        modules?[['select-same','选择相同模块'],['del-same','删除相同模块']]:[],
        [['remove','移除当前记录'],['clear','清空所有历史记录']],
        [['remove-external','移除所有外部引用记录']],
        [['clean-dead','清理失效记录'],['resync','重新同步记录']],
        node?[['toggle-node-bypass','绕过节点']]:[],
        [['open-explorer','在资源管理器查看'],...(downloads?[['download','下载'],['download-all','打包下载所有历史']]:[])],
    ].filter(group=>group.length);
    return groups.map(group=>group.map(([id,label])=>`<div class="clab-context-menu-item${id==='del-same'?' clab-danger':''}" id="clab-ctx-${id}" role="menuitem" tabindex="0">${label}</div>`).join('')).join('<div class="clab-context-menu-divider"></div>');
}
export function bindOutputActions({menuEl,selectedAreaObjs,mainObj,onChanged,beforeAction,mainCurrentUrl,previewModalApi}={}){
    const outputs=selectedAreaObjs.filter(item=>item.area.type==='preview');if(!outputs.length||!mainObj)return;
    bindDownloadActions({menuEl,selectedAreaObjs:outputs,getCurrentUrl,getHistoryArr,getHistoryIdx,getHistoryIndexForUrl,buildDownloadFilename,ensureUniqueDownloadName,downloadFile});
    bindOpenActions({menuEl,selectedAreaObjs:outputs,mainObj,mainCurrentUrl:mainCurrentUrl??getCurrentUrl(mainObj.area),mainHistoryIdx:getHistoryIdx(mainObj.area),previewModalApi,openAssetWithSystem,showAutoToast});
    bindHistoryActions({menuEl,selectedAreaObjs:outputs,getHistoryArr,getHistoryIdx,removePreviewHistoryIndex,loadSelectedTextContent,clearPreviewHistory,syncTextContentWithSelection,saveAndRender,onChanged});
    bindMaintenanceActions({menuEl,selectedAreaObjs:outputs,getHistoryArr,getMediaType,loadTextHistoryEntry,removePreviewHistoryIndex,syncTextContentWithSelection,loadSelectedTextContent,saveAndRender,loadAllTextHistory,probeMissingAndFallback,showAutoToast,onChanged});
    const hasCurrent=outputs.some(item=>!!(item.displayUrl??getCurrentUrl(item.area)));
    const hasHistory=outputs.some(item=>getHistoryArr(item.area).some(Boolean)||getCurrentUrl(item.area));
    const enabled={remove:hasCurrent,clear:hasHistory,'remove-external':outputs.some(item=>item.area.historyRuns?.some(run=>run?.externalImport)),
        'clean-dead':hasHistory,resync:hasHistory,'open-explorer':!!(mainCurrentUrl??getCurrentUrl(mainObj.area)),download:hasCurrent,'download-all':hasHistory};
    for(const [id,available]of Object.entries(enabled))if(!available){const item=menuEl.querySelector('#clab-ctx-'+id);if(item){item.setAttribute('aria-disabled','true');item.tabIndex=-1;item.onclick=null;}}
    for(const item of menuEl.querySelectorAll('.clab-context-menu-item')){
        const invoke=item.onclick;if(!invoke)continue;
        item.onclick=event=>{if(menuEl.matches(':popover-open'))menuEl.hidePopover();beforeAction?.();return invoke(event);};
        item.onkeydown=event=>{if(event.key==='Enter'||event.key===' '){event.preventDefault();event.stopPropagation();item.click();}};
    }
}
