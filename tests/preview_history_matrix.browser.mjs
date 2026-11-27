import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runHistoryMatrixChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const settle=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js');ui.syncStateToActiveWorkspace();
        window.hm={ui,old:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces]};
        const task=(id,values)=>({id,title:id,areas:[{id:id+'-in',type:'edit',title:'步数',value:999},{id:id+'-out',type:'preview',title:'结果',targetNodeId:'2',history:values.map((_,i)=>'/view?filename='+id+'-'+i+'.png'),resultUrl:'/view?filename='+id+'-0.png',historyIndex:0,inputHistorySnapshots:values.map(v=>['steps','sampler','cfg'].map((name,i)=>({sourceAreaId:id+'-in',title:name,targetNodeId:'1',targetWidget:name,value:v[i]})))}]});
        hm.workspace=ui.createEmptyWorkspace('历史矩阵',{cards:[task('h-a',[[20,'Euler',5],[30,'Euler',5]]),task('h-b',[[20,'DPM',5],[20,'DPM',7]]),task('h-c',[[20,'Euler',5]])]});
        ui.state.workspaces.push(hm.workspace);ui.applyWorkspaceToState(hm.workspace);ui.state.selectedCardIds=hm.workspace.cards.map(card=>card.id);ui.appState.selectedWorkspaceIds=[hm.workspace.id];document.dispatchEvent(new Event('clab_render_ui'));
        hm.before=JSON.stringify(hm.workspace.cards);hm.xy=JSON.stringify(hm.workspace.view.xy);
        (await import('/extensions/clab/components/contextmenu/group_content.js')).openWorkspacePreview();
        hm.root=()=>document.querySelector('.clab-preview-modal.visible');hm.q=s=>hm.root()?.querySelector(s);hm.q('[data-review-mode=xy]').click();
    })()`);await settle();
    try{
        assert.equal(await evaluate(`!!hm.q('.clab-review-grid-stage .clab-xy-overlay')&&!hm.q('.clab-result-table')`),true,'card histories must use the shared XY canvas');
        assert.equal(await evaluate(`hm.root().querySelectorAll('.clab-review-grid-stage .clab-card').length`),3,'all selected task histories must share their parameter coordinates');
        assert.equal(await evaluate(`(()=>{const row=hm.q('.clab-review-xy-extra-visibility'),labels=[...row.querySelectorAll('label')],upper=[...hm.q('.clab-review-xy-visibility').querySelectorAll('label')].slice(-2);return labels.every((label,i)=>Math.abs(label.getBoundingClientRect().left-upper[i].getBoundingClientRect().left)<1)&&row.querySelectorAll('input:checked').length===2&&parseFloat(getComputedStyle(row).marginTop)>0&&parseFloat(getComputedStyle(row).marginBottom)>0;})()`),true,'extra visibility controls must default on, align in two columns and keep vertical spacing');
        await evaluate(`hm.q('[data-review-xy-history-labels]').click();hm.q('[data-review-xy-show=bindings][value=output]').click()`);await settle();
        await evaluate(`var filter=hm.q('[data-table-filter]');filter.value='7';filter.dispatchEvent(new Event('change',{bubbles:true}));`);await settle();
        assert.equal(await evaluate(`hm.root().querySelectorAll('.clab-review-grid-stage .clab-card').length`),1,'non-axis historical parameter filters must affect the canvas');
        assert.equal(await evaluate(`hm.q('.clab-xy-overlay>.clab-xy-history').hidden&&getComputedStyle(hm.q('[data-xy-part=output-binding]')).visibility==='hidden'&&!hm.q('[data-review-xy-history-labels]').checked&&!hm.q('[data-review-xy-show=bindings][value=output]').checked`),true,'history filtering must retain output-summary and history-label visibility');
        await evaluate(`var filter=hm.q('[data-table-filter]');filter.value='';filter.dispatchEvent(new Event('change',{bubbles:true}));`);await settle();
        await evaluate(`hm.q('[data-review-xy-history-labels]').click();hm.q('[data-review-xy-show=bindings][value=output]').click()`);await settle();
        assert.equal(await evaluate(`!hm.q('.clab-xy-overlay>.clab-xy-history').hidden&&getComputedStyle(hm.q('[data-xy-part=output-binding]')).visibility==='visible'`),true,'turning visibility back on did not restore both decorations');
        await evaluate(`var z=hm.q('[data-table-option=z]');z.value=JSON.stringify(['1','cfg']);z.dispatchEvent(new Event('change',{bubbles:true}));`);await settle();
        assert.equal(await evaluate(`hm.q('[data-table-option=zValue]').options.length===2&&!!hm.q('.clab-xy-empty')`),true,'Z slices and missing combinations must remain visible');
        const beforeZoom=await evaluate(`(()=>{const s=hm.q('.clab-review-grid-stage'),r=s.getBoundingClientRect();window.hmWheel={x:r.left+r.width*.6,y:r.top+r.height*.6};return hm.q('.clab-cards-wrapper').style.transform;})()`);
        const wheel=await evaluate('hmWheel');await send('Input.dispatchMouseEvent',{type:'mouseWheel',...wheel,deltaX:0,deltaY:-100},sessionId);await settle();
        assert.notEqual(await evaluate(`hm.q('.clab-cards-wrapper').style.transform`),beforeZoom,'history matrix canvas must zoom with the wheel');
        await evaluate(`hm.transform=hm.q('.clab-cards-wrapper').style.transform;var z=hm.q('[data-table-option=zValue]');z.value='7';z.dispatchEvent(new Event('change',{bubbles:true}));`);await settle();
        assert.equal(await evaluate(`hm.root().querySelectorAll('.clab-review-grid-stage .clab-card').length===1&&hm.q('.clab-cards-wrapper').style.transform===hm.transform`),true,'switching historical Z slices must preserve the camera');
        await evaluate(`hm.q('[data-review-xy-tiles]').click()`);await settle();
        assert.equal(await evaluate(`hm.root().querySelectorAll('.clab-xy-layer-title').length===2&&hm.root().querySelectorAll('.clab-review-grid-stage .clab-card').length===4`),true,'historical Z layers must tile on the shared canvas');
        if(process.env.CLAB_HISTORY_MATRIX_SCREENSHOT){const shot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(process.env.CLAB_HISTORY_MATRIX_SCREENSHOT,Buffer.from(shot.data,'base64'));}
        const exported=await evaluate(`(async()=>{const {capturePreviewLayout,renderLayoutPNG}=await import('/extensions/clab/components/contextmenu/content/preview_layout_export.js');const layout=await capturePreviewLayout(hm.q('.clab-review-grid-stage'),{transparent:true});try{return {axes:layout.outer.querySelectorAll('.clab-xy-axis').length,size:(await renderLayoutPNG(layout,1)).size};}catch(error){return {error:error.message,width:layout.width,height:layout.height};}})()`);
        assert.ok(exported.axes>0&&exported.size>1000,'historical exports must include the rendered matrix axes: '+JSON.stringify(exported));
        await evaluate(`var cell=[...hm.root().querySelectorAll('.clab-review-grid-stage .clab-card')].find(cell=>cell.querySelector(':scope > .clab-xy-history').textContent.endsWith('/2'));cell.dispatchEvent(new MouseEvent('click',{bubbles:true}));hm.q('.clab-review-grid-stage').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true,cancelable:true}));`);await settle();
        assert.equal(await evaluate(`hm.q('.clab-review-grid-stage .clab-card.selected > .clab-xy-history').textContent`),'1/2','grid history navigation must retain all records in a parameter combination');
        const names=await evaluate(`(async()=>{
            const native=HTMLAnchorElement.prototype.click;let archive;
            HTMLAnchorElement.prototype.click=function(){if(this.download==='XY矩阵-媒体.zip')archive=fetch(this.href).then(response=>response.arrayBuffer());else native.call(this);};
            try{hm.q('[data-review-download=selected]').click();for(let i=0;i<100&&!archive;i++)await new Promise(resolve=>setTimeout(resolve,10));if(!archive)return [];
                const bytes=await archive,view=new DataView(bytes),files=[];for(let offset=0;view.getUint32(offset,true)===0x04034b50;){const length=view.getUint16(offset+26,true);files.push(new TextDecoder().decode(new Uint8Array(bytes,offset+30,length)));offset+=30+length+view.getUint16(offset+28,true)+view.getUint32(offset+18,true);}return files;
            }finally{HTMLAnchorElement.prototype.click=native;}
        })()`);
        assert.deepEqual(names,['001-001-001.png'],'historical cell downloads must retain original task/module/history identifiers');
        await evaluate(`var source=hm.q('[data-table-option=source]');source.value=JSON.stringify(['h-b','h-b-out']);source.dispatchEvent(new Event('change',{bubbles:true}));`);await settle();
        assert.equal(await evaluate(`hm.root().querySelectorAll('.clab-review-grid-stage .clab-card').length`),2,'output-source filtering must preserve its own Z combinations');
        await evaluate(`hm.q('[data-review-xy-swap=xy]').click()`);await settle();
        assert.equal(await evaluate(`hm.q('[data-table-option=x]').value===JSON.stringify(['1','sampler'])&&hm.q('[data-table-option=y]').value===JSON.stringify(['1','steps'])`),true,'axis swapping must update the historical parameter choices');
        assert.equal(await evaluate(`JSON.stringify(hm.workspace.cards)===hm.before&&JSON.stringify(hm.workspace.view.xy)===hm.xy`),true,'history matrix viewing must not rewrite task content or workspace matrix data');
        await evaluate(`hm.q('.clab-preview-modal-close').click()`);await settle();
        assert.equal(await evaluate(`JSON.stringify(hm.workspace.cards)===hm.before`),true);
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
        console.log('PASS card histories use the XY canvas with grouped records, missing combinations, Z layers, zoom, rendered PNG axes and unchanged original tasks');
    }finally{
        await evaluate(`hm.q('.clab-preview-modal-close')?.click();hm.ui.state.workspaces=hm.workspaces;hm.ui.applyWorkspaceToState(hm.old);document.dispatchEvent(new Event('clab_render_ui'));`);
    }
}
