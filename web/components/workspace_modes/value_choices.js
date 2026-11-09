import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { toggleChoiceValue } from './value_parser.js';

const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const label=value=>typeof value==='boolean'?value?'True':'False':String(value);

export function availableValueChoices(fields,values) {
    return fields.map((field,index)=>{
        const choices=[...field.choices];
        if(choices.length)for(const row of values){const value=fields.length===1?row:row[index];if(value!==''&&!choices.some(choice=>same(choice,value)))choices.push(value);}
        return choices;
    });
}

export function valueChoicesHTML(fields,choices,showCount=true) {
    return fields.map((field,index)=>choices[index].length?`<section class="clab-xy-value-choices">${fields.length>1?`<div>${esc(field.displayName||field.name)}</div>`:''}<header class="clab-value-choice-head"><button type="button" data-xy-choice-all="${index}">全选</button>${showCount?`<span data-choice-count="${index}">已选择 0 项</span>`:''}<button type="button" data-choice-clear="${index}">取消选择</button></header>${choices[index].map((choice,option)=>`<label><input type="checkbox" data-xy-choice="${index}:${option}"><span>${esc(label(choice))}${field.choices.some(value=>same(value,choice))?'':'（已失效）'}</span></label>`).join('')}</section>`:'').join('');
}

export function checkValueChoices(container,values,fields,choices) {
    const selected=(index,choice)=>values.some(row=>same(fields.length===1?row:row[index],choice));
    for(const input of container.querySelectorAll('[data-xy-choice]')){
        const [index,option]=input.dataset.xyChoice.split(':').map(Number);input.checked=selected(index,choices[index][option]);
    }
    for(const button of container.querySelectorAll('[data-xy-choice-all]')){
        const index=Number(button.dataset.xyChoiceAll),count=choices[index].filter(choice=>selected(index,choice)).length;button.disabled=fields[index].choices.every(choice=>selected(index,choice));
        const label=container.querySelector(`[data-choice-count="${index}"]`);if(label)label.textContent=`已选择 ${count} 项`;container.querySelector(`[data-choice-clear="${index}"]`).disabled=count===0;
    }
}

export function selectAllValues(values,fields,index) {
    return fields[index].choices.reduce((next,choice)=>toggleChoiceValue(next,fields,index,choice,true),values);
}

export const clearChoiceValues=(values,fields,index)=>values.filter(value=>!fields[index].choices.some(choice=>same(fields.length===1?value:value[index],choice)));
