import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {it,expect,vi,afterEach} from 'vitest';
import {OpenAIModel} from '../server/model';
const dirs:string[]=[];
it('sends proposal field and length constraints as a strict output schema',async()=>{
  let body:any;
  vi.stubGlobal('fetch',async(_url:any,request:any)=>{body=JSON.parse(request.body);return Response.json({choices:[{message:{content:'{}'}}]});});
  await new OpenAIModel(config()).proposal({},new AbortController().signal);
  expect(body.response_format).toMatchObject({type:'json_schema',json_schema:{strict:true,schema:{additionalProperties:false,properties:{title:{maxLength:160},agenda:{maxItems:6},verificationQuestions:{maxItems:8}}}}});
});
it.each([{finish_reason:'length',message:{content:'{}'}},{finish_reason:'stop',message:{content:'{}',refusal:'Cannot comply'}}])('rejects incomplete or refused model outputs',async(choice)=>{
  vi.stubGlobal('fetch',async()=>Response.json({choices:[choice]}));
  await expect(new OpenAIModel(config()).proposal({},new AbortController().signal)).rejects.toMatchObject({code:'INVALID_MODEL_OUTPUT'});
});
function config(){const dir=mkdtempSync(join(tmpdir(),'sidecar-model-'));dirs.push(dir);return {apiKey:'fixture-key',model:'gpt-5.4-mini-2026-03-17',budgetUsd:1,budgetPath:join(dir,'budget.json')};}
afterEach(()=>{vi.unstubAllGlobals();for(const dir of dirs.splice(0))rmSync(dir,{recursive:true,force:true});});
it('requires an authorized budget before a request is possible',async()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  const model=new OpenAIModel({...config(),budgetUsd:0});
  await expect(model.proposal({},new AbortController().signal)).rejects.toMatchObject({code:'MODEL_NOT_CONFIGURED'});
  expect(fetch).not.toHaveBeenCalled();
});
it('persists its reservation before sending to the fixed OpenAI endpoint',async()=>{
  const options=config();const fetch=vi.fn(async(url,request)=>{expect(existsSync(options.budgetPath)).toBe(true);expect(url).toBe('https://api.openai.com/v1/chat/completions');expect(JSON.parse(request.body)).toMatchObject({model:options.model,store:false,max_completion_tokens:1800});return new Response(JSON.stringify({choices:[{message:{content:'{"value":"fixture"}'}}]}));});
  vi.stubGlobal('fetch',fetch);const model=new OpenAIModel(options);
  expect(await model.proposal({},new AbortController().signal)).toEqual({value:'fixture'});
  expect(fetch).toHaveBeenCalledTimes(1);
});
it('bounds UTF-8 bytes before reserving or sending',async()=>{
  const options=config();const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  await expect(new OpenAIModel(options).proposal({text:'你'.repeat(30000)},new AbortController().signal)).rejects.toMatchObject({code:'MODEL_INPUT_LIMIT'});
  expect(fetch).not.toHaveBeenCalled();expect(existsSync(options.budgetPath)).toBe(false);
});
const remote={url:'https://sidecar-fixture.upstash.io',token:'storage-fixture',key:'sidecar:budget:test'};
it('waits for a durable remote reservation before sending a paid request without a local ledger',async()=>{
  const options={...config(),remote};let reserved=false;
  vi.stubGlobal('fetch',vi.fn(async(url,request)=>{
    if(url===remote.url){
      expect(request.headers.Authorization).toBe('Bearer storage-fixture');
      const command=JSON.parse(request.body);
      expect(command.slice(0,1)).toEqual(['EVAL']);
      expect(command.slice(2,4)).toEqual([1,remote.key]);
      expect(command[5]).toBe(1000000);
      await new Promise(resolve=>setTimeout(resolve,5));reserved=true;
      return Response.json({result:25000});
    }
    expect(reserved).toBe(true);
    return Response.json({choices:[{message:{content:'{"value":"reserved"}'}}]});
  }));
  expect(await new OpenAIModel(options).proposal({},new AbortController().signal)).toEqual({value:'reserved'});
  expect(existsSync(options.budgetPath)).toBe(false);
});
it.each([
  [{result:-1},200,'MODEL_BUDGET_EXHAUSTED'],
  [{result:-2},200,'MODEL_BUDGET_UNREADABLE'],
  [{result:0},200,'MODEL_BUDGET_UNREADABLE'],
  [{result:1000001},200,'MODEL_BUDGET_UNREADABLE'],
  [{result:'25000'},200,'MODEL_BUDGET_UNREADABLE'],
  [{error:'private provider error'},401,'MODEL_BUDGET_UNREADABLE']
])('does not send a paid request when the remote budget cannot authorize it (%j)',async(payload,status,code)=>{
  const options={...config(),remote};let paidRequests=0;
  vi.stubGlobal('fetch',vi.fn(async(url)=>{
    if(url===remote.url)return Response.json(payload,{status});
    paidRequests++;return Response.json({choices:[{message:{content:'{}'}}]});
  }));
  await expect(new OpenAIModel(options).proposal({},new AbortController().signal)).rejects.toMatchObject({code});
  expect(paidRequests).toBe(0);expect(existsSync(options.budgetPath)).toBe(false);
});
it('rejects untrusted remote destinations before sending either credential',async()=>{
  const fetch=vi.fn();vi.stubGlobal('fetch',fetch);
  await expect(new OpenAIModel({...config(),remote:{...remote,url:'https://sidecar-fixture.upstash.io.attacker.example'}}).proposal({},new AbortController().signal)).rejects.toMatchObject({code:'MODEL_BUDGET_CONFIG'});
  expect(fetch).not.toHaveBeenCalled();
});
