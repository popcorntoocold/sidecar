import {mkdtempSync,rmSync,existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {it,expect,vi,afterEach} from 'vitest';
import {OpenAIModel} from '../server/model';
const dirs:string[]=[];
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
