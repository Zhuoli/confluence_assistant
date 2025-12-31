---
name: repo-shepherd-releases
description: Shepherd release management repository containing deployment configurations, release scripts, and rollback procedures
---

# Shepherd Release Management Repository

## Basic Information

- **Repository**: `shepherd-releases`
- **Location**: `git@github.com:company/shepherd-releases.git`
- **Purpose**: Centralized release management using Shepherd for coordinated multi-service deployments
- **Tool**: Shepherd (internal deployment orchestration tool)
- **Team**: Platform Engineering / SRE
- **On-Call**: platform-oncall PagerDuty rotation

## What is Shepherd?

Shepherd is the company's deployment orchestration platform that:
- Manages multi-service releases as atomic units
- Handles dependency ordering between services
- Provides rollback capabilities
- Integrates with CI/CD pipelines
- Tracks deployment history and state
- Enforces deployment gates and approvals

## Repository Structure

```
shepherd-releases/
├── README.md                           # Overview and quick start
├── releases/                           # Release definitions
│   ├── trading-platform/
│   │   ├── 2024-q1/
│   │   │   ├── v1.5.0.yaml
│   │   │   ├── v1.5.1.yaml
│   │   │   └── v1.6.0.yaml
│   │   └── 2024-q2/
│   │       ├── v1.7.0.yaml
│   │       └── v1.8.0.yaml
│   ├── payments/
│   │   └── 2024-q1/
│   │       ├── v2.5.0.yaml
│   │       └── v2.6.0.yaml
│   └── user-services/
│       └── 2024-q1/
│           └── v3.2.0.yaml
├── configs/                            # Environment configurations
│   ├── dev/
│   │   ├── cluster.yaml
│   │   └── services.yaml
│   ├── staging/
│   │   ├── cluster.yaml
│   │   └── services.yaml
│   └── production/
│       ├── cluster.yaml
│       └── services.yaml
├── scripts/                            # Deployment scripts
│   ├── deploy.sh
│   ├── rollback.sh
│   ├── validate.sh
│   ├── status.sh
│   └── promote.sh
├── templates/                          # Release templates
│   ├── release-template.yaml
│   └── hotfix-template.yaml
├── hooks/                             # Pre/post deployment hooks
│   ├── pre-deploy/
│   │   ├── backup-database.sh
│   │   └── notify-team.sh
│   └── post-deploy/
│       ├── smoke-tests.sh
│       └── update-status-page.sh
└── docs/                              # Documentation
    ├── shepherd-guide.md
    ├── release-process.md
    └── troubleshooting.md
```

## Release Definition Format

Shepherd releases are defined in YAML files:

```yaml
# Example: releases/trading-platform/2024-q1/v1.6.0.yaml

apiVersion: shepherd.company.com/v1
kind: Release
metadata:
  name: trading-platform-v1.6.0
  version: v1.6.0
  created: 2024-01-15
  owner: trading-platform-team
  jira: TRADE-1234

spec:
  description: "Q1 2024 release with real-time order matching"

  # Services to deploy in this release
  services:
    - name: order-service
      version: v2.8.0
      image: company/order-service:v2.8.0
      replicas: 10

    - name: matching-engine
      version: v3.1.0
      image: company/matching-engine:v3.1.0
      replicas: 5

    - name: market-data-service
      version: v1.5.0
      image: company/market-data-service:v1.5.0
      replicas: 8

  # Deployment order (handles dependencies)
  deploymentOrder:
    - phase: 1
      services: [market-data-service]
      waitForHealthy: true

    - phase: 2
      services: [matching-engine]
      waitForHealthy: true

    - phase: 3
      services: [order-service]
      waitForHealthy: true

  # Database migrations
  migrations:
    - service: order-service
      path: db/migrations/v2.8.0
      rollback: db/rollbacks/v2.8.0

  # Configuration changes
  configChanges:
    - service: order-service
      key: ORDER_MATCHING_ENABLED
      value: "true"

  # Feature flags
  featureFlags:
    - flag: enable-real-time-matching
      value: true
      rollout: 10  # Start with 10% rollout

  # Deployment gates
  gates:
    - name: approval
      type: manual
      approvers: [engineering-lead, product-manager]

    - name: tests
      type: automated
      tests:
        - integration-tests
        - smoke-tests

    - name: monitoring
      type: automated
      metrics:
        - error_rate < 1%
        - response_time_p95 < 500ms
      duration: 15m

  # Rollback strategy
  rollback:
    automatic: true
    triggers:
      - error_rate > 5%
      - health_check_failures > 3
    strategy: immediate
    previousVersion: v1.5.1

  # Notifications
  notifications:
    slack:
      - channel: "#trading-platform-releases"
      - channel: "#engineering-all"
    email:
      - trading-platform-team@company.com
```

## Release Process

### 1. Creating a Release

```bash
# Step 1: Create release definition from template
cd shepherd-releases
cp templates/release-template.yaml releases/trading-platform/2024-q2/v1.9.0.yaml

# Step 2: Edit release definition
vim releases/trading-platform/2024-q2/v1.9.0.yaml

# Step 3: Validate release definition
./scripts/validate.sh releases/trading-platform/2024-q2/v1.9.0.yaml

# Step 4: Commit and push
git add releases/trading-platform/2024-q2/v1.9.0.yaml
git commit -m "Add release definition for trading-platform v1.9.0"
git push origin main
```

