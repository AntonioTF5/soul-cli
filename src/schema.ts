/**
 * Embedded SOUL.md JSON Schema (draft-07)
 * Kept in sync with soul-spec/schema/soul.schema.json
 */

export const SOUL_SCHEMA = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "SOUL.md",
  type: "object",
  required: ["name", "version", "description", "personality"],
  additionalProperties: false,
  properties: {
    name: { type: "string", minLength: 1, maxLength: 100 },
    version: {
      type: "string",
      pattern:
        "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$",
    },
    description: { type: "string", minLength: 10, maxLength: 280 },
    personality: { type: "string", minLength: 50, maxLength: 2000 },
    tone: { type: "string", maxLength: 200 },
    values: {
      type: "array",
      items: { type: "string", minLength: 1, maxLength: 100 },
      minItems: 1,
      maxItems: 10,
    },
    constraints: {
      type: "array",
      items: { type: "string", minLength: 1, maxLength: 200 },
      minItems: 1,
      maxItems: 10,
    },
    knowledge_domains: {
      type: "array",
      items: { type: "string", minLength: 1, maxLength: 100 },
      minItems: 1,
      maxItems: 20,
    },
    communication_style: { type: "string", maxLength: 500 },
    memory_mode: {
      type: "string",
      enum: ["stateless", "session", "persistent"],
    },
    goals: {
      type: "array",
      items: { type: "string", minLength: 1, maxLength: 200 },
      minItems: 1,
      maxItems: 5,
    },
    relationships: {
      type: "array",
      items: {
        type: "object",
        required: ["name", "role"],
        additionalProperties: false,
        properties: {
          name: { type: "string" },
          role: { type: "string" },
          notes: { type: "string" },
        },
      },
    },
    language: {
      type: "string",
      pattern: "^[a-z]{2}(-[A-Z]{2})?$",
    },
    platform_hints: { type: "object", additionalProperties: true },
  },
  patternProperties: {
    "^x-": {},
  },
} as const;

export const OPTIONAL_FIELDS = [
  "tone",
  "values",
  "constraints",
  "knowledge_domains",
  "communication_style",
  "memory_mode",
  "goals",
  "relationships",
  "language",
  "platform_hints",
] as const;

export type OptionalField = (typeof OPTIONAL_FIELDS)[number];
