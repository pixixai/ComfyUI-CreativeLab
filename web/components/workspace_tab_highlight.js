const views=new WeakMap();
let sequence=0;
export function paintWorkspaceHighlights(container,selectedIds){
    let view=views.get(container);
    if(!view){
        view={ids:[],paths:new Map(),gradient:`clab-tab-rainbow-${++sequence}`};views.set(container,view);
        new ResizeObserver(()=>paintWorkspaceHighlights(container,view.ids)).observe(container);
    }
    view.ids=[...selectedIds];
    let svg=container.querySelector(':scope > .clab-workspace-highlight');
    if(!svg){
        svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.classList.add('clab-workspace-highlight');svg.setAttribute('aria-hidden','true');
        svg.innerHTML=`<defs><linearGradient id="${view.gradient}" gradientUnits="userSpaceOnUse"><stop stop-color="#d97e8f"/><stop offset=".23" stop-color="#d1bc76"/><stop offset=".48" stop-color="#80bba5"/><stop offset=".73" stop-color="#8ba9da"/><stop offset="1" stop-color="#c28dcd"/></linearGradient></defs>`;
        container.append(svg);view.paths.clear();
    }
    const tabs=[...container.querySelectorAll(':scope > [data-workspace-id]')],active=tabs.find(tab=>tab.classList.contains('active'));
    const multi=selectedIds.length>1,groups=[];
    for(const tab of tabs){
        if(!(multi?selectedIds.includes(tab.dataset.workspaceId):tab===active))continue;
        const last=groups.at(-1);if(last&&tabs.indexOf(tab)===tabs.indexOf(last.at(-1))+1)last.push(tab);else groups.push([tab]);
    }
    if(multi&&active&&!selectedIds.includes(active.dataset.workspaceId))groups.push([active]);
    const keys=new Set();
    svg.style.width=`${Math.max(container.clientWidth,...[...container.children].filter(node=>node!==svg).map(node=>node.offsetLeft+node.offsetWidth))}px`;svg.style.height=`${container.clientHeight}px`;
    for(const group of groups){
        const ring=multi&&selectedIds.includes(group[0].dataset.workspaceId),key=group.map(tab=>tab.dataset.workspaceId).join('|');keys.add(key);
        const first=group[0],last=group.at(-1);
        // SVG coordinates must stay in layout pixels during the panel's scale animation.
        const left=first.offsetLeft+.5,right=last.offsetLeft+last.offsetWidth-.5,top=.5,bottom=container.clientHeight-.5;
        const start=group.includes(active)?active.offsetLeft+.5:left;
        const length=ring?2*(right-left+bottom-top):right-left;
        const d=ring?`M${start},${top}H${right}V${bottom}H${left}V${top}H${start}`:`M${left},${top}H${right}`;
        let path=view.paths.get(key);const fresh=!path||!path.isConnected;
        if(fresh){
            path=document.createElementNS(svg.namespaceURI,'path');const gradient=svg.querySelector('linearGradient').cloneNode(true);gradient.id=`clab-tab-rainbow-${++sequence}`;svg.querySelector('defs').append(gradient);path.gradient=gradient;
            path.setAttribute('fill','none');path.setAttribute('stroke',`url(#${gradient.id})`);path.setAttribute('stroke-width','1');svg.append(path);view.paths.set(key,path);
        }
        path.gradient.setAttribute('x1',left);path.gradient.setAttribute('x2',right);
        const changed=path.getAttribute('d')!==d;path.setAttribute('d',d);path.style.strokeDasharray=`${length} ${length}`;
        if(fresh||changed){
            const from=ring?(group.includes(active)?Math.min(active.offsetWidth,right-start):0):0;
            if(!matchMedia('(prefers-reduced-motion: reduce)').matches)path.animate([{strokeDasharray:`${from} ${length}`},{strokeDasharray:`${length} ${length}`}],{duration:320,easing:'ease-out'});
        }
    }
    for(const [key,path]of view.paths)if(!keys.has(key)){path.gradient.remove();path.remove();view.paths.delete(key);}
}
