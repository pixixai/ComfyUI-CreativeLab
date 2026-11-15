import { createFrameWork } from './frame_work.js';
import { getActiveWorkspace } from './ui_state.js';

export function createPanelLoading(panel,{toolbar,tabs,content,refresh}){
    const container=panel.querySelector('#clab-cards-container');let owner;
    const work=createFrameWork(()=>panel.classList.contains('visible')&&owner===getActiveWorkspace());
    const finish=()=>{delete container.dataset.clabProgressive;delete container.dataset.clabOpening;panel.removeAttribute('aria-busy');};
    const cancel=()=>{work.clear();finish();};
    new MutationObserver(()=>{if(!panel.classList.contains('visible')){cancel();container.dispatchEvent(new Event('clab_panel_closed'));}}).observe(panel,{attributes:true,attributeFilter:['class']});
    return {cancel,open(){
        cancel();owner=getActiveWorkspace();container.dataset.clabProgressive='';container.dataset.clabOpening='';panel.setAttribute('aria-busy','true');
        const retained=[...container.querySelectorAll('.clab-area:not([data-clab-deferred]):not([data-clab-virtual]):not([data-clab-layout])')];
        work.replace([toolbar,tabs,()=>{delete container.dataset.clabOpening;content();},()=>{
            // Newly mounted content already reflects current data. Only reconcile
            // controls retained from the previous opening (including graph edits).
            work.replace([...retained.map(root=>()=>{if(root.isConnected&&container.contains(root))refresh(root.dataset.areaId);}),finish]);
        }],{afterPaint:true});
    }};
}
