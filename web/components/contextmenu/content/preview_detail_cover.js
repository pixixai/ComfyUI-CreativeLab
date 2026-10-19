import { captureModelPreview, renderModelViewer } from '../../modules/media_types/media_model.js';
import { getAudioWavePeaks, drawAudioWave } from '../../modules/media_types/audio_waveform.js';

let modelCapture=Promise.resolve();

export function attachDetailCover(host,{resources}={}) {
    if(!document.getElementById('clab-detail-cover-styles')){
        const style=document.createElement('style');style.id='clab-detail-cover-styles';style.textContent=`.clab-detail-cover{position:absolute;inset:0;z-index:4;background:#141414;pointer-events:none;overflow:hidden;display:flex;align-items:center;justify-content:center}.clab-detail-cover[hidden]{display:none}.clab-detail-cover>img,.clab-detail-cover>video,.clab-detail-cover>canvas{display:block;width:100%;height:100%;object-fit:contain}.clab-detail-cover>pre{margin:0;padding:12px;box-sizing:border-box;width:100%;height:100%;white-space:pre-wrap;overflow-wrap:anywhere;overflow:hidden;font:12px/1.6 monospace;color:#bbb}.clab-detail-cover>span{color:#999;font:12px/1.5 sans-serif}`;document.head.append(style);
    }
    const controller=new AbortController(),{signal}=controller;
    const media=host.querySelector('video,audio'),stage=host.querySelector('.clab-glb-viewer');
    let layer,key,posterController,resize,hovering=false,left=false,disposed=false,visible=false;
    const modelPlaying=playing=>{const button=stage?.querySelector('.clab-model-play');if(button&&!stage.querySelector('.clab-model-animation').hidden&&button.getAttribute('aria-pressed')!==String(playing))button.click();};
    const pause=()=>{left=true;hovering=false;media?.pause();modelPlaying(false);if(layer)layer.hidden=false;};
    const enter=()=>{
        if(disposed||document.hidden)return;
        hovering=true;left=false;if(layer)layer.hidden=true;
        media?.play().catch(()=>{});modelPlaying(true);
    };
    host.addEventListener('pointerenter',enter,{signal});host.addEventListener('pointerleave',pause,{signal});
    media?.addEventListener('play',()=>{if(disposed||left||document.hidden)media.pause();else if(layer)layer.hidden=true;},{signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();},{signal});
    const visibility=new IntersectionObserver(entries=>{for(const entry of entries){visible=entry.isIntersecting;if(!visible)pause();else layer?._detailPrepareCover();}});visibility.observe(host);
    const loaded=stage?new MutationObserver(()=>{if(hovering)modelPlaying(true);else modelPlaying(false);}):null;
    if(stage)loaded.observe(stage,{attributes:true,attributeFilter:['data-model-loaded']});
    async function poster(record,current,signal){
        const finish=()=>{if(!signal.aborted)current.dataset.ready='1';};
        try{
            if(record.type==='image'||record.type==='video'){
                const element=document.createElement(record.type==='image'?'img':'video');element.src=record.url;current.append(element);
                if(record.type==='video'){element.muted=true;element.playsInline=true;element.preload='metadata';}
                await new Promise(resolve=>{
                    const ready=record.type==='image'?'load':'loadeddata';element.addEventListener(ready,resolve,{once:true,signal});element.addEventListener('error',resolve,{once:true,signal});signal.addEventListener('abort',resolve,{once:true});
                    if(record.type==='image'&&element.complete||record.type==='video'&&element.readyState>=2)resolve();
                });
            }else if(record.type==='model'){
                const temporary=document.createElement('div');temporary.innerHTML=renderModelViewer(record.url);
                const capture=modelCapture.then(()=>captureModelPreview(temporary.firstElementChild,{resources,signal}));modelCapture=capture.then(()=>{},()=>{});
                const url=await capture;
                if(!signal.aborted){const image=new Image();image.src=url;await image.decode();current.replaceChildren(image);}
            }else if(record.type==='audio'){
                const peaks=await getAudioWavePeaks(record.url);if(signal.aborted)return;
                const canvas=document.createElement('canvas');current.append(canvas);
                const draw=()=>{const hidden=current.hidden;current.hidden=false;drawAudioWave(canvas,peaks,0);current.hidden=hidden;};resize=new ResizeObserver(draw);resize.observe(current);draw();
            }else{
                const text=document.createElement(record.type==='text'?'pre':'span');
                text.textContent=record.type==='text'?(record.text||await (resources?.read||fetch)(record.url,{signal}).then(response=>{if(!response.ok)throw new Error('封面读取失败');return response.text();})):record.name;
                if(!signal.aborted)current.append(text);
            }
        }catch(error){if(!signal.aborted){const message=document.createElement('span');message.textContent=`封面无法预览：${error.message}`;current.replaceChildren(message);}}
        finally{finish();}
    }
    return {
        update(record,custom){
            const next=custom?record?.key:'';if(key===next)return;key=next;
            posterController?.abort();resize?.disconnect();
            layer?.querySelectorAll('video').forEach(video=>{video.removeAttribute('src');video.load();});layer?.remove();layer=null;
            if(!custom||!record)return;
            layer=document.createElement('div');layer.className='clab-detail-cover';layer.dataset.recordKey=record.key;layer.hidden=hovering||!!media&&!media.paused;host.append(layer);
            posterController=new AbortController();const current=layer,currentSignal=posterController.signal;
            layer._detailPrepareCover=()=>current._detailCoverReady||=(poster(record,current,currentSignal));
            if(visible)void layer._detailPrepareCover();
        },
        pause,
        release(){disposed=true;controller.abort();visibility.disconnect();loaded?.disconnect();posterController?.abort();resize?.disconnect();layer?.querySelectorAll('video').forEach(video=>{video.removeAttribute('src');video.load();});layer?.remove();},
    };
}
