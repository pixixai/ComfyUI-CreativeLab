const metrics=new Map();
if(typeof document!=='undefined')document.fonts?.addEventListener('loadingdone',()=>metrics.clear());
const metricStyles=['width','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','padding','border','boxSizing','letterSpacing','tabSize','textTransform','wordBreak','overflowWrap'];
export function measureInputText(input) {
    if(input.style.resize!=='none'||!input.isConnected||!input.getClientRects().length)return;
    const style=getComputedStyle(input),value=input.value||input.placeholder||'A',key=JSON.stringify([metricStyles.map(name=>style[name]),value]);
    const known=metrics.get(key);
    if(known!==undefined){metrics.delete(key);metrics.set(key,known);if(input.style.height!==known+'px')input.style.height=known+'px';return;}
    let ghost=document.getElementById('clab-ghost-textarea-measurer');
    if(!ghost){ghost=document.createElement('textarea');ghost.id='clab-ghost-textarea-measurer';ghost.tabIndex=-1;ghost.style.cssText='position:absolute;top:-9999px;left:-9999px;visibility:hidden;z-index:-1000;overflow:hidden;height:1px!important;min-height:1px!important;max-height:none!important;word-wrap:break-word;white-space:pre-wrap';document.body.append(ghost);}
    for(const name of metricStyles)ghost.style[name]=style[name];
    ghost.value=value;
    const height=ghost.scrollHeight+(parseFloat(style.borderTopWidth)||0)+(parseFloat(style.borderBottomWidth)||0)+8;
    if(key.length<=16000){metrics.set(key,height);while(metrics.size>128)metrics.delete(metrics.keys().next().value);}
    if(input.style.height!==height+'px')input.style.height=height+'px';
}
