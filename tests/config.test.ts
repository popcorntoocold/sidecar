import {it,expect} from 'vitest';
import {runtimeConfig} from '../server/config';
it('requires a finite positive integer public Qloo budget',()=>{
  for(const value of [undefined,'0','-1','NaN','Infinity','1.5'])expect(()=>runtimeConfig({NODE_ENV:'production',QLOO_HOURLY_WORKFLOW_LIMIT:value})).toThrow();
  expect(runtimeConfig({NODE_ENV:'production',QLOO_HOURLY_WORKFLOW_LIMIT:'30'}).workflowLimit).toBe(30);
});
it('requires a deliberately placed persistent model budget ledger for public paid usage',()=>{
  expect(()=>runtimeConfig({NODE_ENV:'production',QLOO_HOURLY_WORKFLOW_LIMIT:'30',OPENAI_API_KEY:'fixture'})).toThrow(/budget/i);
});
