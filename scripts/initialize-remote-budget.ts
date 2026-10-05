import {readFileSync} from 'node:fs';
import {remoteBudgetConfig,validateRemoteBudget} from '../server/remote-spend';

// Operator-only migration. Stop local paid processes first. Never run at boot.
try{
  const config=remoteBudgetConfig(process.env);
  if(!config)throw new Error();
  validateRemoteBudget(config);
  const path=process.env.OPENAI_BUDGET_FILE;
  if(!path)throw new Error();
  const {reservedMicros}=JSON.parse(readFileSync(path,'utf8'));
  const limitMicros=Math.floor(Number(process.env.OPENAI_TEST_BUDGET_USD)*1000000);
  if(!Number.isSafeInteger(reservedMicros)||reservedMicros<0||!Number.isSafeInteger(limitMicros)||limitMicros<=0||reservedMicros>limitMicros)throw new Error();
  const script=readFileSync(new URL('../server/budget-initialize.lua',import.meta.url),'utf8');
  const response=await fetch(config.url,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',Authorization:`Bearer ${config.token}`},body:JSON.stringify(['EVAL',script,1,config.key,reservedMicros,limitMicros]),signal:AbortSignal.timeout(10000)});
  if(!response.ok)throw new Error();
  const data=await response.json() as {result?:number};
  if(data.result===-1){console.log('Remote ledger already exists. Its balance was not changed.');}
  else if(data.result===1){console.log(JSON.stringify({initialized:true,reservedUpperBoundUsd:reservedMicros/1000000,limitUsd:limitMicros/1000000}));}
  else throw new Error();
}catch{console.error('Budget initialization was not confirmed. Check private configuration and existing ledger; do not reset it.');process.exitCode=1;}
