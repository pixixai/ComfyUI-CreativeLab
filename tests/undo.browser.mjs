import assert from 'node:assert/strict';

export async function runUndoBrowserChecks(send, sessionId) {
    const result = await send('Runtime.evaluate', {
        expression: `(async()=>{
            const {state,buildPersistedState}=await import('/extensions/clab/components/ui_state.js');
            const {StateManager}=await import('/extensions/clab/state_manager.js');
            const app=window.testApp,graph=app.graph,nodes=graph._nodes;
            const config=nodes.find(node=>node.type==='CLab_SystemConfig'),widget=config.widgets.find(widget=>widget.name==='scenes_data');
            const textarea=document.createElement('textarea');textarea.value=widget.value;
            widget.element=textarea;widget.options={getValue:()=>textarea.value,setValue:value=>{textarea.value=value;}};
            Object.defineProperty(widget,'value',{get(){return this.options.getValue();},set(value){this.options.setValue(value);}});
            app.extension.nodeCreated({type:'',constructor:{comfyClass:'CLab_SystemConfig'},widgets:config.widgets});
            const saved=buildPersistedState(),workspace=saved.workspaces.find(workspace=>workspace.id===saved.activeWorkspaceId);
            workspace.view.xy.panX+=10;
            const json=JSON.stringify(saved),images=[...document.querySelectorAll('#clab-panel .clab-card img')],ids=state.cards.map(card=>card.id);
            let loaded=0,cleared=0;
            const onLoaded=()=>loaded++,onCleared=()=>cleared++;
            document.addEventListener('clab_state_loaded',onLoaded);document.addEventListener('clab_state_cleared',onCleared);
            const completed=new Promise(resolve=>document.addEventListener('clab_state_loaded',()=>requestAnimationFrame(resolve),{once:true}));
            graph._nodes=[];
            graph.clear();
            const clearedDuringConfigure=cleared;
            graph._nodes=nodes;widget.value=json;
            app.extension.nodeCreated(config);app.extension.loadedGraphNode(config);
            window.CLab.saveState(state);
            const preservedSnapshot=widget.value===json;
            await completed;await new Promise(resolve=>setTimeout(resolve,150));
            document.removeEventListener('clab_state_loaded',onLoaded);document.removeEventListener('clab_state_cleared',onCleared);
            return {loaded,cleared,clearedDuringConfigure,preservedSnapshot,
                compactStorage:textarea.value===''&&textarea.readOnly&&graph.serialize().nodes[0].widgets_values[0]===json,
                sameTasks:JSON.stringify(ids)===JSON.stringify(state.cards.map(card=>card.id)),
                sameImages:images.length>0&&images.every(image=>image.isConnected&&document.getElementById(image.id)===image),
                panRestored:state.workspaces.find(workspace=>workspace.id===state.activeWorkspaceId).view.xy.panX===workspace.view.xy.panX};
        })()`,
        awaitPromise: true, returnByValue: true,
    }, sessionId);
    assert.equal(result.exceptionDetails, undefined, JSON.stringify(result.exceptionDetails));
    assert.deepEqual(result.result.value, {
        loaded: 1, cleared: 0, clearedDuringConfigure: 0, preservedSnapshot: true, compactStorage: true,
        sameTasks: true, sameImages: true, panRestored: true,
    });
    console.log('PASS workflow undo restores the completed XY graph once, protects its snapshot and retains task/image identities');
    return 1;
}
