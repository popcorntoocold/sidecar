import {type ResearchResult,type Revision} from '../shared/contracts';

export function describeRevision(previous:ResearchResult,next:ResearchResult):Revision{
  const changes:string[]=[];
  for(const [key,label] of [['city','Area'],['category','Partner category'],['objective','Event objective'],['businessType','Business type'],['businessName','Business name']] as const){
    if(previous.brief[key]!==next.brief[key])changes.push(`${label}: ${previous.brief[key]||'not set'} → ${next.brief[key]||'not set'}.`);
  }
  const oldReferences=new Set(previous.brief.references.map(r=>r.id)),newReferences=new Set(next.brief.references.map(r=>r.id));
  for(const ref of next.brief.references)if(!oldReferences.has(ref.id))changes.push(`Added cultural reference: ${ref.name}.`);
  for(const ref of previous.brief.references)if(!newReferences.has(ref.id))changes.push(`Removed cultural reference: ${ref.name}.`);
  for(const id of next.brief.rejectedIds)if(!previous.brief.rejectedIds.includes(id))changes.push(`Excluded ${previous.candidates.find(c=>c.id===id)?.name??'a partner'} at your request. No reason was inferred.`);
  if(previous.brief.rejectedIds.some(id=>!next.brief.rejectedIds.includes(id)))changes.push('One or more earlier exclusions were removed.');
  const priorEvidence=new Set(previous.evidence.map(e=>e.id));
  return {previousRunId:previous.id,changes:changes.length?changes:['The brief is unchanged. Research was requested again.'],reusedEvidenceIds:next.evidence.filter(e=>priorEvidence.has(e.id)).map(e=>e.id),newEvidenceIds:next.evidence.filter(e=>!priorEvidence.has(e.id)).map(e=>e.id),addedPartners:next.candidates.filter(c=>!previous.candidates.some(p=>p.id===c.id)).map(c=>c.name),removedPartners:previous.candidates.filter(c=>!next.candidates.some(p=>p.id===c.id)).map(c=>c.name)};
}
