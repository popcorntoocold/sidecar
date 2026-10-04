import {type Brief,type Resolution,type ResearchResult,type Proposal} from '../shared/contracts';
async function request<T>(path:string,body?:unknown,signal?:AbortSignal):Promise<T>{
  const response=await fetch(path,{method:body?'POST':'GET',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal});
  const result=await response.json();if(!response.ok)throw new Error(result.message??'The request could not be completed.');return result as T;
}
export const api={
  status:()=>request<{qlooConfigured:boolean;modelConfigured:boolean;liveReady:boolean}>('/api/status'),
  preview:(excluded:string[]=[],signal?:AbortSignal)=>request<ResearchResult>(`/api/preview?exclude=${encodeURIComponent(excluded.join(','))}`,undefined,signal),
  resolve:(query:string,type:string,signal?:AbortSignal)=>request<Resolution>('/api/resolve',{query,type},signal),
  tags:(category:Brief['category'],signal?:AbortSignal)=>request<{id:string;name:string}[]>(`/api/tags?category=${category}`,undefined,signal),
  research:(brief:Brief,categoryTag:string,signal?:AbortSignal)=>request<ResearchResult>('/api/research',{brief,categoryTag},signal),
  proposal:(runId:string,candidateId:string,signal?:AbortSignal)=>request<Proposal>('/api/proposal',{runId,candidateId},signal)
};
