/**
 * Embedded SOUL.md JSON Schema (draft-07)
 * Kept in sync with soul-spec/schema/soul.schema.json
 */
export declare const SOUL_SCHEMA: {
    readonly $schema: "http://json-schema.org/draft-07/schema#";
    readonly title: "SOUL.md";
    readonly type: "object";
    readonly required: readonly ["name", "version", "description", "personality"];
    readonly additionalProperties: false;
    readonly properties: {
        readonly name: {
            readonly type: "string";
            readonly minLength: 1;
            readonly maxLength: 100;
        };
        readonly version: {
            readonly type: "string";
            readonly pattern: "^(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?$";
        };
        readonly description: {
            readonly type: "string";
            readonly minLength: 10;
            readonly maxLength: 280;
        };
        readonly personality: {
            readonly type: "string";
            readonly minLength: 50;
            readonly maxLength: 2000;
        };
        readonly tone: {
            readonly type: "string";
            readonly maxLength: 200;
        };
        readonly values: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 100;
            };
            readonly minItems: 1;
            readonly maxItems: 10;
        };
        readonly constraints: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 200;
            };
            readonly minItems: 1;
            readonly maxItems: 10;
        };
        readonly knowledge_domains: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 100;
            };
            readonly minItems: 1;
            readonly maxItems: 20;
        };
        readonly communication_style: {
            readonly type: "string";
            readonly maxLength: 500;
        };
        readonly memory_mode: {
            readonly type: "string";
            readonly enum: readonly ["stateless", "session", "persistent"];
        };
        readonly goals: {
            readonly type: "array";
            readonly items: {
                readonly type: "string";
                readonly minLength: 1;
                readonly maxLength: 200;
            };
            readonly minItems: 1;
            readonly maxItems: 5;
        };
        readonly relationships: {
            readonly type: "array";
            readonly items: {
                readonly type: "object";
                readonly required: readonly ["name", "role"];
                readonly additionalProperties: false;
                readonly properties: {
                    readonly name: {
                        readonly type: "string";
                    };
                    readonly role: {
                        readonly type: "string";
                    };
                    readonly notes: {
                        readonly type: "string";
                    };
                };
            };
        };
        readonly language: {
            readonly type: "string";
            readonly pattern: "^[a-z]{2}(-[A-Z]{2})?$";
        };
        readonly platform_hints: {
            readonly type: "object";
            readonly additionalProperties: true;
        };
    };
    readonly patternProperties: {
        readonly "^x-": {};
    };
};
export declare const OPTIONAL_FIELDS: readonly ["tone", "values", "constraints", "knowledge_domains", "communication_style", "memory_mode", "goals", "relationships", "language", "platform_hints"];
export type OptionalField = (typeof OPTIONAL_FIELDS)[number];
