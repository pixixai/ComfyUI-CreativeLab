export async function checkPreviewReview({ state, passed, assert, delay }) {
    const { previewModalStore } = await import('/extensions/clab/components/contextmenu/content/state.js');
    const { collectPreviewRecords } = await import('/extensions/clab/components/contextmenu/content/preview_records.js');
    const { buildTableModel } = await import('/extensions/clab/components/contextmenu/content/preview_table.js');
    const { exportPreviewHTML, exportPreviewPNGs, packagePreviewPNGs } = await import('/extensions/clab/components/contextmenu/content/preview_export.js');
    const params=(steps,sampler,cfg)=>[
        {sourceAreaId:'review-steps',title:'步数',value:steps,targetNodeId:'1',targetWidget:'steps'},
        {sourceAreaId:'review-sampler',title:'采样器',value:sampler,targetNodeId:'1',targetWidget:'sampler_name'},
        {sourceAreaId:'review-cfg',title:'CFG',value:cfg,targetNodeId:'1',targetWidget:'cfg'},
    ];
    const a={id:'review-a',title:'最终图像',type:'preview',history:[],historyRuns:[],inputHistorySnapshots:[],historyIndex:0};
    const b={id:'review-b',title:'中间结果',type:'preview',history:[],historyRuns:[],inputHistorySnapshots:[],historyIndex:0};
    const current={id:'review-steps',title:'步数',type:'edit',targetNodeId:'1',targetWidget:'steps',value:999};
    const empty={id:'review-empty',title:'未运行的输出',type:'preview',history:[]};
    const card={id:'review-card',title:'采样参数测试',areas:[current,a,b,empty]};
    for(const [i,[steps,sampler,cfg]] of [[20,'Euler',5],[30,'Euler',5],[20,'DPM++',5],[30,'DPM++',7]].entries()) {
        const run={id:`review-${i}`,order:i+1,areaIds:i===1?['review-a']:['review-a','review-b']};
        a.history.push(`/view?filename=review-${i%2?'b':'a'}.png&run=${i}`);a.historyRuns.push(run);a.inputHistorySnapshots.push(params(steps,sampler,cfg));
        if(i===0||i===3) {b.history.push(`/view?filename=review-b.png&run=${i}`);b.historyRuns.push(run);b.inputHistorySnapshots.push(params(steps,sampler,cfg));}
    }
    a.resultUrl=a.history[0];b.resultUrl=b.history[0];
    const old={id:'review-old',title:'旧版图像',type:'preview',history:[a.history[0]],historyIndex:0,resultUrl:a.history[0]};
    const other={id:'review-other',title:'另一任务',areas:[old]};
    const previousSelection=[...state.selectedAreaIds];state.cards.push(card,other);state.selectedAreaIds=[a.id,b.id,old.id];
    const open=()=>{window.CLab.showPreviewContextMenu(100,100,card.id,a.id,a.resultUrl);document.querySelector('#clab-ctx-preview-mode').click();return document.querySelector('.clab-preview-modal.visible');};
    const root=open(),q=selector=>root.querySelector(selector);
    assert(previewModalStore.entries.length===7 && root.querySelectorAll('.clab-browse-source-tree details').length===state.cards.length,'multi-module preview omitted records or source groups');
    assert(previewModalStore.entries.filter(entry=>entry.url===a.history[0]).length===2,'same URL in different modules lost its identity');
    assert(root.querySelectorAll('.clab-browse-filmstrip .clab-preview-modal-thumb').length===7&&!q('.clab-preview-modal-left .clab-preview-modal-thumb'),'browse thumbnails are not in the bottom filmstrip');
    const sourceCheck=id=>[...root.querySelectorAll('[data-browse-source]')].find(input=>JSON.parse(input.dataset.browseSource)[1]===id);
    assert(sourceCheck('review-empty').disabled&&!sourceCheck('model').checked,'source tree hid empty modules or checked unselected output modules');
    const unchanged=JSON.stringify([card,other]);
    const task=()=>q('[data-browse-card="review-card"]');
    assert(task().querySelector('[data-browse-card-name]').textContent===card.title&&sourceCheck(a.id).nextElementSibling.textContent===a.title,'source labels differ from task/module titles');
    task().querySelector('[data-browse-card-name]').click();assert(previewModalStore.entries.length===1&&task().open,'task name did not deselect its outputs or incorrectly collapsed the task');
    task().querySelector('[data-browse-card-name]').click();sourceCheck(a.id).click();assert(q('[data-browse-card-check="review-card"]').indeterminate,'partially selected task is not indeterminate');sourceCheck(a.id).click();
    task().querySelector('[data-browse-fold]').click();assert(!task().open&&previewModalStore.entries.length===7,'fold arrow changed source selection or failed to collapse');
    task().querySelector('[data-browse-fold]').click();assert(task().open,'fold arrow did not expand the task');
    const search=q('[data-browse-search]');search.value='最终图像';search.dispatchEvent(new Event('input',{bubbles:true}));assert(q('[data-browse-search]')===search&&root.querySelectorAll('[data-browse-source]').length===1,'source search replaced its focused input or failed to filter modules');
    search.value='';search.dispatchEvent(new Event('input',{bubbles:true}));
    const tools=q('.clab-browse-tools'),status=q('.clab-browse-status'),sizeControl=q('.clab-browse-thumb-size');
    assert(!q('.clab-browse-media-count')&&status.textContent.startsWith('共 7 条'),'unfiltered media count is redundant or unclear');
    assert(q('[data-browse-sort]').parentElement.nextElementSibling===status&&status.nextElementSibling===sizeControl&&tools.lastElementChild===sizeControl,'browse status and thumbnail size controls are in the wrong positions');
    const mediaFilter=q('[data-review-type]');mediaFilter.value='audio';mediaFilter.dispatchEvent(new Event('change',{bubbles:true}));
    assert(q('.clab-browse-status').textContent.startsWith('显示 0 条，共 7 条'),'filtered count did not distinguish visible records from selected-source totals');
    mediaFilter.value='';mediaFilter.dispatchEvent(new Event('change',{bubbles:true}));
    assert(getComputedStyle(q('.clab-browse-filmstrip'),'::-webkit-scrollbar').height==='6px','filmstrip scrollbar is not narrow');
    passed.push('browse toolbar shows clear filtered counts beside sorting, keeps the size control at the right edge and uses a thin scrollbar');
    const image=q('.clab-preview-modal-main-image'),centerWidth=q('.clab-preview-modal-center').getBoundingClientRect().width;
    assert(!q('[data-browse-panel]')&&!q('.clab-browse-tools [data-review-run]'),'removed browse buttons or run filter remain visible');
    const resize=(side,key)=>q(`[data-browse-resize="${side}"]`).dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));
    resize('sources','ArrowRight');assert(q('.clab-preview-modal-center').getBoundingClientRect().width<centerWidth,'resizing sources did not change the preview width');resize('sources','ArrowLeft');
    resize('parameters','ArrowLeft');resize('parameters','ArrowRight');
    assert(root.querySelectorAll('.clab-filmstrip-group').length===3&&q('[data-filmstrip-group]').textContent.includes(a.title),'default filmstrip did not group records by module');
    const sort=q('[data-browse-sort]');sort.value='newest';sort.dispatchEvent(new Event('change',{bubbles:true}));assert(Number(q('.clab-browse-filmstrip [data-index]').dataset.index)===3,'filmstrip run sorting did not update its order');
    const thumbSize=q('[data-browse-size]');thumbSize.value=176;thumbSize.dispatchEvent(new Event('input',{bubbles:true}));assert(root.style.getPropertyValue('--browse-thumb-width')==='176px','filmstrip size slider did not resize thumbnails');
    q('[data-browse-size-reset]').click();assert(root.style.getPropertyValue('--browse-thumb-width')==='120px'&&getComputedStyle(thumbSize).height==='2px','thumbnail icon did not reset size or range track remains oversized');
    const height=parseFloat(root.style.getPropertyValue('--browse-film-height'));q('[data-filmstrip-resize]').dispatchEvent(new KeyboardEvent('keydown',{key:'ArrowUp',bubbles:true,cancelable:true}));assert(parseFloat(root.style.getPropertyValue('--browse-film-height'))>height,'filmstrip resize handle did not change its height');
    assert(q('.clab-preview-modal-main-image')===image&&JSON.stringify([card,other])===unchanged,'browse layout/source changes rebuilt the preview or modified task parameters');
    sort.value='source';sort.dispatchEvent(new Event('change',{bubbles:true}));thumbSize.value=120;thumbSize.dispatchEvent(new Event('input',{bubbles:true}));
    passed.push('browse task/module titles, name selection, arrow folding, search and resizable panes preserve the active preview');
    const changeSort=value=>{sort.value=value;sort.dispatchEvent(new Event('change',{bubbles:true}));};
    const order=()=>[...root.querySelectorAll('.clab-browse-filmstrip [data-index]')].map(button=>Number(button.dataset.index));
    const drag=async(from,to,after=false)=>{
        const dataTransfer=new DataTransfer();from.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer}));
        const bounds=to.getBoundingClientRect();to.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer,clientX:after?bounds.right-2:bounds.left+2,clientY:bounds.top+5}));
        assert(q('.drop-before,.drop-after'),'dragging did not show an insertion marker');
        to.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer}));
        await delay(0);
    };
    await drag(q('.clab-filmstrip-thumb[data-index="0"]'),q('.clab-filmstrip-thumb[data-index="6"]'),true);
    assert(sort.value==='custom'&&order().join(',')==='1,2,3,4,5,6,0','dragging a thumbnail across sources did not set the custom order');
    changeSort('source');changeSort('custom');assert(order().at(-1)===0,'custom order was lost after switching sort modes');
    changeSort('source');
    q('.clab-filmstrip-thumb[data-index="1"]').dispatchEvent(new MouseEvent('click',{bubbles:true,ctrlKey:true}));
    await drag(q('.clab-filmstrip-thumb[data-index="1"]'),q('.clab-filmstrip-thumb[data-index="3"]'),true);
    assert(order().slice(0,4).join(',')==='2,3,0,1','multi-selected thumbnail dragging lost its order');
    changeSort('source');
    await drag(root.querySelectorAll('[data-filmstrip-group]')[1],q('.clab-filmstrip-thumb[data-index="0"]'));
    assert(order().slice(0,2).join(',')==='4,5'&&q('.clab-browse-status').textContent.includes('已选 2 条'),'module section dragging did not move the selected group');
    assert(q('.clab-preview-modal-main-image')===image&&JSON.stringify([card,other])===unchanged,'custom sorting changed task/history data or rebuilt the active preview');
    changeSort('source');
    passed.push('grouped filmstrip supports custom single, multi-record and whole-section seam dragging without altering stored history');
    q('.clab-preview-modal-thumb[data-index="1"]').click();assert(a.historyIndex===1 && current.value===30,'ordinary browsing no longer selects the owning module and restores its snapshot');
    passed.push('multi-module preview groups all histories by source, preserves duplicate URLs and keeps ordinary history restoration');

    const before=JSON.stringify([card,other]);
    q('[data-review-mode="compare"]').click();
    assert(q('.clab-browse-source-tree')&&!q('.clab-browse-footer').hidden&&q('.clab-compare-stage'),'comparison did not use the source tree and bottom filmstrip or has no empty drop regions');
    q('.clab-preview-modal-thumb[data-index="0"]').click();q('.clab-preview-modal-thumb[data-index="4"]').click();
    assert(q('.clab-compare-stage.side') && q('.clab-compare-stage').querySelectorAll('img').length===2,'image A/B slots did not accept different output modules');
    assert(!q('.clab-compare-slots')&&q('.label-a').textContent.startsWith('A')&&q('.label-b').textContent.endsWith('B'),'A/B information is not in the overlay corner labels');
    const initialStage=q('.clab-compare-stage'),firstPair=[...initialStage.querySelectorAll('img')];
    const sideRect=initialStage.getBoundingClientRect(),modeRect=q('.clab-compare-layout').getBoundingClientRect(),swapRect=q('[data-compare-swap]').getBoundingClientRect();
    assert(initialStage.contains(q('.clab-compare-layout'))&&modeRect.top>=sideRect.top&&modeRect.bottom<=sideRect.bottom+1&&Math.abs(sideRect.height-q('.clab-preview-modal-center').getBoundingClientRect().height)<2&&q('.clab-compare-layout').classList.contains('clab-review-segment')&&getComputedStyle(q('.clab-compare-layout')).backgroundColor!=='rgba(0, 0, 0, 0)'&&getComputedStyle(q('[data-compare-layout="side"]')).fontWeight==='700','comparison mode capsule is not overlaid on the full-height preview');
    const swap=q('[data-compare-swap]'),glyph=swap.querySelector('svg').getBoundingClientRect(),hintRect=q('.clab-compare-status').getBoundingClientRect();
    assert(glyph.width===22&&glyph.height===22&&swapRect.width>glyph.width&&swapRect.height>glyph.height&&swap.querySelector('svg').getAttribute('fill')==='none'&&swap.querySelector('circle[stroke="currentColor"]')&&swap.querySelector('path').getAttribute('fill')==='currentColor'&&!swap.querySelector('path').hasAttribute('fill-rule')&&getComputedStyle(swap).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(swap).color===getComputedStyle(q('.clab-compare-divider')).backgroundColor,'comparison swap does not use a hollow circle and solid arrows with a transparent hit area');
    const dividerRect=q('.clab-compare-divider').getBoundingClientRect();
    assert(Math.abs(glyph.x+glyph.width/2-dividerRect.x-dividerRect.width/2)<.6&&Math.abs(glyph.y+glyph.height/2-dividerRect.y-dividerRect.height/2)<.6,'comparison circle is not centered on the upper and lower divider segments');
    assert(modeRect.width<145&&modeRect.height<=28&&Math.abs(sideRect.bottom-modeRect.top-modeRect.height/2-52)<2&&Math.abs(sideRect.bottom-hintRect.top-hintRect.height/2-19)<2,'comparison capsule did not shrink or exchange vertical positions with its hint');
    for(const label of root.querySelectorAll('.clab-compare-label')) {
        assert(getComputedStyle(label).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(label).borderTopWidth==='0px'&&label.querySelector('.clab-compare-label-separator'),'comparison corner information still has a background frame or lacks its separator');
        const badge=label.querySelector('strong').getBoundingClientRect();assert(badge.width===badge.height&&getComputedStyle(label.querySelector('strong')).borderRadius==='3px','preview A/B badge is not a slightly rounded square');
    }
    for(const overlay of initialStage.querySelectorAll('button,strong,span,svg,.clab-compare-layout,.clab-compare-status,.clab-compare-divider'))assert(getComputedStyle(overlay).boxShadow==='none'&&getComputedStyle(overlay).textShadow==='none'&&getComputedStyle(overlay).filter==='none','comparison overlay still has a shadow or filter');
    const badgeColor=slot=>getComputedStyle(q(`[data-compare-slot="${slot}"] strong`)).backgroundColor;
    const activeColor=badgeColor('a');assert(activeColor!==badgeColor('b')&&getComputedStyle(q('[data-compare-slot="a"] strong')).color==='rgb(255, 255, 255)','pending A region is not indicated by its lit number badge');
    q('[data-compare-slot="b"]').click();await delay(180);assert(badgeColor('b')===activeColor&&badgeColor('a')!==activeColor,'switching the pending region did not move the badge highlight');
    assert(Math.abs(swapRect.x+swapRect.width/2-sideRect.x-sideRect.width/2)<2&&Math.abs(swapRect.y+swapRect.height/2-sideRect.y-sideRect.height/2)<2,'side comparison swap button is not at the divider center');
    q('[data-compare-slot="a"]').click();resize('sources','ArrowLeft');resize('sources','ArrowRight');
    assert(initialStage.querySelector('img')===firstPair[0],'comparison target or layout resizing rebuilt the selected media');
    q('[data-compare-layout="split"]').click();
    const stage=q('.clab-compare-stage'),r=stage.getBoundingClientRect();
    assert(stage===initialStage&&stage.querySelector('img')===firstPair[0],'switching comparison layout replaced its media');
    stage.dispatchEvent(new PointerEvent('pointermove',{bubbles:true,clientX:r.left+r.width*.75,clientY:r.top+20}));
    assert(stage.style.getPropertyValue('--compare-split')==='75%','hover did not move the image comparison divider');
    stage.dispatchEvent(new WheelEvent('wheel',{deltaY:-100,bubbles:true,cancelable:true}));
    assert([...stage.querySelectorAll('.clab-compare-transform')].every(el=>el.style.transform.includes('1.12')),'image A/B zoom is not shared');
    const zoomSwap=q('[data-compare-swap]').getBoundingClientRect(),imageBounds=stage.querySelector('.clab-compare-transform').getBoundingClientRect();
    assert(imageBounds.width>r.width&&Math.abs(zoomSwap.x+zoomSwap.width/2-r.left-r.width*.75)<2,'zoom did not fill the viewport or moved the overlay swap button');
    assert(q('[data-compare-slot="a"]').getBoundingClientRect().left>=r.left&&q('[data-compare-slot="b"]').getBoundingClientRect().right<=r.right+1,'split clipping hid an A/B overlay label');
    q('[data-compare-swap]').click();assert(q('[data-compare-slot="a"]').textContent.includes('中间结果'),'swapping A/B did not swap the chosen sources');
    assert(JSON.stringify([card,other])===before,'A/B selection changed live parameters or history');
    passed.push('image A/B comparison supports cross-module slots, split hover, shared zoom and swapping without modifying tasks');
    const put=async(index,slot)=>{
        const thumb=q(`.clab-filmstrip-thumb[data-index="${index}"]`),dataTransfer=new DataTransfer();
        thumb.dispatchEvent(new DragEvent('dragstart',{bubbles:true,cancelable:true,dataTransfer}));
        const stage=q('.clab-compare-stage'),rect=stage.getBoundingClientRect(),split=parseFloat(stage.style.getPropertyValue('--compare-split'))/100;
        const x=rect.left+rect.width*(slot==='a'?split/2:(1+split)/2),y=rect.top+rect.height/2;
        stage.dispatchEvent(new DragEvent('dragover',{bubbles:true,cancelable:true,dataTransfer,clientX:x,clientY:y}));
        assert(stage.dataset.dropSlot===slot,'drag feedback chose the wrong comparison region');
        stage.dispatchEvent(new DragEvent('drop',{bubbles:true,cancelable:true,dataTransfer,clientX:x,clientY:y}));
        thumb.dispatchEvent(new DragEvent('dragend',{bubbles:true,dataTransfer}));await delay(0);
    };
    await put(2,'a');assert(q('.label-a').textContent.includes('历史 3')&&q('[data-compare-slot="b"]').getAttribute('aria-pressed')==='true','split drop did not replace A or arm B');
    q('[data-compare-layout="side"]').click();await put(6,'b');assert(q('.label-b').textContent.includes(other.title),'side drop did not replace B with a different task');
    assert(q('.clab-filmstrip-thumb[data-index="2"] .clab-filmstrip-assignment').textContent==='A'&&q('.clab-filmstrip-thumb[data-index="6"] .clab-filmstrip-assignment').textContent==='B','filmstrip does not identify selected A/B records');
    q('[data-compare-slot="a"]').click();q('.clab-filmstrip-thumb[data-index="0"]').click();assert(q('.label-a').textContent.includes('历史 1')&&q('[data-compare-slot="b"]').getAttribute('aria-pressed')==='true','thumbnail click did not alternate its comparison target');
    q('.clab-filmstrip-thumb[data-index="0"]').click();
    const badges=q('.clab-filmstrip-thumb[data-index="0"] .clab-filmstrip-assignment'),thumbBounds=badges.parentElement.getBoundingClientRect();
    assert(badges.children.length===2&&badges.textContent==='AB','a record used in both regions did not receive two separate A/B badges');
    for(const badge of badges.children) {const r=badge.getBoundingClientRect();assert(r.width===r.height&&getComputedStyle(badge).borderRadius==='3px'&&r.right<=thumbBounds.right&&r.left>thumbBounds.left+thumbBounds.width/2,'thumbnail A/B badges are not rounded squares at the top right');}
    assert(JSON.stringify([card,other])===before,'comparison dropping modified stored history or parameters');
    passed.push('comparison shares browse controls, keeps full-size media under corner overlays and accepts thumbnail drops into either A/B region');

    q('[data-review-mode="table"]').click();
    assert(q('.clab-result-table').querySelectorAll('tbody tr').length===5,'result table did not group matching runs or isolate legacy records');
    assert(q('.clab-result-table').textContent.includes('未参与本次运行') && q('.clab-result-table').textContent.includes('无可用结果') && q('.clab-result-table').textContent.includes('参数未记录'),'result table substituted unrelated records or current values');
    const outputColumn=q('[data-output-column]'),outputKey=outputColumn.dataset.outputColumn;outputColumn.click();assert(!q('.clab-result-table thead').textContent.includes('最终图像'),'output column toggle did not update the table');
    [...root.querySelectorAll('[data-output-column]')].find(input=>input.dataset.outputColumn===outputKey).click();
    const column=q('[data-table-column]');column.click();assert(!q('.clab-result-table thead').textContent.includes('步数'),'parameter column toggle did not update the table');
    q('[data-table-layout="xy"]').click();
    assert(q('.clab-result-table').querySelectorAll('tbody tr').length===2,'XY matrix did not arrange sampler rows');
    const change=(selector,value)=>{const el=q(selector);el.value=value;el.dispatchEvent(new Event('change',{bubbles:true}));};
    const cfgKey=JSON.stringify(['1','cfg']);change('[data-table-option="z"]',cfgKey);
    assert(q('[data-table-option="zValue"]').options.length===2,'Z did not create parameter slices');
    assert(q('.clab-result-table').textContent.includes('无结果'),'XY matrix did not preserve missing combinations within a Z slice');
    change('[data-table-option="zValue"]','7');
    assert(q('.clab-result-table').querySelectorAll('.clab-result-record').length===1,'Z selection mixed other parameter slices');
    const selected=q('[data-review-check]');selected.click();
    assert(JSON.stringify([card,other])===before,'table settings changed current inputs or outputs');
    passed.push('detail and XYZ tables use recorded parameters, distinguish missing outputs and keep table selections read-only');

    const anchorClick=HTMLAnchorElement.prototype.click,downloads=[];
    HTMLAnchorElement.prototype.click=function(){if(this.download){downloads.push(this.download);return;}return anchorClick.call(this);};
    try {
        q('[data-review-export="html"]').click();
        for(let i=0;i<120&&q('.clab-review-notice').textContent==='正在整理资源并导出…';i++)await delay(25);
        assert(downloads.some(name=>name.endsWith('.zip'))&&q('.clab-review-notice').textContent==='导出完成。','toolbar HTML export did not finish its download');
    } finally {HTMLAnchorElement.prototype.click=anchorClick;}

    const sources=[{card,area:a},{card,area:b},{card:other,area:old}],records=collectPreviewRecords(sources);
    const config={layout:'detail',fields:[JSON.stringify(['1','steps'])],width:120,textLimit:80};
    const model=buildTableModel(records,sources,config);
    const archive=await exportPreviewHTML(model,config);
    // ZIP local headers allow checking the stored package without an external unzip dependency.
    const readStored=async blob=>{
        const bytes=new Uint8Array(await blob.arrayBuffer()),view=new DataView(bytes.buffer),files=new Map();let offset=0;
        while(view.getUint32(offset,true)===0x04034b50) {
            const length=view.getUint32(offset+18,true),nameLength=view.getUint16(offset+26,true),extra=view.getUint16(offset+28,true),start=offset+30+nameLength+extra;
            files.set(new TextDecoder().decode(bytes.slice(offset+30,offset+30+nameLength)),bytes.slice(start,start+length));offset=start+length;
        } return files;
    };
    const files=await readStored(archive),html=new TextDecoder().decode(files.get('index.html'));
    assert(files.size>1 && html.includes('media/') && !html.includes('http://') && !html.includes('/extensions/'),'HTML export depends on the original server or omitted media');
    const pngs=await exportPreviewPNGs(model,config);
    assert(pngs.files.length>=1 && pngs.files[0].blob.size>1000 && pngs.failed.length===0,'result table PNG did not render its real image content');
    const pages=await exportPreviewPNGs({...model,rows:Array(50).fill(model.rows[0])},config);
    assert(pages.files.length>1 && (await packagePreviewPNGs(pages.files)).name.endsWith('.zip'),'long result tables did not export paginated images');
    const failModel={...model,rows:[{cells:[{text:'失败示例',records:[]},{text:'',records:[{...records[0],url:'/missing.png'}]},{text:'',records:[]},{text:'',records:[]},{text:'',records:[]}]}]};
    const failed=await exportPreviewPNGs(failModel,config);assert(failed.failed.length===1,'missing export media was silently omitted');
    passed.push('result tables export portable HTML with media, real PNGs and paginated ZIPs, and report missing assets');

    q('.clab-preview-modal-close').click();
    const previousCards=[...state.selectedCardIds],cardElement=document.createElement('div');
    cardElement.className='clab-card';cardElement.dataset.cardId=card.id;
    document.querySelector('#clab-cards-container').appendChild(cardElement);
    state.selectedCardIds=[card.id,other.id];state.selectedAreaIds=[];
    cardElement.dispatchEvent(new MouseEvent('contextmenu',{bubbles:true,cancelable:true,button:2,clientX:100,clientY:100}));
    document.querySelector('#clab-ctx-preview-mode').click();
    assert(previewModalStore.entries.length===7&&sourceCheck(a.id).checked&&sourceCheck(b.id).checked&&sourceCheck(old.id).checked,'card preview entry did not select outputs from every selected task');
    q('.clab-preview-modal-close').click();cardElement.remove();state.selectedCardIds=previousCards;
    passed.push('right clicking selected task cards opens browse with all of their output modules checked');

    const canvas=document.createElement('canvas');canvas.width=160;canvas.height=90;
    const context=canvas.getContext('2d');context.fillStyle='#8c6478';context.fillRect(0,0,160,90);
    const stream=canvas.captureStream(10),recorder=new MediaRecorder(stream,{mimeType:'video/webm'}),chunks=[];
    recorder.ondataavailable=event=>chunks.push(event.data);
    const recording=new Promise(resolve=>{recorder.onstop=resolve;});recorder.start();
    const interval=setInterval(()=>{context.fillStyle=`hsl(${performance.now()/20%360},50%,50%)`;context.fillRect(0,0,160,90);},100);
    await delay(1400);recorder.stop();await recording;clearInterval(interval);stream.getTracks().forEach(track=>track.stop());
    const blobURL=URL.createObjectURL(new Blob(chunks,{type:'video/webm'})),videoURL=`${blobURL}#review.webm`;
    const video={id:'review-video',title:'视频结果',type:'preview',history:[videoURL,videoURL],historyRuns:[{id:'video-1'},{id:'video-2'}],historyIndex:0,resultUrl:videoURL};
    card.areas.push(video);state.selectedAreaIds=[video.id];root.querySelector('.clab-preview-modal-close').click();
    window.CLab.showPreviewContextMenu(100,100,card.id,video.id,videoURL);document.querySelector('#clab-ctx-preview-mode').click();
    const browseVideo=q('.clab-preview-modal-main-video');
    for(let i=0;i<60&&browseVideo.readyState<2;i++)await delay(30);
    assert(!browseVideo.controls && q('.clab-preview-video .clab-video-controls') && !q('.clab-video-play'), 'browse still uses native video controls');
    if (!Number.isFinite(browseVideo.duration)) { q('.clab-preview-video').click();await delay(60);assert(!browseVideo.paused,'video without a duration header could not start');q('.clab-preview-video').click(); }
    Object.defineProperty(browseVideo,'duration',{value:1.3});browseVideo.dispatchEvent(new Event('loadedmetadata'));
    browseVideo.currentTime=.2;await browseVideo.play();await delay(60);browseVideo.pause();
    const position=browseVideo.currentTime;
    resize('parameters','ArrowLeft');resize('parameters','ArrowRight');
    for(let i=0;i<32;i++)resize('parameters','ArrowRight');
    assert(getComputedStyle(q('.clab-preview-modal-right')).display==='none'&&!q('[data-browse-restore="parameters"]').hidden,'collapsed parameters did not expose their restore arrow');
    q('[data-browse-restore="parameters"]').click();
    q('[data-browse-sort]').value='newest';q('[data-browse-sort]').dispatchEvent(new Event('change',{bubbles:true}));
    assert(q('.clab-preview-modal-main-video')===browseVideo&&browseVideo.paused&&Math.abs(browseVideo.currentTime-position)<.03,'browse layout changes replaced or restarted a paused video');
    passed.push('browse side-panel and sorting changes preserve the real video element, position and paused state');
    const pressSpace = target => target.dispatchEvent(new KeyboardEvent('keydown',{key:' ',code:'Space',bubbles:true,cancelable:true}));
    const browsePlayer=q('.clab-preview-video');
    browsePlayer.click();await delay(80);assert(!browseVideo.paused,'browse click did not start playback');
    pressSpace(browsePlayer);await delay(30);assert(browseVideo.paused,'browse Space did not pause playback');
    const speed=q('.clab-preview-video .clab-media-speed-input');speed.focus();pressSpace(speed);assert(browseVideo.paused,'editing video speed unexpectedly toggled playback');speed.blur();
    const beforeSeek=browseVideo.currentTime;
    browsePlayer.dispatchEvent(new WheelEvent('wheel',{deltaY:100,bubbles:true,cancelable:true}));
    assert(Math.abs(browseVideo.currentTime-beforeSeek-.2)<.03,'browse wheel did not seek by the module video step');await delay(450);
    assert(browseVideo.paused,'browse wheel resumed a previously paused video');
    const beforeZoom=browseVideo.currentTime,transform=q('.clab-preview-video-transform'),bounds=transform.getBoundingClientRect(),point={x:bounds.left+bounds.width*.75,y:bounds.top+bounds.height*.25};
    const zoomEvent=new WheelEvent('wheel',{deltaY:-100,ctrlKey:true,clientX:point.x,clientY:point.y,bubbles:true,cancelable:true});browsePlayer.dispatchEvent(zoomEvent);
    const zoomed=transform.getBoundingClientRect();
    assert(zoomEvent.defaultPrevented&&Math.abs((point.x-zoomed.left)/zoomed.width-.75)<.001&&Math.abs((point.y-zoomed.top)/zoomed.height-.25)<.001&&Math.abs(browseVideo.currentTime-beforeZoom)<.01,'browse Ctrl+wheel did not zoom about the pointer independently of playback');
    browsePlayer.querySelector('.clab-more-toggle').click();
    const detachedVideoMenu=document.querySelector('body > .clab-more-dropdown');
    assert(detachedVideoMenu&&detachedVideoMenu.classList.contains('show'),'browse did not open the module speed menu');
    detachedVideoMenu.querySelector('[data-spd="1.5"]').click();assert(browseVideo.playbackRate===1.5,'browse speed menu did not change playback rate');
    browsePlayer.querySelector('.clab-more-toggle').click();
    passed.push('browse reuses module video controls, click/Space playback, wheel seeking and pointer-anchored Ctrl+wheel zoom');
    q('[data-review-mode="compare"]').click();q('.clab-preview-modal-thumb[data-index="0"]').click();q('.clab-preview-modal-thumb[data-index="1"]').click();
    const prepareVideos=async()=>{
        const medias=[...root.querySelectorAll('.clab-compare-stage video')];
        for(const [index,media] of medias.entries()) {for(let i=0;i<60&&media.readyState<2;i++)await delay(30);assert(media.readyState>=2,'comparison fixture video did not decode');Object.defineProperty(media,'duration',{value:index?1:1.3});media.dispatchEvent(new Event('loadedmetadata'));}
        return medias;
    };
    let videos=await prepareVideos();
    assert(videos.every(media=>media.paused),'comparison videos ignored disabled autoplay');
    assert(!detachedVideoMenu.isConnected&&videos.every(media=>!media.controls)&&q('.clab-compare-stage .clab-video-controls'),'comparison failed to reuse module controls or leaked the old speed menu');
    const seek=q('.clab-compare-stage .clab-video-progress-container'),seekRect=seek.getBoundingClientRect();seek.dispatchEvent(new MouseEvent('mousedown',{button:0,clientX:seekRect.left+seekRect.width*.3,bubbles:true,cancelable:true}));await delay(80);
    assert(videos.every(media=>Math.abs(media.currentTime-.3)<.06),'shared seek did not position both videos');
    q('[data-compare-layout="split"]').click();q('[data-compare-slot="a"]').click();sourceCheck(a.id).click();sourceCheck(a.id).click();
    assert([...root.querySelectorAll('.clab-compare-stage video')].every((media,i)=>media===videos[i]&&media.paused&&Math.abs(media.currentTime-.3)<.06),'comparison controls or source filtering rebuilt or restarted its paused video pair');
    const stageBounds=q('.clab-compare-stage').getBoundingClientRect(),playBounds=q('.clab-compare-stage .clab-video-toolbar').getBoundingClientRect();
    assert(playBounds.top>=stageBounds.top&&playBounds.top>=q('.clab-compare-layout').getBoundingClientRect().bottom,'video playback controls overlap comparison mode buttons or are outside the preview');
    const previousVideos=videos;q('[data-compare-swap]').click();videos=await prepareVideos();await delay(80);
    assert(previousVideos.every(media=>media.paused&&!media.getAttribute('src'))&&videos.every(media=>media.paused&&Math.abs(media.currentTime-.3)<.06),'video exchange lost paused progress or toggled playback');
    pressSpace(q('.clab-compare-stage'));await delay(150);assert(videos.every(media=>!media.paused),'shared play did not start both videos');
    q('.clab-compare-stage').dispatchEvent(new WheelEvent('wheel',{deltaY:100,bubbles:true,cancelable:true}));assert(videos.every(media=>media.paused),'wheel seeking did not pause the pair');
    await delay(500);assert(videos.every(media=>!media.paused),'wheel seeking did not restore playback');
    pressSpace(q('.clab-compare-stage'));change('[data-compare-audio]','b');assert(videos[0].muted&&!videos[1].muted,'comparison audio played both sources');
    q('.clab-compare-stage .clab-more-toggle').click();
    const sharedMenu=document.querySelector('body > .clab-more-dropdown');sharedMenu.querySelector('[data-spd="1.5"]').click();
    assert(videos.every(media=>media.playbackRate===1.5),'comparison speed was not shared');
    const primaryTime=videos[0].currentTime,videoTransform=q('.clab-compare-transform'),videoBounds=videoTransform.getBoundingClientRect();
    const videoPoint={x:videoBounds.left+videoBounds.width*.65,y:videoBounds.top+videoBounds.height*.3};
    videoTransform.dispatchEvent(new WheelEvent('wheel',{deltaY:-100,ctrlKey:true,clientX:videoPoint.x,clientY:videoPoint.y,bubbles:true,cancelable:true}));
    const afterVideoZoom=videoTransform.getBoundingClientRect();
    assert([...root.querySelectorAll('.clab-compare-transform')].every(el=>el.style.transform===videoTransform.style.transform)&&Math.abs((videoPoint.x-afterVideoZoom.left)/afterVideoZoom.width-.65)<.001&&videos.every(media=>Math.abs(media.currentTime-primaryTime)<.03),'comparison Ctrl+wheel did not share pointer zoom independently of seek');
    q('.clab-compare-stage .clab-video-progress-container').dispatchEvent(new KeyboardEvent('keydown',{key:'End',bubbles:true,cancelable:true}));
    assert(videos.every(media=>Math.abs(media.currentTime-1)<.03),'shared progress exceeded the shorter video duration');
    passed.push('comparison shares module video controls and synchronized pointer-anchored Ctrl+wheel zoom');
    q('[data-review-mode="table"]').click();assert(videos.every(media=>media.paused&&!media.getAttribute('src')),'leaving comparison retained active videos');
    q('.clab-preview-modal-close').click();URL.revokeObjectURL(blobURL);
    passed.push('two real videos share play, seek, wheel resume, speed and a single audio source, then release on mode changes');

    let nativeVideoURL;
    window.openReviewVideo=async mode=>{
        if(!state.cards.includes(card))state.cards.push(card,other);
        q('.clab-preview-modal-close').click();
        if(nativeVideoURL)URL.revokeObjectURL(nativeVideoURL);
        nativeVideoURL=URL.createObjectURL(new Blob(chunks,{type:'video/webm'}));
        video.history=[`${nativeVideoURL}#review.webm`,`${nativeVideoURL}#review.webm`];video.resultUrl=video.history[0];state.selectedAreaIds=[video.id];
        window.CLab.showPreviewContextMenu(100,100,card.id,video.id,video.resultUrl);document.querySelector('#clab-ctx-preview-mode').click();
        if(mode==='compare'){q('[data-review-mode="compare"]').click();q('.clab-preview-modal-thumb[data-index="0"]').click();q('.clab-preview-modal-thumb[data-index="1"]').click();}
        const player=q(mode==='compare'?'.clab-compare-stage':'.clab-preview-video');
        window.nativePreviewVideos=[...player.querySelectorAll('video')];
        for(const media of window.nativePreviewVideos){for(let i=0;i<60&&media.readyState<2;i++)await delay(30);Object.defineProperty(media,'duration',{value:1.3});media.dispatchEvent(new Event('loadedmetadata'));media.currentTime=.25;}
        window.nativePreviewTransform=player.querySelector('.clab-preview-video-transform,.clab-compare-transform');
        const r=window.nativePreviewTransform.getBoundingClientRect();return{x:r.x+r.width*.7,y:r.y+r.height*.35,width:r.width};
    };
    window.closeReviewVideo=()=>{q('.clab-preview-modal-close').click();URL.revokeObjectURL(nativeVideoURL);state.selectedAreaIds=previousSelection;};
    window.showReviewDemo=layout=>{
        if(!state.cards.includes(card))state.cards.push(card,other);
        state.selectedAreaIds=[a.id,b.id,old.id];open();
        if(layout==='compare'){q('[data-review-mode="compare"]').click();q('.clab-preview-modal-thumb[data-index="0"]').click();q('.clab-preview-modal-thumb[data-index="4"]').click();q('[data-compare-layout="split"]').click();}
        else if(layout!=='browse'){q('[data-review-mode="table"]').click();if(layout==='xy')q('[data-table-layout="xy"]').click();}
    };
    window.exportReviewDemoPNG=async()=>{
        const {files}=await exportPreviewPNGs(model,config);
        return new Promise(resolve=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(files[0].blob);});
    };
    state.cards.splice(state.cards.indexOf(card),1);state.cards.splice(state.cards.indexOf(other),1);state.selectedAreaIds=previousSelection;
}
