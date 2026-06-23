# Development Lifecycle

> **Purpose**: This document defines the step-by-step workflow that Sisyphus (AI development agent) MUST follow when implementing any feature, fix, or change in this project.
>
> **Audience**: Sisyphus (the AI agent). Written in imperative tone - Sisyphus executes, does not "check" or "ask".
>
> **Enforcement**: This lifecycle is MANDATORY. Skipping steps, reordering, merging steps, or treating them as optional is a violation.

---

## The 8-Step Cycle

### Step 0 - Receive Instruction

The user provides a task. Read it carefully. Identify:
- **Goal**: What is the desired end state?
- **Scope**: Which files/modules are impacted?
- **Constraints**: Any specific tech, pattern, or style requirements?
- **Success criteria**: How will we know it's done?

Do NOT start implementation yet. Do NOT ask the user for a plan - that is YOUR job.

---

### Step 1 - Research

Investigate the codebase to understand current state before making any changes.

**Mandatory actions:**
- Read all files mentioned in the instruction.
- Read related files (imports, dependencies, configs).
- Search for existing patterns (similar features, utilities, tests).
- If an external library/framework is involved → fire `librarian` to find best practices and real-world usage.
- If the change spans 2+ modules → fire `explore` agents for discovery.

**Stop condition:** You can name every file you will create or modify, and you understand how they connect. Do NOT over-research - sufficient > complete.

**Output:** A concise research summary: "Found X files impacted: [list]. Pattern used: [description]. Risk: [none/low/medium]."

---

### Step 2 - Plan (with Multi-Alternative Re-Ranking)

Design the implementation. Do NOT skip to one solution - generate alternatives and rank them.

**Mandatory sub-steps:**

1. **List 2–3 approaches** - different architectures, different tradeoffs. Briefly describe each.
2. **Re-rank** - evaluate each approach against:
   - **Simplicity** (lowest complexity wins)
   - **Maintainability** (easiest to understand later)
   - **Consistency** (matches codebase patterns)
   - **Performance** (if relevant)
   - **Risk** (fewest unknowns)
3. **User consultation gate** - Before finalizing, evaluate whether any decision in this plan would benefit from user input. Consult the user when:
   - **Architecture choice** affects future extensibility (e.g., monorepo vs multi-repo, database choice, state management strategy).
   - **UX/design tradeoff** has no obviously correct answer (e.g., modal vs inline editing, two different layouts).
   - **Scope ambiguity** - the requirement could mean 2 different things with 2x+ effort difference.
   - **New dependency** would be introduced that isn't trivial.
   - **Non-obvious risk** - one approach is safer but slower, another faster but riskier.

   **How to consult:**
   ```
   Konu: [brief topic title]
   Durum: [one-line context]
   Seçenekler:
   1. [Option A] - [advantage: X] / [disadvantage: Y]
   2. [Option B] - [advantage: X] / [disadvantage: Y]
   Önerim: [Option X] - [short reason]
   Nasıl devam edelim?
   ```

   If no decision meets the threshold, proceed automatically. Do NOT consult for trivial details (variable names, formatting, file organization).

4. **Select** - choose the highest-ranked approach. If user input was obtained, incorporate it. If two are tied and no user input, pick the simpler one.
5. **Break down** - list concrete implementation steps (order matters - dependencies first).

**Output:** A structured plan with chosen approach, rejected alternatives with brief reasoning, and ordered step list.

**Exception:** For truly trivial changes (single-line fix, typo), the entire user consultation gate is skipped - compress the whole step to one sentence: "Plan: [single approach]".

**Exception:** For truly trivial changes (single-line fix, typo), this step compresses to one sentence: "Plan: [single approach]".

---

### Step 3 - Backup

Before touching ANY file, backup every file that will be changed.

**Rules:**
- Backup directory: `backups/v<current-version>/`
- Create the directory if it doesn't exist: `New-Item -ItemType Directory -Path "backups/v<version>" -Force`
- Copy every file before editing: `Copy-Item -Path "original/path/file.ext" -Destination "backups/v<version>/file.ext"`
- Backup ONCE per file per session. If you already backed up a file, do not overwrite.
- If the version is not obvious, use the next logical version (e.g., if current is v1.0.1, use v1.0.2).
- If a backup already exists for that version, create a subfolder with timestamp: `backups/v<version>/2026-06-23_14-30/`

**Incremental backups during implementation:** After each completed step (Step 4 checkpoint), you may optionally backup again. This is recommended for multi-step changes.

---

### Step 4 - Implement (Change → Test → Pass → Next)

This is the core loop. Each unit of work follows this exact sub-cycle:

```
┌────────────────────────────────────────────────────┐
│  For EACH function / class / module / feature:     │
│                                                     │
│  4a. Write the change (code)                       │
│  4b. Write the test for it                         │
│  4c. Run the test                                  │
│  4d. Test passes? ──yes──→ Next unit               │
│       │                                            │
│       no                                           │
│       ↓                                            │
│  4e. Fix the failure root cause                    │
│  4f. Go to 4c                                      │
│                                                     │
│  STOP CONDITION: All tests pass with zero           │
│  mocks, zero placeholders, zero workarounds.        │
└────────────────────────────────────────────────────┘
```

