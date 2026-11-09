import { generateSingleCardHTML, attachCardEvents } from '../comp_taskcard.js';
import { tableParameter } from './table_model.js';
import { escapeHtml as esc } from '../contextmenu/content/shared.js';

export function promoteDraftRows(wrapper,cards) {
    for(const card of cards){
        const row=wrapper.querySelector(`.clab-table-draft-row[data-card-id="${CSS.escape(card.id)}"]`);if(!row)continue;
        row.classList.replace('clab-table-draft-row','clab-card');attachCardEvents(row);
    }
}

export function renderDraftRows(wrapper,rows,columns,parameters,selectedAreas) {
    for(const row of wrapper.querySelectorAll('.clab-table-draft-row'))if(!rows.some(item=>item.id===row.dataset.cardId))row.remove();
    for(const row of rows){
        let element=wrapper.querySelector(`:scope>[data-card-id="${CSS.escape(row.id)}"]`);
        if(!element){const temp=document.createElement('div');temp.innerHTML=generateSingleCardHTML({...row,areas:[]},rows.indexOf(row));element=temp.firstElementChild;element.classList.replace('clab-card','clab-table-draft-row');wrapper.append(element);}
        element.dataset.tableRow=row.id;element.hidden=false;element.draggable=false;
        const list=element.querySelector('.clab-area-list');
        for(const cell of list.querySelectorAll('.clab-table-draft-cell')){
            const index=columns.findIndex(column=>column.id===cell.dataset.tableColumn),area=row.areas[index];
            if(!area||area.id!==cell.dataset.areaId||list.querySelector(`.clab-area[data-area-id="${CSS.escape(area.id)}"]`))cell.remove();
        }
        for(const column of columns){
            const area=row.areas[column.index];if(list.querySelector(`.clab-area[data-area-id="${CSS.escape(area.id)}"]`))continue;
            let cell=list.querySelector(`.clab-table-draft-cell[data-table-column="${CSS.escape(column.id)}"]`);
            if(!cell){cell=document.createElement('div');cell.className='clab-table-draft-cell';cell.innerHTML='<div class="clab-input-body"></div>';list.append(cell);}
            Object.assign(cell.dataset,{areaId:area.id,cardId:row.id,tableColumn:column.id,tableIndex:column.index});cell.setAttribute('role','cell');cell.style.gridColumn=column.index+2;
            cell.classList.toggle('active',selectedAreas.has(area.id));
            const body=cell.firstElementChild,parameter=tableParameter(column.area,parameters),kind=area.type==='preview'?'output':parameter.choices?.length?'choice':parameter.type==='boolean'?'boolean':parameter.type==='number'?'number':'text';
            if(cell.dataset.editor!==kind){
                cell.dataset.editor=kind;
                body.innerHTML=kind==='output'?'':kind==='choice'?`<select class="clab-table-draft-value" data-draft-choice><option value=""> </option>${parameter.choices.map((choice,index)=>`<option value="${index}">${esc(choice)}</option>`).join('')}</select>`:kind==='boolean'?'<label class="clab-bool-label"><input type="checkbox" class="clab-table-draft-value"><span></span></label>':kind==='number'?'<input type="number" step="any" class="clab-table-draft-value">':'<textarea class="clab-table-draft-value" rows="1"></textarea>';
            }
            const input=body.querySelector('.clab-table-draft-value');if(!input||document.activeElement===input)continue;
            if(kind==='boolean'){input.checked=area.value===true;input.indeterminate=area.value==='';body.querySelector('span').textContent=area.value===''?'':String(area.value);}
            else if(kind==='choice'){const index=parameter.choices.findIndex(choice=>JSON.stringify(choice)===JSON.stringify(area.value));input.value=index<0?'':index;}
            else input.value=area.value??'';
        }
    }
}
