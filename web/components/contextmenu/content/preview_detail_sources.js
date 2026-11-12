import { detailInputs,detailInputGroups,detailOutputGroups,detailOutputRecords,detailCardMedia,detailFieldKey } from './preview_detail_model.js';
import { detailSourceControls,detailSourceTaskHTML } from './preview_detail_sources_html.js';
import { sourceMediaHTML,createSourceMediaObserver } from './preview_source_media_html.js';
import { createSourceRatios } from './preview_source_ratios.js';

export function createDetailSources(left,config,eyeIcon) {
    const ratios=createSourceRatios(left),media=createSourceMediaObserver(left),closed=new Set();
    let cards=[],rows=[],initialized=false,signature='';

    function selection() {
        for(const group of left.querySelectorAll('[data-detail-source]')) {
            group.querySelector('summary').classList.toggle('clab-detail-source-active',group.dataset.detailSource===config.active);
            for(const input of group.querySelectorAll('[data-detail-input]'))input.closest('.clab-detail-source-option').classList.toggle('clab-detail-source-current',config.selectedFields.has(detailFieldKey(group.dataset.detailSource,input.value)));
        }
    }
    function sync(nextCards) {
        cards=nextCards;
        const inputs=detailInputGroups(cards,config),outputs=detailOutputGroups(cards,config);
        const selections=new Map(cards.map(card=>[card.id,detailCardMedia(card,config)]));
        for(const input of left.querySelectorAll('[data-detail-input]')) {
            input.checked=!config.inputs.has(input.dataset.detailInput)||config.inputs.get(input.dataset.detailInput).has(input.value);
            const button=input.closest('.clab-detail-source-option').querySelector('[data-detail-visibility]'),title=button.dataset.detailVisibility,group=inputs.get(title);
            const shown=!!group&&group.shown===group.matches.length;
            button.disabled=!group;button.title=group?`在所有卡片中${shown?'隐藏':'显示'}同名字段『${title}』`:'当前展示的卡片中没有同名字段';
            button.setAttribute('aria-label',button.title);button.setAttribute('aria-pressed',group?.shown&&!shown?'mixed':String(shown));button.innerHTML=eyeIcon(shown);
        }
        for(const {row,card,area} of rows) {
            const selected=selections.get(card.id),input=row.querySelector('[data-detail-output]');
            input.checked=area.id===selected.area?.id;input.title='选择内容模块';
            const apply=row.querySelector('[data-detail-output-switch]');
            apply.disabled=!outputs.has(apply.dataset.detailOutputSwitch);apply.title=`批量应用『${apply.dataset.detailOutputSwitch}』（当前勾选任务）`;apply.setAttribute('aria-label',apply.title);
            for(const thumb of row.querySelectorAll('[data-detail-record]')){
                const active=input.checked&&thumb.dataset.recordKey===selected.record?.key;
                thumb.classList.toggle('active',active);thumb.setAttribute('aria-pressed',String(active));
            }
            for(const pin of row.querySelectorAll('[data-detail-cover]')){
                const covered=selected.customCover&&pin.dataset.recordKey===selected.coverRecord.key;
                pin.setAttribute('aria-pressed',String(covered));pin.title=covered?'取消封面':'设为任务封面';pin.setAttribute('aria-label',pin.title);pin.classList.toggle('selected',covered);
            }
        }
        for(const preview of left.querySelectorAll('[data-detail-task-preview]')){
            const selected=selections.get(preview.dataset.detailTaskPreview);
            preview.classList.toggle('is-stacked',selected.customCover);
            for(const role of ['output','cover']){
                const button=preview.querySelector(`[data-detail-source-pool="${role}"]`),record=role==='cover'?selected.coverRecord:selected.record;
                button.hidden=role==='cover'&&!selected.customCover;button.disabled=role==='output'&&!selected.area;
                button.title=role==='cover'?`封面 · ${record?.name||''}`:`内容 · ${selected.area?.title||'未选择输出模块'} · 点击选择记录`;
                button.setAttribute('aria-label',button.title);
                if(button.hidden)continue;
                const poster=button.querySelector('.clab-source-cover');
                if(poster.dataset.recordKey!==(record?.key||'')){poster.dataset.recordKey=record?.key||'';poster.innerHTML=sourceMediaHTML(record);}
            }
            preview.closest('[data-detail-source]').classList.toggle('is-unchecked',!config.tasks.has(preview.dataset.detailTaskPreview));
        }
        for(const input of left.querySelectorAll('[data-detail-task]'))input.checked=config.tasks.has(input.dataset.detailTask);
        const outputCount=cards.filter(card=>config.tasks.has(card.id)).reduce((count,card)=>{
            const selected=selections.get(card.id),chosen=selected.area?.id,cover=selected.customCover?selected.coverArea.id:null;
            return count+new Set([chosen,cover].filter(Boolean)).size;
        },0);
        const count=left.querySelector('[data-detail-count]');
        count.textContent=`${config.tasks.size} 个任务 · ${outputCount} 个输出`;count.title=count.textContent;
        const tree=left.querySelector('.clab-detail-source-tree');
        ratios.observe(new Map([...rows.map(({row,records})=>[row,records]),...[...tree.querySelectorAll('[data-detail-task-preview]')].map(preview=>[preview,selections.get(preview.dataset.detailTaskPreview).records])]));
        selection();media.observe(tree);
    }
    function render(nextCards) {
        cards=nextCards;
        if(initialized)for(const group of left.querySelectorAll('[data-detail-source]'))group.open?closed.delete(group.dataset.detailSource):closed.add(group.dataset.detailSource);
        if(!left.querySelector('[data-detail-search]')){signature='';left.innerHTML=detailSourceControls();}
        left.querySelector('[data-detail-search]').value=config.search;left.querySelector('[data-detail-type]').value=config.typeFilter;
        left.querySelector('[data-detail-columns]').value=config.sourceColumns;left.querySelector('[data-detail-columns-label]').textContent=`${config.sourceColumns} 列`;
        const tree=left.querySelector('.clab-detail-source-tree'),scroll=left.scrollTop,query=config.search.trim().toLowerCase();
        const tasks=cards.flatMap((card,index)=>{
            const title=card.title||`#${index+1}`,matches=title.toLowerCase().includes(query);
            const outputs=card.areas.filter(area=>area.type==='preview').map((area,index)=>({area,title:area.title||`##${index+1}`,records:detailOutputRecords(card,area)}))
                .filter(output=>(!config.typeFilter||output.records.some(record=>record.type===config.typeFilter))&&(!query||matches||output.title.toLowerCase().includes(query)));
            const inputs=detailInputs(card).filter(field=>!query||matches||field.title.toLowerCase().includes(query));
            if((config.typeFilter&&!outputs.length)||(query&&!outputs.length&&!inputs.length))return [];
            return [{card,title,outputs,inputs}];
        });
        const next=JSON.stringify([config.search,config.typeFilter,tasks.map(({card,title,outputs,inputs})=>[card.id,title,outputs.map(({area,title,records})=>[area.id,title,records.map(record=>record.key)]),inputs.map(field=>[field.id,field.title,field.historical])])]);
        if(next!==signature)tree.innerHTML=tasks.map(task=>detailSourceTaskHTML(task,closed.has(task.card.id),config.typeFilter)).join('')||'<p class="clab-review-note">没有匹配的任务或模块</p>';
        tree.style.setProperty('--browse-thumb-columns',config.sourceColumns);
        rows=[];
        const elements=new Map([...tree.querySelectorAll('[data-detail-source-output]')].map(row=>[row.dataset.detailSourceOutput,row]));
        for(const {card,outputs} of tasks)for(const {area,records} of outputs)rows.push({card,area,records,row:elements.get(area.id)});
        sync(cards);
        signature=next;initialized=true;
        left.style.setProperty('--browse-controls-height',`${left.querySelector('.clab-source-controls').offsetHeight}px`);left.scrollTop=scroll;
    }
    function locate(cardId,fieldId='') {
        const find=()=>{const group=left.querySelector(`[data-detail-source="${CSS.escape(cardId)}"]`);return {group,target:fieldId?group?.querySelector(`[data-detail-input][value="${CSS.escape(fieldId)}"]`)?.closest('.clab-detail-source-option'):group?.querySelector('summary')};};
        let {group,target}=find();
        if(!target&&(config.search||config.typeFilter)){config.search='';config.typeFilter='';render(cards);({group,target}=find());}
        reveal(group,target);
    }
    function reveal(group,target) {
        if(!group||!target||!left.clientHeight)return;
        group.open=true;
        const bounds=left.getBoundingClientRect(),rect=target.getBoundingClientRect();
        const top=Math.max(bounds.top+left.clientTop+4,left.querySelector('.clab-source-controls').getBoundingClientRect().bottom+4),bottom=bounds.top+left.clientTop+left.clientHeight-4;
        if(rect.top<top||rect.bottom>bottom)left.scrollTop+=(rect.top+rect.bottom-top-bottom)/2;
    }
    function locateRecord(cardId,areaId,key) {
        const find=()=>{const row=rows.find(item=>item.card.id===cardId&&item.area.id===areaId)?.row;return row?[...row.querySelectorAll('[data-detail-record]')].find(button=>button.dataset.recordKey===key):null;};
        let target=find();
        if(!target&&(config.search||config.typeFilter)){config.search='';config.typeFilter='';render(cards);target=find();}
        if(target)reveal(target.closest('[data-detail-source]'),target);
        return target;
    }
    const historyGroups=()=>rows.map(({card,area,records})=>({card,area,records:records.filter(record=>!config.typeFilter||record.type===config.typeFilter)}));
    return {render,sync,selection,locate,locateRecord,historyGroups,reset(){closed.clear();initialized=false;signature='';},release(){media.release();ratios.release();rows=[];signature='';}};
}
