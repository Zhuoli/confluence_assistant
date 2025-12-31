# Repository Skills - Setup Guide

This guide explains how to create Skills for code repositories to provide context to the AI assistant.

## Why Repository Skills?

When the AI has Skills for your repositories, it can:
- Generate accurate technical documentation based on actual code structure
- Answer questions about specific services and how they work
- Understand relationships between multiple repos
- Reference correct paths, commands, and configurations
- Create runbooks with actual operational procedures
- Explain architecture decisions with proper context

## Skill Naming Convention

Use these naming patterns:

```
.claude/skills/
├── repo-[service-name]/SKILL.md          # Single repository
├── repos-[team-name]-overview/SKILL.md   # Multiple repos overview
├── repo-runbooks-[name]/SKILL.md         # Runbook repository
├── repo-shepherd-[name]/SKILL.md         # Shepherd/release repository
└── repo-library-[name]/SKILL.md          # Shared library
```

Examples:
- `repo-payment-service/` - Payment processing service
- `repo-user-service/` - User management service
- `repos-trading-platform/` - Overview of all trading platform repos
- `repo-runbooks-ops/` - Operational runbooks repository
- `repo-shepherd-releases/` - Shepherd release management

## Repository Skill Template

Each repository skill should include:

### 1. Basic Information
- Repository name and location
- Purpose/what the repo does
- Primary language and frameworks
- Team ownership
- Related repositories

### 2. Architecture & Structure
- Directory structure
- Key components/modules
- Design patterns used
- Important files to know about

### 3. Development Setup
- Prerequisites
- How to build/run locally
- Environment setup
- Common development tasks

### 4. Deployment & Operations
- How it's deployed
- Monitoring/observability
- Configuration management
- Runbook location (if applicable)

### 5. Key Concepts
- Domain models
- Important algorithms/logic
- Integration points
- Dependencies

### 6. Documentation References
- Where to find detailed docs
- Confluence pages
- API documentation
- Architecture diagrams

## Multi-Repository Overview Skill

For services composed of multiple repos, create an overview skill:

```markdown
---
name: repos-[service-name]-overview
description: Overview of [Service Name] architecture and repositories
---

# [Service Name] - Multi-Repository Overview

## Service Architecture
[High-level description of what the service does]

## Repositories
1. **[repo-name-1]** - [Purpose]
   - Language: [Language]
   - Deploys to: [Environment]
   - Depends on: [Other repos]

2. **[repo-name-2]** - [Purpose]
   - Language: [Language]
   - Deploys to: [Environment]
   - Depends on: [Other repos]

## How Repositories Work Together
[Explain the relationships and data flow]

## Deployment Flow
[How the repos are deployed together]
```

## Runbook Repository Skills

For repositories containing operational runbooks:

```markdown
---
name: repo-runbooks-[name]
description: Operational runbooks and procedures
---

# Runbooks Repository

## Purpose
Contains operational runbooks, incident response procedures, and SOPs.

## Contents
- `/runbooks/services/` - Service-specific runbooks
- `/runbooks/incidents/` - Incident response procedures
- `/runbooks/deployments/` - Deployment procedures

## Key Runbooks
- `service-x-deployment.md` - How to deploy service X
- `database-failover.md` - Database failover procedure
- `incident-response.md` - General incident response

## Using These Runbooks
[How team members access and use these runbooks]
```

## Shepherd/Release Repository Skills

For Shepherd or release management repos:

```markdown
---
name: repo-shepherd-[name]
description: Shepherd release management and deployment automation
---

# Shepherd Release Repository

## Purpose
Contains Shepherd configurations, release scripts, and deployment automation.

## Structure
- `/releases/` - Release configurations
- `/scripts/` - Deployment scripts
- `/configs/` - Environment configs

## Release Process
[How releases are managed using this repo]

## Key Scripts
- `deploy.sh` - Main deployment script
- `rollback.sh` - Rollback procedure
- `validate.sh` - Post-deployment validation
```

## Best Practices

1. **Keep Skills Updated**: Update when repo structure changes significantly
2. **Reference Actual Paths**: Use real file paths and commands
3. **Link to Code**: Reference specific files where helpful
4. **Include Examples**: Show example commands, configs, API calls
5. **Document Gotchas**: Known issues, workarounds, caveats
6. **Version Info**: Note if skills apply to specific versions
7. **Cross-reference**: Link related skills and repos

## When to Create a New Skill

Create a new repository skill when:
- Adding a new microservice
- Team takes ownership of a new repo
- Significant architectural changes warrant new documentation
- New operational procedures are established

## Using Repository Skills

The AI will automatically reference repository skills when:
- Creating technical documentation
- Answering questions about specific services
- Generating runbooks
- Explaining architecture
- Troubleshooting issues
- Planning changes or new features

Example prompts that benefit from repo skills:
```
"Create a technical design for adding caching to the payment service"
→ AI references repo-payment-service skill for current architecture

"Document the deployment process for our trading platform"
→ AI references repos-trading-platform-overview and repo-shepherd skills

"Explain how user authentication works across our services"
→ AI references repo-user-service and related service skills

"Create a runbook for the payment service database failover"
→ AI references repo-payment-service and repo-runbooks skills
```
