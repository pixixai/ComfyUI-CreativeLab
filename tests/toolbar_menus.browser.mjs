import assert from 'node:assert/strict';

export async function runToolbarMenuChecks(send,sessionId){
    const evaluate=async expression=>{
        const result=await send('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true},sessionId);
        assert.equal(result.exceptionDetails,undefined,JSON.stringify(result.exceptionDetails));return result.result.value;
    };
    const settle=()=>evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const click=async point=>{
        await send('Input.dispatchMouseEvent',{type:'mouseMoved',...point},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mousePressed',button:'left',buttons:1,clickCount:1,...point},sessionId);
        await send('Input.dispatchMouseEvent',{type:'mouseReleased',button:'left',buttons:0,clickCount:1,...point},sessionId);
        await settle();
    };
    const center=selector=>evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error('Hidden menu control: '+${JSON.stringify(selector)});return{x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};})()`);
    const blank=()=>evaluate(`(()=>{const dock=document.querySelector('.clab-tool-dock'),r=dock.getBoundingClientRect(),y=r.top+r.height/2;for(let x=r.left+4;x<r.right-4;x+=4){const e=document.elementFromPoint(x,y);if(e===dock||e?.matches('.clab-toolbar-left,.clab-toolbar-right,.clab-xy-toolbar-start,.clab-xy-toolbar-center'))return{x,y};}throw Error('No toolbar blank area');})()`);
    const open=menu=>evaluate(`document.querySelector(${JSON.stringify(menu)}).style.display==='block'&&document.querySelector(${JSON.stringify(menu)}).matches(':popover-open')`);
    await evaluate(`window.showWorkspaceModeDemo('cards');window.menuDock=document.querySelector('.clab-tool-dock');window.menuSaved={side:menuDock.dataset.dock,left:menuDock.style.left,top:menuDock.style.top};`);await settle();
    try{
        for(const side of ['top','bottom','float']){
            await evaluate(`menuDock.dataset.dock=${JSON.stringify(side)};if(${JSON.stringify(side)}==='float'){menuDock.style.left='100px';menuDock.style.top='240px';}else{menuDock.style.left='';menuDock.style.top='';}`);await settle();
            for(const [button,menu]of [['#clab-import-json-btn','#clab-import-json-dropdown'],['#clab-run-dropdown-toggle','#clab-run-dropdown-menu']]){
                await click(await center(button));assert.equal(await open(menu),true,side+' menu opens');
                await click(await blank());assert.equal(await open(menu),false,side+' toolbar blank dismisses '+menu);
                await click(await center(button));assert.equal(await open(menu),true);
                await click(await center(button));assert.equal(await open(menu),false,side+' clicking trigger again dismisses '+menu);
            }
            await click(await center('#clab-import-json-btn'));await click(await center('#clab-run-dropdown-toggle'));
            assert.equal(await open('#clab-import-json-dropdown'),false);assert.equal(await open('#clab-run-dropdown-menu'),true);
            await click(await center('#clab-workspace-bar'));assert.equal(await open('#clab-run-dropdown-menu'),false,side+' workspace area dismisses run menu');
        }
        console.log('PASS real pointer clicks dismiss import and Run All menus on toolbar blanks in top, bottom and floating layouts; trigger toggling and switching menus still work');
    }finally{
        await evaluate(`menuDock.dataset.dock=menuSaved.side;menuDock.style.left=menuSaved.left;menuDock.style.top=menuSaved.top;document.querySelectorAll('.clab-toolbar-menu').forEach(menu=>menu.style.display='none');`);
    }
}
