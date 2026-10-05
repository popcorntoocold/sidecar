import {AppError} from '../shared/contracts';
import {reservationMicros} from './spend';
import {readFileSync} from 'node:fs';

export type RemoteBudgetConfig={url:string;token:string;key:string};
export function remoteBudgetConfig(env:NodeJS.ProcessEnv):RemoteBudgetConfig|undefined{
  const url=env.UPSTASH_REDIS_REST_URL,token=env.UPSTASH_REDIS_REST_TOKEN,key=env.OPENAI_BUDGET_REDIS_KEY;
  return url||token||key?{url:url??'',token:token??'',key:key??''}:undefined;
}
export function validateRemoteBudget(config:RemoteBudgetConfig){
  try{
    const url=new URL(config.url);
    if(url.protocol!=='https:'||!url.hostname.endsWith('.upstash.io')||url.username||url.password||url.port||url.search||url.hash||url.pathname!=='/'||!config.token||!/^sidecar:[a-zA-Z0-9:_-]{1,100}$/.test(config.key))throw new Error();
  }catch{throw new AppError('MODEL_BUDGET_CONFIG','Configure a complete, trusted remote budget ledger before enabling paid requests.',503);}
}

// One atomic write-side script. Never recreate a missing ledger or refund an
// ambiguous reservation. A separate operator step initializes the budget once.
export const RESERVE_SCRIPT=readFileSync(new URL('./budget-reservation.lua',import.meta.url),'utf8');
export class RemoteModelSpendGuard{
  constructor(private config:RemoteBudgetConfig&{limitUsd:number}){}
  async reserve(model:string,requestBytes:number,maxOutputTokens:number,signal?:AbortSignal){
    validateRemoteBudget(this.config);
    const amount=reservationMicros(model,requestBytes,maxOutputTokens,this.config.limitUsd);
    const limit=Math.floor(this.config.limitUsd*1000000);
    try{
      const response=await fetch(this.config.url,{method:'POST',redirect:'error',headers:{'Content-Type':'application/json',Authorization:`Bearer ${this.config.token}`},body:JSON.stringify(['EVAL',RESERVE_SCRIPT,1,this.config.key,amount,limit]),signal:AbortSignal.any([signal??new AbortController().signal,AbortSignal.timeout(10000)])});
      if(!response.ok){await response.body?.cancel();throw new Error();}
      const data=await response.json() as {result?:unknown;error?:unknown};
      if(data.error!==undefined)throw new Error();
      if(data.result===-1)throw new AppError('MODEL_BUDGET_EXHAUSTED','The approved model test budget is reserved. Further requests are disabled.',429);
      if(!Number.isSafeInteger(data.result)||(data.result as number)<amount||(data.result as number)>limit)throw new Error();
    }catch(error){
      if(error instanceof AppError)throw error;
      throw new AppError('MODEL_BUDGET_UNREADABLE','The remote model budget could not be verified. No paid request was sent.',503);
    }
  }
}
