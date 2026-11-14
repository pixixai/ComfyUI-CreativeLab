// Small UI batches leave a paint opportunity between expensive component updates.
export function createFrameWork(active=()=>true){
    let jobs=[],frame=0,revision=0;
    const clear=()=>{revision++;jobs=[];cancelAnimationFrame(frame);frame=0;};
    const run=()=>{
        frame=0;if(!active()){clear();return;}
        const version=revision,deadline=performance.now()+5;let count=0;
        while(jobs.length&&version===revision&&active()){
            jobs.shift()();
            if(++count>=2||performance.now()>=deadline)break;
        }
        if(jobs.length&&!frame)frame=requestAnimationFrame(run);
    };
    return {clear, get pending(){return jobs.length;},
        replace(next,{afterPaint=false}={}){
            clear();jobs=[...next];if(!jobs.length)return;
            frame=requestAnimationFrame(afterPaint?()=>{frame=requestAnimationFrame(run);}:run);
        }
    };
}
