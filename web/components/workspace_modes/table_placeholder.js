import { getAreaResultType } from '../modules/media_types/media_utils.js';

export function renderTablePlaceholder(cell,area){
    if(!cell.matches('[data-clab-deferred],[data-clab-virtual],[data-clab-presenting]'))return;
    let preview=cell.querySelector(':scope>.clab-table-placeholder');
    const kind=area.type==='preview'?getAreaResultType(area):'value';
    const text=String(area.type==='preview'?area.textContent||({video:'视频',audio:'音频',model:'3D'})[kind]||'':area.value??'').slice(0,4000);
    const url=kind==='image'?area.resultUrl||'':'';
    const key=JSON.stringify([kind,url,text,!!area.missingHistoryRun]);
    if(!preview){preview=document.createElement('div');preview.className='clab-table-placeholder';preview.setAttribute('aria-hidden','true');cell.append(preview);}
    if(preview.dataset.key===key)return;
    preview.dataset.key=key;preview.replaceChildren();
    if(url&&!area.missingHistoryRun){const image=new Image();image.src=url;image.decoding='async';image.loading='lazy';image.draggable=false;preview.append(image);}
    else{const value=document.createElement('span');value.textContent=area.missingHistoryRun?'':text;preview.append(value);}
}
