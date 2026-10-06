import {randomUUID} from 'node:crypto';
import {z} from 'zod';
import {AppError,type Brief,type Candidate,type EvidenceRecord,type Resolution,type Reference} from '../../shared/contracts';
import {executeQloo} from './process';
import {ExpiringStore} from '../limits';
const Envelope=z.object({status:z.enum(['ok','empty','needs_input']),results:z.union([z.array(z.unknown()),z.record(z.string(),z.unknown())]),interpretation:z.record(z.string(),z.unknown()).optional(),resolution:z.unknown().optional()}).passthrough();
const Entity=z.object({entity_id:z.string().optional(),id:z.string().optional(),name:z.string(),type:z.string().optional(),subtype:z.string().optional(),affinity:z.number().finite().optional(),popularity:z.number().finite().optional(),properties:z.record(z.string(),z.unknown()).optional(),explainability:z.unknown().optional()}).passthrough();
export type QlooExecute=(operation:string,input:Record<string,unknown>,signal:AbortSignal)=>Promise<unknown>;
function envelope(raw:unknown){const parsed=Envelope.safeParse(raw);if(!parsed.success)throw new AppError('INVALID_PROVIDER_OUTPUT','Qloo returned an unexpected response.');return parsed.data;}
function object(raw:unknown):Record<string,unknown>{return raw!==null&&typeof raw==='object'&&!Array.isArray(raw)?raw as Record<string,unknown>:{};}
function string(raw:unknown,fallback=''){return typeof raw==='string'?raw.slice(0,2000):fallback;}
function list(data:z.infer<typeof Envelope>):unknown[]{if(!Array.isArray(data.results))throw new AppError('INVALID_PROVIDER_OUTPUT','Qloo returned an unexpected result list.');return data.results;}
function ref(raw:unknown):Reference|undefined{
  const item=Entity.safeParse(raw);if(!item.success)return;const id=item.data.entity_id??item.data.id;if(!id)return;
  const facts={...item.data.properties,...item.data};
  const subtitle=[facts.release_year,facts.address,facts.description??facts.short_description].filter(x=>typeof x==='string'||typeof x==='number').join(' · ').slice(0,500);
  return {id,name:item.data.name,type:item.data.type??'entity',...(subtitle?{subtitle}:{})};
}
// Bound provider metadata and remove credential-bearing keys before storage or export.
function redact(value:unknown,depth=0):unknown{
  if(depth>7)return '[truncated]';
  if(typeof value==='string'){
    const text=value.slice(0,4000);
    if(/^https?:\/\//i.test(text)){try{const url=new URL(text);url.username='';url.password='';for(const key of [...url.searchParams.keys()])if(/key|token|secret|auth|password/i.test(key))url.searchParams.delete(key);return url.href;}catch{return text;}}
    return text;
  }
  if(Array.isArray(value))return value.slice(0,50).map(x=>redact(x,depth+1));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).slice(0,50).filter(([key])=>!(/key|token|secret|auth|password|headers|cookie/i.test(key))).map(([key,val])=>[key,redact(val,depth+1)]));
  return value;
}
function metadata(data:z.infer<typeof Envelope>){return Object.fromEntries(['interpretation','provenance','explainability','execution','warnings','resolution'].filter(key=>data[key]!==undefined).map(key=>[key,redact(data[key])]));}
function warnings(data:z.infer<typeof Envelope>):string[]{return Array.isArray(data.warnings)?data.warnings.filter((x):x is string=>typeof x==='string').slice(0,20).map(x=>x.slice(0,1000)):[];}
export function parseResolution(raw:unknown):Resolution{
  const data=envelope(raw);
  if(data.status==='needs_input'){
    const issues=object(data.resolution).issues;
    const candidates=Array.isArray(issues)?issues.flatMap(issue=>{const values=object(issue).candidates;return Array.isArray(values)?values.flatMap(x=>{const r=ref(x);return r?[r]:[];}):[];}):[];
    return {status:candidates.length?'ambiguous':'not_found',candidates};
  }
  const outcomes=object(data.resolution).outcomes;
  const selected=Array.isArray(outcomes)?outcomes.map(x=>object(object(x).selected)):[];
  const candidates=list(data).flatMap(x=>{const r=ref(x);if(r&&r.type==='entity'){const match=selected.find(s=>s.id===r.id);if(typeof match?.type==='string')r.type=match.type;}return r?[r]:[];});
  return {status:candidates.length===1?'resolved':candidates.length?'ambiguous':'not_found',candidates};
}
export function parseCandidates(raw:unknown,evidenceId:string,rejectedIds:string[]):Candidate[]{
  const data=envelope(raw);
  if(data.status==='needs_input')throw new AppError('RESOLUTION_REQUIRED','Qloo needs a more specific reference or partner category. Refine your brief.',422);
  const seen=new Set(rejectedIds);
  return list(data).flatMap((raw,i)=>{
    const parsed=Entity.safeParse(raw);if(!parsed.success)throw new AppError('INVALID_PROVIDER_OUTPUT','A Qloo result was missing required fields.');
    const item=parsed.data,id=item.entity_id??item.id;
    if(!id)throw new AppError('INVALID_PROVIDER_OUTPUT','A Qloo result did not include an entity ID.');
    if(seen.has(id))return [];seen.add(id);
    return [{id,name:item.name,type:item.subtype??item.type??'place',address:string(item.properties?.address,'Address not supplied'),description:string(item.properties?.short_description??item.properties?.description,'Explore the underlying cultural evidence before proposing a partnership.'),providerRank:i+1,affinity:item.affinity,popularity:item.popularity,evidenceIds:[evidenceId],explanation:item.explainability??null}];
  });
}
export class QlooProvider{
  private discoveries=new ExpiringStore<{data:z.infer<typeof Envelope>;evidence:EvidenceRecord}>();
  private analyses=new ExpiringStore<EvidenceRecord>();
  constructor(private execute:QlooExecute=executeQloo){}
  async resolve(query:string,type:string|undefined,signal:AbortSignal){return parseResolution(await this.execute('describe',{entity:query,...type?{type}:{}},signal));}
  async tags(category:string,signal:AbortSignal):Promise<{id:string;name:string}[]>{
    const labels:Record<string,string>={cafe:'coffee shop',bookstore:'bookstore',venue:'music venue',restaurant:'restaurant'};
    const data=envelope(await this.execute('find_tags',{query:labels[category]??category,limit:5},signal));
    return list(data).flatMap(raw=>{const item=object(raw);if(typeof item.id!=='string'||typeof item.name!=='string')return [];const parts=item.id.split(':'),scope=parts[0]==='urn'&&parts[1]==='tag'?parts[3]==='place'?`place ${parts[2]}`:parts[2]?.replaceAll('_',' '):undefined;return [{id:item.id,name:scope?`${item.name} (${scope})`:item.name}];});
  }
  async discover(brief:Brief,categoryTag:string,signal:AbortSignal){
    const request={target_type:'place',signals:brief.references.map(x=>x.id),filter_location:brief.city,include_tags:[categoryTag],explain:true,limit:10};
    if(signal.aborted)throw new AppError('CANCELLED','Research was cancelled.',499);
    const key=JSON.stringify(request),cached=this.discoveries.get(key);
    if(cached)return {candidates:parseCandidates(cached.data,cached.evidence.id,brief.rejectedIds),evidence:structuredClone(cached.evidence),cacheHit:true};
    const data=envelope(await this.execute('recommend',request,signal));
    if(data.interpretation?.filter_location!==brief.city)throw new AppError('LOCATION_MISMATCH','The provider did not preserve the requested area. No results were used.');
    const evidence:EvidenceRecord={id:randomUUID(),source:'Qloo',operation:'recommend',fetchedAt:new Date().toISOString(),request,entityIds:[],metrics:{},details:data.results,metadata:metadata(data),limitations:['Location includes the provider’s surrounding-area matching; strict city boundaries are not asserted.','Affinity describes aggregate taste alignment, not actual customer overlap or sales.',...warnings(data)]};
    const candidates=parseCandidates(data,evidence.id,[]);evidence.entityIds=candidates.map(x=>x.id);
    this.discoveries.set(key,{data:structuredClone(data),evidence:structuredClone(evidence)});
    return {candidates:candidates.filter(c=>!brief.rejectedIds.includes(c.id)),evidence,cacheHit:false};
  }
  async analyze(operation:'rank'|'compare_audiences',brief:Brief,candidates:Candidate[],signal:AbortSignal):Promise<EvidenceRecord>{
    const request=operation==='rank'?{options:candidates.map(x=>x.id),option_type:'place',signals:brief.references.map(x=>x.id)}:{group_a:brief.references.map(x=>x.id),group_b:candidates.map(x=>x.id),target_type:'book',limit:5};
    if(signal.aborted)throw new AppError('CANCELLED','Research was cancelled.',499);
    const key=JSON.stringify({operation,request}),cached=this.analyses.get(key);if(cached)return structuredClone(cached);
    const data=envelope(await this.execute(operation,request,signal));
    if(data.status==='needs_input')throw new AppError('ANALYSIS_UNAVAILABLE','This comparison could not resolve all inputs.',422);
    if(operation==='rank')list(data);
    const record:EvidenceRecord={id:randomUUID(),source:'Qloo',operation,fetchedAt:new Date().toISOString(),request,entityIds:candidates.map(x=>x.id),metrics:{},details:data.results,metadata:metadata(data),limitations:['Analysis does not establish customer overlap or partner availability.',...warnings(data)]};
    this.analyses.set(key,structuredClone(record));return record;
  }
}
