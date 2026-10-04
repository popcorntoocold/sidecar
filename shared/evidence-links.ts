import {safeWebUrl} from './urls';

export function evidenceLinks(metadata?:Record<string,unknown>):string[]{
  const links=new Set<string>();
  function visit(value:unknown,depth:number){
    if(depth>7||links.size>=12)return;
    if(typeof value==='string'){
      const safe=safeWebUrl(value);if(!safe)return;
      const url=new URL(safe);url.username='';url.password='';
      for(const key of [...url.searchParams.keys()])if(/key|token|secret|auth|password/i.test(key))url.searchParams.delete(key);
      links.add(url.href);
    }else if(Array.isArray(value))value.slice(0,50).forEach(v=>visit(v,depth+1));
    else if(value&&typeof value==='object')Object.values(value).slice(0,50).forEach(v=>visit(v,depth+1));
  }
  visit(metadata?.provenance,0);return [...links];
}
