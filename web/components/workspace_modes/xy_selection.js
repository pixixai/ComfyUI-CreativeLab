import { state } from '../ui_state.js';
import { updateSelectionUI } from '../ui_selection.js';
import { visibleMatrixCells, matrixOutput } from './xy_model.js';
import { selectXYCells } from './xy_layout.js';

export function attachXYSelection(container,getXY) {
    let anchor='',workspace;
    container.addEventListener('mousedown',event=>{
        if(container.closest('#clab-panel').dataset.workspaceMode!=='xy'||event.button!==0)return;
        const xy=getXY();if(workspace!==xy){workspace=xy;anchor='';}
        const empty=event.target.closest('.clab-xy-empty');
        if(empty){
            const placeholders=[...container.querySelectorAll('.clab-xy-empty')],cells=placeholders.map(node=>{const [x,y,z]=node.dataset.xyPlaceholder.split(',').map(Number);return {card:{id:node.dataset.xyPlaceholder},x,y,...(z===undefined?{}:{z})};});
            const ids=selectXYCells(cells,placeholders.filter(node=>node.classList.contains('is-selected')).map(node=>node.dataset.xyPlaceholder),empty.dataset.xyPlaceholder,anchor,event);
            placeholders.forEach(node=>node.classList.toggle('is-selected',ids.includes(node.dataset.xyPlaceholder)));
            const start=cells.find(cell=>cell.card.id===anchor),target=cells.find(cell=>cell.card.id===empty.dataset.xyPlaceholder);if(!event.shiftKey||!start||start.z!==target?.z)anchor=empty.dataset.xyPlaceholder;
            state.selectedCardIds=[];state.selectedAreaIds=[];state.activeCardId=null;updateSelectionUI();return;
        }
        const card=event.target.closest('.clab-card:not([hidden])');
        if(!card||event.target.closest('button,input,textarea,select,.clab-video-controls-interactive,.clab-glb-toolbar'))return;
        container.querySelectorAll('.clab-xy-empty.is-selected').forEach(node=>node.classList.remove('is-selected'));
        const cells=visibleMatrixCells(state.cards,xy),selected=cells.filter(cell=>state.selectedCardIds.includes(cell.card.id)||state.selectedAreaIds.includes(matrixOutput(cell.card,xy)?.id)).map(cell=>cell.card.id);
        const ids=selectXYCells(cells,selected,card.dataset.cardId,anchor,event);
        const start=cells.find(cell=>cell.card.id===anchor),target=cells.find(cell=>cell.card.id===card.dataset.cardId);if(!event.shiftKey||!start||start.z!==target?.z)anchor=card.dataset.cardId;
        state.selectedCardIds=[];state.selectedAreaIds=cells.filter(cell=>ids.includes(cell.card.id)).map(cell=>matrixOutput(cell.card,xy).id);state.activeCardId=ids.length?card.dataset.cardId:null;
        updateSelectionUI();
    },true);
}
