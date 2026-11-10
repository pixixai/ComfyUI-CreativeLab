import { state, getActiveWorkspace } from '../ui_state.js';
import { createWorkspaceView } from './view_state.js';
import { showCardsMode } from './mode_cards.js';
import { createTableController } from './mode_table.js';
import { injectWorkspaceModeStyles } from './mode_styles.js';
import { hydrateWorkspaceAreas } from './task_dom.js';
import { synchronizeModeMedia } from './mode_media.js';
import { createXYController } from './xy_controller.js';
import { switchWorkspace } from '../comp_workspace.js';

const controllers=new WeakMap(),initialized=new WeakSet();

export function setupWorkspaceModes(panel) {
    injectWorkspaceModeStyles();
    const container=panel.querySelector('#clab-cards-container');
    const strip=panel.querySelector('.clab-workspace-strip'),menu=strip.querySelector('.clab-mode-menu');
    const buttons=[...menu.querySelectorAll('[data-workspace-mode]')];
    let currentModeKey='',frame=0;
    let modeAnchor;
    const closeModeMenu=()=>{
        menu.hidden=true;
        modeAnchor?.setAttribute('aria-expanded','false');
        modeAnchor=null;
    };
    const openModeMenu=trigger=>{
        if(modeAnchor===trigger){closeModeMenu();return;}
        closeModeMenu();
        const workspace=state.workspaces.find(item=>item.id===trigger.closest('[data-workspace-id]').dataset.workspaceId);
        if(!workspace)return;
        const checked=buttons.find(button=>button.dataset.workspaceMode===workspace.view?.mode)||buttons[0];
        buttons.forEach(button=>button.setAttribute('aria-checked',String(button===checked)));
        modeAnchor=trigger;
        trigger.setAttribute('aria-expanded','true');
        menu.hidden=false;
        const rect=strip.getBoundingClientRect();
        const left=(trigger.getBoundingClientRect().left-rect.left)*strip.offsetWidth/rect.width;
        menu.style.left=Math.max(4,Math.min(left,strip.clientWidth-menu.offsetWidth-4))+'px';
        checked.focus({preventScroll:true});
    };
    const view=()=>{const workspace=getActiveWorkspace();if(!initialized.has(workspace)){workspace.view=createWorkspaceView(workspace.view);initialized.add(workspace);}return workspace.view;};
    const template=()=>state.cards.find(card=>card.id===view().templateId)||state.cards.find(card=>state.selectedCardIds.includes(card.id))||state.cards[0];
    const save=()=>window.CLab?.saveState(state);
    const saveView=()=>window.CLab?.saveState(state,{createAnchor:false});
    const xy=createXYController(container,view,save,saveView),table=createTableController(container,view,save);
    const render=()=>{
        const config=view(),wrapper=container.querySelector('.clab-cards-wrapper');if(!wrapper)return;
        const key=`${state.activeWorkspaceId}:${config.mode}`,changed=key!==currentModeKey;
        if(panel.dataset.workspaceMode!==config.mode)panel.dataset.workspaceMode=config.mode;
        wrapper.toggleAttribute('data-clab-retain-model',config.mode!=='cards');
        if(modeAnchor&&(changed||!modeAnchor.isConnected))closeModeMenu();
        if(changed){table.leave();xy.leave();showCardsMode(wrapper);currentModeKey=key;container.scrollLeft=container.scrollTop=0;}
        if(config.mode==='cards')hydrateWorkspaceAreas(wrapper);
        if(config.mode==='cards'){if(changed)window._clabUpdateCardsLayout?.();synchronizeModeMedia(wrapper);return;}
        if(config.mode==='xy'){xy.render(changed,template());if(changed)saveView();return;}
        table.render(template());if(changed)saveView();
    };
    const changeMode=mode=>{
        if(view().mode==='xy'&&mode!=='xy')xy.exportRecords();
        if(mode==='table'&&view().mode!=='table'){
            const selected=state.cards.find(card=>state.selectedCardIds.includes(card.id)||card.areas.some(area=>state.selectedAreaIds.includes(area.id)));
            if(selected){view().templateId=selected.id;view().table.empty=false;}
        }
        view().mode=mode;state.painterMode=false;state.painterSource=null;
        render();saveView();document.dispatchEvent(new CustomEvent('clab_render_ui'));
    };
    strip.addEventListener('click',event=>{
        const target=event.target.closest('button');if(!target)return;
        if(target.matches('[data-mode-toggle]')){openModeMenu(target);return;}
        if(modeAnchor&&menu.contains(target)){
            const trigger=modeAnchor;
            const {workspaceId}=trigger.closest('[data-workspace-id]').dataset;
            closeModeMenu();
            if(workspaceId!==state.activeWorkspaceId)switchWorkspace(workspaceId);
            if(target.dataset.workspaceMode!==view().mode)changeMode(target.dataset.workspaceMode);
            if(trigger.isConnected)trigger.focus({preventScroll:true});
        }
    });
    panel.addEventListener('dragstart',event=>{if(view().mode!=='cards'&&event.target.closest('.clab-card,.clab-area')&&!(view().mode==='table'&&event.target.closest('[data-table-row-header],.clab-history-thumb')))event.preventDefault();},true);
    document.addEventListener('pointerdown',event=>{
        if(modeAnchor&&!modeAnchor.contains(event.target)&&!menu.contains(event.target))closeModeMenu();
    },true);
    strip.querySelector('#clab-workspace-bar').addEventListener('scroll',closeModeMenu);
    strip.addEventListener('keydown',event=>{
        if(!modeAnchor)return;
        if(event.key==='Escape'){
            const trigger=modeAnchor;
            closeModeMenu();
            trigger.focus({preventScroll:true});
            event.stopPropagation();
        } else if(menu.contains(event.target)&&['ArrowUp','ArrowDown'].includes(event.key)){
            event.preventDefault();
            const at=buttons.indexOf(document.activeElement),step=event.key==='ArrowUp'?-1:1;
            buttons[(at+step+buttons.length)%buttons.length].focus({preventScroll:true});
        }
    });
    document.addEventListener('clab_workspace_view_change',()=>{if(view().mode==='cards'||frame)return;frame=requestAnimationFrame(()=>{frame=0;if(panel.classList.contains('visible'))render();});});
    controllers.set(panel,{render});
}

export function refreshWorkspaceModes(panel) {controllers.get(panel)?.render();}
