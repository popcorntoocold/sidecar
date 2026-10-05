import {it,expect} from 'vitest';
import {runtimeConfig} from '../server/config';
it('requires a finite positive integer public Qloo budget',()=>{
  for(const value of [undefined,'0','-1','NaN','Infinity','1.5'])expect(()=>runtimeConfig({NODE_ENV:'production',QLOO_HOURLY_WORKFLOW_LIMIT:value})).toThrow();
  expect(runtimeConfig({NODE_ENV:'production',QLOO_HOURLY_WORKFLOW_LIMIT:'30'}).workflowLimit).toBe(30);
});
it('requires a deliberately placed persistent model budget ledger for public paid usage',()=>{
  expect(()=>runtimeConfig({NODE_ENV:'production',QLOO_HOURLY_WORKFLOW_LIMIT:'30',OPENAI_API_KEY:'fixture'})).toThrow(/budget/i);
});
it('supports a complete remote ledger on a host with ephemeral storage',()=>{
  expect(()=>runtimeConfig({NODE_ENV:'production',QLOO_HOURLY_WORKFLOW_LIMIT:'30',OPENAI_API_KEY:'fixture',UPSTASH_REDIS_REST_URL:'https://fixture.upstash.io',UPSTASH_REDIS_REST_TOKEN:'fixture',OPENAI_BUDGET_REDIS_KEY:'sidecar:budget:test'})).not.toThrow();
});
it('rejects incomplete remote ledger configuration even if a local path exists',()=>{
  expect(()=>runtimeConfig({NODE_ENV:'production',QLOO_HOURLY_WORKFLOW_LIMIT:'30',OPENAI_API_KEY:'fixture',OPENAI_BUDGET_FILE:process.cwd()+'/budget.json',UPSTASH_REDIS_REST_URL:'https://fixture.upstash.io'})).toThrow(/budget/i);
});
