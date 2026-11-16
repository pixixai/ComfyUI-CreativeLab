import test from 'node:test';
import assert from 'node:assert/strict';
import {registerWorkspaceSurface,registerPreviewSurface,rememberPanelSurface,returnToWorkspace,togglePanelSurface} from '../web/components/panel_surface.js';

test('the toggle closes both surfaces, reopens the last surface and falls back after an invalid preview session',()=>{
    let workspace=false,preview=false,saved=false,valid=true;
    registerWorkspaceSurface({visible:()=>workspace,show:()=>workspace=true,hide:()=>workspace=false});
    registerPreviewSurface({visible:()=>preview,hide:()=>{preview=false;saved=true;},resume:()=>preview=saved&&valid});
    rememberPanelSurface('workspace');togglePanelSurface();assert.equal(workspace,true);
    preview=true;rememberPanelSurface('preview');togglePanelSurface();assert.equal(preview,false);assert.equal(workspace,false);
    togglePanelSurface();assert.equal(preview,true);assert.equal(workspace,false);
    preview=false;returnToWorkspace();assert.equal(workspace,true);togglePanelSurface();togglePanelSurface();assert.equal(workspace,true);assert.equal(preview,false);
    preview=true;togglePanelSurface();valid=false;togglePanelSurface();assert.equal(workspace,true);assert.equal(preview,false);
});
