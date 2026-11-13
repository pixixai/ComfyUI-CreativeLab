export const workspaceModeType=view=>['table','xy'].includes(view?.structuredMode)?view.structuredMode:['table','xy'].includes(view?.mode)?view.mode:'';
export const workspaceModeAllowed=(view,mode)=>['cards','table','xy'].includes(mode)&&(mode==='cards'||!workspaceModeType(view)||workspaceModeType(view)===mode);
export const previewModeAllowed=(workspaces,mode)=>!['table','xy'].includes(mode)||workspaces.every(workspace=>workspaceModeAllowed(workspace.view,mode));
export const workspacePreviewMode=workspace=>['table','xy'].includes(workspace?.view?.mode)?workspace.view.mode:'browse';
export function previewModeOnWorkspaceChange(previous,next,current) {
    const from=previous?.view?.mode,to=next?.view?.mode;
    const conflict=['table','xy'].includes(from)&&['table','xy'].includes(to)&&from!==to;
    return conflict||!previewModeAllowed([next],current)?workspacePreviewMode(next):current;
}
