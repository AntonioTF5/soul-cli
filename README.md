# soul-cli

[![npm version](https://img.shields.io/npm/v/soul-cli)](https://www.npmjs.com/package/soul-cli)
[![npm downloads](https://img.shields.io/npm/dw/soul-cli)](https://www.npmjs.com/package/soul-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

CLI validator, scorer, and generator for [SOUL.md](https://github.com/AntonioTF5/soul-spec) agent identity files.

```
npx soul-cli validate my-agent.soul.md
```

---

## Install

```bash
# Run without installing
npx soul-cli <command>

# Install globally
npm install -g soul-cli
```

---

## Commands

### `validate <file>`

Validates a `.soul.md` file against the SOUL.md schema. Exits 0 on pass, 1 on fail.

```
$ npx soul-cli validate marcus-aurelius.soul.md

  ✓ PASS  marcus-aurelius.soul.md
  Agent:   Marcus Aurelius
  Version: 1.0.0
```

```
$ npx soul-cli validate broken.soul.md

  ✗ FAIL  broken.soul.md
  Agent:   (missing)
  Version: 1.0.0

  Errors:
    [name] must have required property 'name'
    [personality] must NOT have fewer than 50 characters
```

Machine-readable output:

```
$ npx soul-cli validate marcus-aurelius.soul.md --json
{
  "pass": true,
  "file": "marcus-aurelius.soul.md",
  "name": "Marcus Aurelius",
  "version": "1.0.0",
  "errors": []
}
```

---

### `score <file>`

Shows a completeness score (0–100) based on optional fields filled.

```
$ npx soul-cli score marcus-aurelius.soul.md

  marcus-aurelius.soul.md  90%  █████████░

  ✓  tone                    (47 chars)
  ✓  values                  (5 items)
  ✓  constraints             (3 items)
  ✓  knowledge_domains       (5 items)
  ✓  communication_style     (143 chars)
  ✓  memory_mode             (7 chars)
  ✓  goals                   (2 items)
  ✓  relationships           (3 items)
  ✓  language                (2 chars)
  ·  platform_hints

  Add 1 more optional field to reach 100%.
```

---

### `init`

Interactive soul file generator. Prompts for name, description, personality, and tone, then writes a `.soul.md` file.

```
$ npx soul-cli init

  SOUL.md generator

  Agent name: Debate Coach
  One-line description: A rigorous debate coach who teaches argument structure and steelmanning.
  Personality (2-3 sentences): ...
  Tone: Demanding but fair. Finds logical fallacies before you finish the sentence.
  Output filename [debate-coach.soul.md]:

  ✓ Created debate-coach.soul.md
  Validate: soul-cli validate debate-coach.soul.md
  Score:    soul-cli score debate-coach.soul.md
  Deploy:   https://agenturo.app
```

Non-interactive mode:

```bash
npx soul-cli init --name "Debate Coach" --no-interactive
```

---

## Deploy to Agenturo

[Agenturo](https://agenturo.app) is the reference SOUL.md implementation. Create a soul file with `soul-cli init`, then deploy it as a live AI agent on your own subdomain (`you.agenturo.app`) — no code required.

---

## Spec & examples

Full specification: [soul-spec](https://github.com/AntonioTF5/soul-spec)

Curated examples: [awesome-soul-files](https://github.com/AntonioTF5/awesome-soul-files)

---

*MIT License. Created by [Anton Agafonov](https://agenturo.app).*
