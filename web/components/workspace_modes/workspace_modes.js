import { state, getActiveWorkspace } from '../ui_state.js';
import { createWorkspaceView } from './view_state.js';
import { showCardsMode } from './mode_cards.js';
import { createTableController } from './mode_table.js';
import { injectWorkspaceModeStyles } from './mode_styles.js';
import { hydrateWorkspaceAreas } from './task_dom.js';
import { editHistory } from '../edit_history_runtime.js';
import { synchronizeModeMedia } from './mode_media.js';
import { createXYController } from './xy_controller.js';
import { switchWorkspace } from '../comp_workspace.js';
import { attachWorkspaceModeMenu } from './workspace_mode_menu.js';
import { workspaceModeAllowed } from './mode_policy.js';

const controllers=new WeakMap(),initialized=new WeakSet();

export function setupWorkspaceModes(panel) {
    injectWorkspaceModeStyles();
    const container=panel.querySelector('#clab-cards-container');
    let currentModeKey='',frame=0;
    const view=()=>{const workspace=getActiveWorkspace();if(!initialized.has(workspace)){workspace.view=createWorkspaceView(workspace.view);initialized.add(workspace);}return workspace.view;};
    const template=()=>state.cards.find(card=>card.id===view().templateId)||state.cards.find(card=>state.selectedCardIds.includes(card.id))||state.cards[0];
    const save=()=>window.CLab?.saveState(state);
    const saveView=()=>window.CLab?.saveState(state,{createAnchor:false});
    const xy=createXYController(container,view,save,saveView),table=createTableController(container,view,save);
    const render=()=>{
        const config=view(),wrapper=container.querySelector('.clab-cards-wrapper');if(!wrapper)return;
        const key=`${state.activeWorkspaceId}:${config.mode}`,changed=key!==currentModeKey;
        const paint=()=>{
        if(panel.dataset.workspaceMode!==config.mode)panel.dataset.workspaceMode=config.mode;
        wrapper.toggleAttribute('data-clab-retain-model',config.mode!=='cards');
        if(changed)modeMenu.close();
        if(changed){table.leave();xy.leave();showCardsMode(wrapper);currentModeKey=key;container.scrollLeft=container.scrollTop=0;}
        if(config.mode==='cards')hydrateWorkspaceAreas(wrapper);
        if(config.mode==='cards'){if(changed)window._clabUpdateCardsLayout?.();synchronizeModeMedia(wrapper);return;}
        if(config.mode==='xy'){xy.render(changed,template());if(changed)saveView();return;}
        table.render(template());if(changed)saveView();
        };
        if(changed)editHistory.withoutRecording(paint);else paint();
    };
    const changeMode=mode=>{
        if(!workspaceModeAllowed(view(),mode))return;
        editHistory.withoutRecording(()=>{
        if(mode==='table'||mode==='xy')view().structuredMode=mode;
        if(view().mode==='xy'&&mode!=='xy')xy.exportRecords();
        if(mode==='table'&&view().mode!=='table'){
            const selected=state.cards.find(card=>state.selectedCardIds.includes(card.id)||card.areas.some(area=>state.selectedAreaIds.includes(area.id)));
            if(selected){view().templateId=selected.id;view().table.empty=false;}
        }
        view().mode=mode;state.painterMode=false;state.painterSource=null;
        render();saveView();document.dispatchEvent(new CustomEvent('clab_render_ui'));
        });
    };
    const modeMenu=attachWorkspaceModeMenu(panel.querySelector('.clab-workspace-strip'),(mode,id)=>{if(id!==state.activeWorkspaceId)switchWorkspace(id);if(mode!==view().mode)changeMode(mode);});
    panel.addEventListener('dragstart',event=>{if(view().mode!=='cards'&&event.target.closest('.clab-card,.clab-area')&&!(view().mode==='table'&&event.target.closest('[data-table-row-header],.clab-history-thumb')))event.preventDefault();},true);
    document.addEventListener('clab_workspace_view_change',()=>{if(view().mode==='cards'||frame)return;frame=requestAnimationFrame(()=>{frame=0;if(panel.classList.contains('visible'))render();});});
    document.addEventListener('clab_before_edit_history',()=>{if(panel.classList.contains('visible'))table.flush();});
    controllers.set(panel,{render,changeMode,restore(){table.leave();xy.leave();currentModeKey='';editHistory.withoutRecording(render);}});
}

export function refreshWorkspaceModes(panel) {controllers.get(panel)?.render();}
export function restoreWorkspaceModes(panel) {controllers.get(panel)?.restore();}

export function setWorkspaceMode(panel,mode) {controllers.get(panel)?.changeMode(mode);}
