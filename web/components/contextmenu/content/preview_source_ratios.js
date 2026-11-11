export function createSourceRatios(left) {
    const sizes=new Map(),pending=new Map(),queued=new Set();
    let sections=new Map(),queue=[],observer,frame=0;

    function update() {
        for (const [section,records] of sections) {
            const ratios=records.map(record=>sizes.get(record.url)).filter(Boolean).sort((a,b)=>a-b);
            const ratio=ratios.length?Math.max(1,ratios[Math.floor((ratios.length-1)/2)]):16/10;
            section.style.setProperty('--source-media-ratio',ratio);
        }
    }
    function schedule() {if(!frame)frame=requestAnimationFrame(()=>{frame=0;update();});}

    function pump() {
        while (pending.size<3&&queue.length) {
            const record=queue.shift(),video=record.type==='video';
            const media=video?document.createElement('video'):new Image();
            const stop=()=>{
                media.onload=media.onloadedmetadata=media.onerror=null;
                media.removeAttribute('src');if(video)media.load();
            };
            const finish=()=>{
                const width=video?media.videoWidth:media.naturalWidth,height=video?media.videoHeight:media.naturalHeight;
                sizes.set(record.url,width>0&&height>0?width/height:null);
                pending.delete(record.url);stop();schedule();pump();
            };
            pending.set(record.url,stop);
            if(video) {media.preload='metadata';media.onloadedmetadata=finish;}
            else media.onload=finish;
            media.onerror=finish;media.src=record.url;
        }
    }

    return {
        observe(nextSections) {
            observer?.disconnect();sections=nextSections;
            observer=new IntersectionObserver(items=>{
                for(const {target,isIntersecting} of items) {
                    if(!isIntersecting)continue;
                    observer.unobserve(target);
                    for(const record of sections.get(target)||[]) {
                        if(!['image','video'].includes(record.type)||queued.has(record.url))continue;
                        queued.add(record.url);queue.push(record);
                    }
                }
                pump();
            },{root:left,rootMargin:'100px 0px'});
            for(const section of sections.keys())observer.observe(section);
            update();
        },
        release() {
            observer?.disconnect();observer=null;cancelAnimationFrame(frame);frame=0;
            for(const stop of pending.values())stop();
            pending.clear();queued.clear();sizes.clear();sections.clear();queue=[];
        },
    };
}
