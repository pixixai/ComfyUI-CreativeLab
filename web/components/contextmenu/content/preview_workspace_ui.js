import { escapeHtml as esc } from './shared.js';

const closed=new WeakMap();
export function groupPreviewSources(tree,cards,attribute) {
    if(!cards.some(card=>card.previewWorkspace))return;
    let folded=closed.get(tree);if(!folded){folded=new Set();closed.set(tree,folded);}
    const groups=new Map();
    for(const element of [...tree.children]){
        const card=cards.find(card=>card.id===element.getAttribute(attribute));if(!card?.previewWorkspace)continue;
        const {id,name}=card.previewWorkspace;
        if(!groups.has(id)){
            const section=document.createElement('details');section.className='clab-preview-source-workspace';section.dataset.previewSourceWorkspace=id;section.open=!folded.has(id);
            section.innerHTML=`<summary><span class="clab-source-workspace-fold"></span><span>${esc(name)}</span></summary><div class="clab-preview-source-workspace-body"></div>`;
            section.addEventListener('toggle',()=>section.open?folded.delete(id):folded.add(id));groups.set(id,section);tree.append(section);
        }
        groups.get(id).lastElementChild.append(element);
    }
}

export function injectPreviewWorkspaceStyles() {
    if(document.getElementById('clab-preview-workspace-styles'))return;
    const style=document.createElement('style');style.id='clab-preview-workspace-styles';style.textContent=`
    .clab-review-head-actions{display:flex;align-items:center;gap:12px}.clab-review-head-actions>button{display:inline-flex;align-items:center;gap:5px;background:transparent;border:0;color:#aaa;cursor:pointer;font:12px/1.5 sans-serif;padding:6px}.clab-review-head-actions>button:hover{color:#fff}
    .clab-preview-source-picker{margin:0;padding:10px;width:260px;max-height:360px;overflow:auto;background:#242424;color:#bbb;border:1px solid #444;font:12px/1.5 sans-serif}.clab-preview-source-picker label{display:flex;align-items:center;gap:8px;padding:7px;cursor:pointer}.clab-preview-source-picker h3{margin:2px 7px 8px;font-size:13px}
    .clab-preview-source-workspace{margin:8px 0}.clab-preview-source-workspace>summary{cursor:pointer;color:#ccc;font:600 12px/1.5 sans-serif;padding:6px 0}.clab-preview-source-workspace-body{margin-left:5px;padding-left:10px;border-left:1px dashed #ffffff20;min-width:0}
    .clab-detail-workspace-title{grid-column:1/-1;color:#bbb;font:600 14px/1.5 sans-serif;margin:8px 0 0}.clab-detail-workspace-title:first-child{margin-top:0}
    .clab-review-multi-grid{position:relative;width:100%;height:100%;overflow:auto;background:#181818;scrollbar-width:thin;scrollbar-color:#444 transparent}
    .clab-review-table-groups{display:flex;align-items:flex-start;width:max-content;min-width:100%;min-height:100%}.clab-review-table-group{flex:none;min-width:0}.clab-review-table-group>.clab-review-workspace-title{position:sticky;top:0;z-index:40;height:32px;width:100%;box-sizing:border-box;display:flex;align-items:center;justify-content:center;background:#191919;border:1px solid #ffffff12;color:#bbb;font:600 12px/1.5 sans-serif;cursor:pointer}.clab-review-table-group.is-selected>.clab-review-workspace-title{background:#26394b;color:#eee}
    .clab-review-table-groups .clab-review-grid{height:auto;overflow:visible}.clab-review-table-groups .clab-review-grid-stage{overflow:visible!important}.clab-review-table-groups :is(#clab-panel,.clab-review-grid)[data-workspace-mode=table] .clab-cards-wrapper{min-width:0!important}.clab-review-table-groups .clab-table-head{top:32px}
    .clab-preview-source-columns{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px}.clab-preview-source-columns>div,.clab-preview-source-columns .clab-review-sheet-settings{display:contents}.clab-preview-source-columns section+section{margin:0!important;padding:0!important;border:0!important}.clab-preview-source-columns .clab-review-check span{overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.clab-preview-source-columns .clab-grid-source-actions{flex-wrap:wrap}
    .clab-review-matrix-groups{overflow:hidden;touch-action:none;cursor:grab}.clab-review-matrix-scene{position:absolute;left:0;top:0;transform-origin:0 0;display:flex;align-items:flex-start;gap:64px;padding:24px}.clab-review-matrix-group{position:relative;flex:none}.clab-review-matrix-group>.clab-review-workspace-title{position:relative;display:flex;align-items:center;gap:14px;color:#bbb;font:600 18px/1.5 sans-serif;margin-bottom:24px;min-height:36px}.clab-review-matrix-group>.clab-review-workspace-title{box-sizing:border-box;min-width:0;flex-wrap:nowrap;background:transparent;border:0;padding:0;cursor:pointer}.clab-multi-workspace-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.clab-multi-z-summary{min-width:0;max-width:100%}.clab-multi-z-summary .clab-xy-binding{box-sizing:border-box;max-width:100%;font-size:11px;gap:4px;padding:4px 6px}.clab-multi-z-summary .clab-xy-binding>span:not(:last-child){overflow:hidden;text-overflow:ellipsis;min-width:0}.clab-review-matrix-group .clab-review-grid-stage{width:100%;height:100%;min-height:0!important;background:none!important}.clab-review-matrix-group .clab-review-grid{height:100%}.clab-review-matrix-group .clab-xy-z-binding.is-public{visibility:hidden}
    .clab-preview-source-workspace{position:relative}.clab-preview-source-workspace>summary{display:flex;align-items:center;gap:5px;list-style:none;font-size:14px}.clab-preview-source-workspace>summary::-webkit-details-marker{display:none}.clab-source-workspace-fold{width:12px;flex:none}.clab-source-workspace-fold::before{content:'▸';font-size:10px;color:#888}.clab-preview-source-workspace[open]>.clab-source-workspace-fold::before,.clab-preview-source-workspace[open]>summary .clab-source-workspace-fold::before{content:'▾'}
    .clab-preview-modal-left .clab-preview-source-workspace h3{font-size:12px}.clab-review-xy-current{margin:0 0 12px;padding:0 0 12px;border-bottom:1px solid #ffffff12}.clab-review-xy-current h3{font-size:12px}.clab-preview-source-workspace-body{margin-left:5px;padding-left:12px}
    .clab-source-media-tree [data-browse-card],.clab-detail-source-tree [data-detail-source]{position:relative}.clab-source-media-tree [data-browse-card][open]::before,.clab-detail-source-tree [data-detail-source][open]::before{content:'';position:absolute;left:6px;top:27px;bottom:4px;border-left:1px dashed #ffffff30;pointer-events:none}
    .clab-review-matrix-groups{background:#181818 radial-gradient(#343434 .7px,transparent .7px) 0 0/20px 20px}.clab-review-matrix-group{background:rgb(29,29,29);padding:var(--matrix-group-padding,16px);box-sizing:content-box}
    .clab-multi-z-summary .clab-xy-binding{border:0!important;box-shadow:inset 0 0 0 calc(1px * var(--xy-ui-scale)) #444;font-size:calc(12px * var(--xy-ui-scale));gap:calc(6px * var(--xy-ui-scale));padding:calc(5px * var(--xy-ui-scale)) calc(7px * var(--xy-ui-scale));border-radius:calc(4px * var(--xy-ui-scale))}
    .clab-review-table-group.is-selected{outline:1px solid #5aa9e9;outline-offset:-1px}
    .clab-preview-modal-left .clab-review-sheet-settings h3{font-size:12px}.clab-detail-source-tree>.clab-preview-source-workspace::before{content:none}
    @media(max-width:1100px){[data-preview-add-sources]>span{display:none}}
    `;document.head.append(style);
}
