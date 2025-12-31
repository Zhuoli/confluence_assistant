---
name: repo-runbooks-ops
description: Operational runbooks repository containing incident response procedures, deployment guides, and SOPs
---

# Operational Runbooks Repository

## Basic Information

- **Repository**: `ops-runbooks`
- **Location**: `git@github.com:company/ops-runbooks.git`
- **Purpose**: Central repository for operational procedures, incident response guides, deployment runbooks, and SOPs
- **Format**: Markdown documents
- **Team**: Shared across all engineering teams, maintained by SRE
- **On-Call**: sre-oncall PagerDuty rotation

## Repository Structure

```
ops-runbooks/
├── README.md                           # Overview and index
├── services/                           # Service-specific runbooks
│   ├── payment-service/
│   │   ├── deployment.md
│   │   ├── troubleshooting.md
│   │   ├── rollback.md
│   │   └── monitoring.md
│   ├── user-service/
│   │   ├── deployment.md
│   │   ├── database-maintenance.md
│   │   └── troubleshooting.md
│   └── order-service/
│       ├── deployment.md
│       └── scaling.md
├── incidents/                          # Incident response procedures
│   ├── severity-assessment.md
│   ├── incident-commander-guide.md
│   ├── communication-templates.md
│   └── postmortem-template.md
├── infrastructure/                     # Infrastructure procedures
│   ├── kubernetes/
│   │   ├── cluster-upgrade.md
│   │   ├── node-maintenance.md
│   │   └── troubleshooting.md
│   ├── databases/
│   │   ├── postgres-failover.md
│   │   ├── redis-maintenance.md
│   │   └── backup-restore.md
│   └── networking/
│       ├── dns-changes.md
│       └── firewall-rules.md
├── deployments/                        # Deployment procedures
│   ├── deployment-checklist.md
│   ├── rollback-procedures.md
│   ├── blue-green-deployment.md
│   └── canary-deployment.md
├── security/                           # Security procedures
│   ├── security-incident-response.md
│   ├── access-management.md
│   ├── secrets-rotation.md
│   └── vulnerability-patching.md
├── oncall/                            # On-call guides
│   ├── oncall-handoff.md
│   ├── escalation-paths.md
│   └── common-alerts.md
└── templates/                         # Document templates
    ├── runbook-template.md
    ├── incident-report-template.md
    └── maintenance-window-template.md
```

## Key Runbooks by Category

### Service-Specific Runbooks

**Payment Service** (`services/payment-service/`):
- **deployment.md**: Full deployment procedure including pre/post checks
- **troubleshooting.md**: Common issues and resolution steps
- **rollback.md**: Emergency rollback procedures
- **monitoring.md**: Key metrics, dashboards, alert thresholds

**User Service** (`services/user-service/`):
- **deployment.md**: Deployment with database migration handling
- **database-maintenance.md**: Database backup, restore, index maintenance
- **troubleshooting.md**: Authentication issues, user data problems

### Incident Response (`incidents/`)

**severity-assessment.md**:
- How to determine incident severity (P0-P4)
- Escalation triggers
- Response time SLAs

**incident-commander-guide.md**:
- Role and responsibilities of incident commander
- War room setup procedures
- Communication protocols
- Incident lifecycle management

**communication-templates.md**:
- Status page update templates
- Slack announcement templates
- Customer communication templates
- Executive summary templates

**postmortem-template.md**:
- RCA document structure
- Timeline format
- Action item tracking
- Blameless postmortem guidelines

### Infrastructure Procedures (`infrastructure/`)

**Kubernetes** (`infrastructure/kubernetes/`):
- **cluster-upgrade.md**: Kubernetes version upgrade procedure
- **node-maintenance.md**: Node draining, cordoning, replacement
- **troubleshooting.md**: Pod issues, resource problems, network debugging

**Databases** (`infrastructure/databases/`):
- **postgres-failover.md**: Primary database failover procedure
- **redis-maintenance.md**: Redis cluster maintenance, resharding
- **backup-restore.md**: Backup verification and restore procedures

### Deployment Guides (`deployments/`)

**deployment-checklist.md**:
- Pre-deployment verification
- Deployment steps
- Post-deployment validation
- Rollback decision criteria

**rollback-procedures.md**:
- When to rollback vs. roll forward
- Rollback execution steps
- Database rollback considerations
- Post-rollback actions

**blue-green-deployment.md**:
- Blue-green deployment strategy
- Traffic switching procedures
- Validation steps
- Cleanup procedures

### Security Procedures (`security/`)

**security-incident-response.md**:
- Security incident classification
- Immediate containment steps
- Investigation procedures
- Notification requirements (legal, customers)

**access-management.md**:
- Granting production access
- Access review procedures
- Revoking access (offboarding)
- Audit logging

**secrets-rotation.md**:
- API key rotation procedures
- Database credential rotation
- Certificate renewal
- Service restart coordination

### On-Call Guides (`oncall/`)

**oncall-handoff.md**:
- Weekly handoff checklist
- Ongoing incidents summary
- Known issues to watch
- Scheduled maintenance

**escalation-paths.md**:
- When to escalate
- Who to contact for each service
- External vendor contacts
- Executive escalation

**common-alerts.md**:
- Most frequent alerts
- Quick triage steps
- Known false positives
- Common resolutions

## Runbook Format Standards

All runbooks follow this structure:

