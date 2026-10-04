import {QlooProvider} from '../server/qloo/provider';
if(!process.env.QLOO_API_KEY){console.error('LIVE CHECK NOT RUN: QLOO_API_KEY is missing. Configure the event key privately in .env. No fixture substitution occurred.');process.exitCode=2;}
else{
  try{
    const provider=new QlooProvider(),signal=AbortSignal.timeout(60000);
    const resolution=await provider.resolve('Haruki Murakami','author',signal);
    console.log(JSON.stringify({check:'entity-resolution',status:resolution.status,candidates:resolution.candidates},null,2));
    const tags=await provider.tags('cafe',signal);
    console.log(JSON.stringify({check:'partner-category',candidates:tags},null,2));
    if(resolution.status!=='resolved'||!tags.length){console.error('Live response needs manual resolution; discovery is not yet verified.');process.exitCode=1;}
    else console.log('Entity resolution and tag lookup responded. Complete discovery, revision, model planning and proposal checks in the browser before claiming live readiness.');
  }catch(error){console.error(error instanceof Error?error.message:'Live provider check failed.');process.exitCode=1;}
}
