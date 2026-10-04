export function safeWebUrl(value:unknown):string|undefined{
  if(typeof value!=='string')return;
  try{const url=new URL(value);return ['https:','http:'].includes(url.protocol)?url.href:undefined;}catch{return;}
}
