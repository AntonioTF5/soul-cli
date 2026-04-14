import { OPTIONAL_FIELDS, OptionalField } from "./schema.js";

export interface ScoreResult {
  score: number;
  filled: OptionalField[];
  missing: OptionalField[];
  total: number;
  breakdown: Array<{ field: OptionalField; filled: boolean; note?: string }>;
}

export function scoreData(data: Record<string, unknown>): ScoreResult {
  const filled: OptionalField[] = [];
  const missing: OptionalField[] = [];
  const breakdown: ScoreResult["breakdown"] = [];

  for (const field of OPTIONAL_FIELDS) {
    const value = data[field];
    const isFilled =
      value !== undefined &&
      value !== null &&
      value !== "" &&
      !(Array.isArray(value) && value.length === 0);

    if (isFilled) {
      filled.push(field);
    } else {
      missing.push(field);
    }

    let note: string | undefined;
    if (isFilled && Array.isArray(value)) {
      note = `${value.length} item${value.length !== 1 ? "s" : ""}`;
    } else if (isFilled && typeof value === "string") {
      note = `${value.length} chars`;
    }

    breakdown.push({ field, filled: isFilled, note });
  }

  const score = Math.round((filled.length / OPTIONAL_FIELDS.length) * 100);
  return { score, filled, missing, total: OPTIONAL_FIELDS.length, breakdown };
}
