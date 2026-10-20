import { app } from '../../../../scripts/app.js';

export function nodeName(node) {
    return node?.title||node?.constructor?.nodeData?.display_name||node?.type||'节点已失效';
}

function describeParameter(node,widget) {
    const inputs={...node.constructor?.nodeData?.input?.required,...node.constructor?.nodeData?.input?.optional},definition=inputs[widget.name];
    const options={...widget.options,...(definition?.[1]&&typeof definition[1]==='object'?definition[1]:{})};
    const choices=Array.isArray(definition?.[0])?definition[0]:Array.isArray(widget.type)?widget.type:Array.isArray(options.values)?options.values:Array.isArray(options.options)?options.options:[];
    const rawType=String(widget.type||definition?.[0]||'').toLowerCase();
    const type=['number','int','float'].includes(rawType)||typeof widget.value==='number'?'number':['toggle','boolean'].includes(rawType)||typeof widget.value==='boolean'?'boolean':'string';
    const displayName=widget.label||options.display_name||widget.name;
    return {key:`${node.id}||${widget.name}`,label:`${nodeName(node)} · ${displayName}`,name:widget.name,displayName,type,value:widget.value,choices:choices.length?[...choices]:type==='boolean'?[true,false]:[]};
}

export function workflowParameters() {
    return (app.graph?._nodes||[]).filter(node=>!['PrimitiveNode','CLab_SystemConfig'].includes(node.type)).flatMap(node=>(node.widgets||[]).filter(widget=>widget.name&&widget.type!=='button').map(widget=>describeParameter(node,widget)));
}
