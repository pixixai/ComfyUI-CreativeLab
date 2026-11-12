import { downloadPreviewBlob } from './preview_export.js';
import { browseGroupCover } from './preview_browse.js';

export function filmstripDownloadRecords(groups,covers,keys,selected,includeHistory) {
    return groups.flatMap(group=>{
        const active=group.records.filter(record=>keys.has(record.key));
        if (selected && !active.length) return [];
        if (includeHistory) return group.records;
        return selected ? active : [browseGroupCover(group,covers)];
    });
}

export function outputDownloadRecords(card,area,includeHistory) {
    const history=area.history||[];
    const make=(url,index)=>({cardId:card.id,areaId:area.id,url,index});
    if (includeHistory && history.some(Boolean)) return history.flatMap((url,index)=>url?[make(url,index)]:[]);
    if (area.missingHistoryRun) return [];
    const url=area.resultUrl;
    if (!url) return [];
    const index=history[area.historyIndex]===url?area.historyIndex:history.lastIndexOf(url);
    return [make(url,index)];
}

export function mediaDownloadFiles(cards,records) {
    const taskOrder=new Map(cards.map((card,index)=>[card.id,index+1]));
    const moduleOrder=new Map(cards.flatMap(card=>card.areas.filter(area=>area.type==='preview')
        .map((area,index)=>[JSON.stringify([card.id,area.id]),index+1])));
    const items=new Map();
    for (const {cardId,areaId,index,url} of records) {
        const source=JSON.stringify([cardId,areaId]),task=taskOrder.get(cardId),module=moduleOrder.get(source);
        if (!url||!task||!module) continue;
        const position=Math.max(0,index)+1;
        items.set(JSON.stringify([source,position,url]),{task,module,position,url});
    }
    const width=[...items.values()].reduce((max,item)=>Math.max(max,String(item.task).length,String(item.module).length,String(item.position).length),3);
    return [...items.values()].map(({task,module,position,url})=>{
        const parsed=new URL(url,'http://local/');
        const extension=(parsed.searchParams.get('filename')||parsed.pathname).match(/\.([a-z0-9]{1,12})$/i)?.[1]||'';
        return {url,base:[task,module,position].map(number=>String(number).padStart(width,'0')).join('-'),extension};
    });
}

function unusedFilename(base,extension,names) {
    const tail=extension?'.'+extension:'';
    let name=base+tail;
    for (let n=2;names.has(name.toLowerCase());n++) name=base+'_'+n+tail;
    names.add(name.toLowerCase());
    return name;
}

async function downloadFiles(files,directory,archiveName) {
    const names=new Set(), archive={};
    if (directory) for await (const name of directory.keys()) names.add(name.toLowerCase());
    let saved=0, failed=0;
    for (const {url,base,extension} of files) {
        try {
            const response=await fetch(url);
            if (!response.ok) throw new Error('HTTP '+response.status);
            const mime=(response.headers.get('content-type')||'').split(';')[0].trim().toLowerCase();
            const ext=extension||({'image/jpeg':'jpg','text/plain':'txt','text/markdown':'md','application/json':'json','audio/mpeg':'mp3','video/quicktime':'mov','model/gltf-binary':'glb'})[mime]
                ||mime.match(/^(?:image|audio|video)\/([a-z0-9]+)$/)?.[1]||'bin';
            const name=unusedFilename(base,ext,names);
            if (directory) {
                const file=await directory.getFileHandle(name,{create:true});
                try {
                    const stream=await file.createWritable();
                    if (response.body) await response.body.pipeTo(stream);
                    else await stream.close();
                } catch (error) {
                    await directory.removeEntry(name).catch(()=>{});
                    throw error;
                }
            } else archive[name]=new Uint8Array(await response.arrayBuffer());
            saved++;
        } catch { failed++; }
    }
    if (saved && !directory) {
        const {zipSync}=await import('../../../vendor/zip.js');
        downloadPreviewBlob(new Blob([zipSync(archive,{level:0})],{type:'application/zip'}),archiveName+'.zip');
    }
    return {saved,failed};
}

