import {it, expect} from 'vitest';
import {compareWithBaseline, type ComparisonModel} from '../server/benchmark';
import {createPreview} from '../server/preview';

const signal = new AbortController().signal;
function liveRun() {
  const run = createPreview();
  return {...run, mode: 'live' as const, evidence: run.evidence.map(e => ({...e, source: 'Qloo' as const}))};
}
function model(): ComparisonModel {
  return {name: 'fixture-model', compare: async context => ({suggestions: context.candidates.length
    ? context.candidates.map(c => ({name:c.name, entityId:c.id, reason:'Fixture interpretation', evidenceIds:c.evidenceIds}))
    : [{name:'Unverified fixture business', entityId:null, reason:'Fixture suggestion', evidenceIds:[]}]})};
}
it('refuses to use a preview as measured Qloo evidence', async () => {
  await expect(compareWithBaseline(createPreview(), model(), signal)).rejects.toMatchObject({code:'LIVE_RUN_REQUIRED'});
});
it('keeps the same brief and removes all provider evidence from the baseline input', async () => {
  const contexts: unknown[] = []; const client = model(); const original = client.compare;
  client.compare = async (context, s) => {contexts.push(context); return original(context,s);};
  const run = liveRun(); const pair = await compareWithBaseline(run, client, signal);
  const [baseline, grounded] = contexts as {brief:unknown;candidates:unknown[];evidence:unknown[]}[];
  expect(baseline.brief).toEqual(grounded.brief);
  expect(baseline.candidates).toEqual([]); expect(baseline.evidence).toEqual([]);
  expect(grounded.candidates).toHaveLength(4);
  expect(JSON.stringify(baseline)).not.toContain(run.brief.references[0].id);
  expect(pair.baseline.verification).toBe('unverified');
  expect(pair.grounded.verification).toBe('provider-linked');
  expect(pair.model).toBe('fixture-model');
});
it('rejects invented entity IDs or evidence in the grounded condition', async () => {
  const client=model();client.compare=async context=>({suggestions:[{name:'Invented',entityId:context.candidates.length?'fake':null,reason:'test',evidenceIds:context.candidates.length?['fake']:[]}]});
  await expect(compareWithBaseline(liveRun(),client,signal)).rejects.toMatchObject({code:'UNSUPPORTED_COMPARISON'});
});
it('does not accept baseline citations or silently keep one side after failure', async () => {
  const client=model(); client.compare=async()=>({suggestions:[{name:'Unverified',entityId:null,reason:'test',evidenceIds:['fake']}]});
  await expect(compareWithBaseline(liveRun(),client,signal)).rejects.toMatchObject({code:'UNSUPPORTED_COMPARISON'});
});
it('checks cancellation between conditions', async () => {
  const ac=new AbortController(); const client=model(); let calls=0;
  client.compare=async()=>{calls++;ac.abort();return {suggestions:[]};};
  await expect(compareWithBaseline(liveRun(),client,ac.signal)).rejects.toMatchObject({code:'CANCELLED'});
  expect(calls).toBe(1);
});
