import {ArrowLeft,Printer,Download,Check,Info} from 'lucide-react';
import {type Proposal} from '../../shared/contracts';

function EditableText({label,value,onChange,maxLength=1000}:{label:string;value:string;onChange:(value:string)=>void;maxLength?:number}){
  return <><textarea aria-label={label} className="editable-prose no-print" value={value} maxLength={maxLength} onChange={e=>onChange(e.target.value)}/><p className="print-only printed-prose">{value}</p></>;
}

export function ProposalView({proposal,onBack,onChange}:{proposal:Proposal;onBack:()=>void;onChange:(p:Proposal)=>void}){
  function exportJson(){const blob=new Blob([JSON.stringify(proposal,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='sidecar-collaboration-brief.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  const update=(partial:Partial<Proposal>)=>onChange({...proposal,...partial});
  return <section className="proposal-panel">
    <div className="proposal-toolbar no-print"><button className="text-button" onClick={onBack}><ArrowLeft size={15}/>Back to partners</button><div><button className="secondary-button" onClick={exportJson}><Download size={15}/>Evidence</button><button className="primary-button" onClick={()=>window.print()}><Printer size={15}/>Print brief</button></div></div>
    <div className="proposal-document">
      <div className="document-top"><span className="document-wordmark">sidecar</span><span>Collaboration brief</span></div>
      <div className="proposal-label">{proposal.mode==='preview'?'Illustrative proposal':'Proposed collaboration'} / {proposal.brief.city}</div>
      <h1 className="print-only">{proposal.title}</h1><textarea className="editable-title no-print" aria-label="Proposal title" value={proposal.title} maxLength={160} onChange={e=>update({title:e.target.value})}/>
      <div className="partner-byline">Your business <span>+</span> {proposal.candidate.name}</div>
      <div className="notice"><Info size={15}/><span>{proposal.mode==='preview'?'This is a fictional example, with no live Qloo evidence.':'This proposal is generated from cultural evidence. Partner interest, costs, capacity and availability are not verified.'}</span></div>
      <h2>The idea</h2><EditableText label="The idea" value={proposal.concept} maxLength={1500} onChange={concept=>update({concept})}/>
      <h2>Why explore it</h2><EditableText label="Why explore it" value={proposal.valueHypothesis} onChange={valueHypothesis=>update({valueHypothesis})}/>
      <h2>A possible evening</h2><ol className="agenda">{proposal.agenda.map((item,i)=><li key={i}><span>{i+1}</span><EditableText label={`Agenda step ${i+1}`} value={item} maxLength={500} onChange={value=>update({agenda:proposal.agenda.map((old,index)=>index===i?value:old)})}/></li>)}</ol>
      <h2>Before you commit</h2><ul className="verification-list">{proposal.verificationQuestions.map((q,i)=><li key={i}><Check size={16}/><EditableText label={`Verification question ${i+1}`} value={q} maxLength={500} onChange={value=>update({verificationQuestions:proposal.verificationQuestions.map((old,index)=>index===i?value:old)})}/></li>)}</ul>
      <h2>How to learn from it</h2><EditableText label="How to learn from it" value={proposal.measurementPlan} onChange={measurementPlan=>update({measurementPlan})}/>
      <div className="document-sources"><h2>Evidence appendix</h2>{proposal.evidence.map(e=><div key={e.id}><strong>{e.source} / {e.operation}</strong><p>Retrieved {new Date(e.fetchedAt).toLocaleString()}. Record: {e.id}</p>{e.limitations.map(l=><p key={l}>{l}</p>)}<details><summary>Request and source details</summary><pre>{JSON.stringify({request:e.request,details:e.details,metadata:e.metadata},null,2)}</pre></details></div>)}</div>
      <div className="document-footer">Prepared with Sidecar. An invitation to investigate, not a confirmed partnership.</div>
    </div>
  </section>;
}
