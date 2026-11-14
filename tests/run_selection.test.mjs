import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';

function harness(){
    const source=readFileSync(new URL('../web/components/actions/action_run_executor.js',import.meta.url),'utf8').replace(/^import .+;$/gm,'').replaceAll('export function','function');
    const state={cards:[{id:'a',areas:[{id:'in-a',type:'edit'},{id:'out-a',type:'preview'},{id:'out-a2',type:'preview'}]},{id:'b',areas:[{id:'in-b',type:'edit'},{id:'out-b',type:'preview'}]},{id:'empty',areas:[]}],selectedCardIds:[],selectedAreaIds:[],activeCardId:'b'};
    const context=vm.createContext({state});vm.runInContext(source,context);
    return {state,run:all=>JSON.parse(JSON.stringify(context.buildTasksQueue(all)))};
}
test('cards with no selection run every task with an output, ignoring a stale active card',()=>{
    const h=harness();assert.deepEqual(h.run(),[{cardId:'a',previewAreaIds:['out-a','out-a2']},{cardId:'b',previewAreaIds:['out-b']}]);
});
test('card input selection runs its whole task while output selection retains partial execution',()=>{
    const h=harness();h.state.selectedAreaIds=['in-a'];assert.deepEqual(h.run(),[{cardId:'a',previewAreaIds:['out-a','out-a2']}]);
    h.state.selectedAreaIds=['out-a2'];assert.deepEqual(h.run(),[{cardId:'a',previewAreaIds:['out-a2']}]);
});
test('explicit card selection remains scoped and Run All overrides the selection',()=>{
    const h=harness();h.state.selectedCardIds=['b'];assert.deepEqual(h.run(),[{cardId:'b',previewAreaIds:['out-b']}]);assert.equal(h.run(true).length,2);
});
test('selecting a task without an output does not silently run another active task',()=>{
    const h=harness();h.state.selectedCardIds=['empty'];assert.deepEqual(h.run(),[]);
});
