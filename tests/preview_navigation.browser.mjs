import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runPreviewNavigationChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const settle=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await settle();};
    const realClick=async selector=>{
        const point=await evaluate(`(()=>{const r=document.querySelector(${JSON.stringify(selector)}).getBoundingClientRect();return{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};})()`);
        for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...point,...(type==='mouseMoved'?{}:{button:'left',buttons:type==='mousePressed'?1:0,clickCount:1})},sessionId);
        await settle();
    };
    const check=async(expression,message)=>assert.equal(await evaluate(expression),true,message);
    const root='.clab-preview-modal.visible',left=`${root} .clab-preview-modal-left`,right=`${root} .clab-preview-modal-right`,tile=`${right} .clab-multi-settings:not([hidden]) [data-review-xy-tiles]`;
    await evaluate(`(async()=>{
        const {state,getActiveWorkspace,syncStateToActiveWorkspace,createEmptyWorkspace,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');
        const {synchronizeMatrix}=await import('/extensions/clab/components/workspace_modes/xy_model.js');
        const {createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');
        const {pushPreviewHistoryEntry}=await import('/extensions/clab/components/modules/media_types/media_utils.js');
        const {openWorkspacePreview}=await import('/extensions/clab/components/contextmenu/group_content.js');
        syncStateToActiveWorkspace();window.navigationBackup={active:getActiveWorkspace(),workspaces:[...state.workspaces]};
        const make=(id,name,z)=>{const w=createEmptyWorkspace(name,{id,view:createWorkspaceView({mode:'cards',xy:{initialized:true,x:{bindings:['110||steps'],values:[10,20,30]},y:{bindings:['110||sampler'],values:['Euler','DPM','DDIM']},z:{enabled:z,bindings:z?['110||cfg']:[],values:z?[5,7]:[]},outputNodeId:'111'}})});synchronizeMatrix(w.cards,w.view.xy,[]);for(const [i,c]of w.cards.entries()){c.title=name+' · 任务 '+(i+1);pushPreviewHistoryEntry(c.areas[0],'/view?filename=navigation.png');}return w;};
        const a=make('navigation-a','无 Z 工作区',false),b=make('navigation-b','有 Z 工作区',true);window.navigationDemo={a,b};state.workspaces=[a,b];applyWorkspaceToState(a);document.dispatchEvent(new Event('clab_render_ui'));openWorkspacePreview();document.querySelector('[data-review-mode=xy]').click();
    })()`);await settle();
    try{
        await check(`!document.querySelector('${right} [data-review-xy-tiles]').disabled`,'single workspace without Z cannot enable tiling');
        await click(`${right} [data-review-xy-tiles]`);
        await check(`navigationDemo.a.view.xy.z.display==='all'`,'tiling preference for a workspace without Z was not saved');
        await evaluate(`document.querySelector('[data-review-workspaces] [data-workspace-id="navigation-b"] .clab-workspace-tab-select').dispatchEvent(new MouseEvent('click',{bubbles:true,ctrlKey:true}));`);await settle();
        await check(`!document.querySelector('${tile}').disabled&&getComputedStyle(document.querySelector('.clab-review-matrix-group')).backgroundColor==='rgb(29, 29, 29)'`,'mixed sources disable tiling or group color is wrong');
        await click(tile);await click(tile);
        await check(`navigationDemo.a.view.xy.z.display==='all'&&navigationDemo.b.view.xy.z.display==='all'&&[...document.querySelectorAll('${right} [data-review-xy-tiles]')].every(i=>i.checked)`,'no-selection tiling did not update both Z/non-Z workspaces');
        for(const mode of ['xy','browse','compare','detail','table']){
            await click(`${root} [data-review-mode=${mode}]`);
            await check(`(()=>{const r=document.querySelector('${root} .clab-source-ruler');return !r.hidden&&r.querySelectorAll('.is-workspace').length===2&&[...r.querySelectorAll('button')].every(b=>b.dataset.sourceTitle&&!b.dataset.sourceTitle.includes('展开或折叠'));})()`,`${mode} ruler is missing or has wrong labels`);
            if(mode==='xy')continue;
            if(mode==='browse'){
                await evaluate(`(()=>{document.querySelector('${root} .clab-source-ruler button:not(.is-workspace)').dispatchEvent(new PointerEvent('pointerenter'));})()`);await evaluate('new Promise(resolve=>setTimeout(resolve,250))');
                await check(`(()=>{const t=document.querySelector('${root} .clab-source-ruler-tooltip');return !t.hidden&&!!t.querySelector('img')&&t.textContent.includes('任务');})()`,'ruler hover did not show the task thumbnail');
                await evaluate(`(()=>{const host=document.createElement('div');host.dataset.rulerFixture='';for(let i=0;i<150;i++){const task=document.createElement('details');task.dataset.browseCard='ruler-'+i;task.innerHTML='<summary>定位测试 '+i+'</summary>';host.append(task);}document.querySelector('${left}').append(host);})()`);await settle();
                await check(`(()=>{const r=document.querySelector('${root} .clab-source-ruler'),b=r.parentElement.getBoundingClientRect(),p=r.getBoundingClientRect(),buttons=[...r.children];return r.scrollHeight>r.clientHeight&&p.height<=b.height*2/3+1&&Math.abs(p.top+p.bottom-b.top-b.bottom)<1&&buttons.every((button,i)=>!i||Math.abs(button.offsetTop-buttons[i-1].offsetTop-8)<.1)&&getComputedStyle(buttons.find(b=>!b.classList.contains('active')),'::before').height==='2px';})()`,'ruler no longer has fixed 8px spacing or a centered two-thirds viewport');
                await check(`(()=>{const r=document.querySelector('${root} .clab-source-ruler'),l=document.querySelector('${left}'),before=l.scrollTop;r.scrollTop=0;r.dispatchEvent(new WheelEvent('wheel',{deltaY:120,bubbles:true,cancelable:true}));return r.scrollTop>0&&l.scrollTop===before;})()`,'ruler wheel scrolling moved the source list');
                await evaluate(`document.querySelector('[data-ruler-fixture]').remove()`);await settle();
            }
            await check(`document.querySelectorAll('${root} .clab-source-ruler button:not(.is-workspace)').length>=18`,`${mode} ruler is missing tasks`);
            await evaluate(`(()=>{const left=document.querySelector('${left}');window.navigationMedia=document.querySelector('${root} .clab-preview-modal-center img');left.querySelectorAll('.clab-preview-source-workspace').forEach(w=>w.open=false);})()`);await settle();
            await click(`${root} .clab-source-ruler button:last-child`);
            await evaluate('new Promise(resolve=>setTimeout(resolve,1200))');
            await check(`(()=>{const l=document.querySelector('${left}'),ws=[...l.querySelectorAll('.clab-preview-source-workspace')].at(-1),task=[...ws.querySelectorAll('[data-detail-source]>summary,[data-browse-card]>summary,[data-grid-filter=row]')].at(-1),r=task.getBoundingClientRect(),p=l.getBoundingClientRect();return ws.open&&(l.scrollHeight<=l.clientHeight||l.scrollTop>0)&&r.bottom>p.top&&r.top<p.bottom&&window.navigationMedia===document.querySelector('${root} .clab-preview-modal-center img');})()`,`${mode} ruler failed to expand/locate the last task or replaced media`);
        }
        for(const preview of [true,false]){
            if(!preview)await click(`${root} .clab-preview-modal-close`);
            const anchor=preview?`${root} [data-review-maintenance]`:'#clab-config-dropdown-trigger';
            await realClick(anchor);await check(`!!document.querySelector('.clab-maintenance-panel:popover-open')`,'maintenance failed to open');
            await realClick(anchor);await check(`!document.querySelector('.clab-maintenance-panel:popover-open')`,'second real click reopened maintenance instead of closing');
            await realClick(anchor);await realClick(preview?`${root} .clab-review-notice`:'#clab-cards-container');
            await check(`!document.querySelector('.clab-maintenance-panel:popover-open')`,'outside click did not close maintenance');
            await realClick(anchor);await realClick('.clab-maintenance-panel:popover-open [data-maint-close]');await check(`!document.querySelector('.clab-maintenance-panel:popover-open')`,'close icon failed');
        }
        await evaluate(`(async()=>{const {synchronizeMatrix}=await import('/extensions/clab/components/workspace_modes/xy_model.js');Object.assign(navigationDemo.a.view.xy.z,{enabled:true,bindings:['110||cfg'],values:[5,7]});synchronizeMatrix(navigationDemo.a.cards,navigationDemo.a.view.xy,[]);document.dispatchEvent(new Event('clab_render_ui'));const {openWorkspacePreview}=await import('/extensions/clab/components/contextmenu/group_content.js');openWorkspacePreview();document.querySelector('[data-review-mode=xy]').click();})()`);await settle();
        await check(`document.querySelector('[data-review-xy-tiles]').checked&&document.querySelectorAll('${root} .clab-xy-layer-title').length===2`,'adding Z values did not honor the stored tiling preference');
        if(process.env.CLAB_NAV_SCREENSHOT){await click(`${root} [data-review-mode=browse]`);const shot=await send('Page.captureScreenshot',{format:'png'},sessionId);fs.writeFileSync(process.env.CLAB_NAV_SCREENSHOT,Buffer.from(shot.data,'base64'));}
        console.log('PASS source rulers navigate all five preview modes without replacing media; mixed Z/non-Z tiling persists and applies to future layers; maintenance closes on invoker/outside/close clicks');
    }finally{
        await evaluate(`(async()=>{document.querySelector('${root} .clab-preview-modal-close')?.click();const {state,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');state.workspaces=navigationBackup.workspaces;applyWorkspaceToState(navigationBackup.active);document.dispatchEvent(new Event('clab_render_ui'));})()`);
    }
}
