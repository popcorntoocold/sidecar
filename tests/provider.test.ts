import {it,expect} from 'vitest';
import {QlooProvider,parseCandidates,parseResolution} from '../server/qloo/provider';
const signal=new AbortController().signal;
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
