import * as fs from "fs";
import * as yaml from "js-yaml";
import Ajv from "ajv";
import { SOUL_SCHEMA } from "./schema.js";

export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationResult {
  pass: boolean;
  file: string;
  name?: string;
  version?: string;
  errors: ValidationError[];
  data?: Record<string, unknown>;
}

/** Parse YAML frontmatter between --- delimiters, skipping leading HTML comments */
export function parseFrontmatter(content: string): string {
  const stripped = content.replace(/^<!--[\s\S]*?-->\s*/m, "").trimStart();
  const match = stripped.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) {
    throw new Error(
      "No YAML frontmatter found. File must start with --- delimiters (optionally preceded by an HTML comment)."
    );
  }
  return match[1];
}

export function validateFile(filePath: string): ValidationResult {
  if (!fs.existsSync(filePath)) {
    return {
      pass: false,
      file: filePath,
      errors: [{ field: "file", message: `File not found: ${filePath}` }],
    };
  }

  const content = fs.readFileSync(filePath, "utf-8");
  let data: Record<string, unknown>;

  try {
    const frontmatterRaw = parseFrontmatter(content);
    const parsed = yaml.load(frontmatterRaw);
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Frontmatter parsed as empty or non-object.");
    }
    data = parsed as Record<string, unknown>;
  } catch (err: unknown) {
    return {
      pass: false,
      file: filePath,
      errors: [
        {
          field: "frontmatter",
          message: err instanceof Error ? err.message : String(err),
        },
      ],
    };
  }

  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validate = ajv.compile(SOUL_SCHEMA);
  const valid = validate(data);

  const errors: ValidationError[] = valid
    ? []
    : (validate.errors ?? []).map((e) => ({
        field: e.instancePath
          ? e.instancePath.replace(/^\//, "")
          : (e.params as Record<string, string>)?.missingProperty ?? "root",
        message: e.message ?? "unknown error",
      }));

  return {
    pass: valid,
    file: filePath,
    name: typeof data.name === "string" ? data.name : undefined,
    version: typeof data.version === "string" ? data.version : undefined,
    errors,
    data,
  };
}
