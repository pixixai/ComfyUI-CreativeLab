// Small UI batches leave a paint opportunity between expensive component updates.
export function createFrameWork(active=()=>true){
    let jobs=[],frame=0,revision=0,budget=5;
    const clear=()=>{revision++;jobs=[];cancelAnimationFrame(frame);frame=0;};
    const run=()=>{
        frame=0;if(!active()){clear();return;}
        const version=revision,deadline=performance.now()+budget;
        while(jobs.length&&version===revision&&active()){
            const job=jobs.shift();
            const complete=job();
            if((complete===false||complete==='yield')&&version===revision)jobs.unshift(job);
            if(complete==='yield')break;
            if(performance.now()>=deadline)break;
        }
        if(jobs.length&&!frame)frame=requestAnimationFrame(run);
    };
    return {clear, get pending(){return jobs.length;},
        replace(next,{afterPaint=false,budgetMs=5}={}){
            clear();budget=budgetMs;jobs=[...next];if(!jobs.length)return;
            frame=requestAnimationFrame(afterPaint?()=>{frame=requestAnimationFrame(run);}:run);
        }
    };
}
