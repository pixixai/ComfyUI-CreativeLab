import assert from 'node:assert/strict';

export async function runInputFileChecks(send,sessionId){
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);assert.equal(r.exceptionDetails,undefined,JSON.stringify(r.exceptionDetails));return r.result.value;};
    const wait=ms=>evaluate(`new Promise(resolve=>setTimeout(resolve,${ms}))`);
    const until=condition=>evaluate(`new Promise((resolve,reject)=>{const end=performance.now()+3000;const check=()=>{if(${condition})resolve();else if(performance.now()>end)reject(new Error('file tree did not become ready'));else setTimeout(check,16);};check();})`);
    await evaluate(`(async()=>{
        const ui=await import('/extensions/clab/components/ui_state.js'),{editHistory}=await import('/extensions/clab/components/edit_history_runtime.js'),{setWorkspaceMode}=await import('/extensions/clab/components/workspace_modes/workspace_modes.js'),tree=await import('/extensions/clab/components/modules/input_file_tree.js');
        ui.syncStateToActiveWorkspace();window.ft={ui,editHistory,setWorkspaceMode,tree,original:ui.getActiveWorkspace(),workspaces:[...ui.state.workspaces],panel:document.querySelector('#clab-panel')};
        ft.nodes=[{id:801,type:'LoadFile',widgets:[{name:'file',type:'combo',value:'notes.txt',options:{file_upload:true,values:['notes.txt']}}]},{id:802,type:'Sampler',widgets:[{name:'sampler',type:'combo',value:'a',options:{values:['a','b']}}]}];window.testApp.graph._nodes.push(...ft.nodes);
        ft.ws=ui.createEmptyWorkspace('目录文件测试',{cards:[{id:'ft-card',areas:[['image','4','image'],['video','6','video'],['audio','5','audio'],['model','7','model_file'],['file','801','file'],['choice','802','sampler']].map(([id,node,widget])=>({id:'ft-'+id,type:'edit',value:'',targetNodeId:node,targetWidget:widget,targetWidgets:[node+'||'+widget],autoHeight:false}))}]});
        ui.state.workspaces.push(ft.ws);ui.applyWorkspaceToState(ft.ws);editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));ft.root=id=>document.querySelector('[data-area-id="ft-'+id+'"]');ft.popup=()=>document.querySelector('.clab-input-files');ft.pick=id=>ft.root(id).querySelector('.clab-file-select').click();ft.close=()=>ft.popup()?.querySelector('.clab-xy-popup-close').click();ft.reads=()=>fetch('/clab/test-input-reads').then(response=>response.json());tree.invalidateInputFiles();
    })()`);await until(`ft.root('image')?.querySelector('.clab-file-select')`);
    try{
        const idle=await evaluate('ft.reads().then(reads=>reads.length)');await wait(60);assert.equal(await evaluate('ft.reads().then(reads=>reads.length)'),idle,'rendering controls scanned the file system');
        await evaluate(`ft.pick('image')`);await until(`ft.popup()?.querySelector('[data-directory="refs"]')`);
        assert.equal(await evaluate(`!ft.popup().querySelector('[data-input-file="refs/deep/same.png"]')&&ft.reads().then(reads=>!reads.slice(${idle}).some(read=>read.directory==='refs'))`),true);
        await evaluate(`ft.popup().querySelector('[data-directory="refs"]>summary').click()`);await until(`ft.popup()?.querySelector('[data-directory="refs/deep"]')`);
        assert.equal(await evaluate(`getComputedStyle(ft.popup().querySelector('[data-directory="refs"]>.clab-input-file-children')).borderLeftStyle==='dashed'`),true);
        await evaluate(`ft.popup().querySelector('[data-directory="refs/deep"]>summary').click()`);await until(`ft.popup()?.querySelector('[data-input-file="refs/deep/same.png"]')`);
        assert.equal(await evaluate(`(()=>{const root=ft.popup().querySelector('[data-directory="refs"]>summary').getBoundingClientRect(),deep=ft.popup().querySelector('[data-directory="refs/deep"]>summary').getBoundingClientRect(),leaf=ft.popup().querySelector('[data-input-file="refs/deep/same.png"]').getBoundingClientRect(),p=ft.popup().getBoundingClientRect(),b=ft.panel.getBoundingClientRect();return deep.left>root.left&&deep.left-root.left<20&&leaf.left>deep.left&&p.left>=b.left&&p.right<=b.right&&p.top>=b.top&&p.bottom<=b.bottom;})()`),true);
        await evaluate(`ft.popup().querySelector('[data-input-file="refs/deep/same.png"]').click()`);await wait(80);
        assert.equal(await evaluate(`ft.ws.cards[0].areas[0].value==='refs/deep/same.png'&&!ft.popup()&&ft.root('image').querySelector('.clab-upload-filename').value==='refs/deep/same.png'`),true);
        await evaluate(`ft.root('image').querySelector('.clab-upload-preview-toggle').click()`);await wait(80);
        assert.equal(await evaluate(`(()=>{const src=new URL(ft.root('image').querySelector('img').src);return src.searchParams.get('filename')==='same.png'&&src.searchParams.get('subfolder')==='refs/deep';})()`),true);
        await evaluate(`ft.pick('image')`);await until(`ft.popup()?.querySelector('[data-input-file="refs/deep/same.png"][aria-selected="true"]')`);
        assert.equal(await evaluate(`!!ft.popup().querySelector('[data-input-file="refs/deep/same.png"][role=radio][aria-checked=true]')&&!ft.popup().querySelector('.clab-input-files-tools input')`),true);
        assert.equal(await evaluate(`ft.popup().querySelector('[data-file-refresh]').previousElementSibling===ft.popup().querySelector('.clab-binding-panel-head>span')&&!ft.popup().querySelector('.clab-input-files-tools')`),true,'refresh still occupies an empty toolbar row');
        await evaluate(`ft.query=ft.root('image').querySelector('.clab-upload-filename');ft.query.value='other';ft.query.dispatchEvent(new Event('input',{bubbles:true}));`);
        assert.equal(await evaluate(`!ft.query.readOnly&&!ft.popup().querySelector('[data-input-file="other.png"]').hidden&&ft.popup().querySelector('[data-input-file="input.png"]').hidden&&ft.ws.cards[0].areas[0].value==='refs/deep/same.png'`),true);
        await evaluate(`ft.close()`);assert.equal(await evaluate(`ft.query.value==='refs/deep/same.png'`),true);await evaluate(`ft.pick('image')`);await until(`ft.popup()?.querySelector('[data-input-file="refs/deep/same.png"]')`);
        await evaluate(`ft.query.focus();ft.query.select()`);await send('Input.insertText',{text:'other'},sessionId);
        assert.equal(await evaluate(`!!ft.popup()&&ft.query.value==='other'&&!ft.popup().querySelector('[data-input-file="other.png"]').hidden&&ft.ws.cards[0].areas[0].value==='refs/deep/same.png'`),true,'real typing closed the picker or changed the selected value');
        const queryPoint=await evaluate(`(()=>{const r=ft.query.getBoundingClientRect();return{x:r.left+12,y:r.top+r.height/2};})()`);
        for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,...queryPoint,button:type==='mouseMoved'?'none':'left',clickCount:type==='mouseMoved'?0:1},sessionId);
        assert.equal(await evaluate(`!!ft.popup()&&ft.query.value==='other'`),true,'clicking the live search field discarded its query');
        await evaluate(`ft.close();ft.pick('image')`);await until(`ft.popup()?.querySelector('[data-input-file="refs/deep/same.png"]')`);
        assert.equal(await evaluate(`(()=>{const anchor=ft.root('image').querySelector('.clab-file-select'),field=anchor.querySelector('input').getBoundingClientRect(),icon=anchor.querySelector('.clab-custom-select-icon').getBoundingClientRect(),box=anchor.getBoundingClientRect();return field.left-box.left>=8&&box.right-icon.right>=8;})()`),true,'file caption or triangle is flush with the border');
        assert.equal(await evaluate(`ft.popup().querySelector('[data-directory="refs"]').open&&ft.popup().querySelector('[data-directory="refs/deep"]').open`),true);
        await evaluate(`ft.popup().querySelector('[data-directory="refs"]>summary').click()`);assert.equal(await evaluate(`!ft.popup().querySelector('[data-directory="refs"]').open`),true);await evaluate('ft.close()');
        console.log('PASS input folders load on expansion, indent with dashed guides, restore the selected path and preview nested files without flattening their names');

        await evaluate(`ft.pick('image')`);await until(`ft.popup()?.querySelector('[data-input-file="input.png"]')`);await evaluate(`ft.beforeRefresh=ft.reads();ft.popup().querySelector('[data-file-refresh]').click()`);await until(`ft.popup()?.querySelector('[data-input-file="input.png"]')`);
        assert.equal(await evaluate(`(async()=>{const before=await ft.beforeRefresh,after=await ft.reads();return after.length>before.length;})()`),true);await evaluate('ft.close()');
        await evaluate(`(async()=>{ft.uploadStart=(await ft.reads()).length;const {uploadImageToServer}=await import('/extensions/clab/components/actions/action_data_io.js');ft.uploaded=await uploadImageToServer(new File(['fixture'],'new.png',{type:'image/png'}));ft.pick('image');})()`);await until(`ft.popup()?.querySelector('[data-input-file="'+ft.uploaded.name+'"]')`);assert.equal(await evaluate(`ft.reads().then(reads=>reads.length>ft.uploadStart)`),true);await evaluate('ft.close()');
        console.log('PASS explicit refresh and new uploads invalidate directory caches and immediately expose new files');

        for(const [kind,file]of [['video','clip.mp4'],['audio','sample.wav'],['model','scene.glb'],['file','notes.txt']]){
            await evaluate(`ft.pick('${kind}')`);await until(`ft.popup()?.querySelector('[data-input-file="${file}"]')`);
            assert.equal(await evaluate(`ft.reads().then(reads=>reads.some(read=>read.kind==='${kind}'))`),true);
            if(kind==='model'){
                await evaluate(`ft.popup().querySelector('[data-directory="3d"]>summary').click()`);await until(`ft.popup()?.querySelector('[data-input-file="3d/model.glb"]')`);
                assert.equal(await evaluate(`!!ft.popup().querySelector('[data-input-file="none"]')&&!!ft.popup().querySelector('[data-input-file="3d/texture.fbx"]')`),true);
            }
            await evaluate('ft.close()');
        }
        assert.equal(await evaluate(`!!ft.root('choice').querySelector('[data-type="module-combo"]')&&!ft.root('choice').querySelector('.clab-file-select')`),true);
        await evaluate(`ft.pick('image')`);await until(`ft.popup()?.querySelector('[data-directory="slow"]')`);await evaluate(`ft.popup().querySelector('[data-directory="slow"]>summary').click();ft.close();ft.pick('video');`);await wait(300);
        assert.equal(await evaluate(`!!ft.popup().querySelector('[data-input-file="clip.mp4"]')&&!ft.popup().querySelector('[data-input-file="slow/late.png"]')`),true);await evaluate('ft.close()');
        console.log('PASS image/video/audio/model/general file filters stay separate, ordinary choices are unchanged and closed-folder requests cannot contaminate a new picker');

        await evaluate(`ft.setWorkspaceMode(ft.panel,'table')`);await wait(150);
        assert.equal(await evaluate(`!!ft.root('image').querySelector('.clab-file-select')&&!ft.root('image').querySelector('.clab-table-choice')`),true,'table replaced the file browser with a flat choice list');
        await evaluate(`ft.pick('image')`);await until(`ft.popup()?.querySelector('[data-input-file="refs/deep/same.png"]')`);
        await evaluate(`ft.popup().querySelector('[data-input-file="refs/参考图.png"]').click()`);await wait(90);
        assert.equal(await evaluate(`ft.ui.state.cards.find(card=>card.id==='ft-card').areas[0].value==='refs/参考图.png'`),true);
        await evaluate(`ft.pick('image')`);await until(`ft.popup()?.querySelector('[data-directory="refs"]')`);
        const point=await evaluate(`(()=>{const r=ft.root('image').querySelector('.clab-custom-select-icon').getBoundingClientRect();return{x:r.left+r.width/2,y:r.top+r.height/2};})()`);
        for(const type of ['mouseMoved','mousePressed','mouseReleased'])await send('Input.dispatchMouseEvent',{type,x:point.x,y:point.y,button:type==='mouseMoved'?'none':'left',clickCount:type==='mouseMoved'?0:1},sessionId);
        await wait(40);assert.equal(await evaluate('!ft.popup()'),true,'clicking the same file control did not close its panel');
        console.log('PASS parameter-table upload cells share the hierarchical picker, preserve nested values and toggle the panel closed on a real mouse click');

        assert.equal(await evaluate(`(()=>{const cells=[...document.querySelectorAll('.clab-table-draft-cell[data-table-index="0"]')];return cells.length>0&&cells.every(cell=>cell.querySelector('.clab-file-select input[placeholder]')&&!cell.querySelector('select'));})()`),true,'empty bound rows still use arrow-only native selects');
        await evaluate(`ft.draft=document.querySelector('.clab-table-draft-cell[data-table-index="0"]');ft.draft.querySelector('.clab-file-select').click()`);await until(`ft.popup()?.querySelector('[data-input-file="input.png"]')`);await evaluate(`ft.draftId=ft.draft.dataset.areaId;ft.popup().querySelector('[data-input-file="input.png"]').click()`);await wait(100);
        assert.equal(await evaluate(`ft.ui.state.cards.some(card=>card.areas.some(area=>area.id===ft.draftId&&area.value==='input.png'))`),true);
        await evaluate(`document.querySelector('.clab-table-column[data-table-index="0"] [data-table-settings]').click()`);await until(`document.querySelector('[data-value-file-tree="0"] [data-file-folder="refs"]')`);
        await evaluate(`document.querySelector('[data-value-file-tree="0"] [data-file-folder="refs"]').click()`);await until(`JSON.parse(document.querySelector('[data-table-values]').value).includes('refs/deep/same.png')&&document.querySelector('[data-value-file-tree="0"]')?.getAttribute('aria-busy')!=='true'`);
        assert.equal(await evaluate(`(()=>{const values=JSON.parse(document.querySelector('[data-table-values]').value);return values.includes('refs/参考图.png')&&values.includes('refs/deep/same.png');})()`),true);
        await evaluate(`document.querySelector('[data-xy-value-tab=order]').click()`);assert.equal(await evaluate(`document.querySelectorAll('[data-xy-order-index]').length>=2`),true);
        await evaluate(`document.querySelector('[data-xy-value-tab=input]').click();document.querySelector('[data-value-file-tree="0"] [data-file-folder="refs"]').click()`);await wait(80);
        assert.equal(await evaluate(`!JSON.parse(document.querySelector('[data-table-values]').value).some(value=>value.startsWith('refs/'))`),true);await evaluate(`document.querySelector('.clab-table-column-panel .clab-xy-popup-close').click()`);
        console.log('PASS every empty bound row has a searchable file control; selecting one creates a real row, and column folder checks include descendants and synchronize sorting');

        await evaluate(`(async()=>{const {createWorkspaceView}=await import('/extensions/clab/components/workspace_modes/view_state.js');ft.xy=ft.ui.createEmptyWorkspace('文件矩阵',{view:createWorkspaceView({mode:'xy',xy:{initialized:true,outputNodeId:'2',x:{bindings:['4||image','1||text'],values:[['input.png','keep']]},y:{bindings:[],values:[]}}})});ft.ui.state.workspaces.push(ft.xy);ft.ui.applyWorkspaceToState(ft.xy);ft.editHistory.withoutRecording(()=>document.dispatchEvent(new Event('clab_render_ui')));})()`);await wait(120);
        await evaluate(`document.querySelector('.axis-x').click()`);await until(`document.querySelector('.clab-xy-values [data-value-file-tree="0"] [data-file-folder="refs"]')`);
        await evaluate(`document.querySelector('.clab-xy-values [data-file-folder="refs"]').click()`);await until(`ft.xy.view.xy.x.values.some(value=>value[0]==='refs/deep/same.png')`);
        assert.equal(await evaluate(`ft.xy.view.xy.x.values.some(value=>value[0]==='refs/参考图.png')&&ft.xy.view.xy.x.values.every(value=>value[1]==='keep')`),true);
        await evaluate(`document.querySelector('.clab-xy-values [data-file-folder="refs"]').click()`);await until(`!ft.xy.view.xy.x.values.some(value=>value[0].startsWith('refs/'))`);
        assert.equal(await evaluate(`ft.xy.view.xy.x.values.some(value=>value[0]==='input.png'&&value[1]==='keep')`),true);
        await evaluate(`document.querySelector('.clab-xy-values .clab-xy-popup-close').click()`);
        console.log('PASS XY file trees recursively select and clear directory values while preserving other tuple parameters and files outside the folder');
    }finally{
        await evaluate(`(()=>{ft.close();ft.tree.invalidateInputFiles();ft.editHistory.withoutRecording(()=>{ft.ui.state.workspaces=ft.workspaces;ft.ui.applyWorkspaceToState(ft.original);window.testApp.graph._nodes=window.testApp.graph._nodes.filter(node=>!ft.nodes.includes(node));document.dispatchEvent(new Event('clab_render_ui'));});})()`);
    }
}
