import test from 'node:test';
import assert from 'node:assert/strict';
import { createEditHistory } from '../web/components/edit_history.js';
import { state, createEmptyWorkspace, buildPersistedState, serializePersistedState } from '../web/components/ui_state.js';
import { createWorkspaceView } from '../web/components/workspace_modes/view_state.js';

function fixture(){
    return {activeWorkspaceId:'a',workspaces:['a','b'].map(id=>createEmptyWorkspace(id,{id,view:createWorkspaceView(),cards:Array.from({length:100},(_,i)=>({id:'card'+i,areas:Array.from({length:8},(_,j)=>({id:'area'+i+'-'+j,type:'edit',value:20}))}))}))};
}
test('a scoped input edit reads only its changed module and leaves other workspaces and large views untouched',()=>{
    const data=fixture(),history=createEditHistory(),ws=data.workspaces[0],target=ws.cards[0].areas[0];
    let otherModules=0,otherWorkspace=0,tableReads=0;
    Object.defineProperty(ws.cards[99].areas[7],'value',{enumerable:true,get(){otherModules++;return 20;}});
    Object.defineProperty(data.workspaces[1].cards[99].areas[7],'value',{enumerable:true,get(){otherWorkspace++;return 20;}});
    const view=ws.view.table;Object.defineProperty(ws.view,'table',{enumerable:true,get(){tableReads++;return view;}});
    history.clear(data);otherModules=otherWorkspace=tableReads=0;target.value=30;
    history.record(data,{workspaceIds:['a'],cardsOnly:true,cardIds:['card0'],areaIds:['area0-0']});
    // The current sheet ID is read once, without walking its row/column data.
    assert.equal(otherModules,0);assert.equal(otherWorkspace,0);assert.ok(tableReads<=1);
    history.undo(data,'a');assert.equal(target.value,20);history.redo(data,'a');assert.equal(target.value,30);
});

test('scoped records do not lose later full edits, structural changes or independent workspace redo',()=>{
    const data=fixture(),history=createEditHistory();history.clear(data);const [a,b]=data.workspaces;
    a.cards[0].areas[0].value=30;history.record(data,{workspaceIds:['a'],cardsOnly:true,cardIds:['card0'],areaIds:['area0-0']});
    a.cards.push({id:'new',areas:[]});a.view.xy.x.values=[1,2];history.record(data,{workspaceIds:['a']});
    b.cards[0].areas[0].value=40;history.record(data,{workspaceIds:['b']});
    history.undo(data,'a');assert.equal(a.cards.length,100);assert.deepEqual(a.view.xy.x.values,[]);assert.equal(a.cards[0].areas[0].value,30);assert.equal(b.cards[0].areas[0].value,40);
    history.undo(data,'a');assert.equal(a.cards[0].areas[0].value,20);history.redo(data,'a');history.redo(data,'a');assert.equal(a.cards.length,101);
    history.undo(data,'b');assert.equal(b.cards[0].areas[0].value,20);assert.equal(a.cards[0].areas[0].value,30);
});

test('workspace JSON reuse skips unchanged workspaces and preserves complete persistence including hidden histories',()=>{
    const previous={...state};
    try{
        const data=fixture();Object.assign(state,data,{cards:data.workspaces[0].cards});
        const [a,b]=state.workspaces,cache=new Map();b.archivedTasks.push({id:'archived',areas:[{id:'out',type:'preview',history:['/saved.png']}]});
        let reads=0;const view=b.view;Object.defineProperty(b,'view',{enumerable:true,get(){reads++;return view;}});
        const initial=serializePersistedState(cache);assert.deepEqual(JSON.parse(initial),buildPersistedState());reads=0;
        a.cards[0].areas[0].value=45;const result=serializePersistedState(cache,['a']);assert.equal(reads,0);
        assert.equal(JSON.parse(result).workspaces[1].archivedTasks[0].areas[0].history[0],'/saved.png');assert.deepEqual(JSON.parse(result),buildPersistedState());
        b.cards[0].areas[0].value=80;const forced=serializePersistedState(cache);assert.equal(JSON.parse(forced).workspaces[1].cards[0].areas[0].value,80);
        state.workspaces.splice(1,1);serializePersistedState(cache,['a']);assert.equal(cache.size,1);
        state.workspaces.push(createEmptyWorkspace('replacement',{id:'b'}));assert.equal(JSON.parse(serializePersistedState(cache,['a'])).workspaces[1].name,'replacement');
    }finally{Object.assign(state,previous);}
});
