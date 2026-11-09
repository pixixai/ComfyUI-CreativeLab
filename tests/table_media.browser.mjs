import assert from 'node:assert/strict';

export async function runTableMediaChecks({evaluate,click,wait}) {
    const ids=['media-image','media-video','media-audio','media-model'];
    const cell = id => `[data-area-id="${id}"]`;
    const dimensions = () => evaluate(`Array.from(document.querySelectorAll('.clab-area[data-area-id^=media-]')).map(cell=>cell.getBoundingClientRect().width)`);
    await evaluate(`(async()=>{
        const {state,createEmptyWorkspace,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');
        const areas=[['media-image',4,'image','input.png'],['media-video',6,'video','video.webm'],['media-audio',5,'audio','audio.wav'],['media-model',7,'model_file','3d/model.glb']]
            .map(([id,node,targetWidget,value])=>({id,type:'edit',targetNodeId:String(node),targetWidget,value}));
        window.uploadCheckWorkspace=createEmptyWorkspace('媒体参数表',{cards:[{id:'media-card',areas}],view:{mode:'table'}});
        state.workspaces.push(window.uploadCheckWorkspace);applyWorkspaceToState(window.uploadCheckWorkspace);
        window.originalMediaCheckFetch=window.fetch;window.mediaCheckUploads=[];
        window.fetch=(url,options)=>{
            if(url==='/upload/image'){
                const file=options.body.get('image');window.mediaCheckUploads.push(file.name);
                const subfolder=options.body.get('subfolder')||'clipboard-fixtures';
                return Promise.resolve(new Response(JSON.stringify({name:file.name,subfolder,type:'input'})));
            }
            if(String(url)==='https://example.invalid/clip.webm')return Promise.resolve(new Response(new Blob(['test'],{type:'video/webm'})));
            if(String(url)==='https://example.invalid/copied-image')return Promise.resolve(new Response(new Blob(['test'],{type:'image/png'})));
            return window.originalMediaCheckFetch(url,options);
        };
        document.dispatchEvent(new Event('clab_render_ui'));
    })()`);
    const setLayout = async (width, height) => {
        await evaluate(`(()=>{const {view}=window.uploadCheckWorkspace;view.table.widths=Object.fromEntries(${JSON.stringify(ids)}.map(id=>[id,${width}]));view.table.rowHeight=${height};document.dispatchEvent(new Event('clab_workspace_view_change'));})()`);
        await wait();
    };
    const paste = (name, mime, text='', html='') => evaluate(`(()=>{
        const data=new DataTransfer();if(${JSON.stringify(name)})data.items.add(new File(['test'],${JSON.stringify(name)},{type:${JSON.stringify(mime)}}));
        if(${JSON.stringify(text)})data.setData('text/plain',${JSON.stringify(text)});
        if(${JSON.stringify(html)})data.setData('text/html',${JSON.stringify(html)});
        const event=new ClipboardEvent('paste',{clipboardData:data,bubbles:true,cancelable:true});document.activeElement.dispatchEvent(event);return event.defaultPrevented;
    })()`);
    const waitUpload = async (index, pattern) => {
        for(let i=0;i<30;i++){
            const value=await evaluate(`window.uploadCheckWorkspace.cards[0].areas[${index}].value`);
            if(pattern.test(value))return;
            await wait();
        }
        assert.fail('clipboard upload was not assigned to its selected media cell');
    };
    try {
        await wait();await setLayout(256,144);
        assert.deepEqual(await dimensions(),[256,256,256,256]);
        assert.equal(await evaluate(`Array.from(document.querySelectorAll('.clab-area[data-area-id^=media-]')).every(cell=>{const outer=cell.getBoundingClientRect(),header=cell.querySelector('.clab-input-header').getBoundingClientRect(),body=cell.querySelector('.clab-input-body').getBoundingClientRect();return Math.abs((header.top+body.bottom)/2-(outer.top+outer.bottom)/2)<3;})`),true,'collapsed controls are not vertically centered');
        await setLayout(64,48);
        await evaluate(`document.querySelectorAll('.clab-area[data-area-id^=media-] .clab-upload-preview-toggle').forEach(toggle=>toggle.click())`);await wait();
        const bounds=await evaluate(`Array.from(document.querySelectorAll('.clab-area[data-area-id^=media-]')).map(cell=>{
            const outer=cell.getBoundingClientRect(),body=cell.querySelector('.clab-input-body');
            const boxes=[...cell.querySelectorAll('.clab-upload-preview,.clab-upload-preview-toggle,.clab-upload-file-row,.clab-upload-trigger-btn,.clab-upload-clear-btn,.clab-audio-controls-row,.clab-model-toolbar,.clab-video-controls')];
            return {id:cell.dataset.areaId,overX:body.scrollWidth-body.clientWidth,overY:body.scrollHeight-body.clientHeight,clipped:boxes.filter(box=>{if(box.hidden||!box.getClientRects().length)return false;const r=box.getBoundingClientRect();return r.height<=0||r.width<=0||r.top<outer.top-1||r.left<outer.left-1||r.bottom>outer.bottom+1||r.right>outer.right+1;}).map(box=>box.className)};
        })`);
        assert.ok(bounds.length===4 && bounds.every(item=>item.overX<=1&&item.overY<=1&&!item.clipped.length),JSON.stringify(bounds));
        await setLayout(256,144);assert.deepEqual(await dimensions(),[256,256,256,256]);
        console.log('PASS media inputs retain fixed width and fit their controls and previews into small cells without scrolling');

        await click(cell(ids[0])+' .clab-upload-preview');assert.equal(await paste('screenshot.png','image/png'),true);await waitUpload(0,/clipboard-fixtures\/screenshot\.png$/);
        await click(cell(ids[1])+' .clab-upload-preview');assert.equal(await paste('','','https://example.invalid/clip.webm'),true);await waitUpload(1,/clipboard-fixtures\/clip\.webm$/);
        await click(cell(ids[2])+' .clab-upload-preview');assert.equal(await paste('sound.wav','audio/wav'),true);await waitUpload(2,/clipboard-fixtures\/sound\.wav$/);
        await click(cell(ids[3])+' .clab-upload-preview');
        assert.equal(await paste('wrong-type.png','image/png','https://example.invalid/wrong-type.png'),true);
        assert.equal(await evaluate('window.mediaCheckUploads.length'),3);
        assert.equal(await evaluate('window.uploadCheckWorkspace.cards[0].areas[3].value'),'3d/model.glb');
        assert.equal(await paste('mesh.glb','model/gltf-binary'),true);await waitUpload(3,/3d\/mesh\.glb$/);
        await evaluate(`window.uploadCheckWorkspace.view.mode='cards';document.dispatchEvent(new Event('clab_render_ui'));`);await wait();
        await click(cell(ids[0])+' .clab-input-header');assert.equal(await paste('','','','<img src="https://example.invalid/copied-image">'),true);await waitUpload(0,/clipboard-fixtures\/clipboard-\d+\.png$/);
        assert.equal(await evaluate('window.mediaCheckUploads.length'),5);
        console.log('PASS file, screenshot and web media paste share ComfyUI input upload in table and card views');
    } finally {
        await evaluate(`(async()=>{window.fetch=window.originalMediaCheckFetch;const {state,applyWorkspaceToState}=await import('/extensions/clab/components/ui_state.js');applyWorkspaceToState(window.sheet);state.workspaces=state.workspaces.filter(w=>w!==window.uploadCheckWorkspace);document.dispatchEvent(new Event('clab_render_ui'));})()`);
        await wait();
    }
    return 2;
}
