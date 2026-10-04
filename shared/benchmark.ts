import {z} from 'zod';
import {type Brief} from './contracts';

export const ComparisonOutputSchema=z.object({suggestions:z.array(z.object({
  name:z.string().min(1).max(200),entityId:z.string().max(150).nullable(),
  reason:z.string().min(1).max(800),evidenceIds:z.array(z.string().max(150)).max(20)
}).strict()).max(5)}).strict();
export type ComparisonOutput=z.infer<typeof ComparisonOutputSchema>;
export type ComparisonCondition=ComparisonOutput & {
  verification:'unverified'|'provider-linked';generatedAt:string;durationMs:number;
};
export type BaselineComparison={
  id:string;runId:string;model:string;promptVersion:string;maxOutputTokens:number;
  brief:Brief;baseline:ComparisonCondition;grounded:ComparisonCondition;
  discoveryDurationMs:number;limitations:string[];
};
