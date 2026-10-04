import {it,expect} from 'vitest';
import {RequestGate} from '../src/request-gate';
it('ignores a stale response after a new request begins',()=>{
  const gate=new RequestGate();const first=gate.begin();const next=gate.begin();
  expect(first.signal.aborted).toBe(true);expect(gate.current(first.id)).toBe(false);expect(gate.current(next.id)).toBe(true);
});
it('invalidates cancelled work',()=>{
  const gate=new RequestGate();const job=gate.begin();gate.cancel();expect(gate.current(job.id)).toBe(false);expect(job.signal.aborted).toBe(true);
});
