import assert from 'node:assert/strict';
import fs from 'node:fs';

export async function runToolbarDockChecks(send, sessionId) {
    const evaluate = async expression => {
        const {result, exceptionDetails} = await send('Runtime.evaluate', {expression, awaitPromise:true, returnByValue:true}, sessionId);
        assert.equal(exceptionDetails, undefined, JSON.stringify(exceptionDetails));
        return result.value;
    };
    const mouse = (type, point, extra = {}) => send('Input.dispatchMouseEvent', {type, ...point, ...extra}, sessionId);
    const center = selector => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error('Toolbar target is hidden: '+${JSON.stringify(selector)});return {x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};})()`);
    const settle = () => evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const click = async selector => {
        const point = await center(selector);
        await mouse('mouseMoved', point);
        await mouse('mousePressed', point, {button:'left', buttons:1, clickCount:1});
        await mouse('mouseReleased', point, {button:'left', clickCount:1});
        await settle();
    };
    const drag = async (selector, end) => {
        const start = typeof selector === 'string' ? await center(selector) : selector;
        await mouse('mouseMoved', start);
        await mouse('mousePressed', start, {button:'left', buttons:1, clickCount:1});
        for (let step = 1; step <= 8; step++) {
            const point = {x:start.x + (end.x-start.x)*step/8, y:start.y + (end.y-start.y)*step/8};
            await mouse('mouseMoved', point, {buttons:1, button:'left'});
        }
        await mouse('mouseReleased', end, {button:'left', clickCount:1});
        await settle();
    };
    const shot = async name => {
        if (!process.env.CLAB_DOCK_SCREENSHOT_PREFIX) return;
        const {data} = await send('Page.captureScreenshot', {format:'png'}, sessionId);
        fs.writeFileSync(process.env.CLAB_DOCK_SCREENSHOT_PREFIX + '-' + name + '.png', Buffer.from(data, 'base64'));
    };
    const dock = () => evaluate('document.querySelector(".clab-tool-dock").dataset.dock');
    const checkMenuMarker = () => evaluate(`(()=>{
        const button=document.querySelector('#clab-import-json-btn'),icon=button.querySelector('.clab-tool-icon');
        const label=button.querySelector('.clab-tool-label'),mark=getComputedStyle(icon,'::after');
        return getComputedStyle(button).position==='relative'&&getComputedStyle(icon).position==='static'&&
            button.getBoundingClientRect().right-label.getBoundingClientRect().right>=7&&mark.right==='2px'&&mark.bottom==='2px';
    })()`);
    const checkRunHighlight = async side => {
        const vertical = side === 'left' || side === 'right';
        const run = await evaluate(`(()=>{
            const q=s=>document.querySelector(s),group=q('#clab-run-group'),main=q('#clab-btn-run');
            const menu=q('#clab-run-dropdown-toggle'),count=q('#clab-run-count-control');
            const [g,a,b,c]=[group,main,menu,count].map(e=>e.getBoundingClientRect());
            const near=(x,y)=>Math.abs(x-y)<0.5;
            const vertical=${vertical};
            const flush=vertical
                ? [a,b,c].every(r=>near(r.left,g.left)&&near(r.right,g.right))&&near(a.top,g.top)&&near(a.bottom,b.top)&&near(b.bottom,c.top)&&near(c.bottom,g.bottom)
                : [a,b,c].every(r=>near(r.top,g.top)&&near(r.bottom,g.bottom))&&near(a.left,g.left)&&near(a.right,b.left)&&near(b.right,c.left)&&near(c.right,g.right);
            return {flush,radius:getComputedStyle(group).borderRadius,menuRadius:getComputedStyle(menu).borderRadius,
                points:[a,b].map(r=>vertical?{x:r.left+1,y:r.top+r.height/2}:{x:r.left+r.width/2,y:r.top+1})};
        })()`);
        assert.equal(run.flush, true, side+' run controls cover the whole group');
        assert.equal(run.radius, side === 'float' ? '8px' : '6px');
        assert.equal(run.menuRadius, '0px');
        for (const [index, selector] of ['#clab-btn-run','#clab-run-dropdown-toggle'].entries()) {
            await mouse('mouseMoved', run.points[index]);
            await settle();
            assert.equal(await evaluate(`(()=>{const button=document.querySelector(${JSON.stringify(selector)});return button.matches(':hover')&&getComputedStyle(button).backgroundColor!=='rgba(0, 0, 0, 0)';})()`), true, side+' '+selector+' highlights at the edge');
        }
    };
    const checkOpeningScale = async side => {
        const { before, scaled } = await evaluate(`(async()=>{
            const {scheduleToolbarLayout}=await import('/extensions/clab/components/toolbar_layout.js');
            const panel=document.querySelector('#clab-panel'),toolbar=panel.querySelector('#clab-toolbar-handle');
            const visible=()=>[...panel.querySelectorAll('[data-toolbar-item]')].filter(item=>
                item.getClientRects().length&&!item.closest('#clab-toolbar-more-menu')).map(item=>item.dataset.toolbarItem);
            const before=visible(),style=panel.style.cssText;
            try {
                panel.style.transition='none';
                panel.style.transform='scale(.95)';
                scheduleToolbarLayout(toolbar);
                await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
                return {before,scaled:visible()};
            } finally {
                panel.style.cssText=style;
                const transition=panel.style.transition;
                panel.style.transition='none';
                void getComputedStyle(panel).transform;
                panel.style.transition=transition;
                scheduleToolbarLayout(toolbar);
            }
        })()`);
        assert.ok(before.includes('#clab-run-group'), side+' run button is visible before the panel animates');
        assert.deepEqual(scaled, before, side+' dock keeps its buttons while the panel scales');
        await settle();
    };
    const dockBlank = () => evaluate(`(()=>{
        const d=document.querySelector('.clab-tool-dock'),r=d.getBoundingClientRect(),vertical=d.hasAttribute('data-vertical');
        for(let offset=4;offset<(vertical?r.height:r.width)-4;offset+=4){
            const x=r.left+(vertical?r.width/2:offset),y=r.top+(vertical?offset:r.height/2);
            if(document.elementFromPoint(x,y)?.matches('.clab-tool-dock,.clab-toolbar-left,.clab-toolbar-right'))return {x,y};
        }
        throw Error('No blank space in docked toolbar');
    })()`);
    const select = kind => evaluate(`(async()=>{
        const {state}=await import('/extensions/clab/components/ui_state.js'),card=state.cards[0];
        state.selectedCardIds=${kind === 'card'}?[card.id]:[];
        state.selectedAreaIds=${kind === 'module' || kind === 'output'}?[card.areas.find(area=>area.type===${JSON.stringify(kind === 'output' ? 'preview' : 'edit')}).id]:[];
        const {updateSelectionUI}=await import('/extensions/clab/components/ui_selection.js');
        updateSelectionUI();
    })()`);
    const centered = vertical => evaluate(`(()=>{
        const rect=s=>document.querySelector(s).getBoundingClientRect();
        const a=rect('.clab-tool-dock'),b=rect('#clab-module-toolbar'),vertical=${vertical};
        return b.width>0&&Math.abs(vertical?(a.top+a.bottom-b.top-b.bottom)/2:(a.left+a.right-b.left-b.right)/2)<2;
    })()`);
    const floatBlank = () => evaluate(`(()=>{
        const d=document.querySelector('.clab-tool-dock'),r=d.getBoundingClientRect();
        const x=r.left+12,y=r.top+r.height/2;
        if(document.elementFromPoint(x,y)!==d)throw Error('Floating toolbar padding is not draggable');
        if(getComputedStyle(d).cursor!=='default')throw Error('Floating toolbar padding does not use an arrow cursor');
        return {x,y};
    })()`);
    await evaluate("window.showWorkspaceModeDemo('cards');window.addClicks=0;document.querySelector('#clab-global-add-card').onclick=()=>window.addClicks++;");
    await settle();
    assert.equal(await evaluate(`(()=>{const panel=document.querySelector('#clab-panel'),dock=panel.querySelector('.clab-tool-dock'),button=panel.querySelector('#clab-global-add-card'),style=getComputedStyle(dock);return dock.dataset.dock==='top'&&dock.offsetHeight<=34&&getComputedStyle(panel).borderRadius==='0px'&&getComputedStyle(button).borderRadius==='6px'&&parseFloat(style.paddingLeft)>=28&&style.paddingLeft===style.paddingRight&&!!button.querySelector('svg')&&getComputedStyle(button.querySelector('.clab-tool-label')).display!=='none';})()`), true);
    assert.equal(await evaluate(`(()=>{
        const q=s=>document.querySelector(s),dock=q('.clab-tool-dock'),button=q('#clab-global-add-card'),run=q('#clab-run-group');
        const count=q('#clab-run-batch-count'),icon=button.querySelector('.clab-tool-icon');
        const triangle=getComputedStyle(q('#clab-import-json-btn .clab-tool-icon'),'::after');
        dock.style.setProperty('--primary-background','#0b8ce9');
        return [button,button.querySelector('.clab-tool-label'),count].every(e=>getComputedStyle(e).fontSize==='11px'&&getComputedStyle(e).lineHeight==='16px')&&
            getComputedStyle(run).backgroundColor==='rgb(11, 140, 233)'&&run.contains(count)&&
            icon.offsetWidth===icon.offsetHeight&&getComputedStyle(icon,'::after').content==='none'&&
            triangle.width==='4px'&&triangle.clipPath.startsWith('polygon')&&getComputedStyle(button).color==='rgb(170, 170, 170)'&&
            !dock.querySelector('.clab-tool-grip,[data-toolbar-divider]')&&getComputedStyle(q('.clab-card-title-input')).fontSize==='14px'&&
            [q('.clab-card'),q('.clab-area')].every(e=>getComputedStyle(e).borderRadius==='0px');
    })()`), true);
    await checkRunHighlight('top');
    assert.equal(await checkMenuMarker(), true);
    await drag('#clab-global-add-card', await center('#clab-global-add-module'));
    assert.equal(await evaluate(`window.addClicks===0&&document.querySelector('#clab-global-add-card').getBoundingClientRect().left<document.querySelector('#clab-global-add-module').getBoundingClientRect().left&&!document.querySelector('.clab-tool-insert')`), true);
    await click('#clab-global-add-card');
    assert.equal(await evaluate('window.addClicks'), 1);
    await shot('top');
    await select('card');
    await settle();
    assert.equal(await centered(false), true);
    await checkOpeningScale('top');
    console.log('PASS toolbar order is fixed, ordinary clicks work and docked selection tools are centered');

    const bounds = await evaluate(`(()=>{const r=document.querySelector('#clab-panel').getBoundingClientRect();return {x:r.left,y:r.top,right:r.right,bottom:r.bottom-1};})()`);
    const midX = (bounds.x+bounds.right)/2, midY = (bounds.y+bounds.bottom)/2;
    await drag(await dockBlank(), {x:midX,y:midY});
    assert.equal(await dock(), 'float');
    const checkFloat = () => evaluate(`(()=>{
        const d=document.querySelector('.clab-tool-dock'),button=d.querySelector('#clab-global-add-card');
        const icon=button.querySelector('.clab-tool-icon'),label=button.querySelector('.clab-tool-short-label'),run=d.querySelector('#clab-run-group');
        const runLabel=run.querySelector('#clab-btn-run .clab-tool-label'),runRect=run.getBoundingClientRect();
        const main=run.querySelector('#clab-btn-run').getBoundingClientRect();
        const toggle=run.querySelector('#clab-run-dropdown-toggle'),menu=toggle.getBoundingClientRect();
        const count=run.querySelector('#clab-run-count-control').getBoundingClientRect();
        const tool=button.getBoundingClientRect(),runStyle=getComputedStyle(run);
        const r=d.getBoundingClientRect(),p=getComputedStyle(d);
        return parseFloat(p.borderRadius)>Math.min(r.width,r.height)/2&&parseFloat(p.gap)>=12&&
            [...d.querySelectorAll('[data-toolbar-item]')].filter(e=>e.offsetWidth&&!e.closest('#clab-module-toolbar')).every(e=>{
                const item=e.getBoundingClientRect();
                return item.left-r.left>=r.height/2&&r.right-item.right>=r.height/2;
            })&&
            d.getAttribute('aria-orientation')==='horizontal'&&!d.querySelector('.clab-tool-orientation,.clab-tool-grip')&&
            getComputedStyle(button.querySelector('.clab-tool-label')).display==='none'&&label.textContent==='新任务'&&
            icon.getBoundingClientRect().bottom<=label.getBoundingClientRect().top&&getComputedStyle(label).fontSize==='10px'&&
            [...d.querySelectorAll('.clab-tool-button:has(> .clab-tool-icon):not(#clab-btn-run)')].filter(e=>e.offsetWidth).every(e=>e.offsetWidth===e.offsetHeight)&&
            getComputedStyle(icon.querySelector('svg')).width==='22px'&&runStyle.backgroundColor==='rgb(11, 140, 233)'&&
            runLabel.offsetWidth>0&&runLabel.scrollWidth<=runLabel.clientWidth&&
            getComputedStyle(runLabel).fontSize==='13px'&&getComputedStyle(run.querySelector('#clab-btn-run svg')).width==='22px'&&
            getComputedStyle(toggle,'::before').content==='none'&&
            Math.abs((runRect.top+runRect.bottom-tool.top-tool.bottom)/2)<1&&runRect.height<tool.height&&main.right<=menu.left&&menu.right<=count.left;
    })()`);
    assert.equal(await checkFloat(),true);
    await checkRunHighlight('float');
    await click('#clab-run-dropdown-toggle');
    assert.equal(await evaluate("document.querySelector('#clab-run-dropdown-menu').matches(':popover-open')"), true);
    await click('#clab-run-dropdown-toggle');
    await shot('floating-horizontal');
    const mainWidth = await evaluate("document.querySelector('.clab-tool-dock').offsetWidth");
    await select('module');
    await settle();
    assert.equal(await evaluate(`(()=>{
        const d=document.querySelector('.clab-tool-dock'),context=d.querySelector('#clab-module-toolbar');
        const a=d.getBoundingClientRect(),b=context.getBoundingClientRect(),toggle=context.querySelector('.clab-toolbar-type');
        return d.offsetWidth===${mainWidth}&&b.bottom<a.top&&Math.abs((a.left+a.right-b.left-b.right)/2)<1&&
            b.height<a.height&&parseFloat(getComputedStyle(context).borderRadius)<b.height/2&&
            getComputedStyle(toggle).flexDirection==='row'&&parseFloat(getComputedStyle(toggle).borderRadius)>20&&toggle.offsetHeight>=32&&
            !toggle.querySelector('svg')&&toggle.querySelector('[data-type=edit]').getAttribute('aria-pressed')==='true';
    })()`), true);
    if (!await evaluate("document.querySelector('#tb-auto-height').checked")) await click('.clab-auto-height');
    const checkAutoHeight = floating => evaluate(`(()=>{
        const button=document.querySelector('.clab-auto-height'),style=getComputedStyle(button);
        const bounds=button.getBoundingClientRect(),icon=button.querySelector('.clab-tool-icon').getBoundingClientRect();
        const label=button.querySelector('.clab-tool-short-label').getBoundingClientRect();
        return button.querySelector('input').checked&&style.boxShadow==='none'&&parseFloat(style.borderRadius)>0&&
            bounds.width===bounds.height&&icon.top>=bounds.top&&label.bottom<=bounds.bottom&&label.top>=icon.bottom&&
            bounds.width>=${floating ? 44 : 42};
    })()`);
    assert.equal(await checkAutoHeight(true), true);
    await select('output');
    await settle();
    assert.equal(await evaluate("!document.querySelector('#tb-output-settings')"), true);
    await click('.clab-area.active .clab-output-settings-trigger');
    assert.equal(await evaluate("document.querySelector('#clab-output-settings-popover').matches(':popover-open')"), true);
    await evaluate("document.querySelector('#clab-output-settings-popover').hidePopover()");
    await settle();
    if (!await evaluate("document.querySelector('#tb-manage-history').getAttribute('aria-pressed')==='true'")) await click('#tb-manage-history');
    assert.equal(await evaluate(`(()=>{
        const button=document.querySelector('#tb-manage-history'),style=getComputedStyle(button);
        return button.getAttribute('aria-pressed')==='true'&&style.boxShadow==='none'&&style.borderRadius==='8px'&&
            style.backgroundColor==='rgba(255, 255, 255, 0.125)';
    })()`), true);
    await click('#tb-manage-history');
    await select('module');
    await settle();
    await shot('floating-horizontal-selection');
    const contextBlank = await evaluate(`(()=>{
        const context=document.querySelector('#clab-module-toolbar'),r=context.getBoundingClientRect();
        const x=r.left+7,y=r.top+r.height/2;
        if(document.elementFromPoint(x,y)!==context)throw Error('Context toolbar padding is covered');
        return {x,y};
    })()`);
    const start = await floatBlank();
    await drag(contextBlank, {x:contextBlank.x+28,y:contextBlank.y+14});
    const moved = await floatBlank();
    assert.ok(Math.abs(moved.x-start.x-28)<1&&Math.abs(moved.y-start.y-14)<1);
    assert.equal(await checkAutoHeight(true), true);
    const horizontalBlank = await floatBlank();
    await drag(horizontalBlank, {x:horizontalBlank.x,y:bounds.y+26});
    assert.equal(await dock(), 'float');
    assert.equal(await evaluate(`document.querySelector('#clab-module-toolbar').getBoundingClientRect().top>document.querySelector('.clab-tool-dock').getBoundingClientRect().bottom`), true);
    await drag(await floatBlank(), horizontalBlank);
    const blank = await floatBlank();
    await drag(blank, {x:blank.x+26,y:blank.y+24});
    assert.equal(await dock(), 'float');
    assert.ok((await floatBlank()).x>blank.x+20);
    await drag(await floatBlank(), {x:bounds.x+5,y:midY});
    assert.equal(await dock(), 'left');
    const checkSide = () => evaluate(`(()=>{
        const q=s=>document.querySelector(s),box=s=>q(s).getBoundingClientRect();
        const dock=box('.clab-tool-dock'),context=box('#clab-module-toolbar'),run=box('#clab-run-group');
        const railStyle=getComputedStyle(q('.clab-tool-dock'));
        const menuIcon=q('#clab-import-json-btn .clab-tool-icon'),type=q('.clab-toolbar-type');
        const top=['#clab-global-add-card','#clab-global-add-module','#clab-import-json-btn'];
        const bottom=['#clab-btn-run','#clab-preview-mode-switch','#clab-export-json-btn','#clab-config-dropdown-trigger'];
        return q('.clab-tool-dock').getAttribute('aria-orientation')==='vertical'&&
            [...top,...bottom].filter(s=>s!=='#clab-preview-mode-switch').every(s=>{
                const button=box(s),icon=box(s+' .clab-tool-icon'),label=box(s+(s==='#clab-btn-run'?' .clab-tool-label':' .clab-tool-short-label'));
                return label.height>0&&label.top>=icon.bottom&&Math.abs((button.left+button.right-dock.left-dock.right)/2)<1;
            })&&
            top.map(box).every((item,i,all)=>item.bottom<=(all[i+1]?.top??context.top))&&
            bottom.map(box).every((item,i,all)=>item.bottom<=(all[i+1]?.top??dock.bottom))&&
            run.top>=context.bottom&&run.height>run.width&&getComputedStyle(type).flexDirection==='column'&&
            [...type.children].every(button=>getComputedStyle(button).writingMode==='vertical-rl'&&getComputedStyle(button).letterSpacing==='2px')&&
            parseFloat(getComputedStyle(type).gap)>=5&&
            parseFloat(railStyle.paddingTop)>=8&&parseFloat(railStyle.paddingTop)<=24&&railStyle.paddingTop===railStyle.paddingBottom&&parseFloat(railStyle.gap)>=10&&
            top.map(box)[0].top-dock.top>=parseFloat(railStyle.paddingTop)-1&&
            dock.bottom-bottom.map(box).at(-1).bottom>=parseFloat(railStyle.paddingBottom)-1&&
            menuIcon.offsetWidth===30&&menuIcon.querySelector('svg').getBoundingClientRect().width===21&&
            getComputedStyle(q('#clab-import-json-btn .clab-tool-short-label')).fontSize==='10px'&&
            getComputedStyle(menuIcon,'::after').width==='4px';
    })()`);
    assert.equal(await checkSide(), true);
    if (await evaluate("!!document.querySelector('.clab-auto-height').closest('#clab-toolbar-more-menu')")) {
        await click('#clab-toolbar-more');
        assert.equal(await evaluate(`(()=>{const item=document.querySelector('.clab-auto-height');return item.getClientRects().length>0&&item.querySelector('input').checked&&getComputedStyle(item).boxShadow==='none';})()`), true);
        await click('#clab-toolbar-more');
    } else {
        assert.equal(await checkAutoHeight(false), true);
    }
    await checkOpeningScale('left');
    await checkRunHighlight('left');
    await click('#clab-run-count-up');
    assert.equal(await evaluate("document.querySelector('#clab-run-batch-count').value"), '2');
    await click('#clab-run-count-down');
    assert.equal(await evaluate("document.querySelector('#clab-run-batch-count').value"), '1');
    const resize = await center('.clab-tool-resize');
    await drag('.clab-tool-resize', {x:resize.x+102,y:resize.y});
    assert.equal(await evaluate("document.querySelector('.clab-tool-dock').offsetWidth>112"), true);
    assert.equal(await checkSide(), true);
    await click('#clab-import-json-btn');
    assert.equal(await evaluate(`(()=>{const d=document.querySelector('#clab-import-json-dropdown'),t=document.querySelector('.clab-tool-dock');return d.matches(':popover-open')&&d.getBoundingClientRect().left>=t.getBoundingClientRect().right;})()`), true);
    await shot('left');
    await evaluate("window.showWorkspaceModeDemo('xy')");
    await settle();
    assert.equal(await evaluate(`(()=>{const p=document.querySelector('#clab-panel'),s=getComputedStyle(p),t=p.querySelector('.clab-tool-dock'),c=p.querySelector('#clab-cards-container'),xy=c.querySelector('.clab-xy-toolbar'),r=xy.getBoundingClientRect(),b=c.getBoundingClientRect();return t.dataset.dock==='left'&&getComputedStyle(t).display==='none'&&s.paddingLeft==='0px'&&['TopLeft','TopRight','BottomLeft','BottomRight'].every(corner=>s['border'+corner+'Radius']==='0px')&&Math.abs((r.left+r.right-b.left-b.right)/2)<1&&Math.abs(b.bottom-r.bottom-20)<1&&getComputedStyle(xy).borderRadius==='30px';})()`), true);
    await evaluate("window.showWorkspaceModeDemo('cards')");
    await settle();
    assert.equal(await dock(), 'left');
    assert.equal(await evaluate("document.querySelector('#clab-module-toolbar').getClientRects().length"), 0);
    await drag(await dockBlank(), {x:midX,y:midY});
    assert.equal(await dock(), 'float');
    assert.equal(await checkFloat(), true);
    await drag(await floatBlank(), {x:bounds.right-5,y:midY});
    assert.equal(await dock(), 'right');
    await select('module');
    await settle();
    assert.equal(await checkSide(), true);
    await checkOpeningScale('right');
    await checkRunHighlight('right');
    await click('#clab-run-dropdown-toggle');
    assert.equal(await evaluate(`(()=>{const d=document.querySelector('#clab-run-dropdown-menu'),t=document.querySelector('.clab-tool-dock');return d.matches(':popover-open')&&d.getBoundingClientRect().right<=t.getBoundingClientRect().left;})()`), true);
    await drag(await dockBlank(), {x:midX,y:bounds.bottom-4});
    assert.equal(await dock(), 'bottom');
    await evaluate("window.showWorkspaceModeDemo('table')");
    await settle();
    await checkOpeningScale('bottom');
    await checkRunHighlight('bottom');
    assert.equal(await checkMenuMarker(), true);
    assert.equal(await evaluate(`(()=>{const t=document.querySelector('.clab-tool-dock'),c=document.querySelector('#clab-cards-container'),p=t.closest('#clab-panel');return t.dataset.dock==='bottom'&&getComputedStyle(t.closest('#clab-panel')).borderRadius==='0px'&&Math.abs(t.getBoundingClientRect().bottom-p.getBoundingClientRect().bottom)<2&&c.getBoundingClientRect().bottom<=t.getBoundingClientRect().top+.5&&!!document.querySelector('#tb-table-cell-settings .clab-tool-label');})()`), true);
    await evaluate("window.showWorkspaceModeDemo('xy')");
    await settle();
    await click('[data-xy-records]');
    assert.equal(await evaluate(`(()=>{const t=document.querySelector('.clab-xy-toolbar'),p=document.querySelector('.clab-xy-record-panel:popover-open');return p.getBoundingClientRect().bottom<t.getBoundingClientRect().top;})()`), true);
    await click('.clab-xy-popup-close');
    await evaluate("window.showWorkspaceModeDemo('table')");
    await settle();
    await drag(await dockBlank(), {x:midX,y:bounds.y+4});
    assert.equal(await dock(), 'top');
    await drag(await dockBlank(), {x:midX,y:midY});
    assert.equal(await dock(), 'float');
    const padding = await floatBlank();
    for (const clickCount of [1,2]) {
        await mouse('mousePressed', padding, {button:'left', buttons:1, clickCount});
        await mouse('mouseReleased', padding, {button:'left', clickCount});
    }
    await settle();
    assert.equal(await dock(), 'top');
    assert.equal(await evaluate("JSON.parse(localStorage.getItem('clab-toolbar-dock-v1')).side"), 'top');
    console.log('PASS floating toolbars are horizontal capsules, side docks stack icons over labels, and auto-height stays inside its highlight');
    await evaluate("window.showWorkspaceModeDemo('cards');window.dockTestWidth=document.querySelector('#clab-panel').style.width;document.querySelector('#clab-panel').style.width='285px'");
    await settle();
    await click('#clab-toolbar-more');
    await click('#clab-import-json-btn');
    assert.equal(await evaluate(`(()=>{const t=document.querySelector('.clab-tool-dock'),p=document.querySelector('#clab-toolbar-more-menu:popover-open'),d=document.querySelector('#clab-import-json-dropdown');return t.offsetHeight<=34&&p.contains(d)&&d.getBoundingClientRect().height>0;})()`), true);
    await evaluate("document.querySelector('#clab-panel').style.width=window.dockTestWidth");
    await settle();
    console.log('PASS narrow top toolbar stays in one row and controls moved to More keep working');

    const squareAfterSettings = await evaluate(`(async()=>{
        await import('/extensions/clab/clab_settings.js');
        const panel=document.querySelector('#clab-panel'), before=panel.style.cssText;
        const settings=window.testApp.extension.settings;
        const width=settings.find(setting=>setting.id==='CLab.1-General.PanelWidthRatio');
        const height=settings.find(setting=>setting.id==='CLab.1-General.PanelHeightRatio');
        const square=()=>['TopLeft','TopRight','BottomLeft','BottomRight'].every(corner=>getComputedStyle(panel)['border'+corner+'Radius']==='0px');
        window._clabApplyPanelLayout();
        const initial=square();
        width.onChange(65);
        height.onChange(70);
        const resized=panel.style.width==='65vw'&&panel.style.height==='70vh'&&square();
        panel.style.cssText=before;
        return initial&&resized;
    })()`);
    assert.equal(squareAfterSettings, true, 'real panel settings rounded one or more of the four outer corners');
    console.log('PASS real layout settings keep the main panel square on open and resize');

    const activeTab = '.clab-workspace-tab.active';
    const activeId = () => evaluate(`document.querySelector('${activeTab}').dataset.workspaceId`);
    const tab = id => `.clab-workspace-tab[data-workspace-id=${JSON.stringify(id)}]`;
    const menuHidden = () => evaluate("document.querySelector('#clab-workspace-mode-menu').hidden");
    const activeName = () => evaluate(`document.querySelector('${activeTab} .clab-workspace-tab-name').textContent`);
    const activeMode = () => evaluate(`document.querySelector('${activeTab} .clab-workspace-tab-mode').textContent`);
    await settle();
    const original = await activeId();
    await click('#clab-workspace-add');
    const added = await activeId();
    assert.notEqual(added, original);
    const defaultName = await activeName();
    assert.match(defaultName, /^任务卡片·工作区 \d+$/);
    assert.equal(await activeMode(), '任务卡片');
    assert.equal(await evaluate(`(()=>{
        const tab=document.querySelector('.clab-workspace-tab.active'),button=tab.querySelector('[data-mode-toggle]');
        const mark=getComputedStyle(button,'::after'),toolbarMark=getComputedStyle(document.querySelector('#clab-import-json-btn .clab-tool-icon'),'::after');
        const shadow=getComputedStyle(tab).boxShadow;
        return getComputedStyle(button).backgroundColor==='rgb(19, 19, 19)'&&mark.clipPath===toolbarMark.clipPath&&mark.width==='4px'&&
            mark.right==='2px'&&mark.bottom==='2px'&&shadow.includes('0px 2px 0px')&&shadow.includes('inset')&&
            button.getBoundingClientRect().top>=tab.getBoundingClientRect().top+2;
    })()`), true);
    await click(activeTab+' [data-mode-toggle]');
    await click('#clab-workspace-mode-menu [data-workspace-mode=table]');
    assert.equal(await evaluate("document.querySelector('#clab-panel').dataset.workspaceMode"), 'table');
    assert.equal(await activeName(), defaultName.replace('任务卡片', '参数表'));
    assert.equal(await activeMode(), '参数表');
    await click(tab(original)+' .clab-workspace-tab-select');
    const inactiveTrigger = tab(added)+' [data-mode-toggle]';
    const visibility = selector => evaluate(`getComputedStyle(document.querySelector(${JSON.stringify(selector)})).visibility`);
    await mouse('mouseMoved', {x:0,y:0});
    assert.equal(await visibility(activeTab+' [data-mode-toggle]'), 'visible');
    assert.equal(await visibility(inactiveTrigger), 'hidden');
    await mouse('mouseMoved', await center(tab(added)+' .clab-workspace-tab-select'));
    assert.equal(await visibility(inactiveTrigger), 'visible');
    assert.equal(await evaluate(`(()=>{
        const tab=document.querySelector(${JSON.stringify(tab(added))}),name=tab.querySelector('.clab-workspace-tab-name'),mode=tab.querySelector('.clab-workspace-tab-mode');
        const a=tab.getBoundingClientRect(),b=name.getBoundingClientRect(),arrow=mode.parentElement.getBoundingClientRect();
        return Math.abs((a.left+a.right-b.left-b.right)/2)<1&&arrow.left>=b.right-.5&&getComputedStyle(mode).display==='none';
    })()`), true);
    await click(inactiveTrigger);
    assert.equal(await activeId(), original, 'opening an inactive tab menu keeps the current workspace');
    assert.equal(await menuHidden(), false);
    assert.equal(await evaluate("document.activeElement.dataset.workspaceMode"), 'table');
    await shot('workspace-mode-menu');
    for (const type of ['keyDown','keyUp']) {
        await send('Input.dispatchKeyEvent', {type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27}, sessionId);
    }
    assert.equal(await menuHidden(), true);
    assert.equal(await evaluate(`document.activeElement.matches(${JSON.stringify(inactiveTrigger)})`), true);
    await click(inactiveTrigger);
    await click('#clab-workspace-mode-menu [data-workspace-mode=xy]');
    assert.equal(await activeId(), added);
    assert.equal(await evaluate("document.querySelector('#clab-panel').dataset.workspaceMode"), 'xy');
    assert.equal(await menuHidden(), true);
    assert.equal(await activeName(), defaultName.replace('任务卡片', 'XY 矩阵'));
    assert.equal(await activeMode(), 'XY 矩阵');
    const namePoint = await center(activeTab+' .clab-workspace-tab-name');
    await mouse('mouseMoved', namePoint);
    for (const clickCount of [1,2]) {
        await mouse('mousePressed', namePoint, {button:'left',buttons:1,clickCount});
        await mouse('mouseReleased', namePoint, {button:'left',clickCount});
    }
    assert.equal(await evaluate("document.activeElement.matches('.clab-workspace-tab-name[contenteditable=true]')"), true);
    await send('Input.insertText', {text:'工作区 9'}, sessionId);
    for (const type of ['keyDown','keyUp']) {
        await send('Input.dispatchKeyEvent', {type,key:'Enter',code:'Enter',windowsVirtualKeyCode:13}, sessionId);
    }
    await click(activeTab+' [data-mode-toggle]');
    await click('#clab-workspace-mode-menu [data-workspace-mode=table]');
    assert.equal(await activeName(), '工作区 9');
    assert.equal(await activeMode(), '参数表');
    assert.equal(await evaluate(`(async()=>{
        const {buildPersistedState,normalizeWorkspace}=await import('/extensions/clab/components/ui_state.js');
        const saved=buildPersistedState().workspaces.find(workspace=>workspace.id===${JSON.stringify(added)});
        return normalizeWorkspace(saved).autoName;
    })()`), false);
    await click('#clab-btn-preview');
    assert.equal(await evaluate("!!document.querySelector('.clab-preview-modal.visible')"), true);
    await click('.clab-preview-modal-close');
    assert.equal(await evaluate("document.activeElement.id"), 'clab-btn-preview');
    await click(tab(original)+' .clab-workspace-tab-select');
    assert.equal(await activeId(), original);
    assert.equal(await evaluate("document.querySelector('#clab-panel').dataset.workspaceMode"), 'cards');
    console.log('PASS workspace mode arrows follow tab hover and selection and apply the mode to the targeted workspace');
    const expected = await evaluate(`(async()=>{
        const {state}=await import('/extensions/clab/components/ui_state.js');
        const {workspacePreviewSources,sourceRecordCount}=await import('/extensions/clab/components/contextmenu/content/preview_browse.js');
        return workspacePreviewSources(state.cards).filter(({area})=>sourceRecordCount(area)).map(({area})=>area.id);
    })()`);
    assert.ok(expected.length>0);
    assert.equal(await evaluate(`(()=>{
        const group=document.querySelector('#clab-preview-mode-switch'),r=group.getBoundingClientRect();
        return r.width>0&&group.previousElementSibling.id==='clab-run-group'&&group.nextElementSibling.id==='clab-export-json-wrapper';
    })()`), true);
    const previewIds = () => evaluate(`(async()=>{
        const {previewModalStore}=await import('/extensions/clab/components/contextmenu/content/state.js');
        return [...new Set(previewModalStore.entries.map(entry=>entry.areaId))];
    })()`);
    await click('#clab-btn-preview');
    assert.deepEqual(await previewIds(), expected);
    await click('.clab-preview-modal-close');
    assert.equal(await evaluate("document.activeElement.id"), 'clab-btn-preview');
    await evaluate(`(async()=>{
        const {state}=await import('/extensions/clab/components/ui_state.js');
        const {updateSelectionUI}=await import('/extensions/clab/components/ui_selection.js');
        state.selectedAreaIds=[${JSON.stringify(expected[0])}];
        updateSelectionUI();
    })()`);
    await click('#clab-btn-preview');
    assert.deepEqual(await previewIds(), expected.slice(0,1));
    await click('.clab-preview-modal-close');
    console.log('PASS segmented preview switch opens from cards and table, scopes output selection and returns focus to the toolbar');

    await evaluate(`(()=>{
        const values={defaultMode:'table',cardGap:28,moduleGap:14,cardPadding:16,cardWidth:400,columnWidth:310,rowHeight:120,cellPadding:6,xyOrigin:'top',xyGap:9,xyMargin:15};
        for(const setting of window.testApp.extension.settings){
            const key=setting.id.split('.').at(-1);
            if(Object.hasOwn(values,key))setting.onChange(values[key]);
        }
    })()`);
    assert.deepEqual(await evaluate(`['.clab-cards-wrapper','.clab-area-list','.clab-card-body'].map((selector,index)=>
        getComputedStyle(document.querySelector(selector))[index===2?'paddingLeft':'columnGap'])`), ['28px','14px','16px']);
    await click('#clab-card-width-reset');
    assert.equal(await evaluate("document.querySelector('#clab-card-width-slider').value"), '400');
    await click('#clab-workspace-add');
    const defaults = () => evaluate(`(async()=>{
        const {getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js');
        const {mode,table,xy}=getActiveWorkspace().view;
        return {mode,columnWidth:table.columnWidth,rowHeight:table.rowHeight,padding:Object.values(table.padding),origin:xy.origin,gap:xy.x.gap,margin:xy.y.margin};
    })()`);
    assert.deepEqual(await defaults(), {mode:'table',columnWidth:310,rowHeight:120,padding:[6,6,6,6],origin:'top',gap:9,margin:15});
    assert.equal(await evaluate("document.querySelector('.clab-table-column').offsetWidth"), 310);
    await evaluate(`(()=>{
        for(const setting of window.testApp.extension.settings){
            if(setting.id==='CLab.1-General.defaultMode'||/^[789]-/.test(setting.category[1]))setting.onChange(setting.defaultValue);
        }
    })()`);
    assert.deepEqual(await defaults(), {mode:'table',columnWidth:310,rowHeight:120,padding:[6,6,6,6],origin:'top',gap:9,margin:15});
    console.log('PASS card layout settings apply live and new workspaces retain their own layout defaults');

    await evaluate(`(async()=>{
        window.showWorkspaceModeDemo('xy');
        const {getActiveWorkspace,state}=await import('/extensions/clab/components/ui_state.js');
        const {taskCoordinates}=await import('/extensions/clab/components/workspace_modes/task_model.js');
        window.savedXYExecutor=window.CLab.executeTasks;
        window.CLab.executeTasks=tasks=>{
            window.lastXYRun=tasks.map(({cardId})=>{
                const {x,y}=taskCoordinates(state.cards.find(card=>card.id===cardId),getActiveWorkspace().view.xy);
                return [x,y];
            });
        };
    })()`);
    await settle();
    assert.equal(await evaluate(`(()=>{
        const menu=document.querySelector('[data-xy-reassign]'),reset=document.querySelector('[data-xy-reset]');
        return getComputedStyle(menu).borderRadius==='6px'&&getComputedStyle(menu,'::after').width==='4px'&&getComputedStyle(reset,'::after').content==='none';
    })()`), true);
    await click('[data-xy-run]');
    assert.deepEqual(await evaluate('window.lastXYRun'), [[0,0],[1,0],[0,1],[1,1]]);
    await click('[data-xy-run-axis=y]');
    assert.equal(await evaluate("document.querySelector('[data-xy-run-axis=y]').getAttribute('aria-pressed')"), 'true');
    await click('[data-xy-run]');
    assert.deepEqual(await evaluate('window.lastXYRun'), [[0,0],[0,1],[1,0],[1,1]]);
    assert.equal(await evaluate(`(async()=>{
        const {buildPersistedState}=await import('/extensions/clab/components/ui_state.js');
        const saved=buildPersistedState();
        return saved.workspaces.find(workspace=>workspace.id===saved.activeWorkspaceId).view.xy.runAxis;
    })()`), 'y');
    await evaluate('window.CLab.executeTasks=window.savedXYExecutor');
    console.log('PASS XY toolbar menu indicators and run-direction switch match actual queue order');
    return 8;
}
