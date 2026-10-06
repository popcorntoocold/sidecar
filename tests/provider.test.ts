import {it,expect} from 'vitest';
import {QlooProvider,parseCandidates,parseResolution} from '../server/qloo/provider';
const signal=new AbortController().signal;
const brief={city:'Austin',category:'cafe' as const,objective:'A reading event',references:[{id:'ref',name:'Book',type:'book'}],rejectedIds:[]};
it('uses the place subtype instead of the generic entity label',()=>{
  expect(parseCandidates({status:'ok',results:[{entity_id:'a',name:'Cafe',type:'urn:entity',subtype:'urn:entity:place'}]},'record',[])[0].type).toBe('urn:entity:place');
});
it('distinguishes identical tag names by their provider taxonomy',async()=>{
  const provider=new QlooProvider(async()=>({status:'ok',results:[{id:'urn:tag:cuisine:qloo:coffee_shop',name:'Coffee Shop'},{id:'urn:tag:category:place:coffee_shop',name:'Coffee Shop'}]}));
  const tags=await provider.tags('cafe',signal);
  expect(tags.map(t=>t.name)).toEqual(['Coffee Shop (cuisine)','Coffee Shop (place category)']);
});
it('preserves the resolved canonical type when entity details omit it',()=>{
  const result=parseResolution({status:'ok',results:[{entity_id:'author-id',name:'Author'}],resolution:{outcomes:[{selected:{id:'author-id',name:'Author',type:'urn:entity:author'}},{selected:{id:'other',type:'urn:entity:movie'}}]}});
  expect(result.candidates[0].type).toBe('urn:entity:author');
});
it('reuses discovery for an exclusion or objective edit and invalidates it for changed signals',async()=>{
  let calls=0;
  const p=new QlooProvider(async(_op,input)=>{calls++;return {status:'ok',interpretation:{filter_location:input.filter_location},results:[{id:'one',name:'One'},{id:'two',name:'Two'}]};});
  const initial=await p.discover(brief,'tag',signal);
  const revised=await p.discover({...brief,businessName:'Private fixture name',objective:'A different event',rejectedIds:['one']},'tag',signal);
  expect(calls).toBe(1);expect(revised.cacheHit).toBe(true);
  expect(revised.candidates.map(c=>c.id)).toEqual(['two']);
  expect(revised.evidence.id).toBe(initial.evidence.id);
  expect(JSON.stringify(revised.evidence.request)).not.toContain('Private fixture name');
  await p.discover({...brief,references:[{id:'changed',name:'Changed',type:'book'}]},'tag',signal);
  expect(calls).toBe(2);
});
it('reuses unchanged analysis but refreshes it when the shortlist changes',async()=>{
  let calls=0;const p=new QlooProvider(async()=>{calls++;return {status:'ok',results:[]};});
  const candidates=parseCandidates({status:'ok',results:[{id:'one',name:'One'},{id:'two',name:'Two'}]},'discovery',[]);
  const first=await p.analyze('rank',brief,candidates,signal);
  const repeat=await p.analyze('rank',{...brief,objective:'A new event'},candidates,signal);
  expect(calls).toBe(1);expect(repeat.id).toBe(first.id);
  await p.analyze('rank',brief,candidates.slice(1),signal);expect(calls).toBe(2);
});
it('preserves distinguishing facts for same-name references',()=>{
  const result=parseResolution({status:'needs_input',results:[],resolution:{issues:[{candidates:[{id:'a',name:'The Thing',type:'movie',release_year:1982,description:'Antarctic research station'},{id:'b',name:'The Thing',type:'movie',release_year:2011,description:'A prequel'}]}]}});
  expect(result.candidates[0].subtitle).toContain('1982');expect(result.candidates[1].subtitle).toContain('2011');
});
it('accepts structured audience comparisons without weakening list validation',async()=>{
  const p=new QlooProvider(async()=>({status:'ok',results:{shared:[{name:'Book'}],differences:[]}}));
  const evidence=await p.analyze('compare_audiences',brief,[],signal);
  expect(evidence.details).toEqual({shared:[{name:'Book'}],differences:[]});
  expect(()=>parseCandidates({status:'ok',results:{}},'e1',[])).toThrow();
});
it('retains bounded provenance and warnings while removing credential fields',async()=>{
  const p=new QlooProvider(async()=>({status:'ok',results:[{id:'place',name:'Cafe'}],interpretation:{filter_location:'Austin'},warnings:['Nearby matching used'],explainability:{signals:['ref']},provenance:{documentation:['https://docs.qloo.com/reference'],request:{headers:{'X-Api-Key':'private-key'},query:{type:'place'},api_key:'private-key'}},execution:{request_id:'req-1'}}));
  const {evidence}=await p.discover(brief,'tag',signal);
  expect(evidence.metadata).toMatchObject({explainability:{signals:['ref']},provenance:{documentation:['https://docs.qloo.com/reference']},execution:{request_id:'req-1'}});
  expect(evidence.limitations).toContain('Nearby matching used');expect(JSON.stringify(evidence)).not.toContain('private-key');
});
it('requires user choice for ambiguous identities',()=>{
  const result=parseResolution({status:'needs_input',resolution:{issues:[{candidates:[{entity_id:'fixture-1',name:'Same Name',type:'book'},{entity_id:'fixture-2',name:'Same Name',type:'movie'}]}]},results:[]});
  expect(result.status).toBe('ambiguous');expect(result.candidates.map(x=>x.id)).toEqual(['fixture-1','fixture-2']);
});
it('does not invent a match for an empty response',()=>{
  expect(parseResolution({status:'empty',results:[]}).status).toBe('not_found');
});
it('rejects unreadable provider envelopes',()=>{
  expect(()=>parseCandidates({unexpected:true},'e1',[])).toThrow();
});
it('removes rejected candidates and leaves missing affinity absent',()=>{
  const results=parseCandidates({status:'ok',results:[{entity_id:'a',name:'A',type:'place'},{entity_id:'b',name:'B',type:'place'}]},'e1',['a']);
  expect(results.map(x=>x.id)).toEqual(['b']);expect(results[0].affinity).toBeUndefined();
});
it('refuses mismatched geographic interpretation',async()=>{
  const p=new QlooProvider(async()=>({status:'ok',interpretation:{filter_location:'Paris'},results:[]}));
  await expect(p.discover({city:'Austin',category:'cafe',objective:'A reading event',references:[{id:'a',name:'A',type:'book'}],rejectedIds:[]},'urn:tag:cafe',signal)).rejects.toMatchObject({code:'LOCATION_MISMATCH'});
});
it('retains requested city and category in evidence',async()=>{
  const p=new QlooProvider(async(_op,input)=>({status:'ok',interpretation:{filter_location:input.filter_location},results:[{entity_id:'a',name:'Example cafe',type:'place',affinity:0.45}]}));
  const result=await p.discover({city:'Austin',category:'cafe',objective:'A reading event',references:[{id:'b',name:'Book',type:'book'}],rejectedIds:[]},'urn:tag:cafe',signal);
  expect(result.evidence.request).toMatchObject({filter_location:'Austin',include_tags:['urn:tag:cafe'],signals:['b']});
  expect(result.candidates[0].evidenceIds).toEqual([result.evidence.id]);
});