### 2. Deploying to Staging

```bash
# Deploy to staging (automatic after merge to main)
./scripts/deploy.sh \
  --release trading-platform-v1.9.0 \
  --environment staging

# Monitor deployment
./scripts/status.sh trading-platform-v1.9.0 --environment staging

# Output:
# ✓ market-data-service: HEALTHY (5/5 replicas)
# ✓ matching-engine: HEALTHY (3/3 replicas)
# ⋯ order-service: DEPLOYING (7/10 replicas)
```

### 3. Deploying to Production

```bash
# Requires approval gate to be satisfied
./scripts/deploy.sh \
  --release trading-platform-v1.9.0 \
  --environment production \
  --wait-for-approval

# System prompts:
# "Deployment requires approval from: [engineering-lead, product-manager]"
# "Request approval? (y/n)"

# After approval granted:
# "Deployment started. Monitor at: https://shepherd.company.com/releases/..."

# Watch progress
./scripts/status.sh trading-platform-v1.9.0 --environment production --follow
```

### 4. Progressive Rollout

```bash
# Start with 10% traffic
./scripts/promote.sh \
  --release trading-platform-v1.9.0 \
  --environment production \
  --traffic-percentage 10

# Wait and monitor metrics...
# If metrics look good:

# Promote to 50%
./scripts/promote.sh \
  --release trading-platform-v1.9.0 \
  --environment production \
  --traffic-percentage 50

# Promote to 100%
./scripts/promote.sh \
  --release trading-platform-v1.9.0 \
  --environment production \
  --traffic-percentage 100
```

### 5. Rollback

```bash
# Automatic rollback if gates fail
# (error rate > 5% or health checks fail)

# Manual rollback if needed
./scripts/rollback.sh \
  --release trading-platform-v1.9.0 \
  --environment production \
  --to-version v1.8.0

# Emergency rollback (skip validation)
./scripts/rollback.sh \
  --release trading-platform-v1.9.0 \
  --environment production \
  --emergency
```

## Key Scripts

### deploy.sh

Main deployment script:

```bash
./scripts/deploy.sh --release <release-name> --environment <env> [options]

Options:
  --release            Release name (from releases/ directory)
  --environment        Target environment (dev/staging/production)
  --wait-for-approval  Wait for manual approval gate
  --dry-run           Show what would be deployed without deploying
  --skip-tests        Skip automated test gates (not recommended)
  --force             Skip all gates (emergency only)
```

**Example**:
```bash
# Dry run to production
./scripts/deploy.sh \
  --release trading-platform-v1.9.0 \
  --environment production \
  --dry-run

# Actual deployment
./scripts/deploy.sh \
  --release trading-platform-v1.9.0 \
  --environment production \
  --wait-for-approval
```

### rollback.sh

Rollback to previous version:

```bash
./scripts/rollback.sh --release <release-name> --environment <env> [options]

Options:
  --release      Release to rollback
  --environment  Environment to rollback in
  --to-version   Specific version to rollback to (optional)
  --emergency    Emergency rollback (skip validations)
  --reason       Reason for rollback (for audit log)
```

**Example**:
```bash
# Rollback to previous version
./scripts/rollback.sh \
  --release trading-platform-v1.9.0 \
  --environment production \
  --reason "High error rate in order-service"

# Rollback to specific version
./scripts/rollback.sh \
  --release trading-platform-v1.9.0 \
  --environment production \
  --to-version v1.7.0
```

### status.sh

Check deployment status:

```bash
./scripts/status.sh <release-name> --environment <env> [options]

Options:
  --environment  Environment to check
  --follow       Follow status updates (real-time)
  --detailed     Show detailed information
  --json         Output in JSON format
```

**Example**:
```bash
# Check current status
./scripts/status.sh trading-platform-v1.9.0 --environment production

# Follow deployment progress
./scripts/status.sh trading-platform-v1.9.0 --environment production --follow

# Get detailed status with metrics
./scripts/status.sh trading-platform-v1.9.0 --environment production --detailed
```

### validate.sh

Validate release definition:

```bash
./scripts/validate.sh <release-file>

# Example
./scripts/validate.sh releases/trading-platform/2024-q2/v1.9.0.yaml

# Checks:
# ✓ YAML syntax valid
# ✓ All required fields present
# ✓ Service images exist
# ✓ Dependencies resolvable
# ✓ Migration scripts exist
# ⚠ Warning: No rollback migrations defined
```

## Deployment Hooks

### Pre-Deployment Hooks

Located in `hooks/pre-deploy/`:

**backup-database.sh**:
- Creates database backup before migration
- Uploads to S3
- Verifies backup integrity

**notify-team.sh**:
- Posts deployment start message to Slack
- Updates status page to "Deployment in progress"
- Creates deployment log entry

### Post-Deployment Hooks

Located in `hooks/post-deploy/`:

