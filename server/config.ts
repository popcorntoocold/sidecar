import {isAbsolute} from 'node:path';
import {remoteBudgetConfig,validateRemoteBudget} from './remote-spend';

export function runtimeConfig(env:NodeJS.ProcessEnv=process.env){
  const production=env.NODE_ENV==='production';
  const workflowLimit=Number(env.QLOO_HOURLY_WORKFLOW_LIMIT??(production?'':30));
  if(!Number.isSafeInteger(workflowLimit)||workflowLimit<=0)throw new Error('Set a positive integer QLOO_HOURLY_WORKFLOW_LIMIT from the issued event quota.');
  const remote=remoteBudgetConfig(env);
  if(remote)validateRemoteBudget(remote);
  if(production&&env.OPENAI_API_KEY&&!remote&&(!env.OPENAI_BUDGET_FILE||!isAbsolute(env.OPENAI_BUDGET_FILE)))throw new Error('Public paid usage requires an absolute OPENAI_BUDGET_FILE path on persistent storage or a remote budget ledger.');
  const port=Number(env.PORT??4310);
  if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be an integer between 1 and 65535.');
  return {production,workflowLimit,port,host:env.HOST??'127.0.0.1'};
}
