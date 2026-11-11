import { app } from '../../../../../scripts/app.js';
import { getActiveWorkspace } from '../../ui_state.js';
import { buildPreviewJSON } from './preview_records.js';
import { mediaDownloadFiles } from './preview_downloads.js';
import { downloadPreviewBlob } from './preview_export.js';

function archiveFolder() {
    const config=app.graph?._nodes.find(node=>node.type==='CLab_SystemConfig');
    const defaults=['⚓ CLab System Config','⚓ CLab系统配置','⚓ CLab 系统配置','CLab_SystemConfig'];
    const title=config?.title?.trim();
    const workflow=title&&!defaults.includes(title)?title:app.extensionManager?.workflow?.activeWorkflow?.filename?.replace(/\.json$/i,'')||'Unsaved_Workflow';
    const clean=value=>value.replace(/[\\/:"*?<>|]/g,'_').trim();
    return `${window._clabArchiveDir||'CLab'}/${clean(workflow)}_${clean(getActiveWorkspace().name||'工作区 1')}`;
}

async function copyPreviewFiles(cards,records) {
    const folder=archiveFolder();
    const items=mediaDownloadFiles(cards,records);
    const files=items.flatMap(item=>{
        const url=new URL(item.url,location.origin),filename=url.searchParams.get('filename');
        if (url.origin!==location.origin||!filename) return [];
        return [{id:item.base,filename,type:url.searchParams.get('type')||'output',
            subfolder:url.searchParams.get('subfolder')||'',target_subfolder:folder,target_filename:item.base}];
    });
    if (!files.length) throw new Error('当前范围没有可整理的 ComfyUI 媒体文件');
    const response=await fetch('/clab/organize_files',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'copy',files}),
    });
    if (!response.ok) throw new Error(`整理失败（HTTP ${response.status}）`);
    const result=await response.json();
    if (result.status!=='success') throw new Error(result.error||'整理失败');
    const count=result.results.length,skipped=items.length-count;
    return `已复制 ${count} 个文件到 output/${folder}${skipped?`，${skipped} 个文件未能整理`:''}。`;
}

export function createPreviewDataExport(root,getRecords,getCards,getJSONCards) {
    const right=root.querySelector('.clab-preview-modal-right'),notice=root.querySelector('.clab-review-notice');
    const organizationHistory=new Set(),jsonHistory=new Set(),jsonKinds=new Map();
    let busy=false;
    function refresh() {
        const mode=root.dataset.reviewMode;
        let group=right.querySelector('[data-review-data-export]');
        if (!group||group.dataset.reviewDataExport!==mode) {
            group?.remove();
            group=document.createElement('div');
            group.className='clab-review-data-export';group.dataset.reviewDataExport=mode;
            group.innerHTML=`<section class="clab-review-downloads"><h3>收集整理</h3>
                <label class="clab-review-check"><input type="checkbox" data-review-organize-history>含组内全部记录</label>
                <div class="clab-review-export"><button type="button" data-review-data-action="organize">复制到子文件夹</button></div></section>
                <section class="clab-review-downloads"><h3>导出 JSON 数据</h3>
                <div class="clab-review-json-kinds">${[['input','输入模块'],['output','输出模块'],['all','输入+输出模块']].map(([value,label])=>
                    `<label class="clab-review-check"><input type="radio" name="clab-review-json-kind" data-review-json-kind value="${value}">${label}</label>`).join('')}</div>
                <label class="clab-review-check"><input type="checkbox" data-review-json-history>含组内全部记录</label>
                <div class="clab-review-export"><button type="button" data-review-data-action="copy-json">复制</button>
                <button type="button" data-review-data-action="download-json">下载</button></div></section>`;
            const host=right.querySelector(':scope > .clab-review-sheet-settings')||right;
            host.append(group);
        }
        group.querySelector('[data-review-organize-history]').checked=organizationHistory.has(mode);
        group.querySelector('[data-review-json-history]').checked=jsonHistory.has(mode);
        const kind=jsonKinds.get(mode)||'all';
        group.querySelectorAll('[data-review-json-kind]').forEach(input=>input.checked=input.value===kind);
        group.querySelector('[data-review-data-action=organize]').disabled=busy||!getRecords(false,organizationHistory.has(mode)).length;
        const canExport=getJSONCards().some(card=>card.areas.some(area=>kind==='all'||area.type===(kind==='input'?'edit':'preview')));
        for (const button of group.querySelectorAll('[data-review-data-action$="-json"]')) button.disabled=busy||!canExport;
    }
    right.addEventListener('change',event=>{
        const input=event.target,mode=root.dataset.reviewMode;
        if (input.matches('[data-review-json-kind]')) jsonKinds.set(mode,input.value);
        else if (input.matches('[data-review-organize-history],[data-review-json-history]')) {
            const settings=input.matches('[data-review-json-history]')?jsonHistory:organizationHistory;
            if (input.checked) settings.add(mode); else settings.delete(mode);
        } else return;
        refresh();
    });
    right.addEventListener('click',async event=>{
        const button=event.target.closest('[data-review-data-action]');
        if (!button||button.disabled||busy) return;
        const action=button.dataset.reviewDataAction,mode=root.dataset.reviewMode;
        busy=true;refresh();
        try {
            if (action==='organize') {
                notice.textContent='正在复制媒体到子文件夹…';
                notice.textContent=await copyPreviewFiles(getCards(),getRecords(false,organizationHistory.has(mode)));
            } else {
                const kind=jsonKinds.get(mode)||'all';
                const data=buildPreviewJSON(getJSONCards(),getRecords(false,jsonHistory.has(mode)),kind,jsonHistory.has(mode),getCards());
                const json=JSON.stringify(data,null,4);
                if (action==='copy-json') {
                    await navigator.clipboard.writeText(json);
                    notice.textContent='JSON 数据已复制。';
                } else {
                    downloadPreviewBlob(new Blob([json],{type:'application/json'}),`CLab_Export_${kind}_${Date.now()}.json`);
                    notice.textContent='JSON 数据已下载。';
                }
            }
        } catch(error) { notice.textContent=`操作失败：${error.message}`; }
        finally { busy=false;refresh(); }
    });
    return {refresh};
}
