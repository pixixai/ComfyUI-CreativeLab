import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { parseAxisValues, parseValues, coerceValue, formatAxisOrder, toggleChoiceValue } from './value_parser.js';
import { tableParameter, tableCellValue } from './table_model.js';
import { axisValueTabsHTML, attachAxisValueTabs } from './axis_value_order.js';
import { availableValueChoices, valueChoicesHTML, checkValueChoices, selectAllValues, clearChoiceValues } from './value_choices.js';

export function parseTableValues(text,type,format='auto') {
    if(!text.trim())return [];
    if(format==='auto'&&text.trim().startsWith('['))format='json';
    if(format==='auto')return parseAxisValues(text,[type]);
    if(format==='lines')return text.split(/\r\n?|\n/).filter(line=>line.trim()).map(value=>coerceValue(value,type));
    if(format==='comma')return text.split(/\r\n?|\n/).filter(line=>line.trim()).flatMap(line=>parseValues(line,[type]));
    const values=JSON.parse(text);if(!Array.isArray(values))throw new Error('请填写 JSON 数组。');return values.map(value=>value===null||value===''?'':coerceValue(value,type));
}

export function formatTableOrder(values,type,draft) {
    const text=formatAxisOrder(values,[type],draft.text);
    try{if(JSON.stringify(parseTableValues(text,type,draft.format))===JSON.stringify(values))return {text,format:draft.format};}catch{}
    return {text:JSON.stringify(values,null,2),format:'json'};
}

export function attachTableValues(container,column,group,parameters,view,apply,save,position) {
    const parameter=tableParameter(column.area,parameters),fields=[{...parameter,choices:parameter.choices||[]}],current=group.map(card=>card.areas[column.index].value??'');
    if(!view.drafts[column.id]){
        const filled=current.some(value=>value!==''),values=fields[0].choices.length?[...new Map(current.filter(value=>value!=='').map(value=>[JSON.stringify(value),value])).values()]:current;
        view.drafts[column.id]={text:filled?JSON.stringify(values,null,2):'',format:filled?'json':'auto',appliedCount:filled?current.length:0};
    }
    const draft=view.drafts[column.id];
    if(!Number.isFinite(draft.appliedCount))try{draft.appliedCount=Math.min(current.length,parseTableValues(draft.text,parameter.type,draft.format).length);}catch{draft.appliedCount=0;}
    let applied=current.slice(0,draft.appliedCount),tabs;
    const choices=availableValueChoices(fields,applied),fixed=choices[0].length>0;
    const text=`<textarea data-table-values data-xy-values="column" aria-label="列取值" placeholder="${parameter.type==='number'?'20,30,40 或每行一个数值':'每行一条文本，也支持 JSON 数组'}"></textarea>`;
    container.innerHTML=axisValueTabsHTML(`${valueChoicesHTML(fields,choices,false)}${fixed?`<details class="clab-xy-value-array"><summary>编辑取值数组</summary>${text}</details>`:text}<select class="clab-table-value-format" data-table-fill-format aria-label="拆分方式"><option value="auto">自动（按参数类型）</option><option value="lines">换行</option><option value="comma">逗号 / 换行</option><option value="json">JSON 数组</option></select><p>结束编辑或按 Ctrl/Cmd＋Enter 后应用；超出时补充行。排序、移除仅调整此列取值，保留任务和生成历史。</p>`)+'<p class="clab-xy-popup-error" role="status"></p>';
    const tools=document.createElement('div');tools.className='clab-table-value-tools';tools.append(container.querySelector('.clab-table-value-format'));const choicesHead=container.querySelector('.clab-value-choice-head');if(choicesHead)tools.append(choicesHead);container.querySelector('[data-xy-value-page=input]').prepend(tools);
    const input=container.querySelector('textarea'),format=container.querySelector('select'),status=container.querySelector('[role=status]');input.value=draft.text;format.value=draft.format;
    const read=()=>parseTableValues(input.value,parameter.type,format.value).map(value=>tableCellValue(column.area,value,parameters));
    const store=()=>{draft.text=input.value;draft.format=format.value;if(window.CLab?.scheduleSave)window.CLab.scheduleSave();else save();};
    const checks=values=>checkValueChoices(container,values,fields,choices);
    const preview=()=>{
        store();try{const values=read();checks(values);tabs?.preview(values);status.textContent='';}catch{tabs?.preview(null);}
    };
    const commit=()=>{
        try{
            const values=read();store();
            const previous=draft.appliedCount;draft.appliedCount=values.length;
            if(JSON.stringify(values)!==JSON.stringify(applied))apply(values,previous);
            applied=values;checks(values);status.textContent='';tabs?.preview(values);position();return true;
        }catch(error){status.textContent=error.message;tabs?.preview(null);return false;}
    };
    const write=values=>{Object.assign(draft,formatTableOrder(values,parameter.type,draft));input.value=draft.text;format.value=draft.format;commit();};
    input.oninput=preview;input.onchange=commit;format.onchange=commit;
    input.onkeydown=event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();commit();}};
    container.addEventListener('change',event=>{
        const choice=event.target.closest('[data-xy-choice]');if(!choice)return;
        try{const [,option]=choice.dataset.xyChoice.split(':').map(Number);write(toggleChoiceValue(read(),fields,0,choices[0][option],choice.checked));}catch(error){status.textContent=error.message;}
    });
    container.addEventListener('click',event=>{const button=event.target.closest('[data-xy-choice-all],[data-choice-clear]');if(button)try{write(button.matches('[data-choice-clear]')?clearChoiceValues(read(),fields,0):selectAllValues(read(),fields,0));}catch(error){status.textContent=error.message;}});
    tabs=attachAxisValueTabs(container,fields,()=>applied,commit,write,position);preview();
}
