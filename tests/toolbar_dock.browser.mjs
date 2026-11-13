import assert from 'node:assert/strict';
import fs from 'node:fs';
import { runPreviewXYSourcesChecks } from './preview_xy_sources.browser.mjs';

export async function runToolbarDockChecks(send, sessionId) {
    const evaluate = async expression => {
        const {result, exceptionDetails} = await send('Runtime.evaluate', {expression, awaitPromise:true, returnByValue:true}, sessionId);
        assert.equal(exceptionDetails, undefined, JSON.stringify(exceptionDetails));
        return result.value;
    };
    const mouse = (type, point, extra = {}) => send('Input.dispatchMouseEvent', {type, ...point, ...extra}, sessionId);
    const center = selector => evaluate(`(()=>{const e=document.querySelector(${JSON.stringify(selector)}),r=e.getBoundingClientRect();if(!r.width||!r.height)throw Error('Toolbar target is hidden: '+${JSON.stringify(selector)});return {x:(r.left+r.right)/2,y:(r.top+r.bottom)/2};})()`);
    const settle = () => evaluate('new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))');
    const checkExportLayout = async workbook => {
        const layout=await evaluate(`(()=>{
            const grid=document.querySelector('.clab-review-layout-export'),field=document.querySelector('.clab-review-png-scale'),input=field.querySelector('input');
            const bounds=grid.getBoundingClientRect(),buttons=[...grid.querySelectorAll('button')].map(button=>{const r=button.getBoundingClientRect();return {kind:button.dataset.reviewExport,top:r.top,bottom:r.bottom,width:r.width};});
            const side=grid.closest('.clab-preview-modal-right'),downloads=side.querySelector('[data-review-downloads]'),data=side.querySelector('[data-review-data-export]');
            return {buttons,width:bounds.width,inputGap:input.getBoundingClientRect().left-field.getBoundingClientRect().left,
                shared:downloads.parentElement===side&&data.parentElement===side&&[downloads,...data.querySelectorAll('section')].every(section=>getComputedStyle(section).paddingTop==='12px')};
        })()`);
        assert.deepEqual(layout.buttons.map(button=>button.kind),workbook?['copy','png','xlsx','html']:['copy','png','html']);
        assert.equal(layout.buttons[0].top,layout.buttons[1].top);
        for(let i=2;i<layout.buttons.length;i++) {
            assert.ok(layout.buttons[i].top>=layout.buttons[i-1].bottom);
            assert.ok(Math.abs(layout.buttons[i].width-layout.width)<1);
        }
        assert.ok(layout.inputGap>50&&layout.inputGap<125,'PNG scale input is not beside its label');
        assert.equal(layout.shared,true,'shared export sections have different hosts or compressed top spacing');
    };
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
        const d=document.querySelector('.clab-tool-dock'),r=d.getBoundingClientRect();
        for(let offset=4;offset<r.width-4;offset+=4){
            const x=r.left+offset,y=r.top+r.height/2;
            if(document.elementFromPoint(x,y)?.matches('.clab-tool-dock,.clab-toolbar-left,.clab-toolbar-right,.clab-xy-toolbar,.clab-xy-toolbar-start,.clab-xy-toolbar-center'))return {x,y};
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
    assert.equal(await evaluate(`(()=>{const panel=document.querySelector('#clab-panel'),dock=panel.querySelector('.clab-tool-dock'),button=panel.querySelector('#clab-global-add-card'),style=getComputedStyle(dock);return dock.dataset.dock==='top'&&dock.offsetHeight>=38&&dock.offsetHeight<=41&&getComputedStyle(panel).borderRadius==='0px'&&getComputedStyle(button).borderRadius==='6px'&&style.paddingLeft==='16px'&&style.paddingLeft===style.paddingRight&&!!button.querySelector('svg')&&getComputedStyle(button.querySelector('.clab-tool-label')).display!=='none';})()`), true);
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
        return p.backgroundColor==='rgba(0, 0, 0, 0.4)'&&parseFloat(p.borderRadius)>Math.min(r.width,r.height)/2&&parseFloat(p.gap)>=12&&
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
    assert.equal(await dock(), 'float', 'left edge never docks');
    await drag(await floatBlank(), {x:bounds.right-5,y:midY});
    assert.equal(await dock(), 'float', 'right edge never docks');
    assert.equal(await evaluate("document.querySelector('.clab-tool-dock').getAttribute('aria-orientation')"), 'horizontal');
    await drag(await floatBlank(), {x:midX-160,y:midY});
    const dockCenter=()=>center('.clab-tool-dock');
    const originalCenter=await dockCenter();
    for(const mode of ['table','xy','cards']){
        await evaluate("window.showWorkspaceModeDemo("+JSON.stringify(mode)+")");
        await settle();
        assert.equal(await dock(),'float');
        const current=await dockCenter();
        assert.ok(Math.abs(current.x-originalCenter.x)<2&&Math.abs(current.y-originalCenter.y)<2);
        if(mode==='xy'){
            assert.equal(await evaluate("getComputedStyle(document.querySelector('.clab-tool-dock')).borderRadius"),'30px');
            assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-xy-records]>.clab-tool-label')).display"),'none');
            assert.equal(await evaluate("getComputedStyle(document.querySelector('[data-xy-origin-options]>.clab-tool-label')).display"),'block');
            await shot('xy-float');
        }
    }
    await click('#clab-run-count-up');
    assert.equal(await evaluate("document.querySelector('#clab-run-batch-count').value"), '2');
    await click('#clab-run-count-down');
    assert.equal(await evaluate("document.querySelector('#clab-run-batch-count').value"), '1');
    await drag(await floatBlank(), {x:midX,y:bounds.bottom-4});
    assert.equal(await dock(), 'bottom');
    await evaluate("window.showWorkspaceModeDemo('table')");
    await settle();
    await checkOpeningScale('bottom');
    await checkRunHighlight('bottom');
    assert.equal(await checkMenuMarker(), true);
    assert.equal(await evaluate(`(()=>{const t=document.querySelector('.clab-tool-dock'),c=document.querySelector('#clab-cards-container'),p=t.closest('#clab-panel');return t.dataset.dock==='bottom'&&getComputedStyle(t.closest('#clab-panel')).borderRadius==='0px'&&Math.abs(t.getBoundingClientRect().bottom-p.getBoundingClientRect().bottom)<2&&c.getBoundingClientRect().bottom<=t.getBoundingClientRect().top+.5&&!!document.querySelector('#tb-table-cell-settings .clab-tool-label');})()`), true);
    await evaluate("window.showWorkspaceModeDemo('xy')");
    await settle();
    assert.equal(await evaluate("document.querySelector('.clab-tool-dock').offsetHeight"),39);
    await shot('xy-bottom');
    await click('[data-xy-records]');
    assert.equal(await evaluate(`(()=>{const t=document.querySelector('.clab-tool-dock'),p=document.querySelector('.clab-xy-record-panel:popover-open');return p.getBoundingClientRect().bottom<t.getBoundingClientRect().top;})()`), true);
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
    console.log('PASS toolbar floats at a shared center, ignores left and right edges, and docks at top and bottom');
    await evaluate("window.showWorkspaceModeDemo('cards');window.dockTestWidth=document.querySelector('#clab-panel').style.width;document.querySelector('#clab-panel').style.width='285px'");
    await settle();
    await click('#clab-toolbar-more');
    await click('#clab-import-json-btn');
    assert.equal(await evaluate(`(()=>{const t=document.querySelector('.clab-tool-dock'),p=document.querySelector('#clab-toolbar-more-menu:popover-open'),d=document.querySelector('#clab-import-json-dropdown');return t.offsetHeight>=38&&t.offsetHeight<=41&&p.contains(d)&&d.getBoundingClientRect().height>0;})()`), true);
    await evaluate("window.showWorkspaceModeDemo('xy');document.querySelector('#clab-panel').style.width='530px'");
    await settle();
    assert.deepEqual(await evaluate(`(()=>{const t=document.querySelector('.clab-tool-dock'),icon=t.querySelector('[data-xy-records]'),preview=t.querySelector('#clab-btn-preview');return {height:t.offsetHeight,label:getComputedStyle(icon.querySelector('.clab-tool-label')).display,within:preview.getBoundingClientRect().right<t.getBoundingClientRect().right};})()`),{height:39,label:'none',within:true});
    await click('[data-xy-records]');
    await click('.clab-xy-popup-close');
    await evaluate("window.showWorkspaceModeDemo('cards');document.querySelector('#clab-panel').style.width=window.dockTestWidth");
    await settle();
    console.log('PASS narrow docked toolbars use one row with compact controls and working menus');

    const squareAfterSettings = await evaluate(`(async()=>{
        await import('/extensions/clab/clab_settings.js');
        const panel=document.querySelector('#clab-panel'), before=panel.style.cssText;
        const settings=window.testApp.extension.settings;
        if(settings.some(setting=>['CLab.2-PerformanceMedia.Autoplay','CLab.2-PerformanceMedia.ThumbMode'].includes(setting.id)))throw Error('removed automatic playback settings are still registered');
        const width=settings.find(setting=>setting.id==='CLab.1-General.PanelWidthRatio');
        const height=settings.find(setting=>setting.id==='CLab.1-General.PanelHeightRatio');
        const square=()=>['TopLeft','TopRight','BottomLeft','BottomRight'].every(corner=>getComputedStyle(panel)['border'+corner+'Radius']==='0px');
        window._clabApplyPanelLayout();
        const initial=square();
        width.onChange(65);
        height.onChange(70);
        const resized=panel.style.width==='65vw'&&panel.style.height==='70vh'&&square();
        width.onChange(92);height.onChange(92);
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
    const currentPanel = await evaluate(`(()=>{
        const box=document.querySelector('#clab-panel').getBoundingClientRect();
        return {x:(box.left+box.right)/2,top:box.top,bottom:box.bottom,y:(box.top+box.bottom)/2};
    })()`);
    await drag(await dockBlank(),{x:currentPanel.x,y:currentPanel.y});
    const fromTable=await dockCenter();
    await click(tab(original)+' .clab-workspace-tab-select');
    assert.equal(await dock(),'float');
    const fromCards=await dockCenter();
    assert.ok(Math.abs(fromTable.x-fromCards.x)<2&&Math.abs(fromTable.y-fromCards.y)<2);
    await drag(await dockBlank(),{x:currentPanel.x,y:currentPanel.bottom-4});
    assert.equal(await dock(),'bottom');
    const placeTabs = async position => {
        const point=await evaluate(`(()=>{const strip=document.querySelector('#clab-panel .clab-workspace-strip'),rect=strip.getBoundingClientRect();return {x:rect.right-10,y:(rect.top+rect.bottom)/2};})()`);
        await mouse('mousePressed',point,{button:'right',buttons:2,clickCount:1});
        await mouse('mouseReleased',point,{button:'right',clickCount:1});
        await click(`[data-workspace-bar-position=${position}]`);
        assert.equal(await evaluate("localStorage.getItem('clab-workspace-tabs-position')"),position);
    };
    await placeTabs('bottom');
    await settle();
    assert.equal(await evaluate(`(()=>{
        const tabs=document.querySelector('.clab-workspace-strip').getBoundingClientRect(),canvas=document.querySelector('#clab-cards-container').getBoundingClientRect(),bar=document.querySelector('.clab-tool-dock').getBoundingClientRect();
        return canvas.bottom<=tabs.top+.5&&tabs.bottom<=bar.top+.5;
    })()`),true);
    await click(activeTab+' [data-mode-toggle]');
    assert.equal(await evaluate("document.querySelector('#clab-workspace-mode-menu').getBoundingClientRect().bottom<document.querySelector('.clab-workspace-strip').getBoundingClientRect().top"),true);
    for (const type of ['keyDown','keyUp']) {
        await send('Input.dispatchKeyEvent', {type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27}, sessionId);
    }
    await placeTabs('top');
    await drag(await dockBlank(),{x:currentPanel.x,y:currentPanel.top+4});
    assert.equal(await dock(),'top');
    console.log('PASS separate workspaces share docking and the tab bar setting keeps both bars and the workspace menu in bounds');
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
    assert.equal(await evaluate("document.querySelector('.clab-preview-modal.visible').dataset.reviewMode"), 'table');
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
        return r.width>0&&group.parentElement.lastElementChild===group&&group.parentElement.matches('.clab-toolbar-right')&&
            !document.querySelector('#clab-panel #clab-export-json-wrapper');
    })()`), true);
    const previewIds = () => evaluate(`(async()=>{
        const {previewModalStore}=await import('/extensions/clab/components/contextmenu/content/state.js');
        return [...new Set(previewModalStore.entries.map(entry=>entry.areaId))];
    })()`);
    await click('#clab-btn-preview');
    assert.deepEqual(await previewIds(), expected);
    assert.deepEqual(await evaluate(`[...document.querySelectorAll('[data-review-mode] button[data-review-mode]')].map(button=>button.dataset.reviewMode)`),
        ['browse','compare','detail','table','xy']);
    assert.equal(await evaluate(`(()=>{
        const header=document.querySelector('.clab-preview-modal-head'),panel=header.parentElement,workspace=document.querySelector('#clab-panel');
        const head=header.getBoundingClientRect(),tabs=header.nextElementSibling.getBoundingClientRect(),dock=workspace.querySelector('.clab-tool-dock');
        const modes=header.querySelector('.clab-review-modes'),current=header.querySelector('.clab-toolbar-type'),original=workspace.querySelector('#clab-preview-mode-switch');
        return header.firstElementChild.matches('.clab-review-notice')&&header.nextElementSibling.matches('.clab-review-workspaces')&&Math.abs(head.bottom-tabs.top)<1&&
            header.offsetHeight===dock.offsetHeight&&getComputedStyle(panel).borderRadius==='0px'&&
            getComputedStyle(header).paddingLeft===getComputedStyle(dock).paddingLeft&&getComputedStyle(header).paddingRight===getComputedStyle(dock).paddingRight&&
            Math.abs(current.getBoundingClientRect().right-original.getBoundingClientRect().right)<1&&
            getComputedStyle(modes).backgroundColor==='rgba(0, 0, 0, 0)'&&getComputedStyle(modes).borderTopWidth==='0px'&&
            getComputedStyle(current).borderTopStyle===getComputedStyle(original).borderTopStyle&&current.offsetHeight===original.offsetHeight&&
            Math.abs(panel.getBoundingClientRect().width-workspace.getBoundingClientRect().width)<1&&Math.abs(panel.getBoundingClientRect().height-workspace.getBoundingClientRect().height)<1;
    })()`),true);
    await shot('preview-tabs');
    assert.equal(await evaluate("!document.querySelector('#clab-export-json-wrapper')&&!!document.querySelector('.clab-preview-modal-right [data-review-data-action=organize]')"),true);
    const switchReviewWorkspace = id=>click(`[data-review-workspaces] [data-workspace-id="${id}"] .clab-workspace-tab-select`);
    const reviewWorkspaces=await evaluate("[...document.querySelectorAll('#clab-workspace-bar [data-workspace-id]')].map(tab=>tab.dataset.workspaceId)");
    assert.ok(reviewWorkspaces.includes(original)&&reviewWorkspaces.includes(added));
    assert.deepEqual(await evaluate("[...document.querySelectorAll('[data-review-workspaces] [data-workspace-id]')].map(tab=>tab.dataset.workspaceId)"),reviewWorkspaces);
    await switchReviewWorkspace(added);
    assert.equal(await activeId(),added);
    assert.equal(await evaluate("document.querySelector('.clab-preview-modal.visible').dataset.reviewMode"),'browse');
    await switchReviewWorkspace(original);
    assert.equal(await activeId(),original);
    assert.deepEqual(await previewIds(),expected);
    assert.equal(await evaluate("document.querySelectorAll('.clab-preview-modal-right [data-review-json-kind]').length"),3);
    for (const type of ['keyDown','keyUp']) {
        await send('Input.dispatchKeyEvent', {type,key:'Escape',code:'Escape',windowsVirtualKeyCode:27}, sessionId);
    }
    assert.equal(await evaluate("document.querySelector('.clab-preview-modal').classList.contains('visible')"),false);
    assert.equal(await evaluate("document.activeElement.id"), 'clab-btn-preview');
    await evaluate(`(async()=>{
        const {state}=await import('/extensions/clab/components/ui_state.js');
        const {updateSelectionUI}=await import('/extensions/clab/components/ui_selection.js');
        state.selectedAreaIds=[${JSON.stringify(expected[0])}];
        updateSelectionUI();
    })()`);
    await settle();
    await click('#clab-btn-preview');
    assert.equal(await evaluate("document.querySelector('.clab-preview-modal').classList.contains('visible')"),true);
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
        const bar=document.querySelector('.clab-tool-dock'),tabs=document.querySelector('.clab-workspace-strip');
        return bar.dataset.dock==='top'&&bar.offsetHeight===39&&bar.getBoundingClientRect().bottom<=tabs.getBoundingClientRect().top+.5;
    })()`),true);
    await shot('xy-top');
    await evaluate(`(async()=>{
        const {state}=await import('/extensions/clab/components/ui_state.js');
        const {updateSelectionUI}=await import('/extensions/clab/components/ui_selection.js');
        state.selectedAreaIds=[state.cards.find(card=>card.xyOutputId).xyOutputId];updateSelectionUI();
    })()`);
    await settle();
    assert.equal(await evaluate(`(()=>{
        const toolbar=document.querySelector('.clab-tool-dock'),choices=toolbar.querySelectorAll('.clab-xy-choice');
        return !toolbar.querySelector('#tb-clone-btn,#tb-format-painter,[data-type=edit],[data-type=preview]')&&
            [...choices].every(button=>getComputedStyle(button).backgroundColor==='rgba(0, 0, 0, 0)');
    })()`),true);
    await evaluate(`(async()=>{const {state}=await import('/extensions/clab/components/ui_state.js');state.selectedAreaIds=[];})()`);
    await click('[data-xy-reassign]');
    assert.equal(await evaluate("document.querySelector('.clab-xy-axis-panel:popover-open').getBoundingClientRect().top>document.querySelector('.clab-tool-dock').getBoundingClientRect().bottom"),true);
    await click('.clab-xy-popup-close');
    assert.equal(await evaluate(`(()=>{
        const menu=document.querySelector('[data-xy-reassign]'),reset=document.querySelector('[data-xy-reset]');
        return getComputedStyle(menu).borderRadius==='6px'&&getComputedStyle(menu.querySelector('.clab-tool-icon'),'::after').width==='4px'&&getComputedStyle(reset.querySelector('.clab-tool-icon'),'::after').content==='none'&&getComputedStyle(document.querySelector('[data-xy-origin-options]'),'::after').width==='4px';
    })()`), true);
    await click('#clab-btn-run');
    assert.deepEqual(await evaluate('window.lastXYRun'), [[0,0],[1,0],[0,1],[1,1]]);
    await click('[data-xy-run-axis-options]');await click('.clab-xy-options [data-xy-option=y]');
    assert.equal(await evaluate("document.querySelector('[data-xy-run-axis-options]').textContent"), 'Y 轴优先');
    await click('#clab-btn-run');
    assert.deepEqual(await evaluate('window.lastXYRun'), [[0,0],[0,1],[1,0],[1,1]]);
    assert.equal(await evaluate(`(async()=>{
        const {buildPersistedState}=await import('/extensions/clab/components/ui_state.js');
        const saved=buildPersistedState();
        return saved.workspaces.find(workspace=>workspace.id===saved.activeWorkspaceId).view.xy.runAxis;
    })()`), 'y');
    await evaluate('window.CLab.executeTasks=window.savedXYExecutor');
    console.log('PASS XY toolbar menu indicators and run-direction switch match actual queue order');

    assert.equal(await evaluate("!!document.querySelector('.clab-toolbar-right > :last-child #clab-btn-preview')"), true);
    const effectivePreviewRows=await evaluate(`(async()=>{
        const {state,getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js');
        const {matrixCells}=await import('/extensions/clab/components/workspace_modes/xy_model.js');
        const {matchingTasks}=await import('/extensions/clab/components/workspace_modes/task_model.js');
        const {effectiveTableRow}=await import('/extensions/clab/components/workspace_modes/table_sheet.js');
        const view=getActiveWorkspace().view,xy=view.xy;
        const tasks=matrixCells(state.cards,xy).map(cell=>cell.card);
        view.templateId=tasks[0].id;
        Object.assign(view.table,{sheets:[],sheetId:'',empty:false});
        xy.z={...xy.z,enabled:true,bindings:['99||fixture_layer'],values:['First','Second'],current:0,display:'single'};
        xy.records=[{id:'fixture-record',key:'99||fixture_record'}];
        tasks.forEach((card,index)=>{
            card.areas.push({id:'fixture-z-'+index,type:'edit',title:'Layer',targetNodeId:'99',targetWidget:'fixture_layer',value:index<2?'First':'Second'});
            const output=card.areas.find(area=>area.id===card.xyOutputId)||card.areas.find(area=>area.type==='preview');
            if(!output.history?.length){output.history=['/view?filename=first.png'];output.historyIndex=0;output.resultUrl=output.history[0];}
            if(output.history.length===1)output.history.push('/view?filename=alternate-preview.png');
            output.historyIndex=output.history.length-1;output.resultUrl=output.history.at(-1);
            output.historyRuns??=[];
            const at=output.historyIndex??0;
            output.historyRuns[at]={...output.historyRuns[at],recordParameters:[{key:'99||fixture_record',label:'采样备注',value:'已记录'}]};
        });
        window.beforeReviewXY=JSON.stringify(xy,(key,value)=>['zoom','panX','panY','cameraReady','previewRecords','previewRecordsExpanded','tiling','display'].includes(key)?undefined:value);
        return matchingTasks(state.cards,tasks[0]).filter(effectiveTableRow).map(task=>task.id);
    })()`);
    await click('#clab-btn-preview');
    assert.equal(await evaluate("document.querySelector('.clab-preview-modal.visible').dataset.reviewMode"), 'xy');
    assert.equal(await evaluate("document.querySelector('[data-sheet-option=matrixSource]').value"), 'workspace');
    assert.equal(await evaluate(`(()=>{
        const head=document.querySelector('.clab-preview-modal-head').getBoundingClientRect(),tabs=document.querySelector('.clab-review-modes').getBoundingClientRect();
        return Math.abs(head.left+head.right-tabs.left-tabs.right)<2;
    })()`),true);
    const layerCount=()=>evaluate("document.querySelectorAll('.clab-review-grid .clab-xy-layer-axes').length");
    assert.equal(await layerCount(),1);
    await click('[data-review-xy-fit]');
    const checkPreviewHistory = selector => evaluate(`(()=>{
        const root=document.querySelector('.clab-preview-modal.visible'),selected=root.querySelector('[data-review-download=selected]');
        const cell=root.querySelector('${selector}'),url=()=>cell.querySelector('.clab-output-footer').dataset.url;
        const counter=()=>cell.querySelector('.clab-output-history-position');
        const before=url(),wasDisabled=selected.disabled,beforeCount=counter().textContent;
        if(root.dataset.reviewMode==='table'&&getComputedStyle(counter().closest('.clab-output-footer')).display==='none')throw Error('table history counter is hidden');
        if(root.dataset.reviewMode==='table') {
            const previous=cell.style.getPropertyValue('--clab-table-padding');
            try {
                for(const padding of ['0px','23px 31px 7px 11px']) {
                    cell.style.setProperty('--clab-table-padding',padding);
                    const media=cell.querySelector('.clab-preview-bg').getBoundingClientRect(),label=counter().getBoundingClientRect();
                    if(Math.abs(label.top-media.top-6)>1||Math.abs(media.right-label.right-6)>1)throw Error('history label does not follow the padded media corner');
                }
            } finally {cell.style.setProperty('--clab-table-padding',previous);}
        }
        cell.dispatchEvent(new MouseEvent('click',{bubbles:true}));
        cell.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowUp'}));
        const stepped=url(),isEnabled=!selected.disabled;
        if(before!==stepped&&counter().textContent===beforeCount)throw Error('history counter did not follow the displayed record');
        cell.dispatchEvent(new KeyboardEvent('keydown',{bubbles:true,cancelable:true,key:'ArrowDown'}));
        return wasDisabled&&isEnabled&&before!==stepped&&url()===before;
    })()`);
    assert.equal(await checkPreviewHistory('.clab-review-grid[data-workspace-mode=xy] .clab-output-area'),true);

    await shot('matrix-preview');
    await runPreviewXYSourcesChecks(evaluate,click,shot);
    const stage='.clab-review-grid[data-workspace-mode=xy] .clab-review-grid-stage';
    const transform=()=>evaluate(`document.querySelector('${stage} .clab-cards-wrapper').style.transform`);
    const beforeTransform=await transform(),point=await center(stage);
    await mouse('mouseWheel',point,{deltaX:0,deltaY:-100});
    assert.notEqual(await transform(),beforeTransform);
    const beforePan=await transform();
    await drag({x:point.x-10,y:point.y-10},{x:point.x+24,y:point.y+24});
    assert.notEqual(await transform(),beforePan);
    await click('[data-review-xy-show=axes][value=x]');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('${stage} .axis-x')).visibility`),'hidden');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('${stage} .axis-y')).visibility`),'visible');
    await click('[data-review-xy-show=bindings][value=x]');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('${stage} [data-xy-part=x-binding]')).visibility`),'hidden');
    assert.equal(await evaluate(`getComputedStyle(document.querySelector('${stage} [data-xy-part=y-binding]')).visibility`),'visible');
    const change=(selector,value)=>evaluate(`(()=>{
        const input=document.querySelector(${JSON.stringify(selector)});
        input.value=${JSON.stringify(value)};
        input.dispatchEvent(new Event('change',{bubbles:true}));
    })()`);
    await click('[data-review-xy-orientation][value=top]');
    assert.equal(await evaluate(`document.querySelector('${stage} .axis-y').classList.contains('points-up')`),false);
    await change('[data-review-axis=x] [data-review-xy-spacing=gap]','17');
    await change('[data-review-axis=x] [data-xy-label-angle]','45');
    assert.match(await evaluate(`document.querySelector('${stage} .clab-xy-overlay').style.getPropertyValue('--xy-x-label-transform')`),/45deg/);
    await click('[data-review-xy-swap=xy]');
    await click('[data-review-xy-record]');
    assert.match(await evaluate(`document.querySelector('${stage} .clab-review-xy-records').textContent`),/采样备注.*已记录/);
    await click('[data-review-xy-fit]');await shot('matrix-records-down');
    await click('[data-review-xy-orientation][value=bottom]');await click('[data-review-xy-fit]');await shot('matrix-records-up');
    await click('[data-review-xy-orientation][value=top]');
    assert.equal(await evaluate(`(async()=>{
        const {getActiveWorkspace}=await import('/extensions/clab/components/ui_state.js');
        return JSON.stringify(getActiveWorkspace().view.xy,(key,value)=>['zoom','panX','panY','cameraReady','previewRecords','previewRecordsExpanded','tiling','display'].includes(key)?undefined:value)===window.beforeReviewXY;
    })()`),true);
    const matrixSource = (source) => evaluate(`(()=>{
        const select=document.querySelector('[data-sheet-option=matrixSource]');
        select.value=${JSON.stringify(source)};
        select.dispatchEvent(new Event('change',{bubbles:true}));
    })()`);
    await matrixSource('history');
    assert.equal(await evaluate("!!document.querySelector('[data-table-option=x]') && !document.querySelector('.clab-preview-modal').hasAttribute('data-workspace-sheet')"), true);
    await matrixSource('workspace');
    assert.equal(await layerCount(),1);
    await click('[data-review-mode=table]');
    await checkExportLayout(true);
    const sharedPanelAppearance=await evaluate(`(()=>{
        const panel=document.querySelector('#clab-panel'),preview=document.querySelector('.clab-preview-modal-panel'),settings=window.testApp.extension.settings;
        const width=settings.find(setting=>setting.id==='CLab.1-General.PanelWidthRatio'),height=settings.find(setting=>setting.id==='CLab.1-General.PanelHeightRatio');
        const opacity=settings.find(setting=>setting.id==='CLab.1-General.BgOpacity'),blur=settings.find(setting=>setting.id==='CLab.1-General.BackdropBlur');
        const before=[window._clabPanelWidthPercent,window._clabPanelHeightPercent,window._clabBgOpacity,window._clabBgBlur],media=preview.querySelector('img,video,canvas');
        width.onChange(80);height.onChange(82);opacity.onChange(65);blur.onChange(false);
        const a=panel.getBoundingClientRect(),b=preview.getBoundingClientRect(),pa=getComputedStyle(panel),pb=getComputedStyle(preview);
        const matching=['left','top','width','height'].every(key=>Math.abs(a[key]-b[key])<1)&&pa.backgroundColor===pb.backgroundColor&&pb.backgroundColor==='rgba(30, 30, 30, 0.65)'&&pa.backdropFilter==='none'&&pb.backdropFilter==='none'&&pa.boxShadow===pb.boxShadow&&getComputedStyle(panel).visibility==='hidden';
        blur.onChange(true);const frosted=getComputedStyle(preview).backdropFilter===getComputedStyle(panel).backdropFilter&&getComputedStyle(preview).backdropFilter==='blur(15px)';
        width.onChange(before[0]);height.onChange(before[1]);opacity.onChange(before[2]);blur.onChange(before[3]);
        const head=getComputedStyle(document.querySelector('.clab-preview-modal-head')).backgroundColor,toolbar=getComputedStyle(document.querySelector('.clab-tool-dock')).backgroundColor;
        const tab=getComputedStyle(document.querySelector('.clab-review-workspaces')).backgroundColor;
        return matching&&frosted&&preview.querySelector('img,video,canvas')===media&&head===toolbar&&head==='rgba(0, 0, 0, 0.4)'&&tab==='rgba(0, 0, 0, 0.267)';
    })()`);
    assert.equal(sharedPanelAppearance,true,'workspace/preview settings, glass effect or toolbar/tab colors did not stay synchronized');
    await shot('parameter-preview');
    assert.ok(await evaluate("document.querySelectorAll('[data-grid-filter=column]').length") >= 2);
    assert.ok(effectivePreviewRows.length);
    assert.deepEqual(await evaluate("[...document.querySelectorAll('[data-grid-filter=row]:checked')].map(input=>input.value)"),effectivePreviewRows);
    const sourceChecks=type=>evaluate(`[...document.querySelectorAll('[data-grid-filter="${type}"]')].filter(input=>input.checked).map(input=>input.value)`);
    const sourceTotals=await evaluate(`Object.fromEntries(['row','column'].map(type=>[type,document.querySelectorAll('[data-grid-filter="'+type+'"]').length]))`);
    const initialRows=await sourceChecks('row'),initialColumns=await sourceChecks('column');
    for(const type of ['row','column']) {
        const other=type==='row'?'column':'row',before=await sourceChecks(other);
        await click(`[data-grid-source-select="${type}"][data-grid-source-action="none"]`);
        assert.deepEqual(await sourceChecks(type),[]);
        assert.equal(await evaluate(`document.querySelector('[data-grid-source-count="${type}"]').textContent.startsWith('0/${sourceTotals[type]} ')`),true);
        assert.deepEqual(await sourceChecks(other),before,'clearing one source group changed the other group');
        await click(`[data-grid-source-select="${type}"][data-grid-source-action="all"]`);
        assert.equal((await sourceChecks(type)).length,sourceTotals[type]);
        assert.equal(await evaluate(`document.querySelector('[data-grid-source-count="${type}"]').textContent.startsWith('${sourceTotals[type]}/${sourceTotals[type]} ')`),true);
        assert.deepEqual(await sourceChecks(other),before,'selecting one source group changed the other group');
        await evaluate(`(()=>{const wanted=new Set(${JSON.stringify(type==='row'?initialRows:initialColumns)});for(const id of [...document.querySelectorAll('[data-grid-filter="${type}"]')].filter(input=>!wanted.has(input.value)).map(input=>input.value))document.querySelector('[data-grid-filter="${type}"][value="'+CSS.escape(id)+'"]').click();})()`);
    }
    assert.equal(await evaluate("document.querySelectorAll('.clab-review-grid [data-review-row]').length"),initialRows.length);
    assert.equal(await evaluate("document.querySelectorAll('.clab-review-grid [data-review-column]').length"),initialColumns.length);
    console.log('PASS table source task/field all and none actions update their counts and visible grid independently');
    const previewTable='.clab-review-grid[data-workspace-mode=table]';
    assert.equal(await checkPreviewHistory(previewTable+' .clab-output-area'),true);
    const headCount = () => evaluate(`document.querySelectorAll('${previewTable} [data-review-column-name]').length`);
    const count = await headCount();
    await evaluate("[...document.querySelectorAll('[data-grid-filter=column]:checked')].at(-1).click()");
    assert.equal(await headCount(), count - 1);
    await evaluate(`(()=>{
        const title=document.querySelector('${previewTable} [data-review-column-name]');
        title.dispatchEvent(new MouseEvent('dblclick',{bubbles:true}));
        const input=document.querySelector('${previewTable} [data-table-row-title]');
        input.value='预览修改后的列名';
        input.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',bubbles:true}));
    })()`);
    await click(previewTable+' [data-review-cell]');
    await change('.clab-review-cell-settings [data-table-size=width]','303');
    await change('.clab-review-cell-settings [data-table-padding]','4,5,6,7');
    assert.deepEqual(await evaluate(`(()=>{
        const cell=document.querySelector('${previewTable} [data-review-cell].active');
        return [cell.offsetWidth,cell.style.getPropertyValue('--clab-table-padding')];
    })()`),[303,'4px 7px 5px 6px']);
    const visibleSheet = await evaluate(`({
        columns:['任务',...[...document.querySelectorAll('${previewTable} [data-review-column-name]')].map(header=>header.textContent)],
        values:[...document.querySelectorAll('${previewTable} [data-review-row-name]')].map(row=>row.textContent),
    })`);
    await evaluate(`(()=>{
        window.previewDownloads=[];
        const click=HTMLAnchorElement.prototype.click,create=URL.createObjectURL,blobs=new Map();
        URL.createObjectURL=function(blob){const url=create.call(this,blob);blobs.set(url,blob);return url;};
        HTMLAnchorElement.prototype.click=function(){
            if(!this.download)return click.call(this);
            window.previewDownloads.push({name:this.download,blob:blobs.get(this.href)});
        };
        window.stopPreviewDownloads=()=>{URL.createObjectURL=create;HTMLAnchorElement.prototype.click=click;};
    })()`);
    try {
        const getDownload = (index) => evaluate(`(async()=>{
            for(let attempt=0;attempt<400;attempt++){
                const download=window.previewDownloads[${index}];
                if(download)return {name:download.name,size:download.blob.size,type:download.blob.type};
                await new Promise(resolve=>setTimeout(resolve,25));
            }
            throw Error(document.querySelector('.clab-review-notice').textContent);
        })()`);
        const saveDownload = async (index,extension) => {
            if (!process.env.CLAB_DOCK_SCREENSHOT_PREFIX) return;
            const data=await evaluate(`new Promise(resolve=>{
                const reader=new FileReader();
                reader.onload=()=>resolve(reader.result.split(',')[1]);
                reader.readAsDataURL(window.previewDownloads[${index}].blob);
            })`);
            fs.writeFileSync(process.env.CLAB_DOCK_SCREENSHOT_PREFIX+extension,Buffer.from(data,'base64'));
        };
        await click('[data-review-export=xlsx]');
        const workbook = await getDownload(0);
        assert.equal(workbook.name, '参数表.xlsx');
        const workbookParts = await evaluate(`(async()=>{
            const bytes=new Uint8Array(await window.previewDownloads[0].blob.arrayBuffer()),view=new DataView(bytes.buffer),entries={};
            let offset=0;
            while(view.getUint32(offset,true)===0x04034b50){
                const size=view.getUint32(offset+18,true),length=view.getUint16(offset+26,true),extra=view.getUint16(offset+28,true),start=offset+30+length+extra;
                const name=new TextDecoder().decode(bytes.slice(offset+30,offset+30+length));
                entries[name]=name.endsWith('.xml')?new TextDecoder().decode(bytes.slice(start,start+size)):size;
                offset=start+size;
            }
            return entries;
        })()`);
        assert.ok(workbookParts['xl/media/image1.png']>100);
        assert.match(workbookParts['xl/drawings/drawing1.xml'],/<xdr:oneCellAnchor>/);
        assert.ok(visibleSheet.columns.every(label=>workbookParts['xl/worksheets/sheet1.xml'].includes(label)));
        assert.ok(visibleSheet.values.every(value=>workbookParts['xl/worksheets/sheet1.xml'].includes(value)));
        await saveDownload(0,'-workbook.xlsx');
        await click('[data-review-export=html]');
        const html = await getDownload(1);
        assert.equal(html.name, '参数表-HTML.zip');
        assert.ok(html.size > 500);
        await saveDownload(1,'-table-html.zip');
        await change('[data-review-png-scale]','1');
        const expectedTablePNG=await evaluate(`(()=>{
            const grid=document.querySelector('${previewTable}');
            const head=grid.querySelector('.clab-table-head');
            return [[...head.children].reduce((sum,col)=>sum+col.offsetWidth,0),head.offsetHeight+
                [...grid.querySelectorAll('[data-review-row]')].reduce((sum,row)=>sum+row.offsetHeight,0)];
        })()`);
        await click('[data-review-export=png]');
        assert.equal((await getDownload(2)).name,'参数表.png');
        assert.deepEqual(await evaluate(`(async()=>{
            const image=await createImageBitmap(window.previewDownloads[2].blob);
            const size=[image.width,image.height];image.close();return size;
        })()`),expectedTablePNG);
        await saveDownload(2,'-table-rendered.png');
        await evaluate(`(()=>{
            const clipboard=navigator.clipboard,write=clipboard.write;
            clipboard.write=async items=>{window.previewCopy=await items[0].getType('image/png');};
            window.restoreClipboard=()=>{clipboard.write=write;};
        })()`);
        try {
            await click('[data-review-export=copy]');
            assert.ok(await evaluate(`new Promise(resolve=>{
                const start=performance.now(),timer=setInterval(()=>{
                    if(window.previewCopy||performance.now()-start>3000){clearInterval(timer);resolve(window.previewCopy?.size||0);}
                },25);
            })`) > 500);
        } finally { await evaluate('window.restoreClipboard()'); }
        await click('[data-review-mode=xy]');
        await checkExportLayout(false);
        await change('[data-review-png-scale]','2');
        await click('[data-review-export=png]');
        const png = await getDownload(3);
        assert.equal(png.name, 'XY矩阵.png');
        assert.equal(png.type,'image/png');
        assert.ok(png.size > 500);
        await saveDownload(3,'-matrix-rendered.png');
        await evaluate("document.querySelector('[data-review-json-kind][value=input]').scrollIntoView({block:'center'})");
        await click('[data-review-json-kind][value=input]');
        await evaluate("document.querySelector('[data-review-data-action=download-json]').scrollIntoView({block:'center'})");
        await click('[data-review-data-action=download-json]');
        const json = await getDownload(4);
        assert.match(json.name, /^CLab_Export_input_\d+\.json$/);
        assert.ok(json.size > 30);
    } finally {
        await evaluate('window.stopPreviewDownloads()');
    }
    await click('.clab-preview-modal-close');
    assert.equal(await evaluate("document.activeElement.matches('#clab-btn-preview')"), true);
    await click(activeTab+' [data-mode-toggle]');
    await click('#clab-workspace-mode-menu [data-workspace-mode=table]');
    assert.equal(await evaluate(`(()=>{
        const header=[...document.querySelectorAll('#clab-panel [data-table-settings]')].find(button=>button.textContent==='预览修改后的列名');
        const column=header?.closest('.clab-table-column');
        return column?.offsetWidth===303&&[...document.querySelectorAll('#clab-panel [role=cell]')].some(cell=>cell.dataset.tableColumn===column.dataset.tableColumn&&cell.style.getPropertyValue('--clab-table-padding')==='4px 7px 5px 6px');
    })()`),true);
    console.log('PASS preview reuses the workspace matrix and table, preserves matrix state, switches selected output history, and exports selected data');
    return 11;
}
