#!/usr/bin/env node
import { Command } from "commander";
import * as path from "path";
import { validateFile } from "./validate.js";
import { scoreData } from "./score.js";
import { parseFrontmatter } from "./validate.js";
import { runInit } from "./init.js";
import * as fs from "fs";
import * as yaml from "js-yaml";

const program = new Command();

program
  .name("soul-cli")
  .description("CLI tools for SOUL.md agent identity files")
  .version("1.0.0");

// ─── validate ────────────────────────────────────────────────────────────────
program
  .command("validate <file>")
  .description("Validate a .soul.md file against the schema")
  .option("--json", "Output machine-readable JSON")
  .action(async (file: string, opts: { json?: boolean }) => {
    const chalk = (await import("chalk")).default;
    const absPath = path.resolve(file);
    const result = validateFile(absPath);

    if (opts.json) {
      process.stdout.write(JSON.stringify(result, null, 2) + "\n");
      process.exit(result.pass ? 0 : 1);
    }

    const filename = path.basename(file);

    if (result.pass) {
      console.log(chalk.bold.green(`\n  ✓ PASS  ${filename}`));
    } else {
      console.log(chalk.bold.red(`\n  ✗ FAIL  ${filename}`));
    }

    console.log(
      chalk.gray("  Agent:   ") + (result.name ?? chalk.red("(missing)"))
    );
    console.log(
      chalk.gray("  Version: ") + (result.version ?? chalk.red("(missing)"))
    );

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
  .action(async (file: string, opts: { json?: boolean }) => {
    const chalk = (await import("chalk")).default;
    const absPath = path.resolve(file);

    if (!fs.existsSync(absPath)) {
      console.error(chalk.red(`  File not found: ${absPath}`));
      process.exit(1);
    }

    const content = fs.readFileSync(absPath, "utf-8");
    let data: Record<string, unknown>;

    try {
      const frontmatterRaw = parseFrontmatter(content);
      data = yaml.load(frontmatterRaw) as Record<string, unknown>;
    } catch (err: unknown) {
      console.error(
        chalk.red(
          `  Parse error: ${err instanceof Error ? err.message : String(err)}`
        )
      );
      process.exit(1);
    }

    const scoreResult = scoreData(data);

    if (opts.json) {
      process.stdout.write(
        JSON.stringify(
          { file, score: scoreResult.score, ...scoreResult },
          null,
          2
        ) + "\n"
      );
      return;
    }

    const filename = path.basename(file);
    const { score, breakdown } = scoreResult;
    const scoreColor =
      score >= 80 ? chalk.green : score >= 50 ? chalk.yellow : chalk.red;
    const bar =
      "█".repeat(Math.round(score / 10)) +
      "░".repeat(10 - Math.round(score / 10));

    console.log(
      chalk.bold(`\n  ${filename}`) +
        "  " +
        scoreColor(`${score}%  ${bar}`) +
        "\n"
    );

    breakdown.forEach(({ field, filled: isFilled, note }) => {
      const icon = isFilled ? chalk.green("  ✓") : chalk.gray("  ·");
      const fieldStr = isFilled ? chalk.white(field) : chalk.gray(field);
      const noteStr = note ? chalk.gray(`  (${note})`) : "";
      console.log(`${icon}  ${fieldStr.padEnd(24)}${noteStr}`);
    });

    if (scoreResult.missing.length > 0) {
      console.log(
        chalk.gray(
          `\n  Add ${scoreResult.missing.length} more optional field${
            scoreResult.missing.length !== 1 ? "s" : ""
          } to reach 100%.`
        )
      );
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
  .action(
    async (opts: {
      name?: string;
      description?: string;
      tone?: string;
      interactive?: boolean;
      output?: string;
    }) => {
      await runInit({
        name: opts.name,
        description: opts.description,
        tone: opts.tone,
        interactive: opts.interactive,
        output: opts.output,
      });
    }
  );

program.parse();
