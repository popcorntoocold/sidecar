import {it,expect} from 'vitest';
import {summarizeLive} from '../scripts/evaluation';
it('refuses to aggregate preview data as live results',()=>{
  expect(()=>summarizeLive([{mode:'preview',candidates:[],evidence:[],durationMs:0}])).toThrow();
});
it('reports observed citation coverage without inventing business outcomes',()=>{
  const result=summarizeLive([{mode:'live',candidates:[{evidenceIds:['exists']},{evidenceIds:['missing']}],evidence:[{id:'exists',source:'Qloo'}],durationMs:250}]);
  expect(result).toEqual({runs:1,candidates:2,candidatesWithEvidence:1,evidenceCoverage:0.5,meanDurationMs:250});
});
