import { getMediaType } from '../../modules/media_types/media_utils.js';
import { makeId } from '../../ui_state.js';

let sequence=0;
const extensions=/\.(png|jpe?g|webp|gif|bmp|tiff?|svg|avif|mp4|webm|mov|avi|mkv|m4v|mp3|wav|ogg|flac|aac|m4a|opus|glb|gltf|fbx|obj|stl|ply|bvh|txt|md|markdown|json|yaml|yml|xml|csv|tsv|log)$/i;
export function externalMediaPath(value){
    if(typeof value!=='string')return '';
    const path=value.replaceAll('\\','/');
    return !path||path.startsWith('/')||path.includes(':')||path.includes('\0')||path.split('/').some(part=>!part||part==='.'||part==='..')||!extensions.test(path)?'':path;
}
export function addExternalMedia(workspace,paths){
    const settings=workspace.view.previewExternal??={images:[],enabled:true};
    const added=[],known=new Set(settings.images.map(image=>image.path));
    for(const value of paths){
        const path=externalMediaPath(value);if(!path)continue;
        let image=settings.images.find(image=>image.path===path);
        if(!known.has(path)){image={id:makeId('reference')+'_'+(++sequence),path};settings.images.push(image);known.add(path);}
        if(!added.includes(image))added.push(image);
    }
    if(added.length)settings.enabled=true;
    return added;
}
export function externalMediaRecords(workspaces,label){
    return workspaces.flatMap(workspace=>(workspace.view.previewExternal?.images||[]).flatMap(image=>{
        const path=externalMediaPath(image.path);if(!path||typeof image.id!=='string')return [];
        const slash=path.lastIndexOf('/'),name=path.slice(slash+1),key=JSON.stringify(['external',workspace.id,image.id]);
        return [{key,source:key,cardId:'',areaId:image.id,cardLabel:label(workspace),areaLabel:'外部参考媒体',name,
            externalWorkspaceId:workspace.id,externalPath:path,url:'/view?'+new URLSearchParams({filename:name,subfolder:slash<0?'':path.slice(0,slash),type:'input'}),
            type:getMediaType(path),index:-1,run:null,runId:'',snapshot:null,parameters:new Map()}];
    }));
}
