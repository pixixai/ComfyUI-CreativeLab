const pausedByMode=new WeakSet();
export function synchronizeModeMedia(wrapper) {
    for(const media of wrapper.querySelectorAll('video,audio')){
        const hidden=!!media.closest('.clab-card[hidden],.clab-area[hidden]');
        if(hidden&&!media.paused){pausedByMode.add(media);media.pause();}
        else if(!hidden&&pausedByMode.has(media)){
            pausedByMode.delete(media);
            if(!document.hidden&&wrapper.closest('#clab-panel.visible'))media.play().catch(()=>{});
        }
    }
}
