import { state } from '../ui_state.js';
import { matchingTasks, importTaskRows, cloneTask } from './task_model.js';
import { parseValues } from './value_parser.js';
import { escapeHtml as esc } from '../contextmenu/content/shared.js';

export function tableControls(cards,template,view) {
    const group=matchingTasks(cards,template),fields=template?.areas.filter(area=>area.type==='edit')||[];
    return `<label>任务模板<select data-mode-template>${cards.map((card,index)=>`<option value="${esc(card.id)}" ${card===template?'selected':''}>${esc(card.title||`#${index+1}`)}</option>`).join('')}</select></label>
        <span>${group.length} 张同结构任务${cards.length>group.length?` · 其余 ${cards.length-group.length} 张保留在卡片模式`:''}</span><small>同组结构与绑定同步，参数值分别保留。</small>
        <label>列数<input type="number" min="1" max="8" data-table-columns value="${view.columns}"></label>
        <label>输出<select data-table-output>${(template?.areas.filter(area=>area.type==='preview')||[]).map((area,index)=>`<option value="${index}" ${view.outputIndex===index?'selected':''}>${esc(area.title||`输出 ${index+1}`)}</option>`).join('')}</select></label>
        <button data-table-add>添加同结构任务</button><button data-table-select>选中同结构任务</button>
        <details class="clab-mode-popover"><summary>批量填写 ▾</summary><div>
            <label>字段<select data-table-field>${fields.map((field,index)=>`<option value="${esc(field.id)}">${esc(field.title||`输入 ${index+1}`)}</option>`).join('')}</select></label>
            <textarea data-table-values placeholder="逐行填写，或输入逗号分隔值、JSON 数组"></textarea>
            <button data-table-fill>按任务顺序填入</button><small>每行对应一张任务；值超过任务数时自动添加。</small>
        </div></details>
        <details class="clab-mode-popover"><summary>导入任务 ▾</summary><div><textarea data-table-json placeholder='[{"提示词":"第一组","步数":20},{"提示词":"第二组","步数":30}]'></textarea><button data-table-import>从 JSON 创建任务</button></div></details>`;
}

export function showTableMode(wrapper,cards,template,view) {
    const group=new Set(matchingTasks(cards,template).map(card=>card.id));
    wrapper.style.setProperty('--mode-columns',view.columns);
    wrapper.querySelectorAll(':scope > .clab-card').forEach(element=>{
        element.hidden=!group.has(element.dataset.cardId);element.draggable=false;
        let outputs=0;
        element.querySelectorAll('.clab-area').forEach(area=>{
            const preview=area.classList.contains('clab-output-area');area.hidden=preview&&outputs++!==view.outputIndex;
            area.style.order=preview?'0':'1';area.draggable=false;
        });
    });
}

export function handleTableAction(target,controls,template,view) {
    if(!template)return;
    if(target.matches('[data-table-columns]')){view.columns=Math.max(1,Math.min(8,Number(target.value)||3));return true;}
    if(target.matches('[data-table-output]')){view.outputIndex=Number(target.value)||0;return true;}
    if(target.matches('[data-table-select]')){state.selectedCardIds=matchingTasks(state.cards,template).map(card=>card.id);state.selectedAreaIds=[];return true;}
    if(target.matches('[data-table-add]')){state.cards.push(cloneTask(template));return true;}
    if(target.matches('[data-table-import]')){
        let rows;try{rows=JSON.parse(controls.querySelector('[data-table-json]').value);}catch{throw new Error('JSON 格式不正确，请使用对象数组。');}
        state.cards.push(...importTaskRows(template,rows));return true;
    }
    if(target.matches('[data-table-fill]')){
        const fieldId=controls.querySelector('[data-table-field]').value,index=template.areas.findIndex(area=>area.id===fieldId);
        if(index<0)throw new Error('请先添加输入模块。');
        const values=parseValues(controls.querySelector('[data-table-values]').value,[template.areas[index].dataType||'string']);
        const group=matchingTasks(state.cards,template);
        values.forEach((value,i)=>{if(!group[i]){group[i]=cloneTask(template);state.cards.push(group[i]);}group[i].areas[index].value=value;});
        return true;
    }
    return false;
}
