import { state, getActiveWorkspace, saveAndRender } from '../ui_state.js';
import { createWorkspaceView } from './view_state.js';
import { showCardsMode } from './mode_cards.js';
import { tableControls, showTableMode, handleTableAction } from './mode_table.js';
import { matchingTasks, cloneTask } from './task_model.js';
import { injectWorkspaceModeStyles } from './mode_styles.js';
import { appendWorkspaceTasks } from './task_dom.js';
import { captureTableStructure, synchronizeTableStructure } from './table_structure.js';
import { synchronizeModeMedia } from './mode_media.js';
import { createXYController } from './xy_controller.js';

const controllers=new WeakMap(),initialized=new WeakSet();
const names={cards:'任务卡片',table:'参数表',xy:'XY 矩阵'};

export function setupWorkspaceModes(panel) {
    injectWorkspaceModeStyles();
    const container=panel.querySelector('#clab-cards-container'),switcher=panel.querySelector('.clab-mode-switch');
    let controls,currentModeKey='',frame=0,controlsHTML='',tableBaseline;
    const view=()=>{const workspace=getActiveWorkspace();if(!initialized.has(workspace)){workspace.view=createWorkspaceView(workspace.view);initialized.add(workspace);}return workspace.view;};
    const template=()=>state.cards.find(card=>card.id===view().templateId)||state.cards.find(card=>state.selectedCardIds.includes(card.id))||state.cards[0];
    const save=()=>window.CLab?.saveState(state),xy=createXYController(container,view,save);
    const commit=()=>{appendWorkspaceTasks(container,state.cards);saveAndRender();};
    const render=(force=false)=>{
        const config=view(),wrapper=container.querySelector('.clab-cards-wrapper');if(!wrapper)return;
        const key=`${state.activeWorkspaceId}:${config.mode}`,changed=key!==currentModeKey;
        panel.dataset.workspaceMode=config.mode;
        switcher.querySelector('[data-mode-toggle]').textContent=`${names[config.mode]} ▴`;
        switcher.querySelectorAll('[data-workspace-mode]').forEach(button=>button.setAttribute('aria-checked',String(button.dataset.workspaceMode===config.mode)));
        if(changed){controls?.remove();controls=null;controlsHTML='';tableBaseline=null;xy.leave();showCardsMode(wrapper);currentModeKey=key;container.scrollLeft=container.scrollTop=0;}
        if(config.mode==='cards'){if(changed)window._clabUpdateCardsLayout?.();synchronizeModeMedia(wrapper);return;}
        if(config.mode==='xy'){xy.render(changed,template());if(changed)save();return;}
        if(synchronizeTableStructure(state.cards,tableBaseline)){tableBaseline=null;commit();return;}
        if(!controls?.isConnected){controls=document.createElement('div');controls.className='clab-mode-controls';container.prepend(controls);controlsHTML='';}
        const source=template();if(source)config.templateId=source.id;
        config.outputIndex=Math.max(0,Math.min(Math.max(0,(source?.areas.filter(area=>area.type==='preview').length||0)-1),config.outputIndex));
        const html=source?tableControls(state.cards,source,config):'<p>当前工作区没有任务，可先在 XY 矩阵中绑定参数生成，或在任务卡片中建立。</p><button data-workspace-mode="xy">设置 XY 矩阵</button><button data-workspace-mode="cards">建立任务卡片</button>';
        if((force||html!==controlsHTML)&&!(!force&&controls.contains(document.activeElement))){controls.innerHTML=html;controlsHTML=html;}
        showTableMode(wrapper,state.cards,source,config);tableBaseline=source?captureTableStructure(state.cards,source):null;
        synchronizeModeMedia(wrapper);if(changed)save();
    };
    const changeMode=mode=>{
        if(view().mode==='xy'&&mode!=='xy')xy.exportRecords();
        view().mode=mode;state.painterMode=false;state.painterSource=null;
        switcher.querySelector('.clab-mode-menu').hidden=true;switcher.querySelector('[data-mode-toggle]').setAttribute('aria-expanded','false');
        render(true);saveAndRender();
    };
    panel.addEventListener('click',event=>{
        const target=event.target.closest('button');if(!target)return;
        if(target.matches('[data-mode-toggle]')){
            const menu=switcher.querySelector('.clab-mode-menu');menu.hidden=!menu.hidden;target.setAttribute('aria-expanded',String(!menu.hidden));if(!menu.hidden)menu.querySelector('[aria-checked=true]').focus();return;
        }
        if(target.matches('[data-workspace-mode]')){changeMode(target.dataset.workspaceMode);return;}
        if(!controls?.contains(target))return;
        try{if(handleTableAction(target,controls,template(),view())){commit();render(true);}}
        catch(error){let node=controls.querySelector('[role=status]');if(!node){node=document.createElement('p');node.className='clab-mode-error';node.setAttribute('role','status');controls.append(node);}node.textContent=error.message;}
    });
    panel.addEventListener('change',event=>{
        const target=event.target;if(!controls?.contains(target))return;
        if(target.matches('[data-mode-template]')){view().templateId=target.value;render(true);save();}
        else if(handleTableAction(target,controls,template(),view())){render(true);save();}
    });
    panel.addEventListener('click',event=>{
        if(view().mode!=='table')return;
        const target=event.target.closest('#clab-global-add-card,#clab-global-add-module'),source=template();if(!target||!source)return;
        if(target.id==='clab-global-add-card'){event.preventDefault();event.stopImmediatePropagation();state.cards.push(cloneTask(source));commit();}
        else{state.selectedCardIds=matchingTasks(state.cards,source).map(card=>card.id);state.selectedAreaIds=[];}
    },true);
    panel.addEventListener('dragstart',event=>{if(view().mode!=='cards'&&event.target.closest('.clab-card,.clab-area'))event.preventDefault();},true);
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
