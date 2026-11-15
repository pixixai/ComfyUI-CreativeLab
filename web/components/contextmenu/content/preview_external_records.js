import { makeId } from '../../ui_state.js';

let sequence=0;
const extensions=/\.(png|jpe?g|webp|gif|bmp|tiff?|svg|avif)$/i;
export function externalImagePath(value){
    if(typeof value!=='string')return '';
    const path=value.replaceAll('\\','/');
    return !path||path.startsWith('/')||path.includes(':')||path.includes('\0')||path.split('/').some(part=>!part||part==='.'||part==='..')||!extensions.test(path)?'':path;
}
export function addExternalImages(workspace,paths){
    const settings=workspace.view.previewExternal??={images:[],enabled:true};
    const added=[],known=new Set(settings.images.map(image=>image.path));
    for(const value of paths){
        const path=externalImagePath(value);if(!path)continue;
        let image=settings.images.find(image=>image.path===path);
        if(!known.has(path)){image={id:makeId('reference')+'_'+(++sequence),path};settings.images.push(image);known.add(path);}
        if(!added.includes(image))added.push(image);
    }
    if(added.length)settings.enabled=true;
    return added;
}
export function externalImageRecords(workspaces,label){
    return workspaces.flatMap(workspace=>(workspace.view.previewExternal?.images||[]).flatMap(image=>{
        const path=externalImagePath(image.path);if(!path||typeof image.id!=='string')return [];
        const slash=path.lastIndexOf('/'),name=path.slice(slash+1),key=JSON.stringify(['external',workspace.id,image.id]);
        return [{key,source:key,cardId:'',areaId:image.id,cardLabel:label(workspace),areaLabel:'外部参考图',name,
            externalWorkspaceId:workspace.id,externalPath:path,url:'/view?'+new URLSearchParams({filename:name,subfolder:slash<0?'':path.slice(0,slash),type:'input'}),
            type:'image',index:-1,run:null,runId:'',snapshot:null,parameters:new Map()}];
    }));
}
