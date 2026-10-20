export function createWorkspaceView(seed = {}) {
    const xy=seed.xy||{};
    const axis=value=>({bindings:value?.bindings||[],values:value?.values||[],gap:Number.isFinite(value?.gap)?Math.max(0,value.gap):4,margin:Number.isFinite(value?.margin)?Math.max(0,value.margin):10});
    return {
        mode:['cards','table','xy'].includes(seed.mode)?seed.mode:'cards',templateId:seed.templateId||'',
        columns:Number(seed.columns)||3,outputIndex:Number(seed.outputIndex)||0,
        xy:{x:axis(xy.x),y:axis(xy.y),z:{...axis(xy.z),enabled:!!xy.z?.enabled,current:Math.max(0,Number(xy.z?.current)||0),display:xy.z?.display==='all'?'all':'single'},origin:xy.origin==='top'?'top':'bottom',
            records:(Array.isArray(xy.records)?xy.records:[]).map((entry,index)=>typeof entry==='string'?{id:`record_${index}`,key:entry}:entry),
            taskIds:Array.isArray(xy.taskIds)?xy.taskIds:[],outputNodeId:xy.outputNodeId??'',outputIndex:Number(xy.outputIndex)||0,initialized:!!xy.initialized,
            zoom:Number.isFinite(xy.zoom)?xy.zoom:1,panX:Number.isFinite(xy.panX)?xy.panX:290,panY:Number.isFinite(xy.panY)?xy.panY:70,cameraReady:!!xy.cameraReady},
    };
}
