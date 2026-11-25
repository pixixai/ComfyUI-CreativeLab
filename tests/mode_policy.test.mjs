import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspaceView} from '../web/components/workspace_modes/view_state.js';
import {workspaceModeAllowed,previewModeAllowed,workspacePreviewMode,previewModeOnWorkspaceChange} from '../web/components/workspace_modes/mode_policy.js';
import {createEmptyWorkspace,normalizeWorkspace} from '../web/components/ui_state.js';
import {newWorkspaceView} from '../web/components/workspace_preferences.js';

test('card-created workspaces can revisit both structured modes through cards without changing origin or name',()=>{
    let workspace=createEmptyWorkspace('工作区 2',{view:newWorkspaceView('cards')});
    for(const mode of ['table','cards','xy','cards','table']){
        assert.equal(workspaceModeAllowed(workspace.view,mode),true);
        workspace.view.mode=mode;
        workspace=normalizeWorkspace(JSON.parse(JSON.stringify(workspace)));
        workspace.view=createWorkspaceView(workspace.view);
        assert.equal(workspace.name,'任务卡片·2');assert.equal(workspace.view.creationMode,'cards');
        assert.equal(previewModeAllowed([workspace],'table'),true);assert.equal(previewModeAllowed([workspace],'xy'),true);
        if(mode!=='cards')assert.equal(workspaceModeAllowed(workspace.view,mode==='table'?'xy':'table'),false);
    }
});
test('explicit creation modes, copies and custom names survive normalization independently of the current view',()=>{
    for(const [mode,label]of [['table','参数表'],['xy','XY 矩阵']]){
        const workspace=createEmptyWorkspace('工作区 3',{view:newWorkspaceView(mode)});
        assert.equal(workspace.name,`${label}·3`);workspace.view.mode='cards';
        const copy=normalizeWorkspace(JSON.parse(JSON.stringify(workspace)));
        assert.equal(copy.name,workspace.name);assert.equal(copy.view.creationMode,mode);
        assert.equal(workspaceModeAllowed(copy.view,mode==='table'?'xy':'table'),false);
        copy.name='自定义工作区 8';copy.autoName=false;
        assert.equal(normalizeWorkspace(copy).name,copy.name);
    }
});
test('legacy structured modes retain restrictions while old automatic names become compact and custom names stay intact',()=>{
    const legacy=normalizeWorkspace({name:'工作区 7',autoName:true,view:{mode:'cards',structuredMode:'table'}});
    assert.equal(legacy.view.creationMode,'table');assert.equal(legacy.name,'参数表·7');
    assert.equal(workspaceModeAllowed(legacy.view,'xy'),false);
    assert.equal(normalizeWorkspace({name:'工作区 7',autoName:false,view:{mode:'xy'}}).name,'工作区 7');
});

for(const [mode,other]of [['table','xy'],['xy','table']])test(`${mode} workspaces keep their type through card view and persistence`,()=>{
    const view=createWorkspaceView({mode});assert.equal(workspaceModeAllowed(view,other),false);assert.equal(workspaceModeAllowed(view,'cards'),true);
    view.mode='cards';const restored=createWorkspaceView(JSON.parse(JSON.stringify(view)));
    assert.equal(workspaceModeAllowed(restored,other),false);assert.equal(workspaceModeAllowed(restored,mode),true);
});
test('workspace preview entry follows the current workspace mode, including card transit',()=>{
    for(const [mode,expected]of [['cards','browse'],['table','table'],['xy','xy']])assert.equal(workspacePreviewMode({view:{mode}}),expected);
    assert.equal(workspacePreviewMode({view:{mode:'cards',structuredMode:'table'}}),'browse');
});
test('mixed structured sources retain common preview modes and disable incompatible sheet modes',()=>{
    const sources=['table','xy'].map(mode=>({view:createWorkspaceView({mode})}));
    for(const mode of ['browse','compare','detail'])assert.equal(previewModeAllowed(sources,mode),true);
    for(const mode of ['table','xy'])assert.equal(previewModeAllowed(sources,mode),false);
    for(const mode of ['table','xy'])assert.equal(workspaceModeAllowed(createWorkspaceView(),mode),true);
});
test('compatible workspace switches preserve the current preview mode',()=>{
    const card={view:createWorkspaceView()},table={view:createWorkspaceView({mode:'table'})},xy={view:createWorkspaceView({mode:'xy'})};
    for(const mode of ['browse','compare','detail']){
        for(const workspace of [card,table,xy])assert.equal(previewModeOnWorkspaceChange(workspace,workspace,mode),mode);
        assert.equal(previewModeOnWorkspaceChange(card,table,mode),mode);
        assert.equal(previewModeOnWorkspaceChange(table,card,mode),mode);
        assert.equal(previewModeOnWorkspaceChange(card,xy,mode),mode);
        assert.equal(previewModeOnWorkspaceChange(xy,card,mode),mode);
    }
    assert.equal(previewModeOnWorkspaceChange(table,card,'table'),'table');
    assert.equal(previewModeOnWorkspaceChange(xy,card,'xy'),'xy');
    const tableCards={view:createWorkspaceView({mode:'cards',structuredMode:'table'})},xyCards={view:createWorkspaceView({mode:'cards',structuredMode:'xy'})};
    assert.equal(previewModeOnWorkspaceChange(tableCards,xyCards,'compare'),'compare');
    assert.equal(previewModeOnWorkspaceChange(tableCards,xyCards,'table'),'browse');
});
test('structured type conflicts or incompatible preview sheets use the destination default',()=>{
    const card={view:createWorkspaceView()},table={view:createWorkspaceView({mode:'table'})},xy={view:createWorkspaceView({mode:'xy'})};
    for(const mode of ['browse','compare','detail','table','xy']){
        assert.equal(previewModeOnWorkspaceChange(table,xy,mode),'xy');
        assert.equal(previewModeOnWorkspaceChange(xy,table,mode),'table');
    }
    assert.equal(previewModeOnWorkspaceChange(card,xy,'table'),'xy');
    assert.equal(previewModeOnWorkspaceChange(card,table,'xy'),'table');
});
