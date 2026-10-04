import {useEffect,useRef,useState} from 'react';
import {FlaskConical,Download,LoaderCircle} from 'lucide-react';
import {type ResearchResult} from '../../shared/contracts';
import {type BaselineComparison,type ComparisonCondition} from '../../shared/benchmark';
import {api} from '../api';
import {RequestGate} from '../request-gate';

function Condition({title,value}:{title:string;value:ComparisonCondition}){
  return <section className="baseline-condition"><h4>{title}</h4><p className="field-help">{value.verification==='unverified'?'Names and fit are unverified':'Names and citations checked against this Qloo run'} · {(value.durationMs/1000).toFixed(1)}s generation</p>
    {value.suggestions.length===0?<p>No suggestions returned.</p>:<ol>{value.suggestions.map((s,i)=><li key={s.entityId??s.name}><span className="baseline-number">{i+1}</span><div><strong>{s.name}</strong><p>{s.reason}</p><small>{s.evidenceIds.length?`${s.evidenceIds.length} source record(s)`:'No provider evidence'}</small></div></li>)}</ol>}
  </section>;
}

export function BaselinePanel({result}:{result:ResearchResult}){
  const [pair,setPair]=useState<BaselineComparison|null>(null),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const gate=useRef(new RequestGate());
  useEffect(()=>()=>gate.current.cancel(),[]);
  const eligible=result.mode==='live'&&result.candidates.length>0&&result.brief.rejectedIds.length===0;
  async function compare(){
    const request=gate.current.begin();setBusy(true);setError('');
    try{const value=await api.comparison(result.id,request.signal);if(gate.current.current(request.id))setPair(value);}
    catch(e){if(gate.current.current(request.id))setError((e as Error).message);}
    finally{if(gate.current.current(request.id))setBusy(false);}
  }
  function download(){if(!pair)return;const url=URL.createObjectURL(new Blob([JSON.stringify({comparison:pair,research:result},null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='sidecar-paired-comparison.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <section className="baseline-panel" aria-label="Qloo and LLM-only comparison">
    <div className="comparison-heading"><h3><FlaskConical size={18}/> What does cultural evidence add?</h3>{pair&&<button className="text-button" onClick={download}><Download size={14}/>Save both outputs</button>}</div>
    <p>Compare two fresh model outputs for this exact brief. One uses model knowledge alone; the other receives this run’s Qloo evidence.</p>
    {!pair&&<><button className="secondary-button" disabled={!eligible||busy} onClick={()=>void compare()}>{busy?<LoaderCircle size={15} className="spin"/>:<FlaskConical size={15}/>} {busy?'Generating both conditions':'Compare with an LLM-only run'}</button><p className="field-help">{!eligible?'Available after an initial live research run without exclusions. Illustrative examples are never measured results.':'Makes two model calls within the authorized budget. A saved pair is reused for this research run.'}</p></>}
    {error&&<p role="alert" className="inline-error">{error}</p>}
    {pair&&<><p className="baseline-method">{pair.model} · {new Date(pair.baseline.generatedAt).toLocaleString()} · {pair.maxOutputTokens} maximum output tokens per condition</p><div className="baseline-columns"><Condition title="LLM only" value={pair.baseline}/><Condition title="With Qloo evidence" value={pair.grounded}/></div><details><summary>Method and limitations</summary><ul>{pair.limitations.map(text=><li key={text}>{text}</li>)}</ul><p>Prior Qloo research: {(pair.discoveryDurationMs/1000).toFixed(1)} seconds. Prompt: {pair.promptVersion}.</p></details></>}
  </section>;
}
