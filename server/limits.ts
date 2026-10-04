import {AppError} from '../shared/contracts';
export class ExpiringStore<T>{
  private entries=new Map<string,{value:T;expires:number}>();
  constructor(private ttl=1800000,private max=100,private now=Date.now){}
  private sweep(){for(const [key,item] of this.entries)if(item.expires<=this.now())this.entries.delete(key);}
  set(key:string,value:T){this.sweep();this.entries.delete(key);while(this.entries.size>=this.max)this.entries.delete(this.entries.keys().next().value!);this.entries.set(key,{value,expires:this.now()+this.ttl});}
  get(key:string){this.sweep();return this.entries.get(key)?.value;}
}
export class RunLimiter{
  private active=0;private used=0;private window=Date.now();private clients=new Map<string,number>();
  constructor(private config:{globalBudget:number;clientBudget:number;concurrency:number}){}
  acquire(client:string,cost:number){
    if(Date.now()-this.window>=3600000){this.used=0;this.clients.clear();this.window=Date.now();}
    const used=this.clients.get(client)??0;
    if(this.active>=this.config.concurrency||this.used+cost>this.config.globalBudget||used+cost>this.config.clientBudget||this.clients.size>=10000&&!this.clients.has(client))throw new AppError('RESEARCH_LIMIT','Research capacity is busy or at its hourly limit. Try again later.',429,true);
    this.active++;this.used+=cost;this.clients.set(client,used+cost);let released=false;
    return ()=>{if(!released){released=true;this.active--;}};
  }
}
