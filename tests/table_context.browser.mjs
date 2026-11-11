import assert from 'node:assert/strict';

export async function runTableContextChecks({evaluate, click, point, send, sessionId, wait}) {
    await evaluate(`(async()=>{
        const {state,createEmptyWorkspace,getActiveWorkspace,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');
        window.beforeTableContext=getActiveWorkspace();
        const cards=Array.from({length:3},(_,i)=>({id:'ctx-row-'+i,title:'Task '+i,areas:[
            {id:'ctx-input-'+i,type:'edit',title:'Steps',targetNodeId:'141',targetWidget:'steps',dataType:'number',value:10+i},
            {id:'ctx-text-'+i,type:'edit',title:'Text',targetNodeId:'141',targetWidget:'text',value:'text '+i},
            {id:'ctx-output-'+i,type:'preview',title:'Image',targetNodeId:'142',history:['/view?filename=first.png'],historyIndex:0,
                resultUrl:'/view?filename=first.png',historyRuns:[{id:'ctx-run',areaIds:['ctx-output-'+i]}],
                inputHistorySnapshots:[[{sourceAreaId:'ctx-input-'+i}]]},
        ]}));
        window.tableContext=createEmptyWorkspace('右键菜单',{cards,view:{mode:'table'}});
        state.workspaces.push(window.tableContext);applyWorkspaceToState(window.tableContext);document.dispatchEvent(new Event('clab_render_ui'));
        window.contextGrid=()=>window.tableContext.view.table.sheets[0];
    })()`);
    await wait();
    const row = id => `[data-table-row="${id}"] [data-table-row-header]`;
    const column = id => `.clab-table-column[data-table-column="${id}"]`;
    const cell = (rowId, colId) => `[data-table-row="${rowId}"] [role=cell][data-table-column="${colId}"]`;
    const open = async selector => {
        const at = await point(selector);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...at},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'right',buttons:2,clickCount:1,...at},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'right',clickCount:1,...at},sessionId);
        await wait();
    };
    const action = async (selector, name) => {
        await open(selector);
        await click(`[data-table-action="${name}"]`);
        await wait();
    };
    const menu = () => evaluate("[...document.querySelectorAll('[data-table-action]')].map(item=>item.dataset.tableAction)");
    const tracks = axis => evaluate(`contextGrid().${axis}.map(item=>item.id)`);

    await open(cell('ctx-row-0','ctx-input-0'));
    assert.deepEqual(await menu(),['settings','before-row','after-row','delete-row','before-column','after-column','delete-column']);
    const rowBefore = await tracks('rows');
    await action(cell('ctx-row-0','ctx-input-0'),'before-row');
    const insertedRow = (await tracks('rows'))[0];
    assert.deepEqual((await tracks('rows')).slice(1,rowBefore.length+1),rowBefore);
    await action(cell('ctx-row-0','ctx-input-0'),'after-row');
    const below = (await tracks('rows'))[2];
    await action(cell(below,'ctx-input-0'),'delete-row');
    assert.equal((await tracks('rows')).includes(below),false);
    const columnsBefore = await tracks('columns');
    await action(cell('ctx-row-0','ctx-input-0'),'before-column');
    assert.deepEqual((await tracks('columns')).slice(1,columnsBefore.length+1),columnsBefore);
    await action(cell('ctx-row-0','ctx-input-0'),'after-column');
    const draft = (await tracks('columns'))[2];
    assert.equal((await tracks('columns'))[3],'ctx-text-0');
    await evaluate(`contextGrid().rows.find(row=>row.id==='ctx-row-0').values['${draft}']='draft';document.dispatchEvent(new Event('clab_render_ui'))`);
    await click(cell('ctx-row-0',draft));
    assert.equal(await evaluate(`!!document.querySelector('#tb-reset-table-columns')&&!document.querySelector('#tb-clone-btn,#tb-format-painter,#tb-btn-sync-params,.clab-auto-height')`),true);
    await click('#tb-reset-table-columns');
    assert.equal(await evaluate(`Object.hasOwn(contextGrid().rows.find(row=>row.id==='ctx-row-0').values,'${draft}')`),false);
    await action(cell('ctx-row-0',draft),'delete-column');
    assert.equal((await tracks('columns')).includes(draft),false);
    console.log('PASS table cell menus insert on every side, delete tracks, and reset unbound drafts through the compact toolbar');

    await evaluate(`window.tableContext.view.table.heights['ctx-row-0']=210;window.tableContext.view.table.widths['ctx-output-0']=345`);
    await action(row('ctx-row-0'),'copy-row');
    const copiedRow = (await tracks('rows'))[2];
    assert.notEqual(copiedRow,'ctx-row-0');
    assert.equal(await evaluate(`(()=>{const card=tableContext.cards.find(card=>card.id==='${copiedRow}'),image=card.areas.find(a=>a.type==='preview');return card.title==='Task 0'&&card.areas[0].value===10&&image.history[0].includes('first.png')&&image.historyRuns[0].areaIds[0]===image.id&&image.inputHistorySnapshots[0][0].sourceAreaId===card.areas[0].id&&tableContext.view.table.heights[card.id]===210;})()`),true);
    await action(column('ctx-output-0'),'copy-column');
    const outputAt = (await tracks('columns')).indexOf('ctx-output-0');
    const copiedColumn = (await tracks('columns'))[outputAt+1];
    assert.equal(await evaluate(`(()=>{const card=tableContext.cards.find(card=>card.id==='ctx-row-0'),image=card.areas.find(a=>a.tableColumnId==='${copiedColumn}');return image.targetNodeId==='142'&&image.history[0].includes('first.png')&&image.historyRuns[0].areaIds[0]===image.id&&tableContext.view.table.widths['${copiedColumn}']===345;})()`),true);
    await action(row('ctx-row-0'),'delete-before-row');
    assert.equal((await tracks('rows')).includes(insertedRow),false);
    await action(row(copiedRow),'delete-after-row');
    assert.deepEqual(await evaluate("tableContext.cards.map(card=>card.id)"),['ctx-row-0',copiedRow]);
    await action(column('ctx-output-0'),'delete-after-column');
    assert.equal((await tracks('columns')).includes(copiedColumn),false);
    await action(column('ctx-text-0'),'delete-before-column');
    assert.equal((await tracks('columns'))[0],'ctx-text-0');
    assert.equal(await evaluate("tableContext.cards.every(card=>!card.areas.some(area=>area.tableColumnId==='ctx-input-0'))"),true);
    await open(column('ctx-text-0'));
    assert.equal(await evaluate("document.querySelector('[data-table-action=delete-before-column]').getAttribute('aria-disabled')"),'true');
    console.log('PASS table header menus copy data, bindings, layouts and independent history references, and remove only the requested side');
    await evaluate(`(async()=>{
        const {state,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');
        applyWorkspaceToState(window.beforeTableContext);state.workspaces=state.workspaces.filter(item=>item!==window.tableContext);document.dispatchEvent(new Event('clab_render_ui'));
    })()`);
    return 2;
}
