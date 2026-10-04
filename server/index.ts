import {resolve} from 'node:path';
import {existsSync} from 'node:fs';
import {createApp} from './app';
import {runtimeConfig} from './config';
const config=runtimeConfig();
const app=await createApp();
if(config.production){
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
await app.listen({port:config.port,host:config.host});
console.log(`Sidecar ready at http://${config.host}:${config.port}`);
for(const signal of ['SIGINT','SIGTERM'] as const)process.on(signal,()=>void app.close());
