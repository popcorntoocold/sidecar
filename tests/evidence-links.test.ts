import {it,expect} from 'vitest';
import {evidenceLinks} from '../shared/evidence-links';
it('shows only safe provider provenance links and removes URL credentials',()=>{
  const links=evidenceLinks({provenance:{documentation:['https://docs.qloo.com/reference?api_key=secret','javascript:alert(1)','https://user:password@example.com/path']},unrelated:'https://ignore.example'});
  expect(links).toEqual(['https://docs.qloo.com/reference','https://example.com/path']);
});
