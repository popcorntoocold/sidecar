import {it,expect,afterEach,vi} from 'vitest';
import {createApp} from '../server/app';
import {createPreview} from '../server/preview';
import {QlooProvider} from '../server/qloo/provider';
import {OpenAIModel} from '../server/model';
const apps:Awaited<ReturnType<typeof createApp>>[]=[];
afterEach(async()=>{for(const app of apps.splice(0))await app.close();vi.restoreAllMocks();vi.unstubAllEnvs();});
it('allows resolution, research, a paired comparison and revision within the global allowance',async()=>{
  vi.stubEnv('QLOO_API_KEY','fixture-only');vi.stubEnv('QLOO_HOURLY_WORKFLOW_LIMIT','30');
  vi.spyOn(OpenAIModel.prototype,'configured','get').mockReturnValue(true);
  vi.spyOn(OpenAIModel.prototype,'next').mockResolvedValue({action:'finish'});
  vi.spyOn(OpenAIModel.prototype,'compare').mockImplementation(async context=>({suggestions:context.candidates.map(c=>({name:c.name,entityId:c.id,reason:'Fixture reason',evidenceIds:c.evidenceIds}))}));
  const fixture=createPreview();
  vi.spyOn(QlooProvider.prototype,'resolve').mockImplementation(async query=>({status:'resolved',candidates:fixture.brief.references.filter(r=>r.name===query)}));
  vi.spyOn(QlooProvider.prototype,'tags').mockResolvedValue([{id:'fixture-tag',name:'Cafe'}]);
  vi.spyOn(QlooProvider.prototype,'discover').mockImplementation(async brief=>({candidates:fixture.candidates.filter(c=>!brief.rejectedIds.includes(c.id)),evidence:{...fixture.evidence[0],source:'Qloo'},cacheHit:false}));
  const app=await createApp();apps.push(app);
  for(const reference of fixture.brief.references){const response=await app.inject({method:'POST',url:'/api/resolve',payload:{query:reference.name}});expect(response.statusCode).toBe(200);}
  expect((await app.inject({method:'GET',url:'/api/tags?category=cafe'})).statusCode).toBe(200);
  const first=await app.inject({method:'POST',url:'/api/research',payload:{brief:fixture.brief,categoryTag:'fixture-tag'}});expect(first.statusCode).toBe(200);
  expect((await app.inject({method:'POST',url:'/api/comparison',payload:{runId:first.json().id}})).statusCode).toBe(200);
  const revised=await app.inject({method:'POST',url:'/api/research',payload:{brief:{...fixture.brief,rejectedIds:[fixture.candidates[0].id]},categoryTag:'fixture-tag',previousRunId:first.json().id}});
  expect(revised.statusCode).toBe(200);
  expect(revised.json().revision.previousRunId).toBe(first.json().id);
  expect(revised.json().candidates.some((c:{id:string})=>c.id===fixture.candidates[0].id)).toBe(false);
});
it('rejects malformed research before provider access',async()=>{
  const app=await createApp();apps.push(app);
  const res=await app.inject({method:'POST',url:'/api/research',payload:{city:''}});
  expect(res.statusCode).toBe(400);
});
it('clearly separates preview from live status',async()=>{
  const app=await createApp();apps.push(app);
  const res=await app.inject({method:'GET',url:'/api/preview'});
  expect(res.json().mode).toBe('preview');expect(res.json().evidence[0].source).toBe('Illustrative');
});
it('does not create a phantom exclusion from an empty query',async()=>{
  const app=await createApp();apps.push(app);
  const res=await app.inject({method:'GET',url:'/api/preview?exclude='});
  expect(res.json().brief.rejectedIds).toEqual([]);
});
it('does not let a caller turn preview references into live evidence',async()=>{
  const app=await createApp();apps.push(app);
  const res=await app.inject({method:'POST',url:'/api/research',payload:{brief:createPreview().brief,categoryTag:'fixture'}});
  expect(res.statusCode).toBeGreaterThanOrEqual(400);
});
it('rejects an arbitrary run or partner when creating a proposal',async()=>{
  const app=await createApp();apps.push(app);
  const res=await app.inject({method:'POST',url:'/api/proposal',payload:{runId:'fake',candidateId:'fake'}});
  expect(res.statusCode).toBe(404);
});
it('keeps each preview revision independent',()=>{
  const original=createPreview();const next=createPreview([original.candidates[0].id]);
  expect(original.candidates).toHaveLength(4);expect(next.candidates).toHaveLength(3);
  expect(next.candidates.some(c=>c.id===original.candidates[0].id)).toBe(false);
});
it('serves a printable proposal with illustrative provenance',async()=>{
  const app=await createApp();apps.push(app);
  const run=(await app.inject({method:'GET',url:'/api/preview'})).json();
  const response=await app.inject({method:'POST',url:'/api/proposal',payload:{runId:run.id,candidateId:run.candidates[0].id}});
  expect(response.statusCode).toBe(200);expect(response.json().mode).toBe('preview');expect(response.json().evidence[0].source).toBe('Illustrative');
});
it('refuses measured comparisons of a fictional walkthrough',async()=>{
  const app=await createApp();apps.push(app);
  const run=(await app.inject({method:'GET',url:'/api/preview'})).json();
  const response=await app.inject({method:'POST',url:'/api/comparison',payload:{runId:run.id}});
  expect(response.statusCode).toBe(400);expect(response.json().code).toBe('LIVE_RUN_REQUIRED');
});
