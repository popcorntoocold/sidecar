import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {AppError} from '../../shared/contracts';
const allowed=new Set(['describe','recommend','rank','compare_audiences','find_tags']);
type Options={timeoutMs?:number;signal?:AbortSignal;env?:NodeJS.ProcessEnv;maxOutput?:number};
export function runJsonProcess(args:string[],input:unknown,options:Options={}):Promise<unknown>{
  const serialized=JSON.stringify(input);
  if(Buffer.byteLength(serialized)>32768)return Promise.reject(new AppError('INPUT_TOO_LARGE','The request is too large.',400));
  if(options.signal?.aborted)return Promise.reject(new AppError('CANCELLED','Research was cancelled.',499));
  return new Promise((resolve,reject)=>{
    let output='',bytes=0,settled=false;
    const child=spawn(process.execPath,args,{shell:false,windowsHide:true,stdio:['pipe','pipe','pipe'],env:options.env??process.env});
    const finish=(error?:Error,result?:unknown)=>{
      if(settled)return;settled=true;clearTimeout(timer);options.signal?.removeEventListener('abort',cancel);
      if(error){child.kill();reject(error);}else resolve(result);
    };
    const cancel=()=>finish(new AppError('CANCELLED','Research was cancelled.',499));
    const timer=setTimeout(()=>finish(new AppError('PROVIDER_TIMEOUT','The provider took too long. Try again.',504,true)),options.timeoutMs??30000);
    options.signal?.addEventListener('abort',cancel,{once:true});
    child.stdout.on('data',chunk=>{
      bytes+=chunk.length;
      if(bytes>(options.maxOutput??2*1024*1024)){finish(new AppError('PROVIDER_OUTPUT_LIMIT','The provider response was too large.'));return;}
      output+=chunk.toString();
    });
    // Consume stderr without reflecting provider-controlled text or credentials.
    child.stderr.resume();
    child.stdin.on('error',()=>finish(new AppError('PROVIDER_FAILURE','The provider request failed.')));
    child.on('error',()=>finish(new AppError('PROVIDER_UNAVAILABLE','The provider could not be started.')));
    child.on('close',code=>{
      if(settled)return;
      if(code!==0){
        let providerCode='';try{providerCode=JSON.parse(output)?.error?.code??'';}catch{}
        if(providerCode==='QLOO_AUTH')return finish(new AppError('QLOO_AUTH','Qloo rejected the configured credential.',503));
        if(/RATE|QUOTA/.test(providerCode))return finish(new AppError('QLOO_RATE_LIMIT','Qloo is at its request limit. Try again later.',429,true));
        return finish(new AppError('PROVIDER_FAILURE','The provider request failed.'));
      }
      try{finish(undefined,JSON.parse(output));}catch{finish(new AppError('INVALID_PROVIDER_OUTPUT','The provider returned an unreadable response.'));}
    });
    child.stdin.end(serialized);
  });
}
export function qlooEnvironment(apiKey:string):NodeJS.ProcessEnv{
  const env:NodeJS.ProcessEnv={QLOO_API_KEY:apiKey,QLOO_BASE_URL:'https://hackathon.api.qloo.com',QLOO_TRUSTED_BASE_URL:'https://hackathon.api.qloo.com'};
  for(const key of ['PATH','SystemRoot','SYSTEMROOT','TEMP','TMP','HOME','USERPROFILE'])if(process.env[key])env[key]=process.env[key];
  return env;
}
export async function executeQloo(operation:string,input:unknown,signal:AbortSignal,config:{apiKey?:string}={}):Promise<unknown>{
  if(!allowed.has(operation))throw new AppError('INVALID_TOOL','This operation is not allowed.',400);
  const apiKey=config.apiKey??process.env.QLOO_API_KEY;
  if(!apiKey)throw new AppError('QLOO_NOT_CONFIGURED','Live research needs the event-issued Qloo API key. You can explore the labeled example meanwhile.',503);
  const harnessBin=join(dirname(fileURLToPath(import.meta.resolve('@qloo/qloo-harness'))),'bin.js');
  return runJsonProcess([harnessBin,'exec',operation],input,{signal,env:qlooEnvironment(apiKey)});
}
