import { escapeHtml as esc } from '../contextmenu/content/shared.js';

export function focusTableCell(cell,edit=false) {
    if(!cell)return null;
    const editor=[...cell.querySelectorAll('.clab-table-choice,.clab-table-number,.clab-table-draft-value,textarea.clab-edit-val,.clab-edit-val-bool,.clab-custom-select-value,.clab-upload-filename')].find(element=>element.getClientRects().length&&!element.disabled);
    const target=edit&&editor?editor:cell;if(target===cell)cell.tabIndex=-1;target.focus({preventScroll:true});return target;
}

export function restoreTableEditors(wrapper) {
    for(const textarea of wrapper.querySelectorAll('textarea[data-table-max-height]')){textarea.style.setProperty('max-height',textarea.dataset.tableMaxHeight,textarea.dataset.tableMaxHeightPriority);delete textarea.dataset.tableMaxHeight;delete textarea.dataset.tableMaxHeightPriority;}
}

export function updateTableEditor(cell,area,parameter) {
    const body=cell.querySelector('.clab-input-body'),textarea=body?.querySelector('textarea.clab-edit-val');if(!body)return;
    if(textarea){if(!Object.hasOwn(textarea.dataset,'tableMaxHeight')){textarea.dataset.tableMaxHeight=textarea.style.getPropertyValue('max-height');textarea.dataset.tableMaxHeightPriority=textarea.style.getPropertyPriority('max-height');}textarea.style.removeProperty('max-height');}
    const upload=body.querySelector('.clab-upload-zone'),choices=area.type==='edit'&&parameter.type!=='boolean'&&parameter.choices?.length?parameter.choices:[];
    const numeric=!!textarea&&parameter.type==='number'&&!choices.length;
    cell.classList.toggle('clab-table-has-number',numeric);cell.classList.toggle('clab-table-has-choice',choices.length>0);
    cell.classList.toggle('clab-table-text-cell',!!textarea&&!numeric&&!choices.length||cell.dataset.editor==='text');
    let number=body.querySelector('.clab-table-number'),select=body.querySelector('.clab-table-choice');
    if(!numeric)number?.remove();else{
        if(!number){number=document.createElement('input');number.type='number';number.step='any';number.className='clab-table-number';textarea.after(number);}
        number.oninput=()=>{if(number.validity.badInput)return;area.value=number.value===''?'':number.valueAsNumber;textarea.value=number.value;window.CLab?.scheduleSave();};
        number.onchange=()=>window._clabJustSave?.();if(document.activeElement!==number)number.value=area.value??'';
    }
    if(!choices.length)select?.remove();else{
        if(!select){select=document.createElement('select');select.className='clab-table-choice';select.setAttribute('aria-label','选择参数值');(body.querySelector('.clab-upload-select')||body).append(select);}
        const index=choices.findIndex(choice=>JSON.stringify(choice)===JSON.stringify(area.value)),unlisted=index<0&&area.value!==''&&area.value!=null,signature=JSON.stringify([choices,unlisted?area.value:null]);
        if(select.dataset.options!==signature){select.innerHTML='<option value="">选择…</option>'+choices.map((choice,index)=>`<option value="${index}">${esc(choice)}</option>`).join('')+(unlisted?`<option value="current" disabled>${esc(area.value)}</option>`:'');select.dataset.options=signature;}
        if(document.activeElement!==select)select.value=unlisted?'current':index<0?'':String(index);
        select.oninput=()=>{if(select.value==='current')return;area.value=select.value===''?'':choices[Number(select.value)];window.CLab?.scheduleSave();};select.onchange=()=>{if(upload)window._clabSurgicallyUpdateArea?.(area.id);window._clabJustSave?.();};
    }
}
