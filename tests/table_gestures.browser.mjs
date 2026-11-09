import assert from 'node:assert/strict';

export async function runTableGestureChecks({evaluate,click,point,type,key,send,sessionId,wait}) {
    await evaluate(`(async()=>{const {state,createEmptyWorkspace,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');window.gestureOriginal=window.sheet;const columns=Array.from({length:6},(_,i)=>({id:'g-col-'+i,tableColumnId:'g-col-'+i,type:i===5?'preview':'edit',title:'',value:'',dataType:i===3?'number':'string',...(i===3?{targetNodeId:'141',targetWidget:'steps',targetWidgets:['141||steps'],targetNodeIds:['141']}:i===5?{targetNodeId:'142'}:{})}));window.gestureSheet=createEmptyWorkspace('表格拖动回归',{cards:[],view:{mode:'table',table:{sheets:[{id:'gesture-sheet',columns,rows:[10,20,30,''].map((value,i)=>({id:'g-row-'+i,values:{'g-col-3':value}}))}],sheetId:'gesture-sheet'}}});state.workspaces.push(window.gestureSheet);applyWorkspaceToState(window.gestureSheet);document.dispatchEvent(new Event('clab_render_ui'));})()`);await wait();
    const head=i=>`.clab-table-column[data-table-index="${i}"]`,cell=(r,c)=>`[data-table-row="g-row-${r}"] [data-table-index="${c}"]`,row=r=>`[data-table-row="g-row-${r}"] [data-table-row-header]`;
    const geometry=()=>evaluate(`(()=>{const s=window.gestureSheet.view.table.sheets[0];return s.rows.every(row=>{const root=document.querySelector('[data-table-row="'+row.id+'"]'),r=root.getBoundingClientRect(),cells=[...root.querySelectorAll('[role=cell]')];return cells.length===s.columns.length&&new Set(cells.map(c=>c.dataset.tableColumn)).size===s.columns.length&&cells.every(c=>Math.abs(c.getBoundingClientRect().top-r.top)<1&&Math.abs(c.getBoundingClientRect().height-r.height)<1);});})()`);
    const outside=()=>send('Input.dispatchMouseEvent',{type:'mouseMoved',x:30,y:30},sessionId);
    const moveTo=async selector=>send('Input.dispatchMouseEvent',{type:'mouseMoved',...await point(selector)},sessionId);
    const dnd=async(source,target,after=false)=>{
        await wait();const p=await point(source,true);await send('Input.dispatchMouseEvent',{type:'mouseMoved',...p},sessionId);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...p},sessionId);
        await evaluate(`(()=>{const source=document.querySelector(${JSON.stringify(source)}),target=document.querySelector(${JSON.stringify(target)}),r=target.getBoundingClientRect(),data=new DataTransfer(),x=${after?'r.right-2':'r.left+2'},y=${after?'r.bottom-2':'r.top+2'};for(const [e,type]of [[source,'dragstart'],[target,'dragover'],[target,'drop'],[source,'dragend']])e.dispatchEvent(new DragEvent(type,{bubbles:true,cancelable:true,dataTransfer:data,clientX:x,clientY:y}));})()`);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,...p},sessionId);await wait();
    };
    await outside();assert.equal(await geometry(),true,'sparse actual modules pushed earlier draft cells into a clipped second grid row');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('.clab-table-column[data-table-index="0"] .clab-table-column-top')).visibility==='hidden'&&document.querySelector('.clab-table-column[data-table-index="5"]').classList.contains('has-controls')`),true);
    await moveTo(cell(0,0));assert.equal(await evaluate(`getComputedStyle(document.querySelector('.clab-table-column[data-table-index="0"] .clab-table-column-top')).visibility==='visible'&&getComputedStyle(document.querySelector('.clab-table-column[data-table-index="1"] .clab-table-column-top')).visibility==='hidden'`),true);await outside();
    await moveTo(head(0));assert.equal(await evaluate(`getComputedStyle(document.querySelector('.clab-table-column[data-table-index="0"] .clab-table-column-top')).visibility==='visible'`),true);const edge=await point(head(0)+' [data-table-resize]');for(const [event,x]of [['mousePressed',edge.x],['mouseMoved',edge.x+12],['mouseReleased',edge.x+12]])await send('Input.dispatchMouseEvent',{type:event,button:event==='mouseMoved'?'none':'left',buttons:event==='mouseReleased'?0:1,clickCount:1,x,y:edge.y},sessionId);await outside();assert.equal(await evaluate(`window.gestureSheet.view.table.configured['g-col-0']&&getComputedStyle(document.querySelector('.clab-table-column[data-table-index="0"] .clab-table-column-top')).visibility==='visible'`),true);
    await click(head(1),0,true);await click('#tb-table-cell-settings');await click('[data-table-align="4"]');await key('Escape');await outside();assert.equal(await evaluate(`window.gestureSheet.view.table.alignments['g-col-1']===4&&getComputedStyle(document.querySelector('.clab-table-column[data-table-index="1"] .clab-table-column-top')).visibility==='visible'`),true);
    await click(head(2)+' .clab-module-binding-summary');await click('[data-node="141"]');await key('Escape');await outside();assert.equal(await evaluate(`document.querySelector('.clab-table-column[data-table-index="2"]').classList.contains('has-controls')`),true);
    assert.equal(await evaluate(`(()=>{const h=document.querySelector('.clab-table-column[data-table-index="1"]'),line=h.querySelector('.clab-table-column-top').getBoundingClientRect(),a=h.querySelector('[data-table-settings]').getBoundingClientRect(),b=h.querySelector('.clab-module-binding-summary').getBoundingClientRect();return Math.abs(a.left-line.left)<1&&Math.abs(b.right-line.right)<1&&b.left-a.right>5;})()`),true);
    console.log('PASS column titles and binding summaries stay at opposite edges while unused controls follow hover');

    const a=await point(cell(0,0)),b=await point(cell(1,2));await send('Input.dispatchMouseEvent',{type:'mouseMoved',...a},sessionId);await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...a},sessionId);await send('Input.dispatchMouseEvent',{type:'mouseMoved',buttons:1,x:b.x,y:b.y},sessionId);await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,x:b.x,y:b.y},sessionId);await wait();
    assert.equal(await evaluate(`(async()=>{const {state}=await import('/extensions/clab/components/ui_state.js');return state.selectedAreaIds.length===6&&state.selectedCardIds.length===0;})()`),true,'native mouse drag did not select a 2 by 3 cell rectangle');
    await click(row(0));await click(row(1),2);await dnd(row(0),'[data-table-row="g-row-2"]',true);assert.deepEqual(await evaluate(`window.gestureSheet.view.table.sheets[0].rows.slice(0,3).map(r=>r.id)`),['g-row-2','g-row-0','g-row-1']);
    await click(head(0),0,true);await click(head(1),2,true);await dnd(head(0),head(4),true);assert.deepEqual(await evaluate(`window.gestureSheet.view.table.sheets[0].columns.map(c=>c.id)`),['g-col-2','g-col-3','g-col-4','g-col-0','g-col-1','g-col-5']);
    assert.equal(await geometry(),true);assert.equal(await evaluate(`window.gestureSheet.cards.length===3&&window.gestureSheet.view.table.sheets[0].columns.length===6`),true);
    console.log('PASS native cell drag selects rectangles, and selected row/column groups move without collapsing the selection or inserting duplicate columns');

    await click(head(0),0,true);await dnd(head(0),head(4));assert.deepEqual(await evaluate(`window.gestureSheet.view.table.sheets[0].columns.map(c=>c.id)`),['g-col-1','g-col-3','g-col-4','g-col-0','g-col-2','g-col-5']);assert.equal(await geometry(),true);
    await click(head(1),0,true);await dnd(head(1),head(3));assert.deepEqual(await evaluate(`window.gestureSheet.view.table.sheets[0].columns.map(c=>c.id)`),['g-col-1','g-col-0','g-col-4','g-col-3','g-col-2','g-col-5']);assert.equal(await geometry(),true);
    await evaluate(`window.gestureIds=window.gestureSheet.cards.map(c=>[c.id,c.areas.map(a=>a.id)]);`);await click(cell(1,3),0,true);await key('Delete');
    assert.equal(await evaluate(`window.gestureSheet.cards.every((c,i)=>c.id===window.gestureIds[i][0]&&JSON.stringify(c.areas.map(a=>a.id))===JSON.stringify(window.gestureIds[i][1]))&&window.gestureSheet.cards.find(c=>c.id==='g-row-1').areas.find(a=>a.tableColumnId==='g-col-3').value===''`),true,'Delete removed modules instead of clearing selected values');assert.equal(await geometry(),true);
    await type(cell(0,1)+' textarea','a note');await key('Tab');assert.equal(await geometry(),true);await click(cell(0,0),0,true);assert.equal(await evaluate(`(async()=>{const {state}=await import('/extensions/clab/components/ui_state.js');return state.selectedAreaIds.length===1;})()`),true);
    console.log('PASS single columns swap positions, clearing actual inputs retains cells/modules, and sparse grids remain selectable after reorder and editing');

    await key('Escape');await click('#tb-table-cell-settings');
    assert.equal(await evaluate(`document.querySelector('[data-table-padding]').value`),'10, 10, 10, 10');
    await type('[data-table-padding]','3、7 11,15');await key('Enter');await key('Escape');
    assert.equal(await evaluate(`(()=>{const root=document.querySelector('[data-table-row="g-row-0"]'),a=getComputedStyle(root.querySelector('.clab-input-body')),b=getComputedStyle(root.querySelector('.clab-output-area'));return a.padding==='3px 15px 7px 11px'&&b.padding==='3px 15px 7px 11px';})()`),true);
    await click(head(3)+' [data-table-settings]');assert.equal(await evaluate(`(()=>{const p=document.querySelector('.clab-table-column-panel');return p.querySelector('.clab-binding-panel-head .clab-table-type-switch')&&!p.querySelector('[data-table-size],[data-table-align],[data-table-ratio]')&&p.querySelector('.clab-table-value-tools>.clab-table-value-format')&&!p.querySelector('[data-choice-count]');})()`),true);await key('Escape');
    assert.equal(await evaluate(`(()=>{const e=document.querySelector('#clab-cards-container');return ['rgb(68, 68, 68)','rgb(102, 102, 102)'].includes(getComputedStyle(e,'::-webkit-scrollbar-thumb').backgroundColor)&&getComputedStyle(e,'::-webkit-scrollbar-track').backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(e,'::-webkit-scrollbar-button').display==='none';})()`),true);
    console.log('PASS independent four-sided default padding, title-bar type switch, alignment caption, compact value tools and dark arrowless scrollbars');
    await key('Escape');await click('#tb-table-cell-settings');
    assert.equal(await evaluate(`(()=>{const q=s=>document.querySelector(s).getBoundingClientRect(),w=q('[data-table-size-field=width]'),h=q('[data-table-size-field=height]'),p=q('.clab-table-size-outline'),s=q('[data-table-ratio]');return w.top<h.top&&p.left>h.right&&s.top>p.bottom&&!document.querySelector('[data-table-ratio-target]')&&document.querySelector('.clab-table-selection-summary').textContent==='全表';})()`),true);
    await type('[data-table-size=height]','144');await key('Enter');
    await type('[data-table-size=width]','126');await key('Enter');
    assert.equal(await evaluate(`(()=>{const s=document.querySelector('[data-table-ratio]'),r=document.querySelector('.clab-table-size-outline').getBoundingClientRect();return Number(s.value)>7&&Number(s.value)<8&&s.getAttribute('aria-valuetext')==='7:8'&&Math.abs(r.width/r.height-7/8)<.01&&document.querySelectorAll('[data-table-ratio]').length===1&&!s.hasAttribute('list');})()`),true);
    const slider = await point('[data-table-ratio]');
    for (const [type,x] of [['mousePressed',slider.x],['mouseMoved',slider.x-45],['mouseReleased',slider.x-45]]) await send('Input.dispatchMouseEvent',{type,button:type==='mouseMoved'?'none':'left',buttons:type==='mouseReleased'?0:1,clickCount:1,x,y:slider.y},sessionId);
    assert.equal(await evaluate(`(()=>{const s=document.querySelector('[data-table-ratio]');const h=document.querySelector('[data-table-size=height]');return Number.isInteger(Number(s.value))&&h.value==='144';})()`),true);
    await type('[data-table-size=width]','192');await key('Enter');
    const initialPosition=await evaluate(`document.querySelector('[data-table-ratio]').value`);
    await click('[data-table-edge=right]');
    assert.deepEqual(await evaluate(`[document.querySelector('[data-table-ratio]').value,document.querySelector('[data-table-size=width]').value,document.querySelector('[data-table-size=height]').value,document.querySelector('[data-table-edge=right]').getAttribute('aria-pressed'),document.querySelector('[data-table-ratio]').getAttribute('aria-label')]`),[initialPosition,'192','144','true','按比例调整全表行高']);
    await click('[data-table-ratio]');
    assert.equal(await evaluate(`document.querySelector('[data-table-size=width]').value==='192'&&document.querySelector('[data-table-size=height]').value!=='144'`),true);
    await type('[data-table-size=height]','144');await key('Enter');await click('[data-table-align="4"]');await key('Escape');
    await click(head(3)+' [data-table-settings]');
    await type('[data-table-title=column]','批量 "提示词"');await key('Enter');await key('Escape');await click(head(3),0,true);await click('#tb-table-cell-settings');
    await type('[data-table-size=width]','220');await key('Enter');
    await type('[data-table-padding]','9、5');await key('Enter');await click('[data-table-align="8"]');await key('Escape');
    assert.equal(await evaluate(`(()=>{const h=document.querySelector('.clab-table-column[data-table-index="3"]');return h.querySelector('[data-table-settings]').textContent==='批量 "提示词"'&&h.querySelector('.clab-module-binding-label').textContent==='1 节点 · 1 参数'&&window.gestureSheet.cards.every(card=>card.areas.find(area=>area.tableColumnId==='g-col-3').title==='批量 "提示词"')&&document.querySelector('[data-table-row=g-row-0] [data-table-index="3"] .clab-area-title-input').value==='批量 "提示词"';})()`),true);
    const rename = async (value, finish) => {
        const p = await point(row(0));
        for (const clickCount of [1,2]) for (const type of ['mousePressed','mouseReleased']) await send('Input.dispatchMouseEvent',{type,button:'left',buttons:type==='mousePressed'?1:0,clickCount,x:p.x,y:p.y},sessionId);
        assert.equal(await evaluate(`document.activeElement.matches('[data-table-row-title]')&&!document.querySelector('.clab-table-column-panel')`),true);
        await type('[data-table-row-title]',value);await key(finish);
    };
    await rename('新任务标题','Enter');await rename('应被取消','Escape');
    assert.equal(await evaluate(`window.gestureSheet.cards.find(card=>card.id==='g-row-0').title`),'新任务标题');
    await click('#tb-table-cell-settings');
    assert.equal(await evaluate(`document.querySelector('[data-table-ratio]').getAttribute('aria-label')`),'按比例调整行高');
    await type('[data-table-size=height]','176');await key('Enter');
    await type('[data-table-padding]','6');await key('Enter');await click('[data-table-align="0"]');await key('Escape');
    await click(head(3),0,true);await click('#tb-table-cell-settings');
    await type('[data-table-padding]','5');await key('Enter');await click('[data-table-align="8"]');await key('Escape');
    await click(cell(0,3),0,true);await click(cell(1,2),2,true);await click('#tb-table-cell-settings');
    assert.equal(await evaluate(`document.querySelector('.clab-table-selection-summary').textContent==='已选 2 格 · 涉及 2 行、2 列'&&document.querySelector('[data-table-size=width]').value===''&&document.querySelector('[data-table-size=height]').value===''&&document.querySelector('[data-table-padding]').placeholder==='混合'`),true);
    await type('[data-table-size=width]','200');await key('Enter');
    await type('[data-table-size=height]','170');await key('Enter');
    await type('[data-table-padding]','4');await key('Enter');await click('[data-table-align="4"]');
    const crossing = () => evaluate(`[["g-row-0",3],["g-row-1",2],["g-row-0",2],["g-row-1",3],["g-row-2",1]].map(([row,col])=>{const a=document.querySelector('[data-table-row="'+row+'"] [data-table-index="'+col+'"]');return [a.style.getPropertyValue('--clab-table-padding'),a.style.getPropertyValue('--table-text'),a.offsetWidth,a.offsetHeight];})`);
    assert.deepEqual(await crossing(),[['4px 0px 0px 0px','center',200,170],['4px 0px 0px 0px','center',200,170],['6px 0px 0px 0px','left',200,170],['5px 0px 0px 0px','right',200,170],['3px 15px 7px 11px','center',192,144]]);
    await click('[data-table-layout-reset]');
    assert.deepEqual((await crossing()).slice(0,2),[['3px 15px 7px 11px','center',192,144],['3px 15px 7px 11px','center',192,144]]);
    assert.deepEqual((await crossing()).slice(2,4).map(entry=>entry.slice(0,2)),[['6px 0px 0px 0px','left'],['5px 0px 0px 0px','right']]);
    await key('Escape');await key('Escape');await click('#tb-table-cell-settings');await type('[data-table-padding]','7');await key('Enter');
    assert.ok((await crossing()).every(([padding])=>padding==='7px 0px 0px 0px'));
    await key('Escape');
    console.log('PASS selection settings resize affected tracks, style exactly the chosen cells, reset layout separately and rename rows inline');
    const selectionState = () => evaluate(`(async()=>{const {state}=await import('/extensions/clab/components/ui_state.js');return {
        selected:[...state.selectedAreaIds].sort(), rows:state.selectedCardIds,
        active:[...document.querySelectorAll('[role=cell].active')].map(cell=>cell.dataset.areaId).sort(),
        effective:[...document.querySelectorAll('[role=cell].is-effective')].map(cell=>cell.dataset.areaId).sort(),
        all:[...document.querySelectorAll('[role=cell]')].map(cell=>cell.dataset.areaId).sort(),
        corner:document.querySelector('[data-table-select-all]').getAttribute('aria-pressed')
    };})()`);
    await click(cell(0,3),0,true);await key('a',2);
    let info=await selectionState();assert.ok(info.effective.length>0&&info.effective.length<info.all.length);
    assert.deepEqual(info.selected,info.effective);assert.deepEqual(info.active,info.selected);
    await key('a',2);info=await selectionState();assert.deepEqual(info.selected,info.all);assert.equal(info.corner,'true');
    await key('A',10);info=await selectionState();assert.deepEqual([info.selected,info.active,info.rows,info.corner],[[],[],[],'false']);
    await click('[data-table-select-all]');info=await selectionState();assert.deepEqual(info.selected,info.all);
    await click('[data-table-select-all]');assert.deepEqual((await selectionState()).selected,[]);
    await click('[data-table-select-all]');await key('Escape');assert.deepEqual((await selectionState()).active,[]);
    await click('[data-table-select-all]');
    const blank = await evaluate(`(()=>{const box=document.querySelector('#clab-cards-container');box.scrollTop=box.scrollHeight;const b=box.getBoundingClientRect(),x=b.left+b.width/2,y=b.bottom-12;const target=document.elementFromPoint(x,y);return {x,y,isBlank:box.contains(target)&&!target.closest('[role=cell],.clab-table-head,.clab-card-title-bar,.clab-table-fixed-controls')};})()`);
    assert.equal(blank.isBlank,true);
    for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1,x:blank.x,y:blank.y},sessionId);
    assert.deepEqual((await selectionState()).selected,[]);

    const rightClick=async selector=>{
        const p=await point(selector);
        for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,button:'right',buttons:type==='mousePressed'?2:0,clickCount:1,...p},sessionId);
        await wait();
        return p;
    };
    await click(cell(0,3),0,true);await click(cell(1,2),2,true);const multiple=(await selectionState()).selected;
    const contextPoint=await rightClick(cell(0,3));
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('.clab-context-menu:has([data-table-context-settings]) .clab-context-menu-item')].map(item=>item.textContent)`),['单元格设置']);
    assert.deepEqual((await selectionState()).selected,multiple);
    await click('[data-table-context-settings]');
    assert.match(await evaluate(`document.querySelector('.clab-table-selection-summary').textContent`),/^已选 2 格/);
    assert.equal(await evaluate(`(()=>{const p=document.querySelector('.clab-table-cell-panel').getBoundingClientRect(),b=document.querySelector('#clab-panel').getBoundingClientRect();return Math.abs(p.left-Math.max(b.left+8,Math.min(${contextPoint.x},b.right-p.width-8)))<1&&Math.abs(p.top-Math.max(b.top+8,Math.min(${contextPoint.y},b.bottom-p.height-8)))<1;})()`),true);
    await key('Escape');await rightClick(cell(0,2));
    assert.equal((await selectionState()).selected.length,1);
    await key('Escape');assert.deepEqual((await selectionState()).active,[]);
    await type(cell(0,2)+' textarea','保留文字选择');await key('a',2);
    assert.equal(await evaluate(`(()=>{const f=document.activeElement;return f.value==='保留文字选择'&&f.selectionStart===0&&f.selectionEnd===f.value.length;})()`),true);
    assert.equal((await selectionState()).selected.length,1);
    console.log('PASS keyboard and corner select-all, all deselection paths, scoped right-click settings, and native text selection');
    await evaluate(`(async()=>{const {state,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');applyWorkspaceToState(window.gestureOriginal);state.workspaces=state.workspaces.filter(w=>w!==window.gestureSheet);document.dispatchEvent(new Event('clab_render_ui'));})()`);await wait();return 6;
}
