import {describe, it, expect} from 'vitest';
import {BriefSchema} from '../shared/contracts';
const refs = [1,2,3].map(i => ({id:`fixture-${i}`,name:`Example ${i}`,type:'book'}));
const brief = {city:'Austin',category:'cafe',objective:'Host a reading night',references:refs,rejectedIds:[]};
describe('research brief boundary', () => {
  it('accepts a fully specified brief', () => expect(BriefSchema.safeParse(brief).success).toBe(true));
  it('rejects missing city', () => expect(BriefSchema.safeParse({...brief,city:' '}).success).toBe(false));
  it('rejects duplicate entity IDs', () => expect(BriefSchema.safeParse({...brief,references:[refs[0],refs[0],refs[1]]}).success).toBe(false));
  it('requires three confirmed references', () => expect(BriefSchema.safeParse({...brief,references:refs.slice(0,2)}).success).toBe(false));
  it('rejects additional provider instructions', () => expect(BriefSchema.safeParse({...brief,command:'run shell'}).success).toBe(false));
  it('bounds exclusions and text', () => expect(BriefSchema.safeParse({...brief,rejectedIds:Array(51).fill('x')}).success).toBe(false));
});
