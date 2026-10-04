import {z} from 'zod';
const Run=z.object({mode:z.literal('live'),candidates:z.array(z.object({evidenceIds:z.array(z.string())})),evidence:z.array(z.object({id:z.string(),source:z.literal('Qloo')})),durationMs:z.number().nonnegative()});
export function summarizeLive(input:unknown){
  const runs=z.array(Run).min(1).parse(input);
  let candidates=0,candidatesWithEvidence=0;
  for(const run of runs){const ids=new Set(run.evidence.map(e=>e.id));for(const candidate of run.candidates){candidates++;if(candidate.evidenceIds.length&&candidate.evidenceIds.every(id=>ids.has(id)))candidatesWithEvidence++;}}
  return {runs:runs.length,candidates,candidatesWithEvidence,evidenceCoverage:candidates?candidatesWithEvidence/candidates:null,meanDurationMs:runs.reduce((sum,run)=>sum+run.durationMs,0)/runs.length};
}
