"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFrontmatter = parseFrontmatter;
exports.validateFile = validateFile;
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
const ajv_1 = __importDefault(require("ajv"));
const schema_js_1 = require("./schema.js");
/** Parse YAML frontmatter between --- delimiters, skipping leading HTML comments */
function parseFrontmatter(content) {
    const stripped = content.replace(/^<!--[\s\S]*?-->\s*/m, "").trimStart();
    const match = stripped.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!match) {
        throw new Error("No YAML frontmatter found. File must start with --- delimiters (optionally preceded by an HTML comment).");
    }
    return match[1];
}
function validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
        return {
            pass: false,
            file: filePath,
            errors: [{ field: "file", message: `File not found: ${filePath}` }],
        };
    }
    const content = fs.readFileSync(filePath, "utf-8");
    let data;
    try {
        const frontmatterRaw = parseFrontmatter(content);
        const parsed = yaml.load(frontmatterRaw);
        if (!parsed || typeof parsed !== "object") {
            throw new Error("Frontmatter parsed as empty or non-object.");
        }
        data = parsed;
    }
    catch (err) {
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
    const ajv = new ajv_1.default({ allErrors: true, allowUnionTypes: true });
    const validate = ajv.compile(schema_js_1.SOUL_SCHEMA);
    const valid = validate(data);
    const errors = valid
        ? []
        : (validate.errors ?? []).map((e) => ({
            field: e.instancePath
                ? e.instancePath.replace(/^\//, "")
                : e.params?.missingProperty ?? "root",
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
