import {randomUUID} from 'node:crypto';
import {setTimeout as delay} from 'node:timers/promises';
import {z} from 'zod';
import {AppError,ProposalTextSchema,type Brief,type Candidate,type EvidenceRecord,type ResearchResult,type AgentEvent,type Proposal} from '../shared/contracts';
const ActionSchema=z.object({action:z.enum(['rank','compare','finish'])}).strict();
export type AgentContext={brief:Brief;candidates:Candidate[];evidence:EvidenceRecord[];events:AgentEvent[];remainingCalls:number};
export type ModelClient={next(context:AgentContext,signal?:AbortSignal):Promise<unknown>;proposal?(context:unknown,signal:AbortSignal):Promise<unknown>};
export type ResearchProvider={discover(brief:Brief,tag:string,signal:AbortSignal):Promise<{candidates:Candidate[];evidence:EvidenceRecord;cacheHit?:boolean}>;analyze(operation:'rank'|'compare_audiences',brief:Brief,candidates:Candidate[],signal:AbortSignal):Promise<EvidenceRecord>};
export function assertEvidenceIds(ids:string[],records:{id:string}[]){
  const known=new Set(records.map(x=>x.id));if(ids.some(id=>!known.has(id)))throw new AppError('UNSUPPORTED_CITATION','The proposal contained an unsupported evidence reference. Please retry.');
}
function checkCancelled(signal:AbortSignal){if(signal.aborted)throw new AppError('CANCELLED','Research was cancelled.',499);}
export async function runResearch(brief:Brief,tag:string,deps:{provider:ResearchProvider;model:ModelClient},signal:AbortSignal):Promise<ResearchResult>{
  checkCancelled(signal);const started=Date.now();
  const events:AgentEvent[]=[];const warnings:string[]=[];
  const event=(action:string,detail:string,status:'complete'|'warning'='complete')=>events.push({action,detail,status,timestamp:new Date().toISOString()});
  let used=0;const counts=new Map<string,number>();
  async function invoke<T>(action:string,operation:()=>Promise<T>):Promise<T>{
    for(let attempt=0;;attempt++){
      checkCancelled(signal);
      if(used>=8||(counts.get(action)??0)>=2)throw new AppError('TOOL_BUDGET','Research reached its tool limit.');
      used++;counts.set(action,(counts.get(action)??0)+1);
      try{return await operation();}catch(error){
        checkCancelled(signal);
        if(attempt>0||!(error instanceof AppError)||!error.retryable||used>=8||(counts.get(action)??0)>=2)throw error;
        event(`Retry ${action}`,'A transient provider failure will be retried once.','warning');
        try{await delay(250,undefined,{signal});}catch{checkCancelled(signal);throw error;}
      }
    }
  }
  const discovery=await invoke('discovery',()=>deps.provider.discover(brief,tag,signal));checkCancelled(signal);
  const candidates=discovery.candidates.slice(0,5),evidence=[discovery.evidence];
  const addProviderWarnings=(record:EvidenceRecord)=>{const values=record.metadata?.warnings;if(Array.isArray(values))for(const item of values)if(typeof item==='string'&&!warnings.includes(item))warnings.push(item);};
  addProviderWarnings(discovery.evidence);
  event(discovery.cacheHit?'Reuse discovery':'Discover partners',discovery.cacheHit?`Reused Qloo discovery from ${discovery.evidence.fetchedAt}. The geographic filter, cultural signals and category are unchanged; current exclusions were applied.`:`Qloo returned ${discovery.candidates.length} candidates for ${brief.city} and its surrounding area.`);
  while(candidates.length&&used<8){
    checkCancelled(signal);
    try{
      const parsed=ActionSchema.safeParse(await deps.model.next({brief,candidates,evidence,events,remainingCalls:8-used},signal));
      checkCancelled(signal);
      if(!parsed.success){warnings.push('The planner returned an unsupported action. Verified discovery results are retained.');break;}
      const {action}=parsed.data;if(action==='finish')break;
      const count=counts.get(action)??0;if(count>=2){warnings.push('Repeated analysis stopped at the call limit.');break;}
      const operation=action==='compare'?'compare_audiences':'rank';
      const record=await invoke(action,()=>deps.provider.analyze(operation,brief,candidates,signal));checkCancelled(signal);
      if(!evidence.some(e=>e.id===record.id))evidence.push(record);
      addProviderWarnings(record);
      // Analysis supplements discovery. Unverified cross-request score arithmetic never changes ordering.
      candidates.forEach(c=>c.evidenceIds=[...new Set([...c.evidenceIds,record.id])]);
      event(action==='compare'?'Compare cultural audiences':'Evaluate shortlist','Additional Qloo evidence is available in the research record. Discovery order is preserved.');
    }catch(error){
      checkCancelled(signal);
      warnings.push('Optional analysis was unavailable. The original Qloo discovery evidence is retained.');
      event('Optional analysis','Unavailable; discovery retained.','warning');break;
    }
  }
  if(used>=8)warnings.push('Research stopped at its tool budget.');
  event('Shortlist ready',`${candidates.length} candidates are ready for your review. Partner interest and availability need confirmation.`);
  return {id:randomUUID(),mode:'live',brief,candidates,evidence,warnings,events,durationMs:Date.now()-started};
}
export async function buildProposal(result:ResearchResult,candidateId:string,model:ModelClient,signal:AbortSignal):Promise<Proposal>{
  const candidate=result.candidates.find(c=>c.id===candidateId);if(!candidate)throw new AppError('UNKNOWN_CANDIDATE','Select a partner from this research run.',400);
  const evidence=result.evidence.filter(e=>candidate.evidenceIds.includes(e.id));
  if(!model.proposal)throw new AppError('MODEL_NOT_CONFIGURED','Proposal generation needs a configured model.',503);
  const parsed=ProposalTextSchema.safeParse(await model.proposal({brief:result.brief,candidate,evidence},signal));
  if(!parsed.success)throw new AppError('INVALID_PROPOSAL','The generated proposal did not meet the expected format. Retry generation.');
  assertEvidenceIds(parsed.data.evidenceIds,evidence);
  return {...parsed.data,candidate,mode:result.mode,evidence,brief:result.brief};
}
