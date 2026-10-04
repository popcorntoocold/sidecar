import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {createApp} from './app';
const app=await createApp();
const production=process.env.NODE_ENV==='production';
if(production&&!Number(process.env.QLOO_HOURLY_WORKFLOW_LIMIT))throw new Error('Set QLOO_HOURLY_WORKFLOW_LIMIT from the issued event quota before public launch.');
if(production){
  if(!existsSync(resolve('dist/index.html')))throw new Error('Build the app before starting production.');
  const {default:staticPlugin}=await import('@fastify/static');await app.register(staticPlugin,{root:resolve('dist')});
}else{
  const {createServer}=await import('vite');const vite=await createServer({server:{middlewareMode:true},appType:'spa'});
  app.addHook('onRequest',async(request,reply)=>{
    if(request.url.startsWith('/api/'))return;
    reply.hijack();vite.middlewares(request.raw,reply.raw,()=>{reply.raw.statusCode=404;reply.raw.end('Not found');});
  });
  app.addHook('onClose',async()=>{await vite.close();});
}
await app.listen({port:Number(process.env.PORT)||4310,host:process.env.HOST??'127.0.0.1'});
console.log(`Sidecar ready at http://${process.env.HOST??'127.0.0.1'}:${process.env.PORT??4310}`);
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>void app.close());
