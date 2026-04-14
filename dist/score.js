"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreData = scoreData;
const schema_js_1 = require("./schema.js");
function scoreData(data) {
    const filled = [];
    const missing = [];
    const breakdown = [];
    for (const field of schema_js_1.OPTIONAL_FIELDS) {
        const value = data[field];
        const isFilled = value !== undefined &&
            value !== null &&
            value !== "" &&
            !(Array.isArray(value) && value.length === 0);
        if (isFilled) {
            filled.push(field);
        }
        else {
            missing.push(field);
        }
        let note;
        if (isFilled && Array.isArray(value)) {
            note = `${value.length} item${value.length !== 1 ? "s" : ""}`;
        }
        else if (isFilled && typeof value === "string") {
            note = `${value.length} chars`;
        }
        breakdown.push({ field, filled: isFilled, note });
    }
    const score = Math.round((filled.length / schema_js_1.OPTIONAL_FIELDS.length) * 100);
    return { score, filled, missing, total: schema_js_1.OPTIONAL_FIELDS.length, breakdown };
}
