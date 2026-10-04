import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {AppError,type Brief,type Candidate,type EvidenceRecord,type Resolution,type Reference} from '../../shared/contracts';
import {executeQloo} from './process';
const Envelope=z.object({status:z.enum(['ok','empty','needs_input']),results:z.array(z.unknown()),interpretation:z.record(z.string(),z.unknown()).optional(),resolution:z.unknown().optional()}).passthrough();
const Entity=z.object({entity_id:z.string().optional(),id:z.string().optional(),name:z.string(),type:z.string().optional(),affinity:z.number().finite().optional(),popularity:z.number().finite().optional(),properties:z.record(z.string(),z.unknown()).optional(),explainability:z.unknown().optional()}).passthrough();
export type QlooExecute=(operation:string,input:Record<string,unknown>,signal:AbortSignal)=>Promise<unknown>;
function envelope(raw:unknown){const parsed=Envelope.safeParse(raw);if(!parsed.success)throw new AppError('INVALID_PROVIDER_OUTPUT','Qloo returned an unexpected response.');return parsed.data;}
function object(raw:unknown):Record<string,unknown>{return raw!==null&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};}
function string(raw:unknown,fallback=''){return typeof raw==='string'?raw.slice(0,2000):fallback;}
function ref(raw:unknown):Reference|undefined{const item=Entity.safeParse(raw);if(!item.success)return;const id=item.data.entity_id??item.data.id;if(!id)return;return {id,name:item.data.name,type:item.data.type??'entity'};}
export function parseResolution(raw:unknown):Resolution{
  const data=envelope(raw);
  if(data.status==='needs_input'){
    const issues=object(data.resolution).issues;
    const candidates=Array.isArray(issues)?issues.flatMap(issue=>{const values=object(issue).candidates;return Array.isArray(values)?values.flatMap(x=>{const r=ref(x);return r?[r]:[];}):[];}):[];
    return {status:candidates.length?'ambiguous':'not_found',candidates};
  }
  const candidates=data.results.flatMap(x=>{const r=ref(x);return r?[r]:[];});
  return {status:candidates.length===1?'resolved':candidates.length?'ambiguous':'not_found',candidates};
}
export function parseCandidates(raw:unknown,evidenceId:string,rejectedIds:string[]):Candidate[]{
  const data=envelope(raw);
  if(data.status==='needs_input')throw new AppError('RESOLUTION_REQUIRED','Qloo needs a more specific reference or partner category. Refine your brief.',422);
  const seen=new Set(rejectedIds);
  return data.results.flatMap((raw,i)=>{
    const parsed=Entity.safeParse(raw);if(!parsed.success)throw new AppError('INVALID_PROVIDER_OUTPUT','A Qloo result was missing required fields.');
    const item=parsed.data,id=item.entity_id??item.id;
    if(!id)throw new AppError('INVALID_PROVIDER_OUTPUT','A Qloo result did not include an entity ID.');
    if(seen.has(id))return [];seen.add(id);
    return [{id,name:item.name,type:item.type??'place',address:string(item.properties?.address,'Address not supplied'),description:string(item.properties?.short_description??item.properties?.description,'Explore the underlying cultural evidence before proposing a partnership.'),providerRank:i+1,affinity:item.affinity,popularity:item.popularity,evidenceIds:[evidenceId],explanation:item.explainability??null}];
  });
}
export class QlooProvider{
  constructor(private execute:QlooExecute=executeQloo){}
  async resolve(query:string,type:string|undefined,signal:AbortSignal){return parseResolution(await this.execute('describe',{entity:query,...type?{type}:{}},signal));}
  async tags(category:string,signal:AbortSignal):Promise<{id:string;name:string}[]>{
    const labels:Record<string,string>={cafe:'coffee shop',bookstore:'bookstore',venue:'music venue',restaurant:'restaurant'};
    const data=envelope(await this.execute('find_tags',{query:labels[category]??category,limit:5},signal));
    return data.results.flatMap(raw=>{const item=object(raw);return typeof item.id==='string'&&typeof item.name==='string'?[{id:item.id,name:item.name}]:[];});
  }
  async discover(brief:Brief,categoryTag:string,signal:AbortSignal){
    const request={target_type:'place',signals:brief.references.map(x=>x.id),filter_location:brief.city,include_tags:[categoryTag],explain:true,limit:10};
    const data=envelope(await this.execute('recommend',request,signal));
    if(data.interpretation?.filter_location!==brief.city)throw new AppError('LOCATION_MISMATCH','The provider did not preserve the requested area. No results were used.');
    const evidence:EvidenceRecord={id:randomUUID(),source:'Qloo',operation:'recommend',fetchedAt:new Date().toISOString(),request,entityIds:[],metrics:{},details:data.results,limitations:['Location includes the provider’s surrounding-area matching; strict city boundaries are not asserted.','Affinity describes aggregate taste alignment, not actual customer overlap or sales.']};
    const candidates=parseCandidates(data,evidence.id,brief.rejectedIds);evidence.entityIds=candidates.map(x=>x.id);
    return {candidates,evidence};
  }
  async analyze(operation:'rank'|'compare_audiences',brief:Brief,candidates:Candidate[],signal:AbortSignal):Promise<EvidenceRecord>{
    const request=operation==='rank'?{options:candidates.map(x=>x.id),option_type:'place',signals:brief.references.map(x=>x.id)}:{group_a:brief.references.map(x=>x.id),group_b:candidates.map(x=>x.id),target_type:'book',limit:5};
    const data=envelope(await this.execute(operation,request,signal));
    if(data.status==='needs_input')throw new AppError('ANALYSIS_UNAVAILABLE','This comparison could not resolve all inputs.',422);
    return {id:randomUUID(),source:'Qloo',operation,fetchedAt:new Date().toISOString(),request,entityIds:candidates.map(x=>x.id),metrics:{},details:data.results,limitations:['Analysis does not establish customer overlap or partner availability.']};
  }
}