**Hard rules - NEVER violate:**
- **No mocks.** Tests must use real implementations. If a dependency is expensive (e.g., hardware API), abstract with a thin trait/interface that has a real test implementation - not a mock framework.
- **No placeholders.** `TODO`, `FIXME`, `pass`, `return None`, `throw new Error("not implemented")` are forbidden in delivered code. Every line must be real.
- **No workarounds.** If a test fails, fix the ROOT CAUSE. Do not change the test. Do not add `@ts-ignore`, `# type: ignore`, `as any`, or any suppression. Do not skip assertions.
- **One unit at a time.** Do not write 5 functions then write 5 tests. Function → test → pass → next function.
- **Test must fail first** if the feature is truly new (the test proves the feature doesn't exist yet, then your code makes it pass).
- **If stuck for 3+ attempts on the same unit**, stop. Revert to last known good state. Document what was tried. Consult Oracle with full context.

**Output per unit:** "Implemented [function X]. Test [test_X] passes. [N] attempts."

---

### Step 5 - Update TODO.md

After all implementation is complete and all tests pass:

1. Read the current `TODO.md`.
2. Check off completed items.
3. Add any new items discovered during implementation (tech debt, follow-ups).
4. If `TODO.md` does not exist, create it with sections: `## Done`, `## In Progress`, `## Backlog`, `## Known Issues`.

---

### Step 6 - Update Version & Release Artifacts

Update everything that reflects the current state of the project:

| Artifact | What to update | When |
|----------|---------------|------|
| `package.json` | `version` field | If version changed |
| `src-tauri/Cargo.toml` | `version` field | If version changed |
| `README.md` | Feature list, screenshots, URLs, badges | After any public-facing change |
| `ultimate_toolkit_web/` (landing page) | Hero text, feature list, CTA, footer | After any significant change |
| `ultimate_toolkit_web/docs/content/v<version>/` | Docs content | After any user-facing change |
| `docs/content/v<version>/index.json` | Categories, pages, manifest metadata | After any doc change |
| `docs/content/v<version>/changelog.md` | Add entry for the new version | After every release |

**Order:** Update internal versioning → README → website → docs → changelog.

---

### Step 7 - Report

Deliver a structured report to the user.

**Format:**

```
## Summary
[1–2 sentences on what was done]

## Changes
- [file path] - [what changed]

## Tests
[N] tests written. All pass.

## Verification
[How you verified - build output, live URL check, etc.]

## Notes
[Anything unusual, tech debt incurred, future considerations]
```

**No long narratives.** The report should be scannable in 10 seconds. If the user wants details, they will ask.

---

## Diagram (Summary View)

```
User instruction
     │
     ▼
┌──────────┐
│ Research │  (read codebase, patterns, dependencies)
└────┬─────┘
     │
     ▼
┌──────────┐
│  Plan    │  (2-3 alternatives → re-rank → consult user? → select → break down)
└────┬─────┘
     │
     ▼ (if user consultation triggered)
┌───────────┐
│ Ask user  │  (options + pros/cons → wait → incorporate)
└─────┬─────┘
      │
     │
     ▼
┌──────────┐
│ Backup   │  (backups/v<version>/)
└────┬─────┘
     │
     ▼
┌──────────┐     ┌──────────────┐     ┌──────────┐
│ 4a Write │────→│ 4b Test      │────→│ 4c Pass? │──yes──→ Next unit
│  code    │     │  (no mocks)  │     │          │
└──────────┘     └──────────────┘     └────┬─────┘
                                           │no
                                           ▼
                                    ┌──────────────┐
                                    │ 4e Fix root   │
                                    │  cause         │
                                    └──────┬───────┘
                                           │
                                           ▼
                                    ┌──────────────┐
                                    │ 4f Retry test │────→ back to 4c
                                    └──────────────┘
     │
     ▼ (all units done)
┌──────────┐
│ Todo.md  │  (check off, add new items)
└────┬─────┘
     │
     ▼
┌──────────┐
│ Release  │  (version → README → website → docs → changelog)
└────┬─────┘
     │
     ▼
┌──────────┐
│ Report   │  (structured summary to user)
└──────────┘
```

---

## Quick Reference - One-Line Per Step

| Step | One-liner |
|------|-----------|
| 0 | Understand the instruction - goal, scope, constraints |
| 1 | Read all impacted files + patterns + dependencies |
| 2 | Generate 2-3 alternatives, re-rank, **consult user on tradeoffs**, select best, break into ordered steps |
| 3 | `Copy-Item` every file-to-change into `backups/v<version>/` |
| 4 | For each unit: write code → write test → test passes (no mocks/placeholders/workarounds) → next |
| 5 | Update TODO.md - check done, add discovered items |
| 6 | Bump version → README → website → docs → changelog |
| 7 | Deliver structured report to user |
