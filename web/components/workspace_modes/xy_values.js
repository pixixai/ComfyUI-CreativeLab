import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { openXYPopover } from './xy_popover.js';
import { parseValues, parseAxisValues, axisInputText, formatAxisOrder, toggleChoiceValue, validateChoiceValues } from './value_parser.js';
import { axisValueTabsHTML, attachAxisValueTabs } from './axis_value_order.js';
import { workflowParameters } from './parameters.js';
import { axisLabelControlsHTML, attachAxisLabelControls } from './axis_label_controls.js';
import { state } from '../ui_state.js';

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const label=value=>typeof value==='boolean'?value?'True':'False':String(value);
const unique=values=>[...new Map(values.map(value=>[JSON.stringify(value),value])).values()];

export function openXYValues(container,name,getXY,commit,bind,trigger,previewLabels,commitLabels) {
    const axis=getXY()[name],parameters=workflowParameters();
    const fields=axis.bindings.map(key=>parameters.find(parameter=>parameter.key===key)||{key,label:`绑定已失效 · ${key}`,type:'string',choices:[]});
    const choices=fields.map((field,index)=>{
        const available=[...field.choices];
        if(available.length)for(const row of axis.values){const value=fields.length===1?row:row[index];if(!available.some(choice=>same(choice,value)))available.push(value);}
        return available;
    });
    const groups=fields.map((field,index)=>choices[index].length?`<section class="clab-xy-value-choices">${fields.length>1?`<div>${esc(field.displayName||field.name)}</div>`:''}${choices[index].map((choice,option)=>`<label><input type="checkbox" data-xy-choice="${index}:${option}"><span>${esc(label(choice))}${field.choices.some(value=>same(value,choice))?'':'（已失效）'}</span></label>`).join('')}</section>`:'').join('');
    const singleChoice=fields.length===1&&choices[0].length>0,types=fields.map(field=>field.type);
    const hint=fields.length===1?singleChoice?'点击名称或复选框添加、移除取值。':types[0]==='string'?'每个非空行作为一条文本，逗号保留；也支持 JSON 数组。单条文本包含换行时请使用 JSON。':'支持逗号、换行或 JSON 数组，可混用逗号和换行。':`组合顺序：${fields.map(field=>field.displayName||field.name).join(' × ')}。每行一组，参数用逗号分隔，或填写 JSON 二维数组；文本含逗号、换行时请使用 JSON。勾选选项新增一组，其余参数沿用最后一组或工作流值。`;
    const placeholder=fields.length>1?'[[512,768],[768,1024]]':types[0]==='string'?'每行一条文本，或 ["森林, 小屋","城市, 雨夜"]':'20,30,40 或每行一个数值';
    const text=`<textarea data-xy-values="${name}" aria-label="${name.toUpperCase()} 轴取值" placeholder="${esc(placeholder)}">${esc(singleChoice?JSON.stringify(axis.values):axisInputText(axis,types))}</textarea>`;
    const editor=!fields.length?'<button data-xy-bind-axis>绑定参数</button>':singleChoice?`<details class="clab-xy-value-array"><summary>编辑取值数组</summary>${text}</details>`:text;
    const side=name==='y'||name==='z'?'left':getXY().origin==='bottom'?'bottom':'top',tick=trigger?.dataset.xyTick,layer=trigger?.closest('[data-xy-layer]')?.dataset.xyLayer;
    const scope=()=>layer===undefined?container:container.querySelector(`.clab-xy-layer-axes[data-xy-layer="${layer}"]`)||container;
    const anchor=()=>scope().querySelector(tick===undefined?`.axis-${name}`:`.clab-axis-label[data-xy-edit-values="${name}"][data-xy-tick="${tick}"]`)||scope().querySelector(`.axis-${name}`);
    const settings=name==='z'?'':['gap','margin'].map((key,index)=>`<label>${index?'边距':'间距'}<input type="number" min="0" step="1" data-xy-axis-setting="${key}" value="${axis[key]??(index?10:4)}" aria-label="${name.toUpperCase()}轴${index?'边距':'间距'}"></label>`).join('');
    const heading=fields.length===1?` · ${fields[0].displayName||fields[0].name||'绑定已失效'}`:fields.length?'':' · 未绑定';
    const panel=openXYPopover(anchor,`${name.toUpperCase()}轴设置`,`<div class="clab-xy-values-body">${settings?`<div class="clab-xy-axis-spacing">${settings}</div>`:''}<h4>${name.toUpperCase()}轴取值${esc(heading)}</h4>${axisLabelControlsHTML()}${axisValueTabsHTML(`${groups}${editor}<p>${fields.length?hint:'请先绑定节点参数。'}</p>`)}</div><p class="clab-xy-popup-error" role="status"></p>`,'clab-xy-values',side,container.closest('#clab-panel'));
    const textarea=panel.popup.querySelector('[data-xy-values]'),error=panel.popup.querySelector('[role=status]');
    const read=()=>singleChoice?parseValues(textarea.value,types):parseAxisValues(textarea.value,types);
    const checks=()=>{
        if(!textarea)return;
        const values=read();
        for(const input of panel.popup.querySelectorAll('[data-xy-choice]')){
            const [index,option]=input.dataset.xyChoice.split(':').map(Number),choice=choices[index][option];
            input.checked=values.some(row=>same(fields.length===1?row:row[index],choice));
        }
    };
    const clearSelection=()=>{state.selectedCardIds=[];state.selectedAreaIds=[];state.activeCardId=null;};
    let tabs;
    const apply=(fit=true)=>{
        if(!textarea)return true;
        try{
            for(const field of fields)if(!parameters.some(parameter=>parameter.key===field.key))throw new Error(`节点参数已失效：${field.key}`);
            const values=validateChoiceValues(read(),fields);
            const current=getXY()[name],selected=current.values[current.current||0],next=unique(values),changed=!same(current.values,next);current.values=next;
            if(name==='z'){current.current=Math.max(0,current.values.findIndex(value=>same(value,selected)));if(changed)clearSelection();}
            const edited=current.inputText!==textarea.value;current.inputText=textarea.value;
            if(changed||edited)commit(changed&&fit);error.textContent='';tabs?.preview(next);panel.position();return true;
        }catch(problem){error.textContent=problem.message;tabs?.preview(null);return false;}
    };
    panel.popup.addEventListener('change',event=>{
        const input=event.target;
        if(input.matches('[data-xy-axis-setting]')){
            const value=input.valueAsNumber;if(!Number.isFinite(value)||value<0){input.reportValidity();return;}
            getXY()[name][input.dataset.xyAxisSetting]=value;commit();panel.position();return;
        }
        if(input===textarea){apply();return;}
        if(!input.matches('[data-xy-choice]'))return;
        try{
            const [index,option]=input.dataset.xyChoice.split(':').map(Number);
            textarea.value=JSON.stringify(toggleChoiceValue(read(),fields,index,choices[index][option],input.checked));checks();apply();
        }catch(problem){input.checked=!input.checked;error.textContent=problem.message;}
    });
    textarea?.addEventListener('input',()=>{try{checks();tabs.preview(unique(validateChoiceValues(read(),fields)));}catch{tabs.preview(null);}});
    textarea?.addEventListener('keydown',event=>{if(event.key==='Enter'&&(event.ctrlKey||event.metaKey)){event.preventDefault();apply();}});
    const binding=panel.popup.querySelector('[data-xy-bind-axis]');if(binding)binding.onclick=()=>bind(name);
    tabs=attachAxisValueTabs(panel.popup,fields,()=>getXY()[name].values,()=>apply(),values=>{const previous=textarea.value;textarea.value=formatAxisOrder(values,types,previous);if(!apply(false))textarea.value=previous;checks();},panel.position);
    attachAxisLabelControls(panel.popup,name,getXY,previewLabels,commitLabels);
    checks();const focused=singleChoice?panel.popup.querySelector('[data-xy-choice]'):textarea||binding;focused?.focus({preventScroll:true});
}
