import assert from 'node:assert/strict';

export async function runCardCacheChecks(send,sessionId){
    const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    const until=condition=>evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+3000;const check=()=>{if(${condition})resolve();else if(performance.now()>end)reject(new Error('cached component did not become ready'));else setTimeout(check,16);};check();})`);
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js'),{cardWindow}=await import('/extensions/clab/components/workspace_modes/card_window.js'),{cacheLimits}=await import('/extensions/clab/components/cache_preferences.js');
        ui.syncStateToActiveWorkspace();window.cc={ui,editHistory,cacheLimits,limits:{...cacheLimits},original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],panel:document.querySelector('#clab-panel')};cc.container=cc.panel.querySelector('#clab-cards-container');
        cc.ws=ui.createEmptyWorkspace('卡片缓存验证',{cards:Array.from({length:80},(_,i)=>({id:'cc-card-'+i,areas:[...Array.from({length:3},(_,j)=>({id:'cc-input-'+i+'-'+j,type:'edit',value:'value '+i+' '+j,autoHeight:true,dataType:'string',targetNodeId:'1',targetWidget:'text',targetWidgets:['1||text']})),{id:'cc-output-'+i,type:'preview',resultUrl:'/view?filename=first.png',history:['/view?filename=first.png'],historyIndex:0,targetNodeId:'2',ratio:'16:9'}]}))});
        ui.state.workspaces.push(cc.ws);ui.applyWorkspaceToState(cc.ws);editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));cc.manager=cardWindow(cc.container);cc.root=id=>cc.container.querySelector('[data-area-id="'+id+'"]');cc.card=id=>cc.container.querySelector('.clab-card[data-card-id="'+id+'"]');
    })()`);
    try{
        await until(`!!cc.root('cc-input-0-0')?.querySelector('textarea')`);
        await evaluate(`cc.card0=cc.card('cc-card-0');cc.field=cc.root('cc-input-0-0').querySelector('textarea');cc.height=cc.field.style.height;cc.manager.reveal('cc-card-50');`);await wait(200);
        assert.equal(await evaluate(`!cc.card('cc-card-0')&&cc.card0.isConnected&&cc.card0.hidden&&cc.panel.querySelector('[data-clab-card-cache]').contains(cc.card0)`),true);
        await evaluate(`cc.manager.reveal('cc-card-0')`);await until(`cc.root('cc-input-0-0')?.querySelector('textarea')===cc.field`);
        assert.equal(await evaluate(`cc.card('cc-card-0')===cc.card0&&cc.field.style.height===cc.height`),true);
        await evaluate(`cc.manager.reveal('cc-card-50');cc.ws.cards[0].areas[0].value='updated offscreen';window._clabSurgicallyUpdateArea('cc-input-0-0',{notify:false});cc.manager.reveal('cc-card-0');`);
        await until(`cc.root('cc-input-0-0')?.querySelector('textarea')?.value==='updated offscreen'`);
        await evaluate(`cc.manager.reveal('cc-card-50');const list=cc.ws.cards[0].areas;list.splice(0,3,list[2],list[1],list[0]);cc.manager.reveal('cc-card-0');`);
        await until(`cc.root('cc-input-0-0')?.querySelector('.clab-area-title-input')?.placeholder==='##3'`);
        console.log('PASS revisiting cards reuses card/input DOM and measured height, while offscreen parameter edits invalidate stale contents');

        await evaluate(`cc.audioArea={id:'cc-audio',type:'preview',resultKind:'audio',resultUrl:'/view?filename=sample.wav',history:['/view?filename=sample.wav'],historyIndex:0,targetNodeId:'2'};cc.ws.cards[0].areas.unshift(cc.audioArea);cc.manager.update();`);
        await until(`cc.root('cc-audio')?.querySelector('audio')?.readyState>0`);
        await evaluate(`cc.audio=cc.root('cc-audio').querySelector('audio');cc.audio.currentTime=.375;cc.audio.volume=.3;cc.audio.playbackRate=1.5;cc.manager.reveal('cc-card-50');`);await wait(120);
        await evaluate(`cc.manager.reveal('cc-card-0')`);await until(`cc.root('cc-audio')?.querySelector('audio')===cc.audio`);
        assert.equal(await evaluate(`cc.audio.paused&&Math.abs(cc.audio.currentTime-.375)<.01&&Math.abs(cc.audio.volume-.3)<.01&&cc.audio.playbackRate===1.5`),true);
        await evaluate(`cc.expirations=[];const original=window.setTimeout;window.setTimeout=(fn,ms,...args)=>ms===30000?(cc.expirations.push(fn),-1):original(fn,ms,...args);try{cc.manager.reveal('cc-card-50');}finally{window.setTimeout=original;}cc.expirations.forEach(fn=>fn());`);
        assert.equal(await evaluate(`cc.expirations.length>0&&cc.audio.getAttribute('src')===null`),true);
        await evaluate(`cc.manager.reveal('cc-card-0')`);await until(`cc.root('cc-audio')?.querySelector('audio')?.readyState>0&&Math.abs(cc.root('cc-audio').querySelector('audio').currentTime-.375)<.01`);
        await evaluate(`cc.audio=cc.root('cc-audio').querySelector('audio');`);
        await evaluate(`cc.cacheLimits.media=0;document.dispatchEvent(new Event('clab_cache_limits_change'));cc.manager.reveal('cc-card-50');`);await wait(100);
        assert.equal(await evaluate(`cc.audio.getAttribute('src')===null`),true);
        await evaluate(`cc.manager.reveal('cc-card-0')`);await until(`cc.root('cc-audio')?.querySelector('audio')?.readyState>0&&Math.abs(cc.root('cc-audio').querySelector('audio').currentTime-.375)<.01`);
        assert.equal(await evaluate(`cc.root('cc-audio').querySelector('audio')!==cc.audio&&cc.root('cc-audio').querySelector('audio').playbackRate===1.5`),true);
        console.log('PASS a cached audio player is reused paused; disabling its cache releases the source and later restores playback state into a new player');

        await evaluate(`Object.assign(cc.cacheLimits,{cards:1,components:2,media:0,models:0});document.dispatchEvent(new Event('clab_cache_limits_change'));cc.manager.reveal('cc-card-60');`);await wait(250);
        assert.equal(await evaluate(`cc.panel.querySelector('[data-clab-card-cache]').children.length<=1&&cc.panel.querySelector('[data-clab-viewport-cache]').children.length<=2`),true);
        await evaluate(`cc.cacheLimits.cards=0;document.dispatchEvent(new Event('clab_cache_limits_change'));`);
        assert.equal(await evaluate(`cc.panel.querySelector('[data-clab-card-cache]').children.length===0`),true);
        await evaluate(`cc.manager.reveal('cc-card-0')`);await until(`cc.root('cc-input-0-0')?.querySelector('textarea')?.value==='updated offscreen'`);
        console.log('PASS lowering cache limits evicts excess cards and components immediately without changing stored task parameters or output histories');
    }finally{
        await evaluate(`(()=>{Object.assign(cc.cacheLimits,cc.limits);document.dispatchEvent(new Event('clab_cache_limits_change'));cc.editHistory.withoutRecording(()=>{cc.ui.state.workspaces=cc.workspaces;cc.ui.applyWorkspaceToState(cc.original);document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
    return 3;
}
