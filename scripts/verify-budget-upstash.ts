import {remoteBudgetConfig,RemoteModelSpendGuard} from '../server/remote-spend';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const config=remoteBudgetConfig(process.env)!;
const testKey='sidecar:test:'+randomUUID();
const command=async(body:unknown[])=>{
 const response=await fetch(config.url,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.token}`},body:JSON.stringify(body),signal:AbortSignal.timeout(15000)});
 if(!response.ok)throw new Error('Storage HTTP failure');
 const data=await response.json() as {result:unknown;error?:unknown};
 if(data.error)throw new Error('Storage command failure');return data.result;
};
try{
 const script=readFileSync('server/budget-initialize.lua','utf8');
 assert.equal(await command(['EVAL',script,1,testKey,15230,50000]),1);
 const attempts=await Promise.allSettled(Array.from({length:20},()=>new RemoteModelSpendGuard({...config,key:testKey,limitUsd:0.05}).reserve('gpt-5.4-mini',100,1800)));
 assert.equal(attempts.filter(x=>x.status==='fulfilled').length,2);
 assert.equal(attempts.filter(x=>x.status==='rejected'&&x.reason?.code==='MODEL_BUDGET_EXHAUSTED').length,18);
 assert.equal(await command(['HGET',testKey,'reservedMicros']),'43868');
 assert.equal(await command(['EVAL',script,1,testKey,0,50000]),-1);
 console.log('PASS: actual Upstash remote guard, 20 concurrent requests, correct persisted cap, no reset. No OpenAI requests.');
}catch{console.log('FAIL: Upstash budget verification; no OpenAI requests.');process.exitCode=1;}
finally{await command(['DEL',testKey]);}
