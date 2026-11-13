import test from 'node:test';
import assert from 'node:assert/strict';
import {createWorkspaceView} from '../web/components/workspace_modes/view_state.js';
import {workspaceModeAllowed,previewModeAllowed,workspacePreviewMode,previewModeOnWorkspaceChange} from '../web/components/workspace_modes/mode_policy.js';

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
