import {it,expect} from 'vitest';
import {runResearch,assertEvidenceIds} from '../server/agent';
import {type Brief,type Candidate} from '../shared/contracts';
const brief:Brief={city:'Austin',category:'cafe',objective:'A reading event',references:[1,2,3].map(i=>({id:`r${i}`,name:`Reference ${i}`,type:'book'})),rejectedIds:[]};
const candidate:Candidate={id:'c',name:'Fixture Cafe',type:'place',address:'Fixture address',description:'Fixture',providerRank:1,evidenceIds:['e'],explanation:null};
const evidence={id:'e',source:'Qloo' as const,operation:'recommend',fetchedAt:'2026-10-04',request:{},entityIds:['c'],metrics:{},details:[],limitations:[]};
function provider(){return {discover:async()=>({candidates:[candidate],evidence}),analyze:async()=>evidence};}
it('rejects fabricated citations',()=>expect(()=>assertEvidenceIds(['unknown'],[evidence])).toThrow());
it('keeps the chosen candidates and their provenance',async()=>{
  const result=await runResearch(brief,'tag',{provider:provider(),model:{next:async()=>({action:'finish'})}},new AbortController().signal);
  expect(result.candidates[0].id).toBe('c');expect(result.evidence[0].id).toBe('e');expect(result.mode).toBe('live');
});
it('bounds a model that repeatedly requests analysis',async()=>{
  let count=0;const p=provider();p.analyze=async()=>{count++;return evidence;};
  const result=await runResearch(brief,'tag',{provider:p,model:{next:async()=>({action:'rank'})}},new AbortController().signal);
  expect(count).toBeLessThanOrEqual(2);expect(result.warnings.length).toBeGreaterThan(0);
});
it('does not pass model-authored ids or city to the provider',async()=>{
  let received:Brief|undefined;const p=provider();p.analyze=async(_op?:unknown,b?:Brief)=>{received=b;return evidence;};
  let n=0;
  const result=await runResearch(brief,'tag',{provider:p,model:{next:async()=>n++?{action:'finish'}:{action:'rank',city:'Paris',ids:['evil']}}},new AbortController().signal);
  expect(received).toBeUndefined();expect(result.warnings.length).toBeGreaterThan(0);
});
it('preserves discovery when optional analysis fails',async()=>{
  const p=provider();p.analyze=async()=>{throw new Error('private debug details');};
  const result=await runResearch(brief,'tag',{provider:p,model:{next:async()=>({action:'compare'})}},new AbortController().signal);
  expect(result.candidates).toHaveLength(1);expect(JSON.stringify(result)).not.toContain('private debug details');
});
it('cancels before calling providers',async()=>{
  const ac=new AbortController();ac.abort();
  await expect(runResearch(brief,'tag',{provider:provider(),model:{next:async()=>({action:'finish'})}},ac.signal)).rejects.toMatchObject({code:'CANCELLED'});
});

it('surfaces provider limitations alongside the shortlist',async()=>{
  const p={discover:async()=>({candidates:[candidate],evidence:{...evidence,metadata:{warnings:['Nearby matching used']}}}),analyze:async()=>evidence};
  const result=await runResearch(brief,'tag',{provider:p,model:{next:async()=>({action:'finish'})}},new AbortController().signal);
  expect(result.warnings).toContain('Nearby matching used');
});
