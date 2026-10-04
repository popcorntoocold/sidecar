import Fastify from 'fastify';
import rateLimit from '@fastify/rate-limit';
import {z} from 'zod';
import {AppError,BriefSchema,type ResearchResult,type Reference} from '../shared/contracts';
import {QlooProvider} from './qloo/provider';
import {OpenAIModel} from './model';
import {runResearch,buildProposal} from './agent';
import {ExpiringStore,RunLimiter} from './limits';
import {createPreview,previewProposal} from './preview';
export async function createApp(){
  const app=Fastify({logger:false,bodyLimit:32768,requestTimeout:120000});
  await app.register(rateLimit,{max:60,timeWindow:'1 minute'});
  const provider=new QlooProvider(),model=new OpenAIModel();
  const runs=new ExpiringStore<ResearchResult>();const references=new ExpiringStore<Reference>(3600000,2000);const tags=new ExpiringStore<{id:string;name:string}[]>(3600000,8);
  const limits=new RunLimiter({globalBudget:Number(process.env.QLOO_HOURLY_WORKFLOW_LIMIT)||30,clientBudget:20,concurrency:2});
  app.setErrorHandler((error,request,reply)=>{
    const status=error instanceof AppError?error.status:error instanceof z.ZodError?400:(error as {statusCode?:number}).statusCode??500;
    const message=error instanceof AppError?error.message:error instanceof z.ZodError?'Check the brief fields and choose three to five distinct references.':status===429?'Too many requests. Try again shortly.':status===413?'This request is too large.':'The request could not be completed.';
    reply.code(status).send({code:error instanceof AppError?error.code:status===400?'INVALID_INPUT':'REQUEST_FAILED',message,retryable:error instanceof AppError?error.retryable:false});
  });
  app.addHook('onSend',async(_request,reply,payload)=>{
    reply.header('X-Content-Type-Options','nosniff').header('Referrer-Policy','no-referrer').header('Cache-Control','no-store');return payload;
  });
  function requireQloo(){if(!process.env.QLOO_API_KEY)throw new AppError('QLOO_NOT_CONFIGURED','Live research needs the event-issued Qloo API key. Explore the labeled example while access is being configured.',503);}
  app.get('/api/status',async()=>({qlooConfigured:Boolean(process.env.QLOO_API_KEY),modelConfigured:model.configured,liveReady:Boolean(process.env.QLOO_API_KEY)&&model.configured}));
  app.get('/api/preview',async(request)=>{const {exclude}=z.object({exclude:z.string().max(2000).optional()}).parse(request.query);const run=createPreview(exclude?.split(',').filter(Boolean)??[]);runs.set(run.id,run);return run;});
  app.post('/api/resolve',async(request,reply)=>{
    const body=z.object({query:z.string().trim().min(2).max(200),type:z.enum(['book','author','artist','movie','brand']).optional()}).strict().parse(request.body);requireQloo();
    const release=limits.acquire(request.ip,1),ac=new AbortController();reply.raw.on('close',()=>ac.abort());
    try{const result=await provider.resolve(body.query,body.type,ac.signal);result.candidates.forEach(r=>references.set(r.id,r));return result;}finally{release();}
  });
  app.get('/api/tags',async(request,reply)=>{
    const {category}=z.object({category:z.enum(['cafe','bookstore','venue','restaurant'])}).parse(request.query);requireQloo();
    const cached=tags.get(category);if(cached)return cached;
    const release=limits.acquire(request.ip,1),ac=new AbortController();reply.raw.on('close',()=>ac.abort());
    try{const result=await provider.tags(category,ac.signal);tags.set(category,result);return result;}finally{release();}
  });
  app.post('/api/research',async(request,reply)=>{
    const body=z.object({brief:BriefSchema,categoryTag:z.string().min(1).max(200)}).strict().parse(request.body);requireQloo();
    if(!model.configured)throw new AppError('MODEL_NOT_CONFIGURED','Configure the server’s model key and model name to enable the research agent.',503);
    const canonical=body.brief.references.map(r=>references.get(r.id));
    if(canonical.some(r=>!r)||!tags.get(body.brief.category)?.some(t=>t.id===body.categoryTag))throw new AppError('RESOLUTION_REQUIRED','Resolve your cultural references and confirm a partner category before researching.',422);
    const brief={...body.brief,references:canonical as Reference[]};
    const release=limits.acquire(request.ip,8),ac=new AbortController();const timer=setTimeout(()=>ac.abort(),110000);reply.raw.on('close',()=>ac.abort());
    try{const run=await runResearch(brief,body.categoryTag,{provider,model},ac.signal);runs.set(run.id,run);return run;}finally{clearTimeout(timer);release();}
  });
  app.post('/api/proposal',async(request,reply)=>{
    const {runId,candidateId}=z.object({runId:z.string().max(100),candidateId:z.string().max(150)}).strict().parse(request.body);
    const run=runs.get(runId);if(!run)throw new AppError('RUN_EXPIRED','This research run expired. Run the brief again.',404);
    if(run.mode==='preview')return previewProposal(run,candidateId);
    const release=limits.acquire(request.ip,1),ac=new AbortController();reply.raw.on('close',()=>ac.abort());
    try{return await buildProposal(run,candidateId,model,ac.signal);}finally{release();}
  });
  return app;
}
