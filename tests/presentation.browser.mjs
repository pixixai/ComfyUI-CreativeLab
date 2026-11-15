import assert from 'node:assert/strict';

export async function runPresentationChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{togglePanel}=await import('/extensions/clab/ui_panel.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js');
        ui.syncStateToActiveWorkspace();window.ps={ui,togglePanel,editHistory,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],panel:document.querySelector('#clab-panel')};ps.container=ps.panel.querySelector('#clab-cards-container');
        ps.make=mode=>ui.createEmptyWorkspace('整组呈现 '+mode,{view:{mode},cards:Array.from({length:100},(_,i)=>({id:'ps-'+mode+'-'+i,areas:Array.from({length:6},(_,j)=>({id:'ps-'+mode+'-'+i+'-'+j,type:'edit',value:'任务 '+i+' 参数 '+j+' content '.repeat(j*3),autoHeight:true,dataType:'string',targetNodeId:'1',targetWidget:'text',targetWidgets:['1||text']}))}))});
        ps.open=mode=>{if(ps.panel.classList.contains('visible'))togglePanel();ps.ws=ps.make(mode);ui.state.workspaces.push(ps.ws);ui.applyWorkspaceToState(ps.ws);togglePanel();};
        ps.sample=()=>new Promise(resolve=>{
            const frames=[];const tick=()=>{
                const v=ps.container.getBoundingClientRect(),inside=b=>b.left<v.right&&b.right>v.left&&b.top<v.bottom&&b.bottom>v.top;
                const cells=[...ps.container.querySelectorAll('.clab-area')].filter(root=>root.dataset.areaId.startsWith('ps-'+ps.ws.view.mode+'-')&&inside(root.getBoundingClientRect())&&!root.closest('[hidden]'));
                const shown=cells.filter(root=>getComputedStyle(root).visibility==='visible'&&root.querySelector('textarea'));
                const incomplete=cells.filter(root=>getComputedStyle(root).visibility==='visible'&&root.matches('[data-clab-deferred],[data-clab-virtual]'));
                frames.push({shown:shown.length,incomplete:incomplete.length,positions:shown.map(root=>({id:root.dataset.areaId,top:root.getBoundingClientRect().top,height:root.offsetHeight,value:root.querySelector('textarea').value}))});
                if(frames.length<65)requestAnimationFrame(tick);else resolve(frames);
            };requestAnimationFrame(tick);
        });
    })()`);
    try{
        await send('Emulation.setCPUThrottlingRate',{rate:4},sessionId);
        const cards=await evaluate(`(async()=>{ps.open('cards');return ps.sample();})()`);
        const ready=cards.find(frame=>frame.shown>0);
        assert.ok(ready,'visible cards never appeared');
        assert.ok(cards.every(frame=>frame.incomplete===0),'an unprepared module appeared between ready modules');
        const firstById=new Map();
        for(const frame of cards)for(const position of frame.positions){
            const previous=firstById.get(position.id);
            if(previous)assert.ok(Math.abs(previous.top-position.top)<1&&Math.abs(previous.height-position.height)<1,`visible module jumped after reveal: ${position.id}`);
            else firstById.set(position.id,position);
            assert.ok(position.value.startsWith('任务 '),'a control appeared before its value');
        }
        assert.equal(await evaluate(`ps.container.querySelectorAll('.clab-card').length<20&&ps.container.querySelectorAll('textarea').length<100`),true);
        console.log('PASS throttled opening reveals complete card content with stable measured heights and preserves the bounded card window');

        const table=await evaluate(`(async()=>{ps.open('table');return ps.sample();})()`);
        const populated=table.findIndex(frame=>frame.shown>0),final=table.at(-1);
        assert.ok(populated>=0&&final.shown>0,'visible table values never appeared');
        assert.equal(table[populated].shown,final.shown,'visible table values trickled in row by row');
        assert.ok(table.every(frame=>frame.incomplete===0),'an empty visible cell appeared before its control was prepared');
        assert.equal(await evaluate(`(()=>{ps.field=ps.container.querySelector('textarea');ps.togglePanel();ps.togglePanel();return ps.sample().then(()=>ps.container.contains(ps.field)&&!ps.container.querySelector('[data-clab-presenting]'));})()`),true);
        console.log('PASS throttled table opening reveals visible parameter values together and reopening reuses controls without leaving hidden cells');

        const media=await evaluate(`(async()=>{
            ps.togglePanel();ps.ws=ps.make('cards');
            for(const card of ps.ws.cards)card.areas=[card.areas[0],{id:card.id+'-audio',type:'preview',targetNodeId:'2',resultKind:'audio',resultUrl:'/view?filename=sample.wav',history:['/view?filename=sample.wav'],historyIndex:0}];
            ps.ui.state.workspaces.push(ps.ws);ps.ui.applyWorkspaceToState(ps.ws);ps.togglePanel();
            const frames=[];let replaced=false;
            return new Promise(resolve=>{const tick=()=>{
                const input=ps.container.querySelector('[data-area-id="ps-cards-0-0"]'),audio=ps.container.querySelector('[data-area-id="ps-cards-0-audio"] audio');
                const visible=!!input?.querySelector('textarea')&&getComputedStyle(input).visibility==='visible';
                frames.push({visible,src:audio?.getAttribute('src')||null});
                if(visible&&audio&&!audio.getAttribute('src')&&!replaced){
                    replaced=true;ps.togglePanel();const area=ps.ws.cards[0].areas[1];area.resultUrl='/view?filename=changed.wav';area.history.push(area.resultUrl);area.historyIndex=1;ps.togglePanel();
                }
                if(frames.length<65)requestAnimationFrame(tick);else resolve({frames,replaced});
            };requestAnimationFrame(tick);});
        })()`);
        assert.ok(media.frames.some(frame=>frame.visible&&!frame.src),'players started before ordinary content had a paint');
        assert.equal(media.replaced,true);
        assert.equal(media.frames.at(-1).src,'/view?filename=changed.wav','a prepared player reused stale data after close/reopen');
        console.log('PASS ordinary content paints before player initialization and reopening invalidates a prepared player whose result changed');
    }finally{
        await send('Emulation.setCPUThrottlingRate',{rate:1},sessionId);
        await evaluate(`(()=>{if(!ps.panel.classList.contains('visible'))ps.togglePanel();ps.editHistory.withoutRecording(()=>{ps.ui.state.workspaces=ps.workspaces;ps.ui.applyWorkspaceToState(ps.original);document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
}
