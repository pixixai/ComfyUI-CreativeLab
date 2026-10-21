import { refreshModelVisibility } from '../modules/media_types/media_model.js';

const pausedByMode=new WeakSet();
const bound=new WeakSet();
export function synchronizeModeMedia(wrapper) {
    if(!bound.has(wrapper)){
        bound.add(wrapper);
        wrapper.addEventListener('play',event=>{
            const media=event.target;
            if(media.matches('video,audio')&&media.closest('.clab-card[hidden],.clab-area[hidden]')){pausedByMode.add(media);media.pause();}
        },true);
    }
    for(const media of wrapper.querySelectorAll('video,audio')){
        const hidden=!!media.closest('.clab-card[hidden],.clab-area[hidden]');
        if(hidden&&!media.paused){pausedByMode.add(media);media.pause();}
        else if(!hidden&&pausedByMode.has(media)){
            pausedByMode.delete(media);
            if(!document.hidden&&wrapper.closest('#clab-panel.visible'))media.play().catch(()=>{});
        }
    }
    refreshModelVisibility(wrapper);
}
