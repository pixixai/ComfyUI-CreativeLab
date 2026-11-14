import test from 'node:test';
import assert from 'node:assert/strict';
import { cardNavigationPlan } from '../web/components/workspace_modes/card_navigation_plan.js';

test('nearby card navigation stays continuous and finishes at the requested position',()=>{
    for(const [from,to]of [[0,700],[1200,200],[40,40]]){
        const plan=cardNavigationPlan(from,to,340,1200);assert.equal(plan.kind,'near');assert.equal(plan.segments.length,1);
        assert.equal(plan.segments[0].from,from);assert.equal(plan.segments[0].to,to);assert.ok(plan.segments[0].duration<=260);
    }
});
test('distant navigation animates only bounded source and destination segments in either direction',()=>{
    for(const [from,to]of [[0,17000],[17000,0],[5000,100000]]){
        const plan=cardNavigationPlan(from,to,340,1200),direction=Math.sign(to-from);assert.equal(plan.kind,'far');assert.equal(plan.segments.length,2);
        assert.equal(plan.segments[0].from,from);assert.equal(plan.segments[1].to,to);
        for(const part of plan.segments){assert.equal(Math.sign(part.to-part.from),direction);assert.ok(Math.abs(part.to-part.from)<=255);}
        assert.ok(Math.abs(plan.segments[1].from-plan.segments[0].to)>1000);
    }
});
test('navigation segment lengths adapt to a narrow viewport without extending the cache buffer path',()=>{
    const plan=cardNavigationPlan(0,10000,340,300);assert.equal(plan.segments[0].to,135);assert.equal(plan.segments[1].from,9865);
});
