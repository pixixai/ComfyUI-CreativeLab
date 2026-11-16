let workspace,preview,last='workspace';
export function registerWorkspaceSurface(controls){workspace=controls;}
export function registerPreviewSurface(controls){preview=controls;}
export function rememberPanelSurface(surface){last=surface;}
export function returnToWorkspace(){last='workspace';workspace?.show();}
export function togglePanelSurface(){
    if(preview?.visible()){last='preview';preview.hide();workspace?.hide();return;}
    if(workspace?.visible()){last='workspace';workspace.hide();return;}
    if(last==='preview'&&preview?.resume()){workspace?.hide();return;}
    last='workspace';workspace?.show();
}
