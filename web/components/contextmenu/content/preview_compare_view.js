const slots=['a','b'];
export function comparisonViews(config){
    config.view??={x:0,y:0,zoom:1,split:.5};
    config.locks??={a:false,b:false};
    config.views??=Object.fromEntries(slots.map(slot=>[slot,{x:config.view.x,y:config.view.y,zoom:config.view.zoom}]));
    return config.views;
}
export function panComparison(config,source,x,y){
    const views=comparisonViews(config);if(config.locks[source])return;
    for(const slot of slots)if(!config.locks[slot]){views[slot].x+=x;views[slot].y+=y;}
    Object.assign(config.view,views[source]);
}
export function zoomComparison(config,source,factor,anchor,sizes){
    const views=comparisonViews(config);if(config.locks[source])return;
    for(const slot of slots)if(!config.locks[slot]){
        const view=views[slot],zoom=Math.max(.2,Math.min(8,view.zoom*factor)),ratio=zoom/view.zoom;
        const x=anchor.x*sizes[slot].width,y=anchor.y*sizes[slot].height;
        view.x=x-(x-view.x)*ratio;view.y=y-(y-view.y)*ratio;view.zoom=zoom;
    }
    Object.assign(config.view,views[source]);
}
export function clearComparisonSlot(config,slot){
    comparisonViews(config);config[slot]='';config.locks[slot]=false;config.views[slot]={x:0,y:0,zoom:1};
}
export function alignComparisonView(config,slot){
    const views=comparisonViews(config),other=slot==='a'?'b':'a';
    Object.assign(views[slot],config[other]?views[other]:{x:0,y:0,zoom:1});
    Object.assign(config.view,views[slot]);
}
