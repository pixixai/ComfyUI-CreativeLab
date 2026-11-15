import { attachInputFileBrowser } from '../modules/input_file_browser.js';
import { toggleChoiceValues } from './value_parser.js';

export function attachValueFiles(container,fields,read,write,report){
    const browsers=[];
    fields.forEach((field,index)=>{
        const tree=container.querySelector(`[data-value-file-tree="${index}"]`);if(!tree)return;
        const selected=()=>{try{return [...new Set(read().map(value=>fields.length===1?value:value[index]).filter(value=>typeof value==='string'&&value!==''))];}catch{return [];}};
        let browser;
        const count=()=>{const values=selected(),label=container.querySelector(`[data-file-choice-count="${index}"]`);if(label)label.textContent=`已选择 ${values.length} 项`;container.querySelector(`[data-file-values-clear="${index}"]`).disabled=browser?.busy||!values.length;container.querySelector(`[data-file-values-all="${index}"]`).disabled=!!browser?.busy;};
        browser=attachInputFileBrowser(tree,{kind:field.uploadType,options:field.choices,multiple:true,getSelected:selected,
            onChange:(values,checked)=>{write(toggleChoiceValues(read(),fields,index,values,checked));count();},onError:report,onBusy:count});
        container.querySelector(`[data-file-values-search="${index}"]`).oninput=event=>browser.filter(event.target.value);
        container.querySelector(`[data-file-values-refresh="${index}"]`).onclick=browser.refresh;
        container.querySelector(`[data-file-values-all="${index}"]`).onclick=browser.selectAll;
        container.querySelector(`[data-file-values-clear="${index}"]`).onclick=browser.clear;
        browsers.push({sync:()=>{browser.sync();count();}});count();
    });
    return {sync:()=>browsers.forEach(browser=>browser.sync())};
}
