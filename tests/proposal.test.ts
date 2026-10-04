import {it,expect} from 'vitest';
import {buildProposal} from '../server/agent';
import {createPreview,previewProposal} from '../server/preview';
it('rejects a model proposal that cites fabricated evidence',async()=>{
  const run=createPreview(),candidate=run.candidates[0];const p=previewProposal(run,candidate.id);
  const {candidate:ignored,mode,evidence,brief,...text}=p;
  await expect(buildProposal(run,candidate.id,{next:async()=>({action:'finish'}),proposal:async()=>({...text,evidenceIds:['fake']})},new AbortController().signal)).rejects.toMatchObject({code:'UNSUPPORTED_CITATION'});
});
it('does not accept a partner outside the current research run',async()=>{
  await expect(buildProposal(createPreview(),'unknown',{next:async()=>({action:'finish'})},new AbortController().signal)).rejects.toMatchObject({code:'UNKNOWN_CANDIDATE'});
});
