import {it,expect} from 'vitest';
import {RunLimiter,ExpiringStore} from '../server/limits';
it('refuses concurrent runs then releases a permit',()=>{
  const limiter=new RunLimiter({globalBudget:10,clientBudget:10,concurrency:1});
  const release=limiter.acquire('a',1);
  expect(()=>limiter.acquire('b',1)).toThrow();release();
  expect(()=>limiter.acquire('b',1)).not.toThrow();
});
it('reserves full tool budget before starting research',()=>{
  const limiter=new RunLimiter({globalBudget:10,clientBudget:10,concurrency:2});
  limiter.acquire('a',8)();expect(()=>limiter.acquire('b',8)).toThrow();
});
it('expires old results and caps retained runs',()=>{
  let now=0;const store=new ExpiringStore<string>(10,2,()=>now);
  store.set('a','first');now=11;expect(store.get('a')).toBeUndefined();
  store.set('b','second');store.set('c','third');store.set('d','fourth');expect(store.get('b')).toBeUndefined();
});
