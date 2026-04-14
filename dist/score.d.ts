import { OptionalField } from "./schema.js";
export interface ScoreResult {
    score: number;
    filled: OptionalField[];
    missing: OptionalField[];
    total: number;
    breakdown: Array<{
        field: OptionalField;
        filled: boolean;
        note?: string;
    }>;
}
export declare function scoreData(data: Record<string, unknown>): ScoreResult;
