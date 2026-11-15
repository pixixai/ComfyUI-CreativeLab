const cache=new Map();
export function invalidateInputFiles(){cache.clear();}

export async function inputDirectory(kind,directory=''){
    const key=kind+':'+directory,known=cache.get(key);
    if(known&&Date.now()-known.time<15000)return known.promise;
    const promise=fetch('/clab/input_files?'+new URLSearchParams({kind,directory})).then(async response=>{
        if(!response.ok)throw new Error(response.status===404?'目录无法读取；若刚更新插件，请先重启 ComfyUI。':'无法读取文件列表。');
        const data=await response.json();if(!Array.isArray(data.entries))throw new Error('文件列表格式无效。');return data.entries;
    });
    const entry={promise,time:Date.now()};cache.set(key,entry);while(cache.size>64)cache.delete(cache.keys().next().value);
    try{return await promise;}catch(error){if(cache.get(key)===entry)cache.delete(key);throw error;}
}

// Native node choices remain available, including sentinels and annotated paths.
export function mergeInputEntries(directory,entries,options){
    const merged=new Map(entries.map(entry=>[entry.path,entry]));
    for(const value of options){
        if(typeof value!=='string')continue;
        const path=value.replaceAll('\\','/'),prefix=directory?directory+'/':'';
        if(!path.startsWith(prefix))continue;
        const rest=path.slice(prefix.length);if(!rest||rest.startsWith('/')||rest.split('/').includes('..'))continue;
        const slash=rest.indexOf('/'),name=slash<0?rest:rest.slice(0,slash),key=prefix+name;
        if(!merged.has(key))merged.set(key,{name,path:key,directory:slash>=0,value:slash<0?value:undefined});
    }
    return [...merged.values()].sort((a,b)=>Number(b.directory)-Number(a.directory)||a.name.localeCompare(b.name,undefined,{numeric:true}));
}

export async function inputSubtree(kind,directory,options=[],alive=()=>true,key=directory){
    const visited=new Set(),files=new Set();
    const visit=async(path,identity)=>{
        if(!alive()||visited.has(identity))return;
        visited.add(identity);
        const entries=mergeInputEntries(path,await inputDirectory(kind,path),options);
        for(const entry of entries){
            if(!alive())return;
            if(entry.directory)await visit(entry.path,entry.key??entry.path);
            else files.add(entry.value??entry.path);
        }
    };
    await visit(directory,key);return [...files];
}
