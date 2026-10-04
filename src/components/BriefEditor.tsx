import {useState,useRef,useEffect} from 'react';
import {MapPin,Plus,X,Search,ArrowRight,LoaderCircle,BookOpen,Music2,Film} from 'lucide-react';
import {type Brief,type Reference} from '../../shared/contracts';
import {api} from '../api';
import {RequestGate} from '../request-gate';
export const freshBrief=():Brief=>({city:'Austin, Texas',category:'cafe',objective:'Bring new people into our independent bookstore with a thoughtful neighborhood event.',references:[],rejectedIds:[]});
export function BriefEditor({brief,setBrief,busy,onResearch,onExample,preview}:{brief:Brief;setBrief:(b:Brief)=>void;busy:boolean;onResearch:(tag:string)=>void;onExample:()=>void;preview:boolean}){
  const [query,setQuery]=useState(''),[type,setType]=useState('author'),[matches,setMatches]=useState<Reference[]>([]),[error,setError]=useState(''),[resolving,setResolving]=useState(false);
  const [tags,setTags]=useState<{id:string;name:string}[]>([]),[tag,setTag]=useState('');
  const gate=useRef(new RequestGate());
  useEffect(()=>()=>gate.current.cancel(),[]);
  useEffect(()=>{setTags([]);setTag('');setMatches([]);setError('');gate.current.cancel();setResolving(false);},[brief.category,preview]);
  const change=(partial:Partial<Brief>)=>setBrief({...brief,...partial});
  async function search(){
    if(query.trim().length<2){setError('Enter at least two characters to find a reference.');return;}
    const job=gate.current.begin();setResolving(true);setError('');setMatches([]);
    try{const result=await api.resolve(query,type,job.signal);if(!gate.current.current(job.id))return;setMatches(result.candidates);if(!result.candidates.length)setError('No match found. Try a more specific name.');}
    catch(e){if(gate.current.current(job.id))setError((e as Error).message);}finally{if(gate.current.current(job.id))setResolving(false);}
  }
  function add(ref:Reference){if(brief.references.some(x=>x.id===ref.id)){setError('That reference is already in your brief.');return;}if(brief.references.length>=5)return;change({references:[...brief.references,ref]});setMatches([]);setQuery('');}
  async function submit(){
    if(brief.references.length<3){setError('Add and confirm at least three cultural references.');return;}
    if(preview){setError('This brief contains example references. Start a new brief to resolve real Qloo entities.');return;}
    if(!tag){const job=gate.current.begin();setResolving(true);setError('');try{const items=await api.tags(brief.category,job.signal);if(gate.current.current(job.id)){setTags(items);setError(items.length?'Choose the Qloo category that best matches your intended partner.':'No matching category found. Try another partner type.');}}catch(e){if(gate.current.current(job.id))setError((e as Error).message);}finally{if(gate.current.current(job.id))setResolving(false);}return;}
    setError('');onResearch(tag);
  }
  return <aside className="brief-panel" aria-label="Your collaboration brief">
    <div className="panel-heading"><span className="step-number">1</span><h2>Your starting point</h2><span className="small-mark"><BookOpen size={17}/></span></div>
    <p className="panel-intro">Tell us where you are and what your audience loves.</p>
    <fieldset disabled={busy||preview}>
      <label htmlFor="city">Neighborhood or city</label><div className="input-icon"><MapPin size={16}/><input id="city" value={brief.city} maxLength={120} onChange={e=>change({city:e.target.value})}/></div>
      <label htmlFor="category">Meet a local…</label><select id="category" value={brief.category} onChange={e=>change({category:e.target.value as Brief['category']})}><option value="cafe">Café</option><option value="bookstore">Bookstore</option><option value="venue">Music venue</option><option value="restaurant">Restaurant</option></select>
      <label htmlFor="objective">What would you like to make happen?</label><textarea id="objective" value={brief.objective} maxLength={500} onChange={e=>change({objective:e.target.value})} rows={3}/>
    </fieldset>
    <div className="reference-title"><label>Cultural references</label><span>{brief.references.length}/5</span></div>
    <p className="field-help">Books, music, films, or brands that capture your business’s character. Choose 3–5.</p>
    <div className="reference-list">{brief.references.map(ref=><div className="reference" key={ref.id}><span className={`reference-icon ${ref.type}`} >{ref.type.includes('artist')?<Music2 size={15}/>:ref.type.includes('movie')?<Film size={15}/>:<BookOpen size={15}/>}</span><span><strong>{ref.name}</strong><small>{ref.type.replace('urn:entity:','')}</small></span>{!preview&&<button className="icon-button" aria-label={`Remove ${ref.name}`} disabled={busy} onClick={()=>change({references:brief.references.filter(r=>r.id!==ref.id)})}><X size={15}/></button>}</div>)}</div>
    {!preview&&brief.references.length<5&&<div className="reference-search"><select aria-label="Reference type" value={type} onChange={e=>{gate.current.cancel();setResolving(false);setMatches([]);setType(e.target.value);}}><option value="author">Author</option><option value="book">Book</option><option value="artist">Artist</option><option value="movie">Film</option><option value="brand">Brand</option></select><div className="search-row"><input aria-label="Find a cultural reference" placeholder="e.g. Haruki Murakami" value={query} maxLength={200} onChange={e=>{gate.current.cancel();setResolving(false);setMatches([]);setQuery(e.target.value);}} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();void search();}}}/><button className="icon-button search-button" aria-label="Search references" disabled={busy||resolving} onClick={()=>void search()}>{resolving?<LoaderCircle className="spin" size={17}/>:<Search size={17}/>}</button></div></div>}
    {matches.length>0&&<div className="resolution-results"><p>Confirm the intended reference</p>{matches.map(ref=><button key={ref.id} onClick={()=>add(ref)}><span>{ref.name}<small>{ref.type.replace('urn:entity:','')} · {ref.subtitle??ref.id}</small></span><Plus size={16}/></button>)}</div>}
    {!!tags.length&&<><label htmlFor="tag">Confirm Qloo category</label><select id="tag" value={tag} onChange={e=>setTag(e.target.value)}><option value="">Choose a category</option>{tags.map(t=><option value={t.id} key={t.id}>{t.name}</option>)}</select></>}
    {error&&<p className="inline-error" role="alert">{error}</p>}
    <button className="primary-button find-button" disabled={busy||resolving||preview} onClick={()=>void submit()}>{busy?<LoaderCircle className="spin" size={17}/>:<ArrowRight size={17}/>}<span>{busy?'Researching your neighborhood':'Find collaboration partners'}</span></button>
    {!preview&&<button className="text-button example-button" onClick={onExample} disabled={busy}>Or explore a complete example</button>}
    <div className="brief-footnote">{preview?'Example references and fictional businesses. No live API calls.':'Only cultural references and your chosen area go to Qloo. No customer data needed.'}</div>
  </aside>;
}
