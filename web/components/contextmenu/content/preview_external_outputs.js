import { bindOutputActions } from './output_menu.js';
import { getMediaType,loadSelectedTextContent } from '../../modules/media_types/media_utils.js';
import { state } from '../../ui_state.js';
import { appendExternalHistory,removeExternalImports } from '../../modules/media_types/external_history.js';
import { projectPreviewValue } from './preview_workspaces.js';

const mediaFields=['history','historyRuns','externalImports','inputHistorySnapshots','historyIndex','resultUrl','resultKind','missingHistoryRun','textHistory','textHistoryStatus','textContent','textLoadState','selectedThumbIndices'];
export function createExternalOutputs(callbacks){
    const resolve=target=>{
        const workspace=state.workspaces.find(workspace=>workspace.id===target.workspaceId),card=workspace?.cards.find(card=>card.id===target.cardId),area=card?.areas.find(area=>area.id===target.areaId&&area.type==='preview');
        return area?{workspace,card,area}:null;
    };
    function refresh(changed){
        const ids=new Set();
        for(const {workspace,area}of changed){
            const group=callbacks.bundle()?.groups.find(group=>group.id===workspace.id);
            const projected=group?.projected.cards.flatMap(card=>card.areas).find(item=>(group.reverse.get(item.id)||item.id)===area.id);
            if(projected)Object.assign(projected,projectPreviewValue(Object.fromEntries(mediaFields.filter(key=>key in area).map(key=>[key,area[key]])),group.reverse));
            if(workspace.id===state.activeWorkspaceId){const root=document.querySelector(`#clab-panel .clab-area[data-area-id="${CSS.escape(area.id)}"]`);if(root)root.dataset.clabPendingRefresh='';}
            ids.add(projected?.id||area.id);
        }
        callbacks.refresh(ids);
    }
    return {
        targets(element,selection=false){
            return callbacks.api()?.externalTargets(element,selection).map(({card,area,display=area})=>{
                const workspaceId=card.previewWorkspace?.id||state.activeWorkspaceId,group=callbacks.bundle()?.groups.find(group=>group.id===workspaceId);
                return {workspaceId,cardId:group?.reverse.get(card.id)||card.id,areaId:group?.reverse.get(area.id)||area.id,index:display.historyIndex,url:display.resultUrl};
            }).filter(resolve)||[];
        },
        bindMenu(menuEl,targets){
            callbacks.commit();
            const resolved=targets.map(target=>({target,output:resolve(target)})).filter(item=>item.output);
            const selectedAreaObjs=resolved.map(({target,output})=>({...output,displayUrl:target.url}));if(!selectedAreaObjs.length)return;
            bindOutputActions({menuEl,selectedAreaObjs,mainObj:selectedAreaObjs[0],mainCurrentUrl:targets[0].url,
                beforeAction(){for(const {target,output}of resolved){
                    const area=output.area,index=area.history?.[target.index]===target.url?target.index:area.history?.indexOf(target.url);
                    if(index>=0){area.historyIndex=index;area.resultUrl=area.history[index];area.missingHistoryRun=null;}
                    else if(!target.url){area.historyIndex=-1;area.resultUrl='';}
                }},
                onChanged(){
                    const current=resolved.filter(({target,output})=>resolve(target)?.area===output.area).map(({output})=>output);
                    refresh(current);callbacks.commit();
                    const workspaceIds=[...new Set(current.map(item=>item.workspace.id))];
                    window.CLab?.saveState(state,{createAnchor:false,workspaceIds});
                    const areaIds=current.filter(item=>item.workspace.id===state.activeWorkspaceId).map(item=>item.area.id);
                    if(areaIds.length)window._clabRefreshContextView?.({areaIds});
                },
            });
        },
        cover(targets){
            const ids=new Set(targets.map(target=>{
                const group=callbacks.bundle()?.groups.find(group=>group.id===target.workspaceId);
                return group?[...group.reverse].find(([,id])=>id===target.areaId)?.[0]:target.areaId;
            }));callbacks.api()?.setExternalCover?.(ids);callbacks.commit();
        },
        append(images,workspace,targets){
            callbacks.commit();
            const changed=[];
            for(const target of targets){const output=resolve(target);if(!output)continue;appendExternalHistory(output.area,images,workspace.id);changed.push(output);}
            refresh(changed);
            for(const output of changed)if(getMediaType(output.area.resultUrl)==='text')void loadSelectedTextContent(output.area,{refresh:false}).then(loaded=>{
                if(loaded&&state.workspaces.includes(output.workspace)){refresh([output]);window.CLab?.saveState(state,{createAnchor:false,workspaceIds:[output.workspace.id]});}
            });
            return [...new Set(changed.map(item=>item.workspace.id))];
        },
        remove(workspace,references,confirmed=false){
            callbacks.commit();
            const result=removeExternalImports(workspace,references,confirmed);
            if(confirmed){
                const changed=[...workspace.cards,...workspace.archivedTasks||[]].flatMap(card=>card.areas.filter(area=>result.areas.includes(area.id)).map(area=>({workspace,area})));
                // Keep bundle session covers consistent before detail saves its session again.
                const group=callbacks.bundle()?.groups.find(group=>group.id===workspace.id);
                if(group?.projected.view.previewDetail){const valid=new Set((workspace.view.previewDetail?.covers||[]).map(([id])=>id));group.projected.view.previewDetail.covers=group.projected.view.previewDetail.covers.filter(([id])=>valid.has(group.reverse.get(id)||id));}
                refresh(changed);
            }
            return result;
        },
    };
}
