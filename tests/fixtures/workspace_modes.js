export async function checkWorkspaceModes({state,passed,assert,delay}) {
    const {createEmptyWorkspace,getActiveWorkspace,syncStateToActiveWorkspace,applyWorkspaceToState,buildPersistedState}=await import('/extensions/clab/components/ui_state.js');
    const {parameterValue,cloneTask}=await import('/extensions/clab/components/workspace_modes/task_model.js');
    const panel=document.querySelector('#clab-panel'),q=selector=>panel.querySelector(selector);
    syncStateToActiveWorkspace();const original=getActiveWorkspace(),workspaces=[...state.workspaces],execute=window.CLab.executeTasks;
    const nodes=[{id:91,title:'采样测试',widgets:[{name:'steps',label:'步数',type:'number',value:20},{name:'sampler',label:'采样器',type:'combo',value:'Euler',options:{values:['Euler','DPM']}},{name:'cfg',type:'number',value:7},{name:'enabled',type:'toggle',value:false}]},{id:92,title:'尺寸',widgets:[{name:'width',type:'number',value:1024},{name:'height',type:'number',value:768}]},{id:93,type:'SaveImage',title:'输出测试',widgets:[]}];
    const input=(id,name,value)=>({id,type:'edit',title:name,value,dataType:typeof value==='number'?'number':'string',targetNodeId:'91',targetWidget:name,targetWidgets:[`91||${name}`],targetNodeIds:['91']});
    const template={id:'mode-template',title:'测试模板',areas:[input('mode-steps','steps',20),input('mode-sampler','sampler','Euler'),{id:'mode-output',type:'preview',targetNodeId:'2',history:['/view?filename=first.png'],resultUrl:'/view?filename=first.png',historyIndex:0,ratio:'16:9'}]};
    let demo=createEmptyWorkspace('三种任务模式',{cards:[template,{id:'mode-unrelated',title:'不同结构的任务',areas:[]}]});
    const show=()=>{
        for(const node of nodes)if(!window.testApp.graph._nodes.includes(node))window.testApp.graph._nodes.push(node);
        if(!state.workspaces.includes(demo))state.workspaces.push(demo);applyWorkspaceToState(demo);document.dispatchEvent(new Event('clab_render_ui'));
    };
    const mode=name=>q(`[data-workspace-mode="${name}"]`).click();
    const popup=()=>document.querySelector('.clab-module-binding-popover:popover-open');
    const orientation=value=>q(`[data-xy-origin="${value}"]`).click();
    const recordPanel=()=>{q('[data-xy-records]').click();return popup();};
    const binding=name=>name.startsWith('record:')?recordPanel().querySelector(`[data-xy-bind="${name}"]`):q(`[data-xy-bind="${name}"]`);
    const bind=(name,keys)=>{
        binding(name).click();
        for(const key of keys){const id=key.split('||')[0];popup().querySelector(`button[data-xy-node="${id}"]`).click();if(name!=='output')popup().querySelector(`[data-xy-parameter="${key}"]`).click();}
        popup().querySelector('.clab-xy-popup-close').click();
    };
    const values=(name,text)=>{q(`.axis-${name}`).click();const input=popup().querySelector('textarea');input.value=text;input.dispatchEvent(new Event('change',{bubbles:true}));popup().querySelector('.clab-xy-popup-close').click();};
    const checkAxes=()=>{
        const rect=selector=>q(selector).getBoundingClientRect(),x=rect('.axis-x i'),y=rect('.axis-y i'),xb=rect('[data-xy-part="x-binding"]'),yb=rect('[data-xy-part="y-binding"]'),out=rect('[data-xy-part="output-binding"]'),up=getActiveWorkspace().view.xy.origin==='bottom';
        const cells=[...q('.clab-cards-wrapper').querySelectorAll(':scope > .clab-card:not([hidden]),.clab-xy-empty')].map(element=>element.getBoundingClientRect());
        const left=Math.min(...cells.map(r=>r.left)),right=Math.max(...cells.map(r=>r.right)),top=Math.min(...cells.map(r=>r.top)),bottom=Math.max(...cells.map(r=>r.bottom)),xc=(x.top+x.bottom)/2,yc=(y.left+y.right)/2;
        assert(Math.abs((up?y.bottom:y.top)-xc)<1.5&&Math.abs(x.left-yc)<1.5,'axis lines extend beyond their shared right-angle origin');
        assert(Math.abs((xb.top+xb.bottom)/2-xc)<1.5&&xb.left>x.right,'X binding summary is not centered after its arrow');
        assert(Math.abs((yb.left+yb.right)/2-yc)<1.5&&(up?yb.bottom<y.top:yb.top>y.bottom),'Y binding summary is not centered beyond its arrow');
        assert(Math.abs((left-yc)-(up?xc-bottom:top-xc))<1.5,'left and horizontal-axis spacing differs around the matrix frames');
        assert(out.left>right&&Math.abs((out.top+out.bottom)/2-(up?top:bottom))<1.5,'output binding summary is not beside the diagonally opposite matrix corner');
        const xt=q('.clab-axis-label[data-xy-edit-values="x"]>span')?.getBoundingClientRect(),yt=q('.clab-axis-label[data-xy-edit-values="y"]>span')?.getBoundingClientRect();
        if(xt&&yt)assert(Math.abs((yc-yt.right)-(up?xt.top-xc:xc-xt.bottom))<1.5,'Y tick text is not right aligned at the same axis distance as X text');
        assert(!q('.clab-cards-wrapper').contains(q('.clab-xy-overlay')),'axis text remains inside the scaled media layer');
    };
    const checkValuePosition=(name,trigger=q(`.axis-${name}`))=>{
        trigger.click();const p=popup().getBoundingClientRect(),r=trigger.getBoundingClientRect(),b=panel.getBoundingClientRect(),up=getActiveWorkspace().view.xy.origin==='bottom';
        const room=name==='y'?r.left-b.left-16:up?b.bottom-r.bottom-16:r.top-b.top-16;
        if(room>=(name==='y'?p.width:p.height))assert(name==='y'?p.right<=r.left-7:up?p.top>=r.bottom+7:p.bottom<=r.top-7,`${name} value panel ignored its preferred side despite available space`);
        assert(p.left>=b.left+7&&p.top>=b.top+7&&p.right<=b.right-7&&p.bottom<=b.bottom-7,'axis settings panel overflowed the plugin bounds');
        const labels=[...popup().querySelectorAll('.clab-xy-axis-spacing label')].map(label=>label.getBoundingClientRect());assert(Math.abs(labels[0].top-labels[1].top)<1&&labels[0].right<labels[1].left,'axis gap and margin are not on the same row');
        for(const label of popup().querySelectorAll('.clab-xy-axis-spacing label')){const range=document.createRange();range.selectNodeContents(label.firstChild);assert(label.querySelector('input').getBoundingClientRect().left-range.getBoundingClientRect().right<8,'axis setting label was separated from its input');}
        const parts=[...popup().querySelector('.clab-xy-values-body').children].filter(node=>!node.hidden).map(node=>node.getBoundingClientRect());assert(parts.slice(1).every((part,index)=>Math.abs(part.top-parts[index].bottom-8)<1),'axis settings have inconsistent spacing between peer rows');
        if(getActiveWorkspace().view.xy[name].bindings.length===1)assert(!popup().querySelector('.clab-xy-value-choices>div'),'single parameter name was repeated below its value heading');
        popup().querySelector('.clab-xy-popup-close').click();
    };
    const canvasGraph=window.testApp.canvas.graph;
    const pick=async(key,nodeId,widgetName='',button=0)=>{
        binding(key).click();popup().querySelector('.clab-binding-start-pick').click();
        assert(!panel.classList.contains('visible')&&!popup(),'XY picker did not hide the panel and close its binding popover');
        await delay(140);
        const target=document.createElement('div');target.className='lg-node';target.dataset.nodeId=nodeId;
        target.innerHTML='<div class="lg-node-widget"><label></label></div>';target.querySelector('label').textContent=widgetName;document.body.append(target);
        const hit=widgetName?target.querySelector('label'):target;
        for(const type of ['pointerdown','pointerup'])hit.dispatchEvent(new PointerEvent(type,{bubbles:true,button,pointerId:30}));
        await delay(230);target.remove();
        assert(panel.classList.contains('visible')&&popup()?.querySelector('.clab-binding-start-pick'),'XY picker did not return to its binding panel');
        const result={bindings:[...getActiveWorkspace().view.xy.x.bindings],message:popup().querySelector('.clab-binding-panel-foot').textContent};popup().querySelector('.clab-xy-popup-close').click();return result;
    };
    try{
        show();const originalCard=q('[data-card-id="mode-template"].clab-card'),originalImage=q('[data-area-id="mode-output"] img');
        mode('table');assert(panel.dataset.workspaceMode==='table'&&q('[data-card-id="mode-unrelated"]').hidden,'table did not isolate matching task structures');
        q('[data-table-values]').value='20,30,40';q('[data-table-fill]').click();
        assert(state.cards.length===4&&state.cards.filter(card=>card.areas.length).map(card=>card.areas[0].value).join(',')==='20,30,40','table bulk values did not fill existing tasks and append missing tasks');
        assert(q('[data-card-id="mode-template"].clab-card')===originalCard&&q('[data-area-id="mode-output"] img')===originalImage,'table bulk edits rebuilt unchanged card/media elements');
        q('[data-table-json]').value='[{"steps":50,"sampler":"DPM"}]';q('[data-table-import]').click();
        assert(state.cards.length===5&&state.cards.at(-1).areas[0].value===50&&state.cards.at(-1).areas.find(area=>area.type==='preview').history.length===0,'table JSON import lost row values or copied generated records');
        const title=q('[data-area-id="mode-steps"] .clab-area-title-input');title.value='步数';title.dispatchEvent(new Event('change',{bubbles:true}));await delay(60);
        assert(state.cards.filter(card=>card.areas.length).every(card=>card.areas[0].title==='步数')&&state.cards.filter(card=>card.areas.length).map(card=>card.areas[0].value).join(',')==='20,30,40,50','table shared title edits did not retain individual values or update the whole group');
        mode('cards');assert(!q('[data-card-id="mode-unrelated"]').hidden&&q('[data-area-id="mode-output"] img')===originalImage,'card view did not restore different structures or preserve its media');
        passed.push('workspace card/table modes share task identities and media, import paired JSON rows and bulk values, and preserve heterogeneous tasks');

        demo=createEmptyWorkspace('独立 XY 矩阵',{cards:[]});show();mode('xy');
        assert(getComputedStyle(q('#clab-toolbar-handle')).display==='none'&&q('.axis-x')&&q('.axis-y')&&q('.clab-xy-empty')&&!q('[data-mode-template]'),'empty XY workspace requires a template or has no editable axes/placeholder');
        checkAxes();orientation('top');checkAxes();orientation('bottom');
        window.testApp.canvas.graph=window.testApp.graph;
        await pick('x','91','steps');bind('y',['91||sampler']);await pick('output','93');values('x','20,30,20');values('y','Euler,DPM');
        assert(!q('[data-xy-size]')&&!q('[data-xy-bind="width"]'),'removed shared width/height settings are still present');
        recordPanel().querySelector('[data-xy-add-record]').click();
        assert(popup()?.getAttribute('aria-label')==='附加记录参数'&&getActiveWorkspace().view.xy.records.length===1,'new record did not open its binding panel');
        popup().querySelector('button[data-xy-node="91"]').click();popup().querySelector('[data-xy-parameter="91||cfg"]').click();popup().querySelector('.clab-xy-popup-close').click();
        const xy=getActiveWorkspace().view.xy,visible=()=>[...q('.clab-cards-wrapper').querySelectorAll(':scope > .clab-card')].filter(element=>!element.hidden);
        assert(visible().length===4&&xy.x.values.length===2&&xy.x.bindings[0]==='91||steps'&&xy.y.bindings[0]==='91||sampler','XY did not create and position unique parameter combinations');
        const matrixCards=visible().map(element=>state.cards.find(card=>card.id===element.dataset.cardId));
        checkAxes();for(const origin of ['top','bottom']){orientation(origin);checkAxes();for(const name of ['x','y']){checkValuePosition(name);checkValuePosition(name,q(`.clab-axis-label[data-xy-edit-values="${name}"]`));}}
        assert(matrixCards.every(card=>parameterValue(card,'92||width')===undefined&&card.recordParameters[0].key==='91||cfg'&&card.areas.find(area=>area.xyRecordKey)?.recordOnly),'matrix injected a removed dimension control or lost workflow-only records');
        const cell=visible()[0],media=cell.querySelector('.clab-preview-bg');assert(Math.abs(cell.offsetWidth-320)<2&&Math.abs(media.offsetWidth/media.offsetHeight-1)<.02,'matrix placeholders did not start square');
        const grid=visible().map(element=>element.getBoundingClientRect()).sort((a,b)=>a.top-b.top||a.left-b.left),gap=4*xy.zoom;assert(Math.abs(grid[1].left-grid[0].right-gap)<1&&Math.abs(grid[2].top-grid[0].bottom-gap)<1,'matrix spacing is not 4 world pixels in both directions');
        assert(q('[data-xy-bind="x"]').textContent.includes('采样测试 · 步数')&&q('[data-xy-bind="output"]').textContent.includes('输出测试'),'binding summaries lost node names or localized parameter labels');
        const summaryWidth=q('[data-xy-bind="x"]').offsetWidth;nodes[0].widgets[0].label='测试一个更长的本地化步数参数名称';document.dispatchEvent(new Event('clab_render_ui'));
        assert(q('[data-xy-bind="x"]').offsetWidth>summaryWidth+30&&q('[data-xy-bind="x"]>span').scrollWidth<=q('[data-xy-bind="x"]>span').clientWidth,'long binding names remained truncated instead of widening their summary');nodes[0].widgets[0].label='步数';document.dispatchEvent(new Event('clab_render_ui'));
        const generated=matrixCards[0].areas.find(area=>area.id===matrixCards[0].xyOutputId);generated.resultUrl='/view?filename=first.png';generated.history=[generated.resultUrl];generated.historyIndex=0;window._clabSurgicallyUpdateArea(generated.id);
        assert(!q('.clab-xy-note')&&visible().every(element=>{const footer=element.querySelector('.clab-output-footer');return (!footer||getComputedStyle(footer).display==='none')&&getComputedStyle(element.querySelector('.clab-preview-placeholder')).display==='none';}),'matrix retained parameter captions, metadata or placeholder text');
        const imageRects=visible().map(element=>element.querySelector('.clab-preview-bg').getBoundingClientRect()).sort((a,b)=>a.top-b.top||a.left-b.left);assert(Math.abs(imageRects[1].left-imageRects[0].right-gap)<1&&Math.abs(imageRects[2].top-imageRects[0].bottom-gap)<1,'media adds internal margins beyond the grid spacing');
        q('.axis-y').click();assert([...popup().querySelectorAll('.clab-xy-value-choices span')].map(span=>span.textContent).join(',')==='Euler,DPM','enum choices were not listed in the value panel');
        popup().querySelector('[data-xy-choice="0:0"]').closest('label').querySelector('span').click();assert(popup().querySelector('textarea').value==='["DPM"]','clicking an option name did not remove its value');popup().querySelector('[data-xy-choice="0:0"]').click();assert(popup().querySelector('textarea').value==='["DPM","Euler"]','clicking the checkbox did not append its typed value');popup().querySelector('.clab-xy-popup-close').click();
        const oldY=structuredClone(xy.y);xy.y={bindings:['91||enabled'],values:[false]};document.dispatchEvent(new Event('clab_render_ui'));q('.axis-y').click();
        assert(popup().querySelector('[data-xy-choice="0:1"]').checked&&!popup().querySelector('[data-xy-choice="0:0"]').checked,'boolean False was not restored as a selected value');popup().querySelector('[data-xy-choice="0:0"]').closest('label').querySelector('span').click();assert(popup().querySelector('textarea').value==='[false,true]','boolean selection became string values');popup().querySelector('.clab-xy-popup-close').click();xy.y=oldY;document.dispatchEvent(new Event('clab_render_ui'));
        const count=state.cards.length;values('x','20,30');assert(state.cards.length===count,'editing unchanged values duplicated its tasks');
        const appended=await pick('x','91','cfg',2);assert(xy.x.bindings.join(',')==='91||steps,91||cfg',`right-click workflow pick did not append an axis parameter: ${JSON.stringify(appended)}`);
        await pick('x','91','steps');assert(xy.x.bindings.join(',')==='91||steps'&&state.cards.length===count,'left-click workflow pick did not replace bindings while retaining task identities');
        await pick(`record:${xy.records[0].id}`,'91','cfg');
        orientation('top');assert(getActiveWorkspace().view.xy.origin==='top','upper-left coordinate origin was not saved');orientation('bottom');
        state.selectedCardIds=[];state.selectedAreaIds=[];let queue;window.CLab.executeTasks=tasks=>{queue=tasks;};q('[data-xy-run]').click();
        assert(queue?.length===4&&queue.every(task=>matrixCards.some(card=>card.id===task.cardId)&&task.previewAreaIds.length===1),'unselected XY run did not execute exactly its four output cells');
        state.selectedAreaIds=[matrixCards[0].xyOutputId];q('[data-xy-run]').click();assert(queue?.length===1&&queue[0].cardId===matrixCards[0].id,'selected XY run escaped the selected cell');state.selectedAreaIds=[];
        const camera=getActiveWorkspace().view.xy;camera.zoom=.6;camera.panX=-50;camera.panY=100;
        mode('cards');
        assert(matrixCards.every(card=>card.areas[0].type==='preview'&&card.areas.find(area=>area.xyRecordKey)?.recordOnly===false&&parameterValue(card,'91||cfg')===7),'XY conversion did not put output first and materialize workflow record values as bound inputs');
        const edited=matrixCards.find(card=>card.id!==getActiveWorkspace().view.templateId);edited.areas[0].title='自由模式改名';edited.areas.reverse();document.dispatchEvent(new Event('clab_render_ui'));
        mode('table');mode('xy');assert(visible().length===4,'card edits silently removed a matrix member or required rebinding its axes');
        assert(getActiveWorkspace().view.xy.x.bindings[0]==='91||steps'&&getActiveWorkspace().view.xy.zoom===.6&&getActiveWorkspace().view.xy.panX===-50,'view switching lost axes or canvas position');
        assert(buildPersistedState().workspaces.find(workspace=>workspace.id===demo.id).view.xy.x.bindings[0]==='91||steps','axis bindings did not reach persisted workspace state');
        state.selectedCardIds=[];state.selectedAreaIds=[];q('[data-xy-run]').click();
        assert(queue?.length===4&&queue.every(task=>matrixCards.some(card=>card.id===task.cardId)),'matrix run escaped into unrelated task cards');
        mode('cards');const duplicate=cloneTask(matrixCards[0]);state.cards.push(duplicate);document.dispatchEvent(new Event('clab_render_ui'));mode('xy');
        assert(xy.taskIds.includes(duplicate.id),'a compatible task cloned in card view did not return to its XY cell');
        assert(visible().length===4&&q(`[data-card-id="${duplicate.id}"].clab-card`).hidden&&state.cards.includes(duplicate),'duplicate coordinates created extra grid cells or deleted the original task');
        state.cards.splice(state.cards.indexOf(duplicate),1);xy.taskIds=xy.taskIds.filter(id=>id!==duplicate.id);document.dispatchEvent(new Event('clab_render_ui'));
        passed.push('standalone XY edits real binding panels and axes, creates combination cells automatically, converts records and dimensions, persists its camera and runs all/selected cells');

        window.showWorkspaceModeDemo=(requested='xy')=>{show();mode(requested);window.workspaceModeDemo=demo;};
    }finally{
        window.testApp.canvas.graph=canvasGraph;
        window.CLab.executeTasks=execute;state.workspaces=workspaces;applyWorkspaceToState(original);document.dispatchEvent(new Event('clab_render_ui'));
        for(const node of nodes){const index=window.testApp.graph._nodes.indexOf(node);if(index>=0)window.testApp.graph._nodes.splice(index,1);}
    }
    await delay(40);
}
