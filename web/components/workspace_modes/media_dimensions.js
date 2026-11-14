// Share successful measurements and in-flight probes for repeated media URLs.
const measured=new Map(),pending=new Map();
export function observeMediaDimensions(url,video,receive){
    const key=(video?'video:':'image:')+url,known=measured.get(key);
    if(known){measured.delete(key);measured.set(key,known);receive(known);return ()=>{};}
    let entry=pending.get(key);
    if(!entry){
        const probe=video?document.createElement('video'):new Image(),listeners=new Set();
        const dispose=()=>{probe.onload=probe.onloadedmetadata=probe.onerror=null;probe.removeAttribute('src');if(video)probe.load();};
        entry={listeners,dispose};pending.set(key,entry);
        const loaded=()=>{
            const width=video?probe.videoWidth:probe.naturalWidth,height=video?probe.videoHeight:probe.naturalHeight;
            if(!width||!height){pending.delete(key);dispose();listeners.clear();return;}
            const result={width,height};measured.set(key,result);while(measured.size>128)measured.delete(measured.keys().next().value);
            pending.delete(key);dispose();for(const listener of listeners)listener(result);listeners.clear();
        };
        if(video){probe.preload='metadata';probe.onloadedmetadata=loaded;}else{probe.decoding='async';probe.onload=loaded;}
        probe.onerror=()=>{pending.delete(key);dispose();listeners.clear();};
        // Defer the request until the first listener is registered.
        entry.start=()=>{probe.src=url;};
    }
    entry.listeners.add(receive);entry.start?.();entry.start=null;
    return ()=>{entry.listeners.delete(receive);if(!entry.listeners.size&&pending.get(key)===entry){pending.delete(key);entry.dispose();}};
}
