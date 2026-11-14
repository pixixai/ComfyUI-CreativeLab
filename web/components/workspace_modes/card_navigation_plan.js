export function cardNavigationPlan(from,to,stride,viewport){
    const distance=Math.abs(to-from);
    if(distance<=stride*3)return {kind:'near',segments:[{from,to,duration:distance<1?0:180+Math.min(80,distance/stride*30)}]};
    const direction=Math.sign(to-from),travel=Math.min(stride*.75,viewport*.45);
    return {kind:'far',segments:[{from,to:from+direction*travel,duration:120},{from:to-direction*travel,to,duration:160}]};
}