```markdown
# [Runbook Title]

**Last Updated**: YYYY-MM-DD
**Owner**: [Team/Individual]
**Review Frequency**: Quarterly / After major changes

## Overview
Brief description of what this runbook covers.

## When to Use
Specific scenarios when this runbook applies.

## Prerequisites
- Required access/permissions
- Required tools
- Knowledge prerequisites

## Procedure

### Step 1: [Action]
**Command**:
```bash
command here
```

**Expected Output**:
```
expected output here
```

**If this fails**: Troubleshooting steps

### Step 2: [Action]
...

## Validation
How to verify the procedure succeeded.

## Rollback
How to undo changes if needed.

## Common Issues
- Issue: Description
  - Resolution: Steps to fix

## References
- Related runbooks
- Documentation links
- Confluence pages
```

## Using These Runbooks

### Quick Access

**Finding a runbook**:
```bash
# Clone the repo
git clone git@github.com:company/ops-runbooks.git
cd ops-runbooks

# Search for a runbook
grep -r "payment service" services/

# Use the README index
cat README.md | grep -i "deployment"
```

**During an incident**:
1. Check `incidents/severity-assessment.md` to determine severity
2. Follow `incidents/incident-commander-guide.md` for coordination
3. Use service-specific troubleshooting guide
4. Update status using templates in `incidents/communication-templates.md`

### Runbook Usage Patterns

**For Deployments**:
```
1. Read: deployments/deployment-checklist.md
2. Follow: services/[service-name]/deployment.md
3. If issues: services/[service-name]/rollback.md
```

**For Incidents**:
```
1. Assess: incidents/severity-assessment.md
2. Coordinate: incidents/incident-commander-guide.md
3. Troubleshoot: services/[service-name]/troubleshooting.md
4. Document: incidents/postmortem-template.md
```

**For Maintenance**:
```
1. Plan: templates/maintenance-window-template.md
2. Execute: infrastructure/[component]/maintenance.md
3. Validate: Check service health
```

## Runbook Maintenance

### Updating Runbooks

**After an incident**:
1. Create PR with runbook improvements
2. Reference incident ticket in commit message
3. Update "Last Updated" date
4. Get review from incident participants

**Quarterly review**:
- SRE team reviews all runbooks
- Test critical procedures
- Update outdated commands/URLs
- Archive obsolete runbooks

**Version control**:
- All changes tracked in Git
- Tag releases: `v2024.01`, `v2024.02`, etc.
- Use conventional commits
- Require PR reviews for all changes

### Creating New Runbooks

**When to create a runbook**:
- New service deployed to production
- Recurring incident requires standardized response
- Complex procedure executed manually multiple times
- On-call engineers request guidance

**Process**:
1. Copy appropriate template from `templates/`
2. Fill in all required sections
3. Test the procedure if possible
4. Get review from service owner and SRE
5. Add to README index
6. Announce in #engineering channel

## Integration with Other Systems

### Confluence
Many runbooks are also published to Confluence for easier discovery:
- Confluence Space: "Operations"
- Auto-sync via GitHub Actions
- Bidirectional links between repo and Confluence

### PagerDuty
- Runbook links included in PagerDuty alert descriptions
- Format: "Runbook: https://github.com/company/ops-runbooks/blob/main/services/..."

### Internal Docs Portal
- Runbooks indexed in internal search
- Accessible at: https://docs.company.internal/runbooks/

## Common Runbook Scenarios

### Scenario: Service Deployment

**Runbooks to reference**:
1. `deployments/deployment-checklist.md` - Pre-flight checks
2. `services/{service}/deployment.md` - Service-specific steps
3. `services/{service}/monitoring.md` - Post-deployment validation
4. `deployments/rollback-procedures.md` - If issues arise

**Typical flow**:
```bash
# 1. Pre-deployment
- Review deployment checklist
- Verify tests passed
- Check monitoring dashboards
- Notify team in Slack

# 2. Deployment
- Follow service-specific deployment.md
- Monitor logs in real-time
- Watch key metrics

# 3. Validation
- Run health checks
- Verify traffic routing
- Check error rates for 30 minutes

# 4. Rollback (if needed)
- Follow rollback.md if errors spike
- Document issues for postmortem
```

### Scenario: Database Incident

**Runbooks to reference**:
1. `incidents/severity-assessment.md` - Assess impact
2. `incidents/incident-commander-guide.md` - Coordinate response
3. `infrastructure/databases/postgres-failover.md` - Execute failover
4. `incidents/communication-templates.md` - Status updates
5. `incidents/postmortem-template.md` - Document afterwards

### Scenario: Security Vulnerability

**Runbooks to reference**:
1. `security/security-incident-response.md` - Initial response
2. `security/vulnerability-patching.md` - Patching procedure
3. `deployments/deployment-checklist.md` - Deploy patches
4. `security/secrets-rotation.md` - If credentials compromised

## Tips for Using Runbooks

1. **Read first, execute later**: Understand the full procedure before starting
2. **Check the date**: Verify runbook is recently updated
3. **Copy commands carefully**: Don't modify without understanding
4. **Document deviations**: If you deviate from runbook, document why
5. **Update as you go**: Found an issue? Fix it in a PR
6. **Use checklists**: Create a checklist from runbook steps
7. **Ask for help**: If unclear, ask in #sre or #infrastructure

## Recent Updates

**2024-01-20**:
- Added canary deployment runbook
- Updated Kubernetes cluster upgrade procedure for v1.28
- Improved incident communication templates

**2024-01-15**:
- Added new payment service troubleshooting guide
- Updated database failover procedures
- Added security incident response runbook

**2024-01-10**:
- Reorganized directory structure for better discoverability
- Added runbook template
- Improved README index
