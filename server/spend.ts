import {mkdirSync,readFileSync,writeFileSync,existsSync,renameSync,openSync,closeSync,unlinkSync} from 'node:fs';
import {dirname} from 'node:path';
import {randomUUID} from 'node:crypto';
import {AppError} from '../shared/contracts';

// Standard text rates verified against the official model page, October 4, 2026.
// Reserve a conservative upper bound before each attempt, including failed calls.
const supportedModels=new Set(['gpt-5.4-mini','gpt-5.4-mini-2026-03-17']);
export function reservationMicros(model:string,requestBytes:number,maxOutputTokens:number,limitUsd:number){
  if(!Number.isFinite(limitUsd)||limitUsd<=0||!Number.isSafeInteger(Math.floor(limitUsd*1000000)))throw new AppError('MODEL_BUDGET_REQUIRED','Set an explicitly authorized OpenAI test budget before making paid requests.',503);
  if(!supportedModels.has(model))throw new AppError('MODEL_PRICE_UNKNOWN','This model has no verified budget rate. Configure the documented GPT-5.4 mini snapshot.',503);
  if(!Number.isSafeInteger(requestBytes)||requestBytes<0||!Number.isSafeInteger(maxOutputTokens)||maxOutputTokens<=0)throw new Error('Invalid model reservation');
  const amount=Math.ceil((requestBytes+8192)*0.75+maxOutputTokens*4.5);
  if(!Number.isSafeInteger(amount))throw new Error('Invalid model reservation');
  return amount;
}
export class ModelSpendGuard{
  constructor(private config:{limitUsd:number;path:string}){}
  reserve(model:string,requestBytes:number,maxOutputTokens:number,_signal?:AbortSignal){
    const {limitUsd,path}=this.config;
    const reservedMicros=reservationMicros(model,requestBytes,maxOutputTokens,limitUsd);
    mkdirSync(dirname(path),{recursive:true});
    let lock:number;
    try{lock=openSync(path+'.lock','wx');}catch{throw new AppError('MODEL_BUDGET_BUSY','The model budget record is busy. Retry later; an interrupted request may need operator review.',503);}
    try{
      let used=0;
      if(existsSync(path)){
        const record=JSON.parse(readFileSync(path,'utf8')) as {reservedMicros?:unknown};
        if(!Number.isSafeInteger(record.reservedMicros)||(record.reservedMicros as number)<0)throw new Error('Invalid budget record');
        used=record.reservedMicros as number;
      }
      if(used+reservedMicros>Math.floor(limitUsd*1000000))throw new AppError('MODEL_BUDGET_EXHAUSTED','The approved model test budget is reserved. Further requests are disabled.',429);
      const temporary=path+'.'+randomUUID()+'.tmp';
      writeFileSync(temporary,JSON.stringify({reservedMicros:used+reservedMicros,updatedAt:new Date().toISOString(),basis:'conservative reservation, not measured billing'}),{mode:0o600});
      renameSync(temporary,path);
    }catch(error){if(error instanceof AppError)throw error;throw new AppError('MODEL_BUDGET_UNREADABLE','The model budget record could not be verified. No request was sent.',503);}
    finally{closeSync(lock);unlinkSync(path+'.lock');}
  }
}
