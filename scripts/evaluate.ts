import {readFile} from 'node:fs/promises';
import {summarizeLive} from './evaluation';
const path=process.argv[2];
if(!path){console.error('Usage: pnpm run evaluate path/to/redacted-live-runs.json');process.exitCode=2;}
else{try{console.log(JSON.stringify(summarizeLive(JSON.parse(await readFile(path,'utf8'))),null,2));}catch{console.error('Evaluation requires a non-empty array of validated live Qloo research results. Preview data is not accepted.');process.exitCode=1;}}
