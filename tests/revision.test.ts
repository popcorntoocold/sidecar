import {it,expect} from 'vitest';
import {describeRevision} from '../server/revision';
import {createPreview} from '../server/preview';
it('describes changed inputs and retained versus replaced evidence without inferring rejection reasons',()=>{
  const prior=createPreview();
  const next={...prior,id:'next',brief:{...prior.brief,city:'Chicago',rejectedIds:[prior.candidates[0].id]},candidates:prior.candidates.slice(1),evidence:[prior.evidence[0],{...prior.evidence[0],id:'new-evidence'}]};
  const revision=describeRevision(prior,next);
  expect(revision.previousRunId).toBe(prior.id);
  expect(revision.changes.join(' ')).toContain('Chicago');
  expect(revision.changes.join(' ')).toContain(prior.candidates[0].name);
  expect(revision.reusedEvidenceIds).toContain(prior.evidence[0].id);
  expect(revision.newEvidenceIds).toEqual(['new-evidence']);
  expect(revision.removedPartners).toEqual([prior.candidates[0].name]);
});
