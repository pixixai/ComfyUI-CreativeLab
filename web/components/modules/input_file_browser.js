import { inputDirectory,inputSubtree,invalidateInputFiles,mergeInputEntries } from './input_file_tree.js';
import { ensureInputFileStyles } from './input_file_styles.js';

const normalized=value=>String(value??'').replaceAll('\\','/');
export function attachInputFileBrowser(tree,{kind,options=[],multiple=false,getSelected,onChange,accept=()=>true,onError=()=>{},onBusy=()=>{}}){
    ensureInputFileStyles();let revision=0,keyword='',changing=false;const folders=new Map(),members=new Map();
    const alive=version=>tree.isConnected&&version===revision;
    const selected=()=>new Set(getSelected().map(normalized));
    const filter=text=>{keyword=text.trim().toLowerCase();for(const button of tree.querySelectorAll('[data-input-file]'))button.hidden=!button.dataset.inputFile.toLowerCase().includes(keyword);};
    const sync=()=>{
        const values=selected();
        for(const item of tree.querySelectorAll('[data-input-file]')){
            const checked=values.has(normalized(item.dataset.inputFile));item.setAttribute('aria-selected',String(checked));
            if(multiple)item.querySelector('input').checked=checked;else item.setAttribute('aria-checked',String(checked));
        }
        for(const [path,{input}]of folders){
            const all=members.get(path),some=[...values].some(value=>value.startsWith(path+'/'));
            input.checked=!!all?.length&&all.every(value=>values.has(normalized(value)));input.indeterminate=some&&!input.checked;
        }
    };
    const choose=async(values,checked)=>{try{await onChange(values,checked);sync();}catch(error){onError(error);sync();}};
    const lock=busy=>{changing=busy;tree.setAttribute('aria-busy',String(busy));for(const input of tree.querySelectorAll('input[type=checkbox]'))input.disabled=busy;onBusy();};
    const selectDirectory=async(path,checked,key=path)=>{
        if(changing){sync();return;}
        const version=revision;lock(true);
        try{
            const values=checked?(await inputSubtree(kind,path,options,()=>alive(version),key)).filter(accept):getSelected().filter(value=>normalized(value).startsWith(path?path+'/':''));
            if(!alive(version))return;
            if(checked){members.set(path,values);for(const name of folders.keys())if(name.startsWith(path?path+'/':''))members.set(name,values.filter(value=>normalized(value).startsWith(name+'/')));}
            await choose(values,checked);
        }catch(error){if(alive(version))onError(error);}finally{if(tree.isConnected){lock(false);sync();}else changing=false;}
    };
    const note=(parent,text)=>{const label=document.createElement('div');label.className='clab-input-file-note';label.textContent=text;parent.append(label);return label;};
    const load=async(parent,directory,version)=>{
        if(!alive(version)||!parent.isConnected)return;
        const loading=note(parent,'读取中…');let listed=[],error;
        try{listed=await inputDirectory(kind,directory);}catch(cause){error=cause.message;}
        if(!alive(version)||!parent.isConnected)return;
        loading.remove();const entries=mergeInputEntries(directory,listed,options);if(error)note(parent,error);
        for(const entry of entries){
            if(!entry.directory&&!accept(entry.value??entry.path))continue;
            if(entry.directory){
                const folder=document.createElement('details');folder.className='clab-input-file-folder';folder.dataset.directory=entry.path;
                const title=document.createElement('summary'),label=document.createElement('span'),children=document.createElement('div');label.textContent=entry.name;title.title=entry.path;children.className='clab-input-file-children';
                if(multiple){
                    const input=document.createElement('input');input.type='checkbox';input.disabled=changing;input.setAttribute('aria-label','选择文件夹内全部文件：'+entry.name);input.dataset.fileFolder=entry.path;
                    input.onclick=event=>event.stopPropagation();input.onchange=()=>selectDirectory(entry.path,input.checked,entry.key??entry.path);title.append(input);folders.set(entry.path,{input});
                }
                title.append(label);folder.append(title,children);parent.append(folder);
                let loaded=false;folder.ontoggle=()=>{if(folder.open&&!loaded){loaded=true;load(children,entry.path,version);}};
                if(!multiple&&[...selected()].some(value=>value.startsWith(entry.path+'/')))folder.open=true;
            }else{
                const item=document.createElement(multiple?'label':'button'),label=document.createElement('span'),value=entry.value??entry.path;item.className='clab-input-file-item';item.dataset.inputFile=value;item.title=value;label.textContent=entry.name;
                if(multiple){const input=document.createElement('input');input.type='checkbox';input.disabled=changing;input.onchange=()=>{if(!changing)choose([value],input.checked);else sync();};item.append(input);}
                else{item.type='button';item.setAttribute('role','radio');item.onclick=()=>choose([value],true);}
                item.append(label);parent.append(item);
                if(!multiple&&selected().has(normalized(value)))requestAnimationFrame(()=>{if(alive(version)&&!keyword)item.scrollIntoView({block:'nearest'});});
            }
        }
        if(!entries.length&&!error)note(parent,'没有对应类型的文件');
        if(!error&&!entries.some(entry=>entry.directory))members.set(directory,entries.map(entry=>entry.value??entry.path));
        sync();filter(keyword);
    };
    const refresh=()=>{revision++;tree.replaceChildren();folders.clear();members.clear();load(tree,'',revision);};
    refresh();return {sync,filter,get busy(){return changing;},refresh:()=>{invalidateInputFiles();refresh();},selectAll:()=>selectDirectory('',true),clear:()=>{if(!changing)return choose(getSelected(),false);},destroy:()=>revision++};
}
