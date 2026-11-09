import { state, getActiveWorkspace, saveAndRender } from '../ui_state.js';
import { createWorkspaceView } from './view_state.js';
import { showCardsMode } from './mode_cards.js';
import { createTableController } from './mode_table.js';
import { injectWorkspaceModeStyles } from './mode_styles.js';
import { hydrateWorkspaceAreas } from './task_dom.js';
import { synchronizeModeMedia } from './mode_media.js';
import { createXYController } from './xy_controller.js';

const controllers=new WeakMap(),initialized=new WeakSet();
const names={cards:'任务卡片',table:'参数表',xy:'XY 矩阵'};

export function setupWorkspaceModes(panel) {
    injectWorkspaceModeStyles();
    const container=panel.querySelector('#clab-cards-container'),switcher=panel.querySelector('.clab-mode-switch');
    let currentModeKey='',frame=0;
    const view=()=>{const workspace=getActiveWorkspace();if(!initialized.has(workspace)){workspace.view=createWorkspaceView(workspace.view);initialized.add(workspace);}return workspace.view;};
    const template=()=>state.cards.find(card=>card.id===view().templateId)||state.cards.find(card=>state.selectedCardIds.includes(card.id))||state.cards[0];
    const save=()=>window.CLab?.saveState(state),xy=createXYController(container,view,save),table=createTableController(container,view,save);
    const render=()=>{
        const config=view(),wrapper=container.querySelector('.clab-cards-wrapper');if(!wrapper)return;
        const key=`${state.activeWorkspaceId}:${config.mode}`,changed=key!==currentModeKey;
        panel.dataset.workspaceMode=config.mode;
        wrapper.toggleAttribute('data-clab-retain-model',config.mode!=='cards');
        switcher.querySelector('[data-mode-toggle]').textContent=`${names[config.mode]} ▴`;
        switcher.querySelectorAll('[data-workspace-mode]').forEach(button=>button.setAttribute('aria-checked',String(button.dataset.workspaceMode===config.mode)));
        if(changed){table.leave();xy.leave();showCardsMode(wrapper);currentModeKey=key;container.scrollLeft=container.scrollTop=0;}
        if(config.mode==='cards')hydrateWorkspaceAreas(wrapper);
        if(config.mode==='cards'){if(changed)window._clabUpdateCardsLayout?.();synchronizeModeMedia(wrapper);return;}
        if(config.mode==='xy'){xy.render(changed,template());if(changed)save();return;}
        table.render(template());if(changed)save();
    };
    const changeMode=mode=>{
        if(view().mode==='xy'&&mode!=='xy')xy.exportRecords();
        if(mode==='table'&&view().mode!=='table'){
            const selected=state.cards.find(card=>state.selectedCardIds.includes(card.id)||card.areas.some(area=>state.selectedAreaIds.includes(area.id)));
            if(selected){view().templateId=selected.id;view().table.empty=false;}
        }
        view().mode=mode;state.painterMode=false;state.painterSource=null;
        switcher.querySelector('.clab-mode-menu').hidden=true;switcher.querySelector('[data-mode-toggle]').setAttribute('aria-expanded','false');
        render();saveAndRender();
    };
    panel.addEventListener('click',event=>{
        const target=event.target.closest('button');if(!target)return;
        if(target.matches('[data-mode-toggle]')){
            const menu=switcher.querySelector('.clab-mode-menu');menu.hidden=!menu.hidden;target.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('[aria-checked=true]').focus();return;
        }
        if(target.matches('[data-workspace-mode]')){changeMode(target.dataset.workspaceMode);return;}
    });
    panel.addEventListener('dragstart',event=>{if(view().mode!=='cards'&&event.target.closest('.clab-card,.clab-area')&&!(view().mode==='table'&&event.target.closest('[data-table-row-header],.clab-history-thumb')))event.preventDefault();},true);
    document.addEventListener('pointerdown',event=>{if(!switcher.contains(event.target)){switcher.querySelector('.clab-mode-menu').hidden=true;switcher.querySelector('[data-mode-toggle]').setAttribute('aria-expanded','false');}},true);
    switcher.addEventListener('keydown',event=>{
        const menu=switcher.querySelector('.clab-mode-menu');if(menu.hidden)return;
        if(event.key==='Escape'){menu.hidden=true;switcher.querySelector('[data-mode-toggle]').setAttribute('aria-expanded','false');switcher.querySelector('[data-mode-toggle]').focus();event.stopPropagation();}
        else if(['ArrowUp','ArrowDown'].includes(event.key)){event.preventDefault();const buttons=[...menu.querySelectorAll('button')],at=buttons.indexOf(document.activeElement);buttons[(at+(event.key==='ArrowUp'?-1:1)+3)%3].focus();}
    });
    document.addEventListener('clab_workspace_view_change',()=>{if(view().mode==='cards'||frame)return;frame=requestAnimationFrame(()=>{frame=0;if(panel.classList.contains('visible'))render();});});
    controllers.set(panel,{render});
}

export function refreshWorkspaceModes(panel) {controllers.get(panel)?.render();}
