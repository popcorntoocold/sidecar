import {mkdtempSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {it,expect,afterEach} from 'vitest';
import {ModelSpendGuard} from '../server/spend';
const dirs:string[]=[];
function file(){const dir=mkdtempSync(join(tmpdir(),'sidecar-spend-'));dirs.push(dir);return join(dir,'usage.json');}
afterEach(()=>{for(const dir of dirs.splice(0))rmSync(dir,{recursive:true,force:true});});
it('reserves conservatively before sending and persists across process restarts',()=>{
  const path=file(); const guard=new ModelSpendGuard({limitUsd:0.08,path});
  guard.reserve('gpt-5.4-mini-2026-03-17',80000,1800);
  const restarted=new ModelSpendGuard({limitUsd:0.08,path});
  expect(()=>restarted.reserve('gpt-5.4-mini-2026-03-17',80000,1800)).toThrow(/budget/i);
});
it('refuses paid usage with an unknown rate or absent authorization',()=>{
  expect(()=>new ModelSpendGuard({limitUsd:0,path:file()}).reserve('gpt-5.4-mini',100,20)).toThrow();
  expect(()=>new ModelSpendGuard({limitUsd:1,path:file()}).reserve('unknown',100,20)).toThrow();
});
