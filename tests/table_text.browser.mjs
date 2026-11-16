import assert from 'node:assert/strict';

export async function runTableTextChecks(send,sessionId) {
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=()=>evaluate('new Promise(resolve=>setTimeout(resolve,180))');
    const check=async(expression,message)=>assert.equal(await evaluate(expression),true,message+': '+JSON.stringify(await evaluate(expression)));
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js');
        ui.syncStateToActiveWorkspace();window.tt={ui,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],setWorkspaceMode};
        tt.node={id:884,type:'Text',widgets:[{name:'text',type:'text',value:''}]};window.testApp.graph._nodes.push(tt.node);
        tt.long=Array.from({length:25},(_,i)=>'第'+i+'行 long text 测试文字').join('\\n');
        const {createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');
        tt.ws=ui.createEmptyWorkspace('展开文字',{view:createWorkspaceView({table:{expandText:false}}),cards:Array.from({length:100},(_,i)=>({id:'tt-row-'+i,areas:[
            {id:'tt-text-'+i,type:'edit',title:'文字',value:i===0||i===90?tt.long:'短文字',dataType:'string',targetNodeId:'884',targetWidget:'text',targetWidgets:['884||text']},
            {id:'tt-image-'+i,type:'preview',title:'图片',targetNodeId:'2',resultUrl:'/view?filename=first.png',history:['/view?filename=first.png'],historyIndex:0},
            {id:'tt-out-'+i,type:'preview',title:'文字输出',targetNodeId:'2',resultKind:'text',textContent:i===1?'# 标题\\n'+tt.long:'短文字',textPreviewMarkdown:i===1,textLoadState:'ready',history:[],historyIndex:-1},
            {id:'tt-file-'+i,type:'edit',title:'加载图像',value:'input.png',targetNodeId:'4',targetWidget:'image',targetWidgets:['4||image'],showUploadPreview:true}
        ]}))});
        ui.state.workspaces=[...ui.state.workspaces,tt.ws];ui.applyWorkspaceToState(tt.ws);document.dispatchEvent(new Event('clab_render_ui'));
        tt.panel=document.querySelector('#clab-panel');tt.container=tt.panel.querySelector('#clab-cards-container');setWorkspaceMode(tt.panel,'table');tt.sheet=tt.ws.view.table.sheets[0];
        tt.cell=id=>tt.container.querySelector('[data-area-id="'+id+'"]');tt.row=id=>tt.container.querySelector('[data-table-row="'+id+'"]');
        tt.render=()=>document.dispatchEvent(new Event('clab_render_ui'));
    })()`);await wait();
    try {
        await evaluate(`tt.image=tt.cell('tt-image-0').querySelector('img');tt.imageSize=tt.image.getBoundingClientRect().height;tt.upload=tt.cell('tt-file-0').querySelector('.clab-upload-preview');tt.uploadSize=tt.upload.getBoundingClientRect().height;tt.base=tt.row('tt-row-0').offsetHeight;
            tt.ui.state.selectedAreaIds=[];tt.ui.state.selectedCardIds=[];tt.panel.querySelector('#tb-table-cell-settings').click();
            tt.toggle=document.querySelector('.clab-table-cell-panel [data-table-expand-text]');tt.toggle.click();`);await wait();
        await check(`tt.toggle.checked&&tt.sheet.expandText===true&&tt.row('tt-row-0').offsetHeight>tt.base+200&&tt.row('tt-row-2').offsetHeight===tt.base`,'overflow rows grow while short rows retain manual height');
        await check(`tt.cell('tt-image-0').querySelector('img')===tt.image&&Math.abs(tt.image.getBoundingClientRect().height-tt.imageSize)<2`,'expansion must retain the existing image and its original frame');
        await check(`tt.cell('tt-file-0').querySelector('.clab-upload-preview')===tt.upload&&Math.abs(tt.upload.getBoundingClientRect().height-tt.uploadSize)<3`,'file-input preview retains its original height');
        await check(`(()=>{const t=tt.cell('tt-text-0').querySelector('textarea');return t.scrollHeight<=t.clientHeight+2;})()`,'expanded input has no clipped text');
        await check(`(()=>{const b=tt.cell('tt-out-1').querySelector('.clab-text-body-scroll');return b.scrollHeight<=b.clientHeight+2;})()`,'expanded text output has no clipped content');
        await evaluate(`document.querySelector('.clab-table-cell-panel .clab-xy-popup-close')?.click();document.body.click();
            tt.container.scrollTop=tt.container.scrollHeight;`);await wait();
        await check(`tt.container.querySelectorAll('[data-table-row]').length<20&&!tt.row('tt-row-0')`,'expanded table remains virtualized');
        await evaluate(`(async()=>{const {tableWindow}=await import('/extensions/clab/components/workspace_modes/table_window.js');tableWindow(tt.container).reveal('tt-row-90');})()`);await wait();
        await check(`tt.row('tt-row-90').offsetHeight>tt.base+200`,'offscreen rows use expanded heights before being mounted');
        await evaluate(`tt.ws.cards[90].areas[0].value='超长文字\\n'.repeat(160);window._clabSurgicallyUpdateArea('tt-text-90');`);await wait();
        await check(`tt.row('tt-row-90').offsetHeight>2000&&tt.cell('tt-text-90').querySelector('textarea').scrollHeight<=tt.cell('tt-text-90').querySelector('textarea').clientHeight+2`,'automatic expansion must show text beyond the manual height limit');
        await evaluate(`tt.ws.cards[90].areas[0].value='短';window._clabSurgicallyUpdateArea('tt-text-90');`);await wait();
        await check(`tt.row('tt-row-90').offsetHeight===tt.base`,'shortened text shrinks back to manual minimum');
        console.log('PASS text expansion preserves row minima, media identity and size, and virtualized offscreen row geometry');

        await evaluate(`(async()=>{
            const {createPreviewParameterGrid}=await import('/extensions/clab/components/contextmenu/content/preview_parameter_grid.js');
            tt.host=document.createElement('div');tt.host.style.cssText='position:fixed;inset:60px 20px;z-index:999999;background:#181818;display:grid;grid-template-columns:180px 1fr 320px';
            tt.host.innerHTML='<div class="tt-left"></div><div class="tt-center" style="overflow:auto"></div><div class="tt-right" style="overflow:auto"></div>';document.body.append(tt.host);
            tt.center=tt.host.querySelector('.tt-center');tt.grid=createPreviewParameterGrid(tt.center,tt.host.firstElementChild,tt.host.lastElementChild,()=>{},'');
            tt.grid.open(tt.ws);tt.grid.mount();tt.preview=id=>tt.center.querySelector('[data-review-cell="'+id+'"]');
        })()`);await wait();
        await check(`tt.host.querySelector('[data-table-expand-text]').checked&&tt.preview('tt-text-0').offsetHeight>tt.base+200`,'preview shares persisted expansion settings');
        await evaluate(`tt.host.querySelector('[data-table-expand-text]').click();`);await wait();
        await check(`tt.sheet.expandText===false&&tt.preview('tt-text-0').offsetHeight===tt.base`,'disabling expansion restores manual row height');
        await check(`(()=>{const t=tt.preview('tt-text-0').querySelector('textarea');return t.readOnly&&!t.closest('[inert]')&&t.scrollHeight>t.clientHeight+100;})()`,'preview editors must be read-only and scrollable');
        const point=await evaluate(`(()=>{const t=tt.preview('tt-text-0').querySelector('textarea'),r=t.getBoundingClientRect();return {x:r.left+30,y:r.top+30};})()`);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseWheel',deltaX:0,deltaY:120,...point},sessionId);await wait();
        await check(`tt.preview('tt-text-0').querySelector('textarea').scrollTop>0`,'native wheel scrolls preview text');
        await evaluate(`tt.grid.revealHistory({areaId:'tt-text-0'});tt.host.querySelector('[data-table-expand-text]').click();`);await wait();
        await check(`!!tt.sheet.cellAppearance?.[JSON.stringify(['tt-row-0',tt.sheet.columns[0].id])]?.expandText.value&&tt.preview('tt-text-0').offsetHeight>tt.base+200&&tt.preview('tt-out-1').offsetHeight===tt.base`,'preview expansion can target a single selected cell');
        const exported=await evaluate(`(async()=>{const {capturePreviewLayout,renderLayoutPNG}=await import('/extensions/clab/components/contextmenu/content/preview_layout_export.js');
            tt.grid.selectSources('row',false);const input=tt.host.querySelector('[data-grid-filter=row]');input.checked=true;tt.grid.filter(input);
            const layout=await capturePreviewLayout(tt.center.querySelector('.clab-review-grid-stage'));const text=layout.outer.querySelector('.clab-table-static-text');
            const blob=await renderLayoutPNG(layout,1),bitmap=await createImageBitmap(blob);const result={height:layout.height,pngHeight:bitmap.height,fullText:text.textContent===tt.long,editors:layout.outer.querySelectorAll('textarea').length};bitmap.close();return result;})()`);
        assert.ok(exported.height>await evaluate('tt.base')+200,JSON.stringify(exported));assert.equal(exported.height,exported.pngHeight);assert.equal(exported.fullText,true);assert.equal(exported.editors,0);
        console.log('PASS preview text scrolls natively, selected-cell expansion persists, and PNG exports retain the full expanded layout without editors');
        await evaluate(`tt.grid.selectSources('row',true);tt.fetch=window.fetch;window.fetch=(url,...args)=>String(url).includes('tt-long.txt')?new Promise(resolve=>setTimeout(()=>resolve(new Response(tt.long)),80)):tt.fetch(url,...args);
            const a=tt.ws.cards[2].areas[2];Object.assign(a,{history:['/view?filename=first.txt','/view?filename=tt-long.txt'],historyIndex:0,resultUrl:'/view?filename=first.txt',textContent:'short',textHistory:['short',null],textHistoryStatus:['ready','idle']});
            tt.grid.refreshExternal([a.id]);tt.grid.revealHistory({areaId:a.id});tt.grid.applySetting('setAppearance',['expandText',true]);
            tt.center.querySelector('.clab-review-grid-stage').dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowRight'}));`);await wait();
        await check(`tt.preview('tt-out-2').offsetHeight>tt.base+200&&tt.preview('tt-out-2').querySelector('.clab-text-body-content').textContent===tt.long`,'asynchronously loaded text records update expanded preview rows');
        await evaluate(`window.fetch=tt.fetch;tt.grid.revealHistory({areaId:'tt-out-2'});tt.grid.applySetting('setAppearance',['expandText',false]);`);

        await evaluate(`tt.grid.release();tt.host.remove();tt.render();`);await wait();
        await evaluate(`(async()=>{const {tableWindow}=await import('/extensions/clab/components/workspace_modes/table_window.js');tableWindow(tt.container).reveal('tt-row-0');})()`);await wait();
        await check(`tt.row('tt-row-0').offsetHeight>tt.base+200&&tt.row('tt-row-1').offsetHeight===tt.base`,'preview cell expansion returns to workspace unchanged');
        await evaluate(`tt.cell('tt-text-0').dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));const t=tt.cell('tt-text-0').querySelector('textarea');t.value='new short value';t.dispatchEvent(new Event('input',{bubbles:true}));`);await wait();
        await check(`tt.row('tt-row-0').offsetHeight===tt.base&&tt.ws.cards[0].areas[0].value==='new short value'`,'typing updates row height without waiting for mode changes');
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
    } finally {
        await evaluate(`if(tt.fetch)window.fetch=tt.fetch;tt.grid?.release();tt.host?.remove();tt.ui.state.workspaces=tt.workspaces;tt.ui.applyWorkspaceToState(tt.original);window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>node!==tt.node);document.dispatchEvent(new Event('clab_render_ui'));`);
    }
}