**smoke-tests.sh**:
- Runs critical smoke tests
- Verifies key endpoints
- Checks health of all services

**update-status-page.sh**:
- Updates status page to "All systems operational"
- Posts completion message to Slack
- Closes deployment log entry

## Configuration Management

### Environment Configs

Each environment has its own config:

**configs/production/cluster.yaml**:
```yaml
apiVersion: shepherd.company.com/v1
kind: ClusterConfig
metadata:
  name: production

spec:
  cluster:
    name: production-us-east-1
    region: us-east-1

  defaults:
    replicas:
      min: 3
      max: 50
    resources:
      cpu: 1000m
      memory: 2Gi

  monitoring:
    grafana: https://grafana.company.com
    prometheus: https://prometheus.company.com
    alertmanager: https://alerts.company.com
```

## Common Release Patterns

### Standard Release

For regular quarterly releases:
- Use `templates/release-template.yaml`
- Deploy to dev → staging → production
- Requires approval gates
- Progressive rollout in production
- 2-week bake time in production

### Hotfix Release

For urgent bug fixes:
- Use `templates/hotfix-template.yaml`
- Deploy directly to staging → production
- Expedited approval process
- Can skip some test gates
- Faster rollout (still progressive)

### Database Migration Release

For releases with database changes:
- Include migration scripts in release definition
- Automatic backup before migration
- Rollback migrations required
- Extended validation period
- Can't use automatic rollback (requires manual review)

## Monitoring & Observability

### Shepherd Dashboard

- URL: https://shepherd.company.com
- Shows all active deployments
- Real-time deployment status
- Historical deployment logs
- Rollback history

### Metrics

Key metrics tracked during deployment:
- Service health (replicas ready)
- Error rate (per service)
- Response time (p50, p95, p99)
- Traffic distribution (during progressive rollout)
- Resource utilization

### Alerts

Shepherd sends alerts for:
- Deployment failures
- Gate violations
- Automatic rollbacks triggered
- Manual approval required
- Deployment completion

## Troubleshooting

### Deployment Stuck

**Symptoms**: Deployment shows "IN_PROGRESS" for >30 minutes

**Diagnosis**:
```bash
# Check detailed status
./scripts/status.sh <release> --environment production --detailed

# Check service logs
kubectl logs -f deployment/<service> -n <namespace>

# Check events
kubectl get events -n <namespace> --sort-by='.lastTimestamp'
```

**Common causes**:
- Image pull failures (check image exists)
- Health check failures (check logs)
- Resource constraints (check node capacity)
- Configuration errors (check configmaps)

### Automatic Rollback Triggered

**Symptoms**: Deployment automatically rolled back

**Diagnosis**:
```bash
# Check rollback reason
./scripts/status.sh <release> --environment production --detailed

# Look at metrics around rollback time
# Check Grafana dashboard for error rates, response times
```

**Common causes**:
- Error rate exceeded threshold
- Health check failures
- Deployment timeout
- Resource exhaustion

### Gate Failures

**Symptoms**: Deployment blocked at a gate

**Diagnosis**:
```bash
# Check gate status
./scripts/status.sh <release> --environment production

# Check specific gate logs
shepherd gate-status <release> --gate <gate-name>
```

**Common gates**:
- **Approval gate**: Waiting for manual approval
- **Test gate**: Tests failed (check CI logs)
- **Monitoring gate**: Metrics don't meet thresholds

## Best Practices

1. **Always use dry-run first**: Test deployment plan before executing
2. **Progressive rollout**: Start with small traffic percentage
3. **Monitor metrics**: Watch error rates during deployment
4. **Have rollback plan**: Know rollback version before deploying
5. **Test rollback**: Verify rollback works in staging
6. **Document changes**: Include detailed description in release definition
7. **Communicate**: Announce in team channels before/after deployment
8. **Validate migrations**: Test migrations on production-like data
9. **Backup first**: Always backup before database migrations
10. **Review gates**: Don't skip safety gates unless emergency

## Integration with CI/CD

Shepherd integrates with Jenkins/GitHub Actions:

**Automated workflow**:
1. Code merged to `main` branch
2. CI builds and tests
3. CI creates Docker images
4. CI triggers Shepherd deployment to `dev`
5. If successful, auto-promotes to `staging`
6. Production deployment requires manual trigger

**Jenkins Pipeline**:
```groovy
stage('Deploy with Shepherd') {
    steps {
        sh """
            ./scripts/deploy.sh \
              --release ${RELEASE_NAME} \
              --environment ${ENVIRONMENT} \
              --wait-for-approval
        """
    }
}
```

## Recent Changes

**v2.1.0 (Current)**:
- Added progressive rollout support
- Improved rollback automation
- Enhanced monitoring during deployments
- Added pre/post deployment hooks

**v2.0.0**:
- Major refactor to YAML-based releases
- Added deployment gates
- Integrated with feature flags
- Added automatic rollback

## References

- [Shepherd Documentation](https://shepherd.company.internal/docs)
- [Release Process Guide](docs/release-process.md)
- [Troubleshooting Guide](docs/troubleshooting.md)
- Confluence: [Shepherd User Guide](https://confluence.company.com/shepherd-guide)
