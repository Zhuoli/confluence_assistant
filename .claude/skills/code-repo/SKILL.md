---
name: reading-code-repositories
description: Guides efficient code repository comprehension using senior developer methodology. Prevents exhaustive file-by-file reading. Use when exploring unfamiliar codebases, understanding project architecture, onboarding to new repositories, or answering questions about code structure. Triggers on phrases like "understand this repo", "explain this codebase", "how does this project work", or when given access to a code repository via MCP tools.
---

# Reading Code Repositories

Read repositories strategically, not exhaustively. Build understanding top-down using file names as documentation.

## Quick Reference: The 5-Phase Approach

| Phase | Action | Read Contents? |
|-------|--------|----------------|
| 1. README | Read README.md first | Yes |
| 2. Stack | Check dependency files | Yes |
| 3. Structure | List directories/file names | **No** |
| 4. Entry Points | Find main/app/index files | Yes |
| 5. Targeted | Answer specific questions | Only relevant files |

## Phase 1: README First (Always)

README.md contains architecture decisions, setup context, and design rationale. Read it before any source code.

## Phase 2: Identify the Stack

Check these files to understand language and framework:

| File | Reveals |
|------|---------|
| `package.json` / `requirements.txt` / `go.mod` | Language, dependencies |
| `Dockerfile` / `docker-compose.yml` | Deployment pattern |
| `Makefile` / `build.gradle` / `Cargo.toml` | Build system |

## Phase 3: Map Structure via Names Only

**Do not read file contents.** File names are documentation.

```
src/
├── api/           → Request handling
├── services/      → Business logic
├── models/        → Data structures
├── utils/         → Helpers (skip)
└── main.py        → Entry point
```

Common naming patterns:
- `controllers/`, `handlers/`, `api/` → Request layer
- `services/`, `domain/`, `core/` → Business logic
- `models/`, `entities/`, `schemas/` → Data structures
- `utils/`, `helpers/` → Skip initially

## Phase 4: Entry Points

Find where execution starts:

| Type | Look for |
|------|----------|
| Web API | `main.py`, `app.py`, `server.js`, routes |
| CLI | `cli.py`, `cmd/`, `main.rs` |
| Library | `__init__.py`, `index.js`, exports |

## Phase 5: Targeted Deep Dives

Only read files to answer specific questions:

```
Question: "How does auth work?"
→ Find: auth/, middleware/auth, jwt, token
→ Read: Only those 1-3 files
```

## Anti-Patterns

❌ Reading every file recursively  
❌ Starting with utils/helpers  
❌ Reading tests before source  
❌ Skipping README.md  
❌ Reading more than 5 files for overview questions

## Decision Tree

```
User wants overview? → README + structure + entry point (3 files max)
User has specific question? → Search file names → Read 1-3 relevant files
Reading 5+ files? → Stop and reassess approach
```
