import {it,expect,afterEach} from 'vitest';
import {createApp} from '../server/app';
import {createPreview} from '../server/preview';
const apps:Awaited<ReturnType<typeof createApp>>[]=[];
afterEach(async()=>{for(const app of apps.splice(0))await app.close();});
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
