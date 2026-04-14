import * as fs from "fs";
import * as path from "path";
import * as readline from "readline";

export interface InitOptions {
  name?: string;
  description?: string;
  tone?: string;
  interactive?: boolean;
  output?: string;
}

function generateSoulFile(opts: {
  name: string;
  description: string;
  personality: string;
  tone: string;
}): string {
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

function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => rl.question(question, resolve));
}

export async function runInit(opts: InitOptions): Promise<void> {
  const chalk = (await import("chalk")).default;

  if (opts.interactive === false) {
    // Non-interactive mode
    const name = opts.name ?? "My Agent";
    const description =
      opts.description ?? `An AI agent named ${name}.`;
    const personality = `You are ${name}. (Edit this field to describe who this agent is — voice, not instructions.)`;
    const tone = opts.tone ?? "Direct and helpful.";

    const outputFile =
      opts.output ??
      `${name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")}.soul.md`;
    const content = generateSoulFile({ name, description, personality, tone });
    fs.writeFileSync(path.resolve(outputFile), content, "utf-8");
    console.log(chalk.green(`✓ Created ${outputFile}`));
    console.log(chalk.gray(`  Validate with: soul-cli validate ${outputFile}`));
    console.log(
      chalk.gray(`  Deploy at: https://agenturo.app`)
    );
    return;
  }

  // Interactive mode
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(chalk.bold("\n  SOUL.md generator\n"));
  console.log(
    chalk.gray("  Creates a new soul file. Press Ctrl+C to cancel.\n")
  );

  try {
    const name =
      (await prompt(rl, chalk.cyan("  Agent name: "))) || "My Agent";

    const description = await prompt(
      rl,
      chalk.cyan("  One-line description (who this agent is): ")
    );

    const personality = await prompt(
      rl,
      chalk.cyan(
        "  Personality (2-3 sentences — voice, not instructions): "
      )
    );

    const tone = await prompt(
      rl,
      chalk.cyan("  Tone (a few words — e.g. 'Direct, dry, precise'): ")
    );

    const defaultFilename = `${name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")}.soul.md`;
    const outputRaw = await prompt(
      rl,
      chalk.cyan(`  Output filename [${defaultFilename}]: `)
    );
    const outputFile = outputRaw.trim() || defaultFilename;

    rl.close();

    const content = generateSoulFile({
      name,
      description: description || `An AI agent named ${name}.`,
      personality:
        personality ||
        `You are ${name}. Edit this to describe who this agent is.`,
      tone: tone || "Direct and helpful.",
    });

    const absPath = path.resolve(outputFile);
    fs.writeFileSync(absPath, content, "utf-8");

    console.log(chalk.green(`\n  ✓ Created ${outputFile}`));
    console.log(chalk.gray(`  Validate: soul-cli validate ${outputFile}`));
    console.log(chalk.gray(`  Score:    soul-cli score ${outputFile}`));
    console.log(chalk.gray(`  Deploy:   https://agenturo.app\n`));
  } catch (err) {
    rl.close();
    throw err;
  }
}
