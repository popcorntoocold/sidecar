export class RequestGate{
  private id=0;private controller?:AbortController;
  begin(){this.controller?.abort();this.controller=new AbortController();return {id:++this.id,signal:this.controller.signal};}
  current(id:number){return id===this.id&&!this.controller?.signal.aborted;}
  cancel(){this.controller?.abort();this.id++;}
}
