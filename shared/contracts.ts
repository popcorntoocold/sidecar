import {z} from 'zod';
export const ReferenceSchema=z.object({id:z.string().min(1).max(150),name:z.string().trim().min(1).max(200),type:z.string().min(1).max(50),subtitle:z.string().max(500).optional()}).strict();
export const BriefSchema=z.object({
  city:z.string().trim().min(2).max(120),category:z.enum(['cafe','bookstore','venue','restaurant']),
  objective:z.string().trim().min(5).max(500),
  references:z.array(ReferenceSchema).min(3).max(5).refine(xs=>new Set(xs.map(x=>x.id)).size===xs.length,'Choose distinct references.'),
  rejectedIds:z.array(z.string().min(1).max(150)).max(50).default([])
}).strict();
export type Reference=z.infer<typeof ReferenceSchema>;
export type Brief=z.infer<typeof BriefSchema>;
export type Resolution={status:'resolved'|'ambiguous'|'not_found';candidates:Reference[]};
export type EvidenceRecord={id:string;source:'Qloo'|'Illustrative';operation:string;fetchedAt:string;request:Record<string,unknown>;entityIds:string[];metrics:Record<string,number>;details:unknown;metadata?:Record<string,unknown>;limitations:string[]};
export type Candidate={id:string;name:string;type:string;address:string;description:string;providerRank:number;affinity?:number;popularity?:number;evidenceIds:string[];explanation:unknown};
export type AgentEvent={action:string;detail:string;status:'complete'|'warning';timestamp:string};
export type ResearchResult={id:string;mode:'live'|'preview';brief:Brief;candidates:Candidate[];evidence:EvidenceRecord[];warnings:string[];events:AgentEvent[];durationMs:number};
export const ProposalTextSchema=z.object({
  title:z.string().min(1).max(160),concept:z.string().min(1).max(1500),
  valueHypothesis:z.string().min(1).max(1000),agenda:z.array(z.string().max(500)).min(1).max(6),
  verificationQuestions:z.array(z.string().max(500)).min(1).max(8),
  measurementPlan:z.string().min(1).max(1000),evidenceIds:z.array(z.string()).min(1).max(20)
}).strict();
export type ProposalText=z.infer<typeof ProposalTextSchema>;
export type Proposal=ProposalText & {candidate:Candidate;mode:'live'|'preview';evidence:EvidenceRecord[];brief:Brief};
export class AppError extends Error {
  constructor(public code:string,message:string,public status=502,public retryable=false){super(message);this.name='AppError';}
}
export function safeWebUrl(value:unknown):string|undefined{
  if(typeof value!=='string')return;
  try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:undefined;}catch{return;}
}
