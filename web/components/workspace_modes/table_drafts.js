import { state } from '../ui_state.js';
import { generateSingleCardHTML, attachCardEvents } from '../comp_taskcard.js';
import { tableParameter } from './table_model.js';
import { escapeHtml as esc } from '../contextmenu/content/shared.js';
import { generateInputHTML,attachInputEvents } from '../modules/module_input.js';
import { generateAreaHTML,generateDeferredAreaHTML,attachAreaEvents } from '../comp_modulearea.js';
import { moveModuleDOM } from '../modules/module_lifecycle.js';

export function renderDraftRows(wrapper,rows,columns,parameters,selectedAreas,cards,defer) {
    const actual=new Map(cards.map(card=>[card.id,card]));
    for(const row of wrapper.querySelectorAll('.clab-table-draft-row'))if(!rows.some(item=>item.id===row.dataset.cardId))row.remove();
    for(const row of rows){
        let element=wrapper.querySelector(`:scope>[data-card-id="${CSS.escape(row.id)}"]`);
        if(!element){const temp=document.createElement('div');temp.innerHTML=generateSingleCardHTML({...row,areas:[]},rows.indexOf(row));element=temp.firstElementChild;if(!actual.has(row.id))element.classList.replace('clab-card','clab-table-draft-row');wrapper.append(element);attachCardEvents(element);}
        else if(actual.has(row.id)&&element.classList.contains('clab-table-draft-row')){element.classList.replace('clab-table-draft-row','clab-card');attachCardEvents(element);}
        element.dataset.tableRow=row.id;element.hidden=false;element.draggable=false;
        const list=element.querySelector('.clab-area-list');
        const wanted=new Map(columns.map(column=>[row.areas[column.index].id,column]));
        const cells=new Map();for(const cell of [...list.children]){if(!wanted.has(cell.dataset.areaId))cell.remove();else cells.set(cell.dataset.areaId,cell);}
        const realAreas=new Set((actual.get(row.id)?.areas||[]).map(area=>area.id));let added=false;
        for(const column of columns){
            const area=row.areas[column.index];let cell=cells.get(area.id);
            if(realAreas.has(area.id)){
                if(cell&&!cell.classList.contains('clab-area')){cell.remove();cell=null;}
                if(!cell){const temp=document.createElement('div');temp.innerHTML=(defer?generateDeferredAreaHTML:generateAreaHTML)(area,actual.get(row.id));cell=temp.firstElementChild;moveModuleDOM(list,cell);added=true;}
                Object.assign(cell.dataset,{tableColumn:column.id,tableIndex:column.index});continue;
            }
            if(!cell){cell=document.createElement('div');cell.className='clab-table-draft-cell';cell.innerHTML='<div class="clab-input-body"></div>';list.append(cell);}
            Object.assign(cell.dataset,{areaId:area.id,cardId:row.id,tableColumn:column.id,tableIndex:column.index});cell.setAttribute('role','cell');cell.style.gridColumn=column.index+2;
            cell.classList.toggle('active',selectedAreas.has(area.id));
            if(defer&&(!cell.firstElementChild?.children.length||cell.hasAttribute('data-clab-virtual'))){cell.dataset.clabVirtual='';continue;}
            renderDraftValue(cell,area,tableParameter(column.area,parameters),row);
        }
        if(added)attachAreaEvents(element);
    }
}

export function renderDraftValue(cell,area,parameter,row){
    let body=cell.querySelector(':scope>.clab-input-body');if(!body){body=document.createElement('div');body.className='clab-input-body';cell.append(body);}
    if(area.type==='edit'&&parameter.uploadType){
        const signature=JSON.stringify([parameter.uploadType,area.targetNodeId,area.targetWidget,area.targetWidgets,area.value,area.showUploadPreview]);
        if(cell.dataset.editor!=='file'||cell.dataset.fileConfig!==signature||!cell.querySelector('.clab-upload-zone')){
            const temp=document.createElement('div');temp.innerHTML=generateInputHTML(area,{id:cell.dataset.cardId,areas:[area]});
            const root=temp.firstElementChild;cell.replaceChildren(root.querySelector('.clab-input-header'),root.querySelector('.clab-input-body'));cell.insertAdjacentHTML('beforeend','<input type="hidden" class="clab-table-draft-value">');cell.dataset.editor='file';cell.dataset.fileConfig=signature;
        }
        const input=cell.querySelector('.clab-table-draft-value'),field=cell.querySelector('.clab-upload-filename');input.value=area.value??'';
        if(document.activeElement!==field){field.value=area.value??'';field.title=field.value;}
        const owner=state.activeWorkspaceId,update=()=>{
            if(!cell.isConnected||state.activeWorkspaceId!==owner)return;
            if(row?.sheetRow){row.sheetRow.uploadPreviews??={};row.sheetRow.uploadPreviews[area.tableColumnId]=area.showUploadPreview===true;}
            input.value=area.value??'';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
        };
        attachInputEvents(cell,{card:row||{id:cell.dataset.cardId},area,select:update,update});return;
    }
    if(cell.dataset.editor==='file'){body=document.createElement('div');body.className='clab-input-body';cell.replaceChildren(body);delete cell.dataset.fileConfig;}
    const kind=area.type==='preview'?'output':parameter.choices?.length?'choice':parameter.type==='boolean'?'boolean':parameter.type==='number'?'number':'text';
            if(cell.dataset.editor!==kind||!body.children.length){
                cell.dataset.editor=kind;
                body.innerHTML=kind==='output'?'':kind==='choice'?`<select class="clab-table-draft-value" data-draft-choice><option value=""> </option>${parameter.choices.map((choice,index)=>`<option value="${index}">${esc(choice)}</option>`).join('')}</select>`:kind==='boolean'?'<label class="clab-bool-label"><input type="checkbox" class="clab-table-draft-value"><span></span></label>':kind==='number'?'<input type="number" step="any" class="clab-table-draft-value">':'<textarea class="clab-table-draft-value" rows="1"></textarea>';
            }
            const input=body.querySelector('.clab-table-draft-value');if(!input||document.activeElement===input)return;
            if(kind==='boolean'){input.checked=area.value===true;input.indeterminate=area.value==='';body.querySelector('span').textContent=area.value===''?'':String(area.value);}
            else if(kind==='choice'){const index=parameter.choices.findIndex(choice=>JSON.stringify(choice)===JSON.stringify(area.value));input.value=index<0?'':index;}
            else input.value=area.value??'';
}
