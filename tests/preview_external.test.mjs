import test from 'node:test';
import assert from 'node:assert/strict';
import { addExternalMedia,externalMediaRecords,externalMediaPath } from '../web/components/contextmenu/content/preview_external_records.js';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';
import { createPreviewWorkspaceBundle } from '../web/components/contextmenu/content/preview_workspaces.js';
import { mediaDownloadFiles } from '../web/components/contextmenu/content/preview_downloads.js';
import { historyDestination } from '../web/components/history_context.js';

const workspace=id=>({id,name:id,cards:[],view:createWorkspaceView()});
test('external images retain nested paths, deduplicate additions and never create tasks',()=>{
    const w=workspace('one');
    const added=addExternalMedia(w,['refs\\中文 a.png','refs/中文 a.png','other.png']);
    assert.equal(added.length,2);assert.equal(w.cards.length,0);
    w.view.previewExternal.enabled=false;
    assert.equal(addExternalMedia(w,['other.png'])[0].id,added[1].id);
    assert.equal(w.view.previewExternal.enabled,true);
    w.view=createWorkspaceView(structuredClone(w.view));
    assert.equal(w.view.previewExternal.images.length,2);
    const record=externalMediaRecords([w],w=>w.name)[0],url=new URL(record.url,'http://local');
    assert.equal(url.searchParams.get('subfolder'),'refs');assert.equal(url.searchParams.get('filename'),'中文 a.png');
    assert.equal(url.searchParams.get('type'),'input');assert.equal(record.snapshot,null);assert.equal(record.parameters.size,0);
    assert.equal(record.externalWorkspaceId,w.id);
});
test('server references reject absolute, traversing, unsupported files and executable URLs',()=>{
    for(const path of ['../a.png','a/../a.png','/a.png','C:/a.png','https://a/b.png','javascript:a.png','a.exe','a.png\0.jpg',''])assert.equal(externalMediaPath(path),'',path);
    assert.equal(externalMediaPath('目录/a.svg'),'目录/a.svg');
});
test('folder-sized batches keep distinct reference identities even within the same clock tick',()=>{
    const w=workspace('batch'),now=Date.now,random=Math.random;
    try{
        Date.now=()=>123;Math.random=()=>.5;
        const images=addExternalMedia(w,Array.from({length:500},(_,index)=>'folder/'+index+'.png'));
        assert.equal(new Set(images.map(image=>image.id)).size,500);
    }finally{Date.now=now;Math.random=random;}
});
test('copied workspace reference IDs stay distinct in a combined preview and bundle commits preserve additions',()=>{
    const a=workspace('a');addExternalMedia(a,['a.png']);
    const b=structuredClone(a);b.id='b';
    const bundle=createPreviewWorkspaceBundle([a,b],w=>w.name);
    addExternalMedia(a,['new.png']);bundle.commit();
    assert.equal(a.view.previewExternal.images.length,2);assert.equal(b.view.previewExternal.images.length,1);
    const records=externalMediaRecords([a,b],w=>w.name);
    assert.equal(new Set(records.map(record=>record.key)).size,3);
    assert.equal(records.filter(record=>record.externalWorkspaceId==='b').length,1);
});
test('external-only download records have usable filenames without synthetic tasks or module numbering',()=>{
    const w=workspace('a');addExternalMedia(w,['refs/a.png']);
    assert.deepEqual(mediaDownloadFiles([],externalMediaRecords([w],w=>w.name)).map(file=>[file.base,file.extension]),[['reference-a','png']]);
});
test('external image undo remains in any preview mode and leaves the workspace for reference edits',()=>{
    const action={context:{surface:'preview',mode:'browse'},changes:[{kind:'set',path:['workspaces',{id:'w'},'view','previewExternal','images']}]};
    assert.deepEqual(historyDestination(action,{surface:'preview',mode:'compare'}),{surface:'preview',mode:'compare'});
    assert.deepEqual(historyDestination(action,{surface:'workspace',mode:'cards'}),{surface:'preview',mode:'browse'});
    assert.deepEqual(historyDestination(action,{surface:'preview',mode:'detail'}),{surface:'preview',mode:'detail'});
});

test('external media use existing image, video, audio, model and text categories',()=>{
    const w=workspace('types');addExternalMedia(w,['a.svg','b.m4v','c.opus','d.glb','e.md']);
    assert.deepEqual(externalMediaRecords([w],w=>w.name).map(record=>record.type),['image','video','audio','model','text']);
});
