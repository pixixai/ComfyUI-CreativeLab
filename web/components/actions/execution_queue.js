export const executionPreferences={waiting:4};

// Count submission in progress as a reserved slot; never compile prompts concurrently.
export function createExecutionQueue({pending,limit,submit,idle}){
    const active=new Set();let filling=false,wasBusy=false;
    const fill=async()=>{
        if(filling)return;
        filling=true;if(pending().length||active.size)wasBusy=true;
        try{
            while(pending().length&&active.size<limit()){
                const task=pending().shift();if(task.batch.cancelled)continue;
                active.add(task);
                try{await submit(task);}finally{if(task.finished||!task.promptId)active.delete(task);}
            }
        }finally{
            filling=false;
            if(wasBusy&&!pending().length&&!active.size){wasBusy=false;idle();}
        }
    };
    return {fill,complete(task){active.delete(task);return fill();},
        hasWork(workspaceId){
            const belongs=task=>!task.finished&&(!workspaceId||task.workspaceId===workspaceId);
            return pending().some(task=>!task.batch.cancelled&&belongs(task))||[...active].some(belongs);
        },
        get tasks(){return [...active].filter(task=>!task.finished);}
    };
}

// Reconciliation is only needed after reconnect, a queue edit, or unexpected idle.
export async function readExecutionStates(api,tasks){
    const response=await api.fetchApi('/queue');if(response.ok===false)throw new Error('Unable to read execution queue');
    const data=await response.json(),running=new Set((data.queue_running||[]).map(item=>item[1])),waiting=new Set((data.queue_pending||[]).map(item=>item[1]));
    return Promise.all(tasks.map(async task=>{
        const id=task.promptId;
        if(running.has(id))return {task,state:'running'};
        if(waiting.has(id))return {task,state:'waiting'};
        const result=await api.fetchApi(`/history/${encodeURIComponent(id)}`);if(result.ok===false)throw new Error('Unable to read execution history');
        const history=(await result.json())[id];
        return {task,state:!history?'missing':history.status?.completed===false||history.status?.status_str==='error'?'failed':'complete',history};
    }));
}
