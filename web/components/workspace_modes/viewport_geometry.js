export const virtualizeTasks=cards=>cards.length>=40||cards.reduce((sum,card)=>sum+(card.areas?.length||0),0)>=160;
export const intersectsViewport=(box,viewport,margin=160)=>box.width>0&&box.height>0&&box.right>=viewport.left-margin&&box.left<=viewport.right+margin&&box.bottom>=viewport.top-margin&&box.top<=viewport.bottom+margin;
export const xyDetailLevel=(width,zoom,focused=false)=>focused||width*zoom>=120?'full':'summary';
export function estimatedModuleHeight(area,width=320){
    if(area.type==='preview')return area.mediaSize?.width?Math.max(100,width*area.mediaSize.height/area.mediaSize.width):240;
    if(area.dataType==='boolean')return 84;
    if(!area.autoHeight)return 148;
    const lines=String(area.value??'').split('\n').reduce((sum,line)=>sum+Math.max(1,Math.ceil(line.length/Math.max(12,Math.floor(width/7)))),0);
    return 72+Math.max(2,lines)*18;
}

export function revealDelta(start,end,minimum,maximum){
    if(end-start>maximum-minimum)return minimum-start;
    return start<minimum?minimum-start:end>maximum?maximum-end:0;
}
