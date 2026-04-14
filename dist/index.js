#!/usr/bin/env node
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
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const path = __importStar(require("path"));
const validate_js_1 = require("./validate.js");
const score_js_1 = require("./score.js");
const validate_js_2 = require("./validate.js");
const init_js_1 = require("./init.js");
const fs = __importStar(require("fs"));
const yaml = __importStar(require("js-yaml"));
const program = new commander_1.Command();
program
    .name("soul-cli")
    .description("CLI tools for SOUL.md agent identity files")
    .version("1.0.0");
// ─── validate ────────────────────────────────────────────────────────────────
program
    .command("validate <file>")
    .description("Validate a .soul.md file against the schema")
    .option("--json", "Output machine-readable JSON")
    .action(async (file, opts) => {
    const chalk = (await Promise.resolve().then(() => __importStar(require("chalk")))).default;
    const absPath = path.resolve(file);
    const result = (0, validate_js_1.validateFile)(absPath);
    if (opts.json) {
        process.stdout.write(JSON.stringify(result, null, 2) + "\n");
        process.exit(result.pass ? 0 : 1);
    }
    const filename = path.basename(file);
    if (result.pass) {
        console.log(chalk.bold.green(`\n  ✓ PASS  ${filename}`));
    }
    else {
        console.log(chalk.bold.red(`\n  ✗ FAIL  ${filename}`));
    }
    console.log(chalk.gray("  Agent:   ") + (result.name ?? chalk.red("(missing)")));
    console.log(chalk.gray("  Version: ") + (result.version ?? chalk.red("(missing)")));
    if (result.errors.length > 0) {
        console.log(chalk.bold.red("\n  Errors:"));
        result.errors.forEach((e) => {
            const field = e.field ? chalk.cyan(`[${e.field}]`) : "";
            console.log(`    ${field} ${e.message}`);
        });
    }
    console.log("");
    process.exit(result.pass ? 0 : 1);
});
// ─── score ────────────────────────────────────────────────────────────────────
program
    .command("score <file>")
    .description("Show completeness score and field breakdown")
    .option("--json", "Output machine-readable JSON")
    .action(async (file, opts) => {
    const chalk = (await Promise.resolve().then(() => __importStar(require("chalk")))).default;
    const absPath = path.resolve(file);
    if (!fs.existsSync(absPath)) {
        console.error(chalk.red(`  File not found: ${absPath}`));
        process.exit(1);
    }
    const content = fs.readFileSync(absPath, "utf-8");
    let data;
    try {
        const frontmatterRaw = (0, validate_js_2.parseFrontmatter)(content);
        data = yaml.load(frontmatterRaw);
    }
    catch (err) {
        console.error(chalk.red(`  Parse error: ${err instanceof Error ? err.message : String(err)}`));
        process.exit(1);
    }
    const scoreResult = (0, score_js_1.scoreData)(data);
    if (opts.json) {
        process.stdout.write(JSON.stringify({ file, ...scoreResult }, null, 2) + "\n");
        return;
    }
    const filename = path.basename(file);
    const { score, breakdown } = scoreResult;
    const scoreColor = score >= 80 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red;
    const bar = "█".repeat(Math.round(score / 10)) +
        "░".repeat(10 - Math.round(score / 10));
    console.log(chalk.bold(`\n  ${filename}`) +
        "  " +
        scoreColor(`${score}%  ${bar}`) +
        "\n");
    breakdown.forEach(({ field, filled: isFilled, note }) => {
        const icon = isFilled ? chalk.green("  ✓") : chalk.gray("  ·");
        const fieldStr = isFilled ? chalk.white(field) : chalk.gray(field);
        const noteStr = note ? chalk.gray(`  (${note})`) : "";
        console.log(`${icon}  ${fieldStr.padEnd(24)}${noteStr}`);
    });
    if (scoreResult.missing.length > 0) {
        console.log(chalk.gray(`\n  Add ${scoreResult.missing.length} more optional field${scoreResult.missing.length !== 1 ? "s" : ""} to reach 100%.`));
    }
    console.log("");
});
// ─── init ─────────────────────────────────────────────────────────────────────
program
    .command("init")
    .description("Generate a new soul.md file interactively")
    .option("--name <name>", "Agent name (non-interactive)")
    .option("--description <desc>", "One-line description (non-interactive)")
    .option("--tone <tone>", "Tone description (non-interactive)")
    .option("--no-interactive", "Skip prompts, use flags only")
    .option("--output <file>", "Output filename")
    .action(async (opts) => {
    await (0, init_js_1.runInit)({
        name: opts.name,
        description: opts.description,
        tone: opts.tone,
        interactive: opts.interactive,
        output: opts.output,
    });
});
program.parse();
