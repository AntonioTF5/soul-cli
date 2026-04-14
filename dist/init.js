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
exports.runInit = runInit;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const readline = __importStar(require("readline"));
function generateSoulFile(opts) {
    return `---
name: "${opts.name}"
version: "1.0.0"
description: "${opts.description.replace(/"/g, '\\"')}"
personality: "${opts.personality.replace(/"/g, '\\"')}"
tone: "${opts.tone.replace(/"/g, '\\"')}"
values:
  - (add your first value here)
  - (add your second value here)
knowledge_domains:
  - (add your primary domain here)
memory_mode: session
---

## Identity

${opts.name} is an AI agent defined by this soul file. Extend this section with
background, context, and details that make the agent specific and useful.

## Knowledge

Facts and reference material this agent should know. End with:

Do not invent details beyond what is stated here.
`;
}
function prompt(rl, question) {
    return new Promise((resolve) => rl.question(question, resolve));
}
async function runInit(opts) {
    const chalk = (await Promise.resolve().then(() => __importStar(require("chalk")))).default;
    if (opts.interactive === false) {
        // Non-interactive mode
        const name = opts.name ?? "My Agent";
        const description = opts.description ?? `An AI agent named ${name}.`;
        const personality = `You are ${name}. (Edit this field to describe who this agent is — voice, not instructions.)`;
        const tone = opts.tone ?? "Direct and helpful.";
        const outputFile = opts.output ??
            `${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.soul.md`;
        const content = generateSoulFile({ name, description, personality, tone });
        fs.writeFileSync(path.resolve(outputFile), content, "utf-8");
        console.log(chalk.green(`✓ Created ${outputFile}`));
        console.log(chalk.gray(`  Validate with: soul-cli validate ${outputFile}`));
        console.log(chalk.gray(`  Deploy at: https://agenturo.app`));
        return;
    }
    // Interactive mode
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    });
    console.log(chalk.bold("\n  SOUL.md generator\n"));
    console.log(chalk.gray("  Creates a new soul file. Press Ctrl+C to cancel.\n"));
    try {
        const name = (await prompt(rl, chalk.cyan("  Agent name: "))) || "My Agent";
        const description = await prompt(rl, chalk.cyan("  One-line description (who this agent is): "));
        const personality = await prompt(rl, chalk.cyan("  Personality (2-3 sentences — voice, not instructions): "));
        const tone = await prompt(rl, chalk.cyan("  Tone (a few words — e.g. 'Direct, dry, precise'): "));
        const defaultFilename = `${name
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "")}.soul.md`;
        const outputRaw = await prompt(rl, chalk.cyan(`  Output filename [${defaultFilename}]: `));
        const outputFile = outputRaw.trim() || defaultFilename;
        rl.close();
        const content = generateSoulFile({
            name,
            description: description || `An AI agent named ${name}.`,
            personality: personality ||
                `You are ${name}. Edit this to describe who this agent is.`,
            tone: tone || "Direct and helpful.",
        });
        const absPath = path.resolve(outputFile);
        fs.writeFileSync(absPath, content, "utf-8");
        console.log(chalk.green(`\n  ✓ Created ${outputFile}`));
        console.log(chalk.gray(`  Validate: soul-cli validate ${outputFile}`));
        console.log(chalk.gray(`  Score:    soul-cli score ${outputFile}`));
        console.log(chalk.gray(`  Deploy:   https://agenturo.app\n`));
    }
    catch (err) {
        rl.close();
        throw err;
    }
}
