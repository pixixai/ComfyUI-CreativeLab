export function requestInputFileAction(element,action){
    const detail={action,scope:null};
    element.dispatchEvent(new CustomEvent('clab_input_file_action',{bubbles:true,detail}));
    return detail.scope;
}