const captions={
    browse:['含组内全部记录','下载各组封面，或当前正在预览的记录。'],
    compare:['含组内全部记录','下载各组封面，或当前 A/B 两侧的记录。'],
    detail:['含所有生成记录','下载显示中的内容媒体，或当前选中卡片的内容媒体。'],
    table:['含所有生成记录','下载可见输出的当前记录，或所选行、列、单元格中的输出。'],
    xy:['含所有生成记录','下载可见矩阵的当前记录，或选中格子的记录。'],
};
const modeNames={browse:'浏览',compare:'比较',detail:'明细表',table:'参数表',xy:'XY矩阵'};

export function createPreviewDownloads(root,getRecords,getCards) {
    const right=root.querySelector('.clab-preview-modal-right');
    const notice=root.querySelector('.clab-review-notice');
    const history=new Set();
    let format='zip',busy=false;
    const canPickFolder=()=>typeof window.showDirectoryPicker==='function';
    function refresh() {
        const mode=root.dataset.reviewMode;
        const [label,hint]=captions[mode];
        let section=right.querySelector('[data-review-downloads]');
        if (!section || section.dataset.reviewDownloads!==mode) {
            section?.remove();
            right.insertAdjacentHTML('beforeend', `<section class="clab-review-downloads" data-review-downloads="${mode}">
                <h3 title="${hint}">下载媒体</h3>
                <label class="clab-review-field clab-review-download-format"><select data-review-download-format aria-label="保存方式">
                    <option value="zip">打包 ZIP</option><option value="folder"${canPickFolder()?'':' disabled'}>保存到文件夹</option>
                </select></label>
                <label class="clab-review-check"><input type="checkbox" data-review-download-history>${label}</label>
                <div class="clab-review-export">
                    <button type="button" data-review-download="all">下载全部</button>
                    <button type="button" data-review-download="selected">下载选中</button>
                </div></section>`);
            section=right.lastElementChild;
        }
        section.querySelector('[data-review-download-history]').checked=history.has(mode);
        section.querySelector('[data-review-download-format]').value=canPickFolder()?format:'zip';
        for (const button of section.querySelectorAll('[data-review-download]')) {
            button.disabled=busy||!getRecords(button.dataset.reviewDownload==='selected',history.has(mode)).length;
        }
    }
    right.addEventListener('change',event=>{
        const target=event.target,mode=root.dataset.reviewMode;
        if (target.matches('[data-review-download-history]')) {
            if (target.checked) history.add(mode); else history.delete(mode);
            refresh();
        } else if (target.matches('[data-review-download-format]')) format=target.value;
    });
    right.addEventListener('click',async event=>{
        const button=event.target.closest('[data-review-download]');
        if (!button||busy) return;
        const mode=root.dataset.reviewMode;
        if (button.disabled) return;
        busy=true;
        refresh();
        notice.textContent='正在准备下载…';
        try {
            const files=mediaDownloadFiles(getCards(),getRecords(button.dataset.reviewDownload==='selected',history.has(mode)));
            let directory;
            if (format==='folder'&&canPickFolder()) {
                try { directory=await window.showDirectoryPicker({mode:'readwrite'}); }
                catch(error) {
                    if (error.name!=='AbortError') throw error;
                    notice.textContent='已取消选择文件夹。';return;
                }
            }
            const {saved,failed}=await downloadFiles(files,directory,`${modeNames[mode]}-媒体`);
            notice.textContent=failed?`已下载 ${saved} 个文件，${failed} 个文件读取或写入失败。`:`已下载 ${saved} 个文件。`;
        } catch(error) { notice.textContent=`下载失败：${error.message}`; }
        finally { busy=false;refresh(); }
    });
    return {refresh};
}
