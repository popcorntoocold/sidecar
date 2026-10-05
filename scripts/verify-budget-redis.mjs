// Runs the production Lua against a disposable local Redis container. No API keys.
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {readFileSync} from 'node:fs';
import {randomUUID} from 'node:crypto';
import assert from 'node:assert/strict';
const exec=promisify(execFile);
const name='sidecar-budget-test-'+randomUUID();
const script=readFileSync(new URL('../server/budget-reservation.lua',import.meta.url),'utf8');
const initializeScript=readFileSync(new URL('../server/budget-initialize.lua',import.meta.url),'utf8');
const docker=async(...args)=>(await exec('docker',args,{timeout:30000,maxBuffer:1024*1024})).stdout.trim();
const redis=(...args)=>docker('exec',name,'redis-cli','--raw',...args.map(String));
const reserve=(key,amount=100000,limit=1000000)=>redis('EVAL',script,1,key,amount,limit);
async function waitReady(){
  let ready=false;
  for(let attempt=0;attempt<20;attempt++){
    try{ready=await redis('PING')==='PONG';if(ready)break;}catch{}
    await new Promise(resolve=>setTimeout(resolve,100));
  }
  assert.ok(ready,'Redis must start');
}
try{
  await docker('run','--detach','--name',name,'redis:7-alpine','redis-server','--appendonly','yes');
  await waitReady();
  assert.equal(await reserve('missing'),'-2');
  assert.equal(await redis('EVAL',initializeScript,1,'budget',15230,1000000),'1');
  assert.equal(await redis('EVAL',initializeScript,1,'budget',0,1000000),'-1');
  assert.equal(await redis('HGET','budget','reservedMicros'),'15230','Initialization must never reset prior spending');
  assert.equal(await redis('EVAL',initializeScript,1,'bad-init',-1,1000000),'-2');
  const results=await Promise.all(Array.from({length:20},()=>reserve('budget')));
  assert.equal(results.filter(x=>Number(x)>0).length,9);
  assert.equal(results.filter(x=>x==='-1').length,11);
  assert.equal(await redis('HGET','budget','reservedMicros'),'915230');
  assert.equal(await reserve('budget',100000,2000000),'-2','A deployment cannot silently expand the persisted cap');
  await docker('restart',name);
  await waitReady();
  assert.equal(await reserve('budget'),'-1','Restart cannot reset the cap');
  await redis('HSET','invalid','reservedMicros','1.5','limitMicros',1000000);
  assert.equal(await reserve('invalid'),'-2');
  await redis('HSET','expires','reservedMicros',0,'limitMicros',1000000);
  await redis('EXPIRE','expires',60);
  assert.equal(await reserve('expires'),'-2','Expiring records cannot authorize spending');
  console.log('Redis budget verified: 20 concurrent reservations, exact cap, restart persistence, missing/corrupt/expiring record refusal. No paid APIs used.');
}finally{
  await docker('rm','--force',name).catch(()=>{});
}
