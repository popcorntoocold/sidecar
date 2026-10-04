import {it,expect} from 'vitest';
import {executeQloo, runJsonProcess} from '../server/qloo/process';
it('rejects unsupported commands before launching', async () => {
  await expect(executeQloo('build',{},new AbortController().signal)).rejects.toMatchObject({code:'INVALID_TOOL'});
});
it('returns an explicit missing-credential error', async () => {
  await expect(executeQloo('describe',{entity:'test'},new AbortController().signal,{apiKey:''})).rejects.toMatchObject({code:'QLOO_NOT_CONFIGURED'});
});
it('passes shell characters as plain stdin data',async()=>{
  const input={query:'$(Write-Output nope); & echo no'};
  const result=await runJsonProcess(['-e','let d="";process.stdin.on("data",c=>d+=c);process.stdin.on("end",()=>process.stdout.write(d))'],input,{timeoutMs:1000});
  expect(result).toEqual(input);
});
it('terminates a stalled child',async()=>{
  await expect(runJsonProcess(['-e','setInterval(()=>{},1000)'],{}, {timeoutMs:70})).rejects.toMatchObject({code:'PROVIDER_TIMEOUT'});
});
it('does not expose provider stderr or secrets',async()=>{
  await expect(runJsonProcess(['-e','process.stderr.write("SECRET");process.exit(1)'],{},{})).rejects.toMatchObject({message:'The provider request failed.'});
});
it('rejects oversized input before spawning',async()=>{
  await expect(runJsonProcess(['-e','process.stdout.write("{}")'],{text:'x'.repeat(40000)},{})).rejects.toMatchObject({code:'INPUT_TOO_LARGE'});
});
