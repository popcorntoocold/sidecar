import {type EvidenceRecord} from '../../shared/contracts';
import {evidenceLinks} from '../../shared/evidence-links';

export function EvidenceLinks({record}:{record:EvidenceRecord}){
  const links=evidenceLinks(record.metadata);
  return links.length>0?<ul className="source-links" aria-label="Provider source links">{links.map(url=><li key={url}><a href={url} target="_blank" rel="noreferrer">Provider source: {new URL(url).hostname}</a></li>)}</ul>:null;
}
