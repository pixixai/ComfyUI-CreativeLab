export const workspaceModeLabels={cards:'任务卡片',table:'参数表',xy:'XY 矩阵'};
export const workspaceModeType=view=>['cards','table','xy'].includes(view?.creationMode)?view.creationMode:['table','xy'].includes(view?.structuredMode)?view.structuredMode:['table','xy'].includes(view?.mode)?view.mode:'cards';
const typeAllows=(view,mode)=>mode==='cards'||workspaceModeType(view)==='cards'||workspaceModeType(view)===mode;
export const workspaceModeAllowed=(view,mode)=>['cards','table','xy'].includes(mode)&&typeAllows(view,mode)&&!(view?.mode==='table'&&mode==='xy'||view?.mode==='xy'&&mode==='table');
export const previewModeAllowed=(workspaces,mode)=>!['table','xy'].includes(mode)||workspaces.every(workspace=>typeAllows(workspace.view,mode));
export const workspacePreviewMode=workspace=>['table','xy'].includes(workspace?.view?.mode)?workspace.view.mode:'browse';
export function previewModeOnWorkspaceChange(previous,next,current) {
    const from=previous?.view?.mode,to=next?.view?.mode;
    const conflict=['table','xy'].includes(from)&&['table','xy'].includes(to)&&from!==to;
    return conflict||!previewModeAllowed([next],current)?workspacePreviewMode(next):current;
}
