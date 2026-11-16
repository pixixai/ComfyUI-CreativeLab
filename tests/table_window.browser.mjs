import assert from 'node:assert/strict';
import { runTableScrollChecks } from './table_scroll.browser.mjs';

export async function runTableWindowChecks(send,sessionId){
    const evaluate=async expression=>{new Function(expression);const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,160))');
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js'),{tableWindow}=await import('/extensions/clab/components/workspace_modes/table_window.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js');
        ui.syncStateToActiveWorkspace();window.tw={ui,setWorkspaceMode,editHistory,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],execute:window.CLab.executeTasks,running:window.CLab.getRunningCardProgress};
        tw.node={id:812,type:'Sampler',widgets:Array.from({length:23},(_,i)=>({name:'p'+i,type:'number',value:i}))};window.testApp.graph._nodes.push(tw.node);
        tw.ws=ui.createEmptyWorkspace('参数表窗口',{cards:Array.from({length:100},(_,r)=>({id:'tw-row-'+r,title:'任务 '+r,areas:Array.from({length:24},(_,c)=>c===23?{id:'tw-'+r+'-'+c,type:'preview',title:'图像',targetNodeId:'2',history:['/view?filename=first.png'],resultUrl:'/view?filename=first.png',historyIndex:0}:{id:'tw-'+r+'-'+c,type:'edit',title:'参数 '+c,value:r*100+c,dataType:'number',targetNodeId:'812',targetWidget:'p'+c,targetWidgets:['812||p'+c],autoHeight:false})}))});
        ui.state.workspaces.push(tw.ws);ui.applyWorkspaceToState(tw.ws);document.dispatchEvent(new Event('clab_render_ui'));tw.panel=document.querySelector('#clab-panel');tw.container=tw.panel.querySelector('#clab-cards-container');tw.window=tableWindow(tw.container);tw.root=id=>tw.container.querySelector('[data-area-id="'+id+'"]');
        tw.start=performance.now();setWorkspaceMode(tw.panel,'table');tw.sync=performance.now()-tw.start;await new Promise(requestAnimationFrame);tw.firstFrame=performance.now()-tw.start;tw.sheet=tw.ws.view.table.sheets[0];
    })()`);await wait();
    try{
        const first=await evaluate(`({sync:tw.sync,firstFrame:tw.firstFrame,rows:tw.container.querySelectorAll('[data-table-row]').length,columns:tw.container.querySelectorAll('.clab-table-column').length,cells:tw.container.querySelectorAll('[role=cell]').length,height:tw.container.scrollHeight})`);
        assert.ok(first.rows<20&&first.columns<10&&first.cells<160,JSON.stringify(first));
        assert.equal(await evaluate(`tw.ws.cards.length===100&&tw.sheet.rows.length===100&&tw.sheet.columns.length===24&&!tw.root('tw-99-0')&&!tw.root('tw-0-23')&&Math.abs(tw.container.scrollHeight-(40+100*144+28))<3`),true);
        console.log('PASS 100×24 parameter table creates only its visible row/column window: '+JSON.stringify(first));
        await runTableScrollChecks(send,sessionId);
        await evaluate(`tw.editHistory.reset();tw.values=JSON.stringify(tw.ws.cards.map(card=>card.areas.map(area=>area.value)));tw.schema=JSON.stringify(tw.sheet);tw.cell=tw.root('tw-0-0');for(const type of ['pointerdown','pointerup'])tw.cell.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,button:0,pointerId:31}));document.activeElement?.blur();tw.container.scrollTop=tw.container.scrollHeight;`);await wait();
        assert.equal(await evaluate(`!!tw.root('tw-99-0')?.querySelector('.clab-table-number')&&!tw.root('tw-0-0')&&tw.values===JSON.stringify(tw.ws.cards.map(card=>card.areas.map(area=>area.value)))&&tw.schema===JSON.stringify(tw.sheet)`),true,'scrolling mounted all rows, changed data or failed to load the far window: '+JSON.stringify(await evaluate(`({top:tw.container.scrollTop,tail:tw.root('tw-99-0')?.outerHTML.slice(0,240),first:!!tw.root('tw-0-0'),values:tw.values===JSON.stringify(tw.ws.cards.map(card=>card.areas.map(area=>area.value))),schema:tw.schema===JSON.stringify(tw.sheet),rows:[...tw.container.querySelectorAll('[data-table-row]')].map(row=>row.dataset.tableRow)})`)));
        await evaluate(`tw.cell=tw.root('tw-99-2');for(const type of ['pointerdown','pointerup'])tw.cell.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,button:0,shiftKey:true,pointerId:32}));`);await wait();
        assert.equal(await evaluate(`tw.ui.state.selectedAreaIds.length===300&&tw.root('tw-99-2').classList.contains('active')`),true,'Shift selection omitted unloaded rows');
        await evaluate(`const data=new DataTransfer();data.setData('text/plain',${JSON.stringify('700\t701\t702\n800\t801\t802')});tw.root('tw-99-2').dispatchEvent(new ClipboardEvent('paste',{bubbles:true,cancelable:true,clipboardData:data}));`);await wait();
        assert.deepEqual(await evaluate(`tw.ws.cards.slice(0,2).map(card=>card.areas.slice(0,3).map(area=>area.value))`),[[700,701,702],[800,801,802]]);
        await evaluate(`document.activeElement?.blur();tw.panel.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'z',code:'KeyZ',ctrlKey:true}));`);await wait();
        assert.deepEqual(await evaluate(`tw.ws.cards.slice(0,2).map(card=>card.areas.slice(0,3).map(area=>area.value))`),[[0,1,2],[100,101,102]]);
        assert.equal(await evaluate(`tw.panel.dataset.workspaceMode==='table'&&tw.ws.cards.length===100`),true);
        console.log('PASS remote row scrolling preserves data; Shift rectangle selection, clipped paste and undo include unloaded cells');

        await evaluate(`tw.window.reveal('tw-row-0','tw-0-0');`);await wait();
        await evaluate(`tw.root('tw-0-0').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));tw.editor=document.activeElement;tw.container.scrollTop=tw.container.scrollHeight;`);await wait();
        assert.equal(await evaluate(`document.activeElement===tw.editor&&tw.editor.isConnected&&!!tw.root('tw-99-0')?.querySelector('.clab-table-number')&&tw.container.querySelectorAll('[data-table-row]').length<20`),true,'scrolling detached the active editor or broke the window around a pinned row');
        await evaluate(`document.activeElement.blur();tw.ws.view.table.heights['tw-row-0']=96;tw.ws.view.table.heights['tw-row-50']=220;document.dispatchEvent(new Event('clab_render_ui'));tw.window.reveal('tw-row-50');`);await wait();
        assert.equal(await evaluate(`Math.abs(tw.container.scrollHeight-(40+100*144-48+76+28))<3&&tw.container.querySelector('[data-table-row="tw-row-50"]').offsetHeight===220`),true,'variable row heights changed the table extent or displaced the target row');

        await evaluate(`document.activeElement?.blur();tw.window.reveal('tw-row-50','tw-50-22');`);await wait();
        await evaluate(`tw.root('tw-50-22').dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'Tab'}));`);await wait();
        assert.equal(await evaluate(`tw.ui.state.selectedAreaIds[0]==='tw-50-23'&&!!tw.root('tw-50-23')?.querySelector('img')&&tw.container.scrollLeft>1000&&tw.container.querySelectorAll('[data-table-row]').length<20`),true,'Tab could not navigate into an unloaded column');
        await evaluate(`tw.image=tw.root('tw-50-23').querySelector('img');tw.container.scrollTop+=80;`);await wait();
        assert.equal(await evaluate(`tw.root('tw-50-23').querySelector('img')===tw.image`),true,'scrolling recreated retained media');
        await evaluate(`document.activeElement?.blur();tw.ui.state.selectedAreaIds=['tw-0-0','tw-99-0'];tw.ui.state.selectedCardIds=[];tw.panel.querySelector('#clab-run-batch-count').value='1';window.CLab.executeTasks=tasks=>tw.queue=tasks;tw.panel.querySelector('#clab-btn-run').click();`);await wait();
        assert.deepEqual(await evaluate(`tw.queue.map(task=>task.cardId)`),['tw-row-0','tw-row-99']);
        console.log('PASS horizontal windows preserve media identity, navigate with Tab and run selected offscreen tasks');
        await evaluate(`window.CLab.getRunningCardProgress=id=>id===tw.ws.id?[{cardId:'tw-row-90',progress:40}]:[];document.dispatchEvent(new CustomEvent('clab_task_activity',{detail:{workspaceId:tw.ws.id,cardId:'tw-row-90'}}));`);await wait();
        assert.equal(await evaluate(`(()=>{const row=tw.container.querySelector('[data-table-row="tw-row-90"]'),ring=row?.querySelector('.clab-table-progress-ring'),box=row?.getBoundingClientRect(),view=tw.container.getBoundingClientRect();return ring?.style.width==='6144px'&&box.top>=view.top&&box.bottom<=view.bottom&&tw.ui.state.selectedAreaIds.length===2;})()`),true,'running row follow or full effective-row progress depended on mounted columns');
        await evaluate('window.CLab.getRunningCardProgress=tw.running');
        await evaluate(`tw.window.reveal('tw-row-70');tw.setWorkspaceMode(tw.panel,'cards');`);await wait();
        assert.equal(await evaluate(`tw.ws.cards.length===100&&tw.ws.cards.every(card=>card.areas.length===24)&&!tw.container.querySelector('[data-table-spacer]')&&!tw.container.querySelector('[data-clab-table-window]')`),true,'leaving the table leaked spacers or lost task modules');
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
    }finally{
        await evaluate(`window.CLab.executeTasks=tw.execute;window.CLab.getRunningCardProgress=tw.running;tw.ui.state.workspaces=tw.workspaces;tw.ui.applyWorkspaceToState(tw.original);window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>node!==tw.node);document.dispatchEvent(new Event('clab_render_ui'));`);
    }
}
