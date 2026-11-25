import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runPreviewAvatarChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const settle=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js');ui.syncStateToActiveWorkspace();
        window.av={ui,previous:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces]};
        av.workspace=ui.createEmptyWorkspace('avatar export test',{cards:[{id:'avatar-task',title:'任务标题',areas:[
            {id:'avatar-text',type:'edit',title:'文字',dataType:'string',value:'text',targetNodeId:'1',targetWidget:'text',targetWidgets:['1||text']},
            {id:'avatar-output',type:'preview',title:'输出标题',targetNodeId:'2',history:['/view?filename=first.png','/view?filename=second.png'],historyIndex:0,resultUrl:'/view?filename=first.png'}
        ]}]});
        ui.state.workspaces.push(av.workspace);ui.applyWorkspaceToState(av.workspace);ui.appState.selectedWorkspaceIds=[av.workspace.id];document.dispatchEvent(new Event('clab_render_ui'));
        av.open=()=>import('/extensions/clab/components/contextmenu/group_content.js').then(m=>m.openWorkspacePreview());await av.open();
        av.root=()=>document.querySelector('.clab-preview-modal.visible');av.q=s=>av.root().querySelector(s);
    })()`);await settle();
    try{
        assert.deepEqual(await evaluate(`(()=>{const a=av.q('.clab-source-cover'),r=a.getBoundingClientRect();return [r.width,r.height,a.dataset.index];})()`),[32,32,'1']);
        const point=await evaluate(`(()=>{const r=av.q('.clab-filmstrip-thumb[data-index="0"]').getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};})()`);
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point},sessionId);await settle();
        assert.equal(await evaluate(`getComputedStyle(av.q('[data-filmstrip-cover="0"]')).opacity==='1'`),true,'hovering a non-cover history must reveal its cover button');
        await evaluate(`av.q('[data-filmstrip-cover="0"]').click();av.q('.clab-filmstrip-thumb[data-index="1"]').click();av.q('.clab-source-cover').click();av.q('[data-detail-pool-record="0"]').click()`);await settle();
        assert.equal(await evaluate(`av.q('.clab-detail-pool-popover')!==null&&av.workspace.cards[0].areas[1].historyIndex===1&&av.q('.clab-source-cover').dataset.index==='0'`),true,'cover pool must stay open and select an independent preview cover');
        await evaluate(`av.q('[data-detail-pool-close]').click();av.q('.clab-preview-modal-main-image').dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,clientX:610,clientY:310}));av.q('[data-review-cover]').click()`);await settle();
        assert.equal(await evaluate(`av.q('.clab-source-cover').dataset.index==='1'`),true,'browse canvas context menu must set the preview cover');
        await evaluate(`av.q('[data-filmstrip-cover="0"]').click();av.q('.clab-preview-modal-close').click();av.open()`);await settle();
        assert.equal(await evaluate(`av.q('.clab-source-cover').dataset.index==='0'&&av.workspace.cards[0].areas[1].historyIndex===1`),true,'pinned preview cover must survive reopening without changing workspace history selection');
        await evaluate(`av.q('[data-review-mode=compare]').click()`);await settle();
        for(const fraction of [.25,.75]){
            const point=await evaluate(`(()=>{const r=av.q('.clab-compare-stage').getBoundingClientRect();return {x:r.left+r.width*${fraction},y:r.top+r.height*.5};})()`);
            await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'right',buttons:2,clickCount:1,...point},sessionId);
            await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'right',buttons:0,clickCount:1,...point},sessionId);await settle();
            const box=await evaluate(`(()=>{const r=av.q('.clab-external-menu').getBoundingClientRect();return {x:r.left,y:r.top,open:av.q('.clab-external-menu').matches(':popover-open')};})()`);
            assert.equal(box.open,true);assert.ok(Math.abs(box.x-point.x)<1&&Math.abs(box.y-point.y)<1,'A/B context menu must be positioned at the pointer');
            await evaluate(`av.q('.clab-external-menu').hidePopover()`);
        }
        await evaluate(`av.q('.clab-filmstrip-thumb[data-index="0"]').click();av.q('.clab-filmstrip-thumb[data-index="1"]').click()`);await settle();
        assert.equal(await evaluate(`av.workspace.cards[0].areas[1].historyIndex===1&&av.q('.clab-source-cover').dataset.index==='0'`),true,'A/B selection must not replace the workspace current record or preview cover');
        await evaluate(`av.q('[data-review-mode=detail]').click()`);await settle();
        assert.equal(await evaluate(`av.q('[data-detail-source] > summary .clab-detail-source-preview')!==null&&!av.q('.clab-detail-source-preview').classList.contains('is-stacked')`),true,'detail avatar must live beside the task title without an automatic cover');
        const titleBefore=await evaluate(`(()=>{const a=av.q('.clab-detail-source-preview').getBoundingClientRect(),t=av.q('[data-detail-task-name]').getBoundingClientRect();return {left:t.left,gap:t.left-a.right,width:a.width};})()`);
        assert.equal(titleBefore.width,32);
        await evaluate(`av.root().querySelectorAll('[data-detail-cover]')[1].click();av.q('[data-detail-output-switch]').click()`);await settle();
        assert.equal(await evaluate(`av.q('[data-detail-apply-role=cover]').textContent==='将同名模块封面设为任务封面'`),true);
        await evaluate(`av.q('[data-detail-apply-role=cover]').click()`);await settle();
        assert.equal(await evaluate(`av.root().querySelectorAll('[data-detail-cover]')[0].getAttribute('aria-pressed')==='true'&&av.root().querySelectorAll('[data-detail-cover]')[1].getAttribute('aria-pressed')==='false'`),true,'bulk task covers must read the module pinned cover instead of its latest record or previous task cover');
        const titleAfter=await evaluate(`(()=>{const a=av.q('.clab-detail-source-preview').getBoundingClientRect(),t=av.q('[data-detail-task-name]').getBoundingClientRect();return {left:t.left,gap:t.left-a.right,width:a.width};})()`);
        assert.equal(titleAfter.width,56);assert.equal(titleAfter.left-titleBefore.left,24);assert.equal(titleAfter.gap,titleBefore.gap);
        assert.equal(await evaluate(`(()=>{const a=av.q('.clab-detail-source-preview'),f=a.querySelector('[data-detail-source-pool=cover]').getBoundingClientRect(),b=a.querySelector('[data-detail-source-pool=output]').getBoundingClientRect();return a.classList.contains('is-stacked')&&f.width===32&&b.left-f.left===24;})()`),true,'detail avatar layers must overlap by a quarter of their width');
        if(process.env.CLAB_AVATAR_SCREENSHOT){const screenshot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(process.env.CLAB_AVATAR_SCREENSHOT,Buffer.from(screenshot.data,'base64'));}
        await evaluate(`av.q('[data-detail-setting=transparentPNG]').click();av.q('.clab-preview-modal-close').click();av.open()`);await settle();
        await evaluate(`av.q('[data-review-mode=detail]').click()`);await settle();
        assert.equal(await evaluate(`av.q('[data-detail-setting=transparentPNG]').checked&&av.q('.clab-detail-source-preview').classList.contains('is-stacked')`),true,'detail transparency and manual cover must survive reopening');
        const alpha=await evaluate(`(async()=>{
            const {exportDetailPNG}=await import('/extensions/clab/components/contextmenu/content/preview_detail_export.js');
            const {capturePreviewLayout,renderLayoutPNG}=await import('/extensions/clab/components/contextmenu/content/preview_layout_export.js');
            const pixel=async(blob,x,y)=>{const bitmap=await createImageBitmap(blob),c=document.createElement('canvas');c.width=c.height=1;c.getContext('2d').drawImage(bitmap,-x,-y);bitmap.close();return [...c.getContext('2d').getImageData(0,0,1,1).data];};
            const board=av.q('.clab-detail-board'),config={rowWidth:960,columns:3,exportScale:1,transparentPNG:true};
            const detail=await exportDetailPNG(board,config),opaque=await exportDetailPNG(board,{...config,transparentPNG:false});
            const stage=document.createElement('div');stage.className='clab-review-multi-grid';stage.style.cssText='width:100px;height:100px;background:#181818';stage.innerHTML='<div class="clab-review-table-groups"><div class="clab-review-table-group"><div class="clab-review-workspace-title" style="width:40px;height:40px;background:#333">title</div></div></div>';document.body.append(stage);
            const layout=await capturePreviewLayout(stage,{transparent:true}),png=await renderLayoutPNG(layout,1),normal=await renderLayoutPNG(await capturePreviewLayout(stage),1);stage.remove();
            return {detail:await pixel(detail.blob,0,0),detailOpaque:await pixel(opaque.blob,0,0),grid:await pixel(png,95,95),gridHeader:await pixel(png,10,30),gridOpaque:await pixel(normal,95,95)};
        })()`);
        assert.equal(alpha.detail[3],0);assert.equal(alpha.detailOpaque[3],255);assert.equal(alpha.grid[3],0);assert.equal(alpha.gridOpaque[3],255);assert.equal(alpha.gridHeader[3],0);
        await evaluate(`av.q('.clab-preview-modal-close').click();import('/extensions/clab/components/workspace_modes/workspace_modes.js').then(m=>m.setWorkspaceMode(document.querySelector('#clab-panel'),'table'))`);await settle();
        await evaluate(`av.open()`);await settle();
        await evaluate(`av.q('[data-review-png-transparent]').click();av.q('.clab-preview-modal-close').click();av.open()`);await settle();
        assert.equal(await evaluate(`av.q('[data-review-png-transparent]').checked&&av.workspace.view.previewExport.table`),true,'table transparent PNG preference must persist');
        const tableAlpha=await evaluate(`(async()=>{
            const {capturePreviewLayout,renderLayoutPNG}=await import('/extensions/clab/components/contextmenu/content/preview_layout_export.js');
            const source=av.q('.clab-review-grid-stage'),original=getComputedStyle(source.querySelector('[data-review-cell]')).backgroundColor;
            const layout=await capturePreviewLayout(source,{transparent:true}),normal=await capturePreviewLayout(source);
            const host=document.createElement('div');host.style.cssText='position:fixed;left:-100000px;top:0';
            const style=document.createElement('style');style.textContent=layout.styles;layout.outer.prepend(style);host.append(layout.outer);document.body.append(host);
            const origin=layout.outer.getBoundingClientRect(),point=(selector,edge=false)=>{const r=layout.outer.querySelector(selector).getBoundingClientRect();return [Math.floor(r.right-origin.left-(edge?1:4)),Math.floor(r.bottom-origin.top-4)];};
            const points=[point('[data-review-cell]'),point('.clab-table-column'),point('.clab-card-title-bar'),point('[data-review-cell]',true)];
            const image=layout.outer.querySelector('img').getBoundingClientRect();points.push([Math.floor((image.left+image.right)/2-origin.left),Math.floor((image.top+image.bottom)/2-origin.top)]);
            const text=layout.outer.textContent.includes('任务标题');host.remove();style.remove();
            const sample=async blob=>{const bitmap=await createImageBitmap(blob),canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0);bitmap.close();return points.map(([x,y])=>ctx.getImageData(x,y,1,1).data[3]);};
            return {transparent:await sample(await renderLayoutPNG(layout,1)),opaque:await sample(await renderLayoutPNG(normal,1)),text,unchanged:original===getComputedStyle(source.querySelector('[data-review-cell]')).backgroundColor};
        })()`);
        assert.deepEqual(tableAlpha.transparent.slice(0,3),[0,0,0],'table cells, column heads and row heads must export without fill');
        assert.ok(tableAlpha.transparent[3]>0,'transparent table export lost its grid border');assert.equal(tableAlpha.transparent[4],255,'transparent table export lost its media');
        assert.deepEqual(tableAlpha.opaque.slice(0,3),[255,255,255]);assert.equal(tableAlpha.text,true);assert.equal(tableAlpha.unchanged,true,'export changed the live table background');
        const xy=await evaluate(`(async()=>{
            av.q('.clab-preview-modal-close').click();
            const {createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');
            const {synchronizeMatrix}=await import('/extensions/clab/components/workspace_modes/xy_model.js');
            const workspace=av.ui.createEmptyWorkspace('matrix export',{view:createWorkspaceView({mode:'xy',xy:{initialized:true,x:{bindings:['1||steps'],values:[10,20]},y:{bindings:['1||cfg'],values:[5]},outputNodeId:'2'}})});
            synchronizeMatrix(workspace.cards,workspace.view.xy,[]);av.ui.state.workspaces.push(workspace);av.ui.applyWorkspaceToState(workspace);av.ui.appState.selectedWorkspaceIds=[workspace.id];document.dispatchEvent(new Event('clab_render_ui'));await av.open();
            av.q('[data-review-png-transparent]').click();
            const {capturePreviewLayout,renderLayoutPNG}=await import('/extensions/clab/components/contextmenu/content/preview_layout_export.js');
            const layout=await capturePreviewLayout(av.q('.clab-review-grid-stage'),{transparent:true}),blob=await renderLayoutPNG(layout,1);
            const bitmap=await createImageBitmap(blob),canvas=document.createElement('canvas');canvas.width=canvas.height=1;const ctx=canvas.getContext('2d');ctx.drawImage(bitmap,0,0);bitmap.close();
            return {alpha:ctx.getImageData(0,0,1,1).data[3],axes:layout.outer.querySelectorAll('.clab-xy-axis').length,saved:workspace.view.previewExport.xy};
        })()`);
        assert.equal(xy.alpha,0);assert.ok(xy.axes>0);assert.equal(xy.saved,true);
        const streamed=await evaluate(`(async()=>{
            const {renderPreviewPNG}=await import('/extensions/clab/components/contextmenu/content/preview_png.js');
            const alpha=async width=>{const element=document.createElement('div');element.style.cssText='width:'+width+'px;height:2px;background:transparent';element.innerHTML='<div style="width:1px;height:2px;background:red"></div>';const blob=await renderPreviewPNG(new XMLSerializer().serializeToString(element),width,2,1),bitmap=await createImageBitmap(blob,width-1,0,1,1),c=document.createElement('canvas');c.width=c.height=1;const ctx=c.getContext('2d');ctx.drawImage(bitmap,0,0);bitmap.close();return ctx.getImageData(0,0,1,1).data[3];};return [await alpha(100),await alpha(40000)];
        })()`);
        assert.deepEqual(streamed,[0,0],'both the small canvas and streamed PNG paths must preserve alpha');
        await evaluate(`(async()=>{
            av.q('.clab-preview-modal-close').click();
            av.workspace.view.mode='cards';av.workspace.cards=[80,3].map((count,i)=>{const history=Array.from({length:count},(_,n)=>'/view?filename=scroll-'+i+'-'+n+'.png');return {id:'scroll-task-'+i,title:'滚动任务 '+i,areas:[{id:'scroll-output-'+i,type:'preview',title:'输出',history,historyIndex:0,resultUrl:history[0]}]};});
            av.ui.applyWorkspaceToState(av.workspace);document.dispatchEvent(new Event('clab_render_ui'));await av.open();
        })()`);await settle();
        for(const mode of ['browse','compare']){
            await evaluate(`av.q('[data-review-mode=${mode}]').click()`);await settle();
            await evaluate(`av.root().querySelectorAll('[data-browse-reverse]')[1].scrollIntoView({block:'center'})`);await settle();
            const top=await evaluate(`av.q('.clab-preview-modal-left').scrollTop`);assert.ok(top>1000,'long source history must create meaningful scroll distance');
            for(let i=0;i<2;i++){
                await evaluate(`av.root().querySelectorAll('[data-browse-reverse]')[1].click()`);await settle();
                assert.equal(await evaluate(`Math.abs(av.q('.clab-preview-modal-left').scrollTop-${top})<1`),true,mode+' reversal must preserve scrolling below a long preceding module');
            }
        }
        assert.deepEqual(await evaluate('window.testProgress.errors'),[]);
        console.log('PASS compact pinned preview avatars, hover/context cover actions, independent A/B samples and detail covers, pointer-positioned comparison menus, persistent transparent export settings, and transparent PNG pixels with opaque component backgrounds');
    }finally{
        await evaluate(`av.q('.clab-preview-modal-close')?.click();av.ui.state.workspaces=av.workspaces;av.ui.applyWorkspaceToState(av.previous);document.dispatchEvent(new Event('clab_render_ui'))`);
    }
}
