import assert from 'node:assert/strict';

export async function runPreviewDetailRegressions(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.ok(!r.exceptionDetails,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const settle=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const click=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await settle();};
    const check=async(expression,message)=>assert.equal(await evaluate(expression),true,message);
    const hover=async selector=>{const p=await evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)});e.scrollIntoView({block:'center'});const r=e.getBoundingClientRect();return{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};})()`);await send('Input.dispatchMouseEvent',{type:'mouseMoved',...p},sessionId);await settle();return p;};
    const root='.clab-preview-modal.visible',left=`${root} .clab-preview-modal-left`,center=`${root} .clab-preview-modal-center`;
    const toggle=async()=>{await evaluate(`document.querySelector('[data-review-workspaces] [data-workspace-id="reg-b"] .clab-workspace-tab-select').dispatchEvent(new MouseEvent('click',{ctrlKey:true,bubbles:true}));`);await settle();};
    await evaluate(`(async()=>{
        const {state,createEmptyWorkspace,getActiveWorkspace,syncStateToActiveWorkspace,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');
        const {createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');
        const {openWorkspacePreview}=await import('/extensions/clab/components/contextmenu/group_content.js');
        syncStateToActiveWorkspace();window.detailRegressionBackup={workspaces:[...state.workspaces],active:getActiveWorkspace()};
        const make=(id,name)=>createEmptyWorkspace(name,{id,view:createWorkspaceView(),cards:Array.from({length:12},(_,i)=>({id:'task-'+i,title:name+'任务 '+i,areas:[{id:'in-'+i,type:'edit',title:'步数',value:20+i,targetNodeId:'110',targetWidget:'steps',targetWidgets:['110||steps'],dataType:'number'},{id:'out-'+i,type:'preview',title:'结果',targetNodeId:'111',history:[0,1,2].map(n=>'/view?filename=reg-'+n+'.png'),historyIndex:2,resultUrl:'/view?filename=reg-2.png'}]}))});
        const a=make('reg-a','工作区甲'),b=make('reg-b','工作区乙');window.detailRegression={a,b};state.workspaces=[a,b];applyWorkspaceToState(a);document.dispatchEvent(new Event('clab_render_ui'));openWorkspacePreview();document.querySelector('[data-review-mode=detail]').click();
    })()`);await settle();
    try{
        for(let i=0;i<6;i++){
            await toggle();const expected=i%2?12:24;
            assert.equal(await evaluate(`document.querySelectorAll('${center} .clab-detail-card').length`),expected,'source toggling accumulated orphan detail cards');
            await check(`detailRegression.a.cards.length===12&&detailRegression.b.cards.length===12&&[...document.querySelectorAll('${center} .clab-detail-card')].every(card=>card.querySelector('.clab-detail-media img'))`,'detail source switching changed tasks or left empty media behind');
        }
        await toggle();
        await evaluate(`document.querySelector('${center}').scrollTop=0`);
        await click(`${left} [data-preview-source-workspace=reg-b]>summary`);await evaluate('new Promise(resolve=>setTimeout(resolve,900))');
        await check(`(()=>{const c=document.querySelector('${center}'),h=c.querySelector('[data-detail-workspace-id=reg-b]'),r=h.getBoundingClientRect(),p=c.getBoundingClientRect();return c.scrollTop>0&&r.top>=p.top-1&&r.top<p.top+50;})()`,'source workspace title did not locate its detail section');
        await click(`${left} [data-preview-source-workspace=reg-b]>summary`);
        for(const selector of [`${left} [data-preview-source-workspace=reg-b] [data-detail-source]:last-child [data-detail-input]`,`${left} [data-preview-source-workspace=reg-b] [data-detail-source]:last-child`]){
            await evaluate(`document.querySelector('${center}').scrollTop=0`);await click(selector);await evaluate('new Promise(resolve=>setTimeout(resolve,1000))');
            await check(`(()=>{const c=document.querySelector('${center}'),card=c.querySelector('.clab-detail-card:last-child'),r=card.getBoundingClientRect(),p=c.getBoundingClientRect();return c.scrollTop>0&&r.top<p.bottom&&r.bottom>p.top;})()`,'source task body/control did not locate its card');
        }
        for(const mode of ['browse','compare']){
            await click(`${root} [data-review-mode=${mode}]`);await hover(`${left} .clab-source-module .clab-source-history .clab-filmstrip-thumb`);
            await check(`getComputedStyle(document.querySelector('${left} .clab-source-module [data-browse-reverse]')).opacity==='1'&&getComputedStyle(document.querySelector('${left} .clab-source-module .clab-source-module-caption small')).visibility==='hidden'`,`${mode} history hover did not expose its reverse control`);
        }
        await click(`${root} [data-review-mode=table]`);
        for(const selector of [`${root} .clab-review-head-actions`,`${root} [data-review-workspaces]`]){
            await click(`${center} [data-review-cell]`);await check(`document.querySelectorAll('${center} [data-review-cell].active').length>0`,'preview cell was not selected');
            await click(selector);await check(`document.querySelectorAll('${center} [data-review-cell].active').length===0`,'preview header/workspace whitespace did not clear table selection');
        }
        await click(`${root} .clab-preview-modal-close`);
        await evaluate(`import('/extensions/clab/components/workspace_modes/workspace_modes.js').then(({setWorkspaceMode})=>setWorkspaceMode(document.querySelector('#clab-panel'),'table'))`);await settle();
        const p=await hover('#clab-panel [role=cell]');for(const type of ['mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...p,button:'left',buttons:type==='mousePressed'?1:0,clickCount:1},sessionId);await settle();
        await check(`import('/extensions/clab/components/ui_state.js').then(({state})=>state.selectedAreaIds.length>0)`,'workspace cell was not selected');
        await click('#clab-panel .clab-workspace-tabs');await check(`import('/extensions/clab/components/ui_state.js').then(({state})=>!state.selectedAreaIds.length&&!state.selectedCardIds.length)`,'workspace tab whitespace did not clear selection');
        await click('#clab-panel .clab-workspace-tab.active [data-mode-toggle]');await check(`document.querySelector('#clab-panel .clab-mode-menu [data-workspace-mode=xy]').disabled`,'table menu still enables XY conversion');
        await click('#clab-panel .clab-mode-menu [data-workspace-mode=cards]');
        await evaluate(`import('/extensions/clab/components/workspace_modes/workspace_modes.js').then(({setWorkspaceMode})=>setWorkspaceMode(document.querySelector('#clab-panel'),'xy'))`);await settle();
        await check(`detailRegression.a.view.mode==='cards'&&detailRegression.a.view.structuredMode==='table'`,'card transit bypassed the structured workspace type');
        await click('#clab-panel .clab-workspace-tab.active [data-mode-toggle]');await check(`document.querySelector('#clab-panel .clab-mode-menu [data-workspace-mode=xy]').disabled`,'card mode forgot the table restriction');await click('#clab-panel .clab-mode-menu [data-workspace-mode=table]');
        await click('#clab-btn-preview');await check(`document.querySelector('${root} [data-review-mode=xy]').disabled&&!document.querySelector('${root} [data-review-mode=table]').disabled`,'table preview does not enforce its type');
        await click(`${root} .clab-preview-modal-close`);
        await evaluate(`(async()=>{const {switchWorkspace}=await import('/extensions/clab/components/comp_workspace.js');const {setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js');switchWorkspace('reg-b');setWorkspaceMode(document.querySelector('#clab-panel'),'xy');})()`);await settle();
        await click('#clab-btn-preview');await check(`document.querySelector('${root} [data-review-mode=table]').disabled&&!document.querySelector('${root} [data-review-mode=xy]').disabled`,'XY preview does not enforce its type');
        await evaluate(`document.querySelector('[data-review-workspaces] [data-workspace-id="reg-a"] .clab-workspace-tab-select').dispatchEvent(new MouseEvent('click',{ctrlKey:true,bubbles:true}));`);await settle();
        await check(`document.querySelector('${root} [data-review-mode=table]').disabled&&document.querySelector('${root} [data-review-mode=xy]').disabled&&['browse','compare','detail'].every(mode=>!document.querySelector('${root} [data-review-mode='+mode+']').disabled)`,'mixed structured sources did not preserve only compatible preview modes');
        await click(`${root} .clab-preview-modal-close`);
        await evaluate(`(async()=>{const {state,createEmptyWorkspace}=await import('/extensions/clab/components/ui_state.js');for(const [id,name,view]of [['reg-c','任务卡片甲',undefined],['reg-d','任务卡片乙',undefined],['reg-e','参数表乙',detailRegression.a.view],['reg-f','矩阵乙',detailRegression.b.view]])state.workspaces.push(createEmptyWorkspace(name,{id,cards:structuredClone(detailRegression.a.cards),...(view?{view:structuredClone(view)}:{})}));document.dispatchEvent(new Event('clab_render_ui'));})()`);
        await click('#clab-btn-preview');
        const cases=[['reg-b','detail','reg-a','table'],['reg-a','browse','reg-c','browse'],['reg-c','compare','reg-d','compare'],['reg-d','detail','reg-a','detail'],['reg-a','browse','reg-e','browse'],['reg-e','browse','reg-b','xy'],['reg-b','compare','reg-f','compare'],['reg-f','xy','reg-a','table'],['reg-a','table','reg-c','table'],['reg-c','table','reg-b','xy'],['reg-b','detail','reg-c','detail']];
        for(const [from,preview,to,expected]of cases){
            await click(`${root} [data-workspace-id=${from}] .clab-workspace-tab-select`);
            await click(`${root} [data-review-mode=${preview}]`);
            await click(`${root} [data-workspace-id=${to}] .clab-workspace-tab-select`);
            await check(`document.querySelector('${root}').dataset.reviewMode==='${expected}'`,'workspace preview compatibility rule failed for '+[from,preview,to,expected].join(' / '));
        }
        await click(`${root} [data-workspace-id=reg-a] .clab-workspace-tab-select`);await click(`${root} [data-review-mode=table]`);
        await toggle();await check(`document.querySelector('${root}').dataset.reviewMode==='browse'`,'mixed sources did not use a common compatible preview');
        await click(`${root} [data-workspace-id=reg-a] .clab-workspace-tab-select`);await check(`document.querySelector('${root}').dataset.reviewMode==='browse'`,'collapsing compatible sources unnecessarily reset the current preview mode');
        console.log('PASS repeated detail source toggles retain exact cards/media, source bodies locate cards/workspaces, full module hover exposes reversal, table whitespace clears selection, and structured types block direct/indirect conversion and incompatible previews');
    }finally{
        await evaluate(`(async()=>{document.querySelector('${root} .clab-preview-modal-close')?.click();const {state,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');state.workspaces=detailRegressionBackup.workspaces;applyWorkspaceToState(detailRegressionBackup.active);document.dispatchEvent(new Event('clab_render_ui'));})()`);
    }
}
