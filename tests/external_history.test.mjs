import test from 'node:test';
import assert from 'node:assert/strict';
import {appendExternalHistory,removeExternalImports,reconcileExternalHistory} from '../web/components/modules/media_types/external_history.js';
import {remapPreviewHistory,selectPreviewHistory,pushPreviewHistoryEntry} from '../web/components/modules/media_types/media_utils.js';
import {collectPreviewRecords} from '../web/components/contextmenu/content/preview_records.js';
import {createEditHistory} from '../web/components/edit_history.js';
import {createWorkspaceView} from '../web/components/workspace_modes/view_state.js';
import {createPreviewWorkspaceBundle} from '../web/components/contextmenu/content/preview_workspaces.js';

const asset={id:'asset',url:'/view?filename=same.png&type=input&subfolder=refs'};
const fixture=()=>{
    const area={id:'output',type:'preview',history:['old.png','new.png'],historyIndex:0,resultUrl:'old.png'},card={id:'task',areas:[area]};
    const workspace={id:'ws',view:createWorkspaceView(),cards:[card],archivedTasks:[]};return {area,card,workspace,state:{activeWorkspaceId:'ws',workspaces:[workspace]}};
};
test('imports append after the newest record, retain duplicates and select the first newly imported image without restoring parameters',()=>{
    const {area,card}=fixture();card.areas.push({id:'input',type:'edit',value:'keep me'},{id:'peer',type:'preview',history:['peer.png'],historyIndex:0,resultUrl:'peer.png'});
    appendExternalHistory(area,[asset,asset],'ws');assert.deepEqual(area.history,['old.png','new.png',asset.url,asset.url]);assert.equal(area.historyIndex,2);
    const records=collectPreviewRecords([{card,area}]);assert.equal(records[2].run,null);assert.equal(records[2].snapshot,null);assert.equal(records[2].parameters.size,0);assert.ok(records[2].imported);assert.notEqual(records[2].key,records[3].key);
    globalThis.window={};selectPreviewHistory(card,area,3);assert.equal(card.areas[1].value,'keep me');assert.equal(card.areas[2].resultUrl,'peer.png');
});
test('undoing an import removes only that imported record, keeps newer generated results and restores it on redo',()=>{
    const {area,state}=fixture(),history=createEditHistory();history.clear(state);appendExternalHistory(area,[asset],'ws');history.record(state);
    globalThis.window={};pushPreviewHistoryEntry(area,'generated-later.png',{run:{id:'real-run',areaIds:[area.id]}});
    history.undo(state);assert.deepEqual(area.history,['old.png','new.png','generated-later.png']);assert.equal(area.resultUrl,'generated-later.png');
    history.redo(state);assert.deepEqual(area.history,['old.png','new.png',asset.url,'generated-later.png']);assert.equal(area.resultUrl,'generated-later.png');
});
test('cleanup matches asset identity within the supplied workspace, includes archived outputs and clears matching covers',()=>{
    const {area,card,workspace,state}=fixture();appendExternalHistory(area,[asset],'ws');
    const otherAsset={...asset,id:'different-asset'};appendExternalHistory(area,[otherAsset],'ws');
    const archived={id:'archived',areas:[{id:'archived-out',type:'preview'}]};workspace.archivedTasks.push(archived);appendExternalHistory(archived.areas[0],[asset],'ws');
    const imported=collectPreviewRecords([{card,area}])[2];workspace.view.previewDetail={covers:[[card.id,{areaId:area.id,recordKey:imported.key}]]};
    const second=structuredClone(workspace);second.id='other';state.workspaces.push(second);
    assert.deepEqual(removeExternalImports(workspace,[{workspaceId:'ws',assetId:'asset'}]),{count:2,covers:1,areas:[]});
    const history=createEditHistory();history.clear(state);removeExternalImports(workspace,[{workspaceId:'ws',assetId:'asset'}],true);history.record(state);
    assert.deepEqual(area.history,['old.png','new.png',asset.url]);assert.equal(area.externalImports[0].assetId,'different-asset');assert.equal(workspace.view.previewDetail.covers.length,0);assert.equal(archived.areas[0].history.length,0);assert.equal(second.cards[0].areas[0].history.length,4);
    history.undo(state,'ws');assert.equal(area.history.length,4);assert.equal(archived.areas[0].history.length,1);assert.equal(workspace.view.previewDetail.covers.length,1);
});
test('history reorder and ordinary deletion retain or remove import identities with their records',()=>{
    const {area}=fixture();appendExternalHistory(area,[asset],'ws');const id=area.externalImports[0].id;
    remapPreviewHistory(area,[2,0,1]);assert.equal(area.externalImports[0].position,0);assert.equal(area.historyRuns[0].externalImport.id,id);
    remapPreviewHistory(area,[1,2]);assert.equal(area.externalImports.length,0);reconcileExternalHistory(area);assert.deepEqual(area.history,['old.png','new.png']);
});
test('the generated history limit retains imports and background generation never becomes an import undo step',()=>{
    const {area,state}=fixture(),history=createEditHistory();globalThis.window={_clabMaxHistory:2};history.clear(state);
    appendExternalHistory(area,[asset],'ws');history.record(state);
    for(let i=0;i<4;i++)pushPreviewHistoryEntry(area,'new-'+i+'.png',{run:{id:'run-'+i}});
    assert.deepEqual(area.history,[asset.url,'new-2.png','new-3.png']);assert.equal(history.record(state),false);
    history.undo(state);assert.deepEqual(area.history,['new-2.png','new-3.png']);
    history.redo(state);assert.equal(area.history.length,3);assert.equal(area.history.filter(url=>url===asset.url).length,1);
});
test('combined preview projection preserves imported cover identities and commits them back without projection prefixes',()=>{
    const {area,card,workspace}=fixture();appendExternalHistory(area,[asset],'ws');
    const key=collectPreviewRecords([{card,area}]).at(-1).key;workspace.view.previewDetail={covers:[[card.id,{areaId:area.id,recordKey:key}]]};
    const copy=structuredClone(workspace);copy.id='copy';const bundle=createPreviewWorkspaceBundle([workspace,copy],workspace=>workspace.id);
    for(const group of bundle.groups){
        const card=group.projected.cards[0],area=card.areas[0],projectedKey=collectPreviewRecords([{card,area}]).at(-1).key;
        assert.equal(group.projected.view.previewDetail.covers[0][1].recordKey,projectedKey);
    }
    bundle.commit();assert.equal(workspace.view.previewDetail.covers[0][1].recordKey,key);assert.equal(copy.view.previewDetail.covers[0][1].recordKey,key);
});
