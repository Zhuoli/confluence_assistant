---
name: template-runbook
description: Template for Operational Runbooks and Standard Operating Procedures
---

# Operational Runbook Template

Use this template when creating runbooks, playbooks, or standard operating procedures (SOPs).

## Runbook Structure

### 1. **Overview**
- **Service/System Name**: What this runbook covers
- **Purpose**: What this document helps you accomplish
- **Owner/Team**: Who maintains this service
- **Last Updated**: Date of last review
- **Related Systems**: Dependencies and related services
- **On-Call Contact**: How to reach the on-call engineer

**Example:**
```
This runbook covers operational procedures for the Payment Processing Service.
It provides guidance for common operational tasks, troubleshooting steps,
and emergency procedures.

Owner: Payments Team
On-Call: PagerDuty rotation "payments-oncall"
```

### 2. **Service Description**
- **What it does**: High-level functionality
- **Architecture overview**: Major components
- **Key metrics**: SLAs, performance targets
- **Dependencies**: Upstream/downstream services
- **Data stores**: Databases, caches, queues

### 3. **Common Operations**

#### 3.1 Routine Tasks
Step-by-step procedures for regular operations:
- Starting/stopping services
- Deploying changes
- Scaling resources
- Database maintenance
- Log rotation
- Certificate renewal

**Format for each task:**
```
### Task: Deploy New Version

**When to use**: During scheduled deployment window
**Prerequisites**:
- Approved deployment ticket
- Code merged to main
- Tests passing

**Steps:**
1. Check current health: `kubectl get pods -n payments`
2. Trigger deployment: `./deploy.sh production v2.5.0`
3. Monitor rollout: Watch dashboard at [link]
4. Verify health checks: Check /health endpoint
5. Monitor error rates for 15 minutes
6. Update deployment log

**Expected duration**: 15-20 minutes
**Rollback procedure**: See "Emergency Rollback" section
```

#### 3.2 Monitoring & Health Checks
- **Health Endpoints**: URLs to check service health
- **Key Dashboards**: Links to Grafana/Datadog/etc.
- **Critical Alerts**: What alerts mean and thresholds
- **Log Locations**: Where to find logs

### 4. **Troubleshooting Guide**

#### Common Issues and Solutions

**Format:**
```
### Issue: High Memory Usage

**Symptoms:**
- Memory usage > 85%
- Pods restarting frequently
- Slow response times

**Diagnosis:**
1. Check memory metrics: `kubectl top pods -n payments`
2. Check for memory leaks: Review heap dumps
3. Check recent deployments: Any code changes?

**Resolution:**
1. Immediate: Restart affected pods
   `kubectl rollout restart deployment/payment-service -n payments`
2. Short-term: Increase memory limits
3. Long-term: Investigate and fix memory leak (create ticket)

**Prevention:**
- Add memory leak detection tests
- Set up memory growth alerts
- Regular heap dump analysis
```

#### Troubleshooting Decision Tree
```
Is service responding?
├─ No → Check if pods are running
│       ├─ Pods not running → Check deployment/crash logs
│       └─ Pods running → Check network/firewall
└─ Yes → Check response time
        ├─ Slow → Check CPU/memory/database
        └─ Fast → Check application logs for errors
```

### 5. **Emergency Procedures**

#### Incident Response
- **Severity assessment**: How to determine severity
- **Escalation path**: Who to contact and when
- **Communication**: Status page updates, Slack channels
- **War room setup**: When and how to start

#### Emergency Rollback
```
### Emergency Rollback Procedure

**When to use**: Production incident caused by recent deployment

**Steps:**
1. Declare incident: `/incident start` in #incidents
2. Check previous version: `./scripts/get-previous-version.sh`
3. Initiate rollback: `./rollback.sh production`
4. Monitor rollout: Check dashboard
5. Verify traffic restored: Check error rates
6. Update incident: Post status in #incidents
7. Create RCA ticket

**Time to rollback**: ~5 minutes
**Risk**: Low - tested rollback procedure
```

#### Service Degradation
- **Circuit breaker activation**: When and how
- **Rate limiting**: Emergency rate limit increases
- **Cache warming**: Restore cache after failure
- **Database failover**: Steps for DB failover

### 6. **Maintenance Windows**

Procedures for planned maintenance:
- **Pre-maintenance checklist**
- **Maintenance steps**
- **Validation steps**
- **Post-maintenance checklist**
- **Communication templates**

### 7. **Access & Permissions**

- **Production access**: How to get emergency production access
- **Required tools**: List of CLI tools, VPN, credentials
- **AWS/GCP console**: Links and account info
- **Database access**: How to connect to production DB (read-only)
- **Kubernetes access**: Cluster names and contexts

### 8. **Reference Information**

#### Useful Commands
```bash
# Check service health
curl https://api.example.com/health

# View recent logs
kubectl logs -f deployment/payment-service -n payments --tail=100

# Scale service
kubectl scale deployment/payment-service --replicas=10 -n payments

# Check recent deployments
kubectl rollout history deployment/payment-service -n payments

# Port forward for debugging
kubectl port-forward svc/payment-service 8080:80 -n payments
```

#### Configuration
- **Environment variables**: Key configs and where they're set
- **Feature flags**: How to toggle features
- **Secrets**: Where secrets are stored (Vault, AWS Secrets Manager)

#### Metrics & Thresholds
| Metric | Normal | Warning | Critical |
|--------|--------|---------|----------|
| Response time | < 200ms | > 500ms | > 1s |
| Error rate | < 0.1% | > 1% | > 5% |
| CPU usage | < 50% | > 70% | > 85% |
| Memory usage | < 60% | > 75% | > 85% |

### 9. **Change Log**

Track updates to this runbook:
| Date | Author | Changes |
|------|--------|---------|
| 2024-01-15 | Jane Doe | Added rollback procedure |
| 2024-01-10 | John Smith | Updated health check endpoints |

## HTML Formatting for Confluence

```html
<h1>Runbook: [Service Name]</h1>

<ac:structured-macro ac:name="info">
  <ac:parameter ac:name="title">Service Information</ac:parameter>
  <ac:rich-text-body>
    <p><strong>Owner:</strong> [Team Name]</p>
    <p><strong>On-Call:</strong> [PagerDuty rotation]</p>
    <p><strong>Last Updated:</strong> [Date]</p>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Common Operations</h2>
<h3>Deploy New Version</h3>
<ol>
  <li>Check health: <code>kubectl get pods</code></li>
  <li>Deploy: <code>./deploy.sh</code></li>
  <li>Verify: Check dashboard</li>
</ol>

<h2>Troubleshooting</h2>
<ac:structured-macro ac:name="warning">
  <ac:parameter ac:name="title">High Memory Usage</ac:parameter>
  <ac:rich-text-body>
    <p><strong>Symptoms:</strong> Memory > 85%, pods restarting</p>
    <p><strong>Fix:</strong> Restart pods and investigate leak</p>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Emergency Procedures</h2>
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="bgColor">#ffcccc</ac:parameter>
  <ac:parameter ac:name="title">🚨 Emergency Rollback</ac:parameter>
  <ac:rich-text-body>
    <ol>
      <li>Declare incident</li>
      <li>Run: <code>./rollback.sh production</code></li>
      <li>Monitor and verify</li>
    </ol>
  </ac:rich-text-body>
</ac:structured-macro>
```

## Best Practices

1. **Keep it Updated**: Review quarterly or after incidents
2. **Test Procedures**: Verify commands actually work
3. **Be Explicit**: Include exact commands with parameters
4. **Use Screenshots**: Visual aids for dashboards/UIs
5. **Link Everything**: Link to dashboards, repos, other docs
6. **Version Control**: Track changes in a table
7. **Easy to Scan**: Use headings, bullets, tables
8. **Emergency First**: Put critical procedures at top

## Runbook Categories

Different types of runbooks:
- **Service Runbook**: Operations for a specific service
- **Incident Playbook**: Response procedures for incident types
- **Deployment Runbook**: Deployment and rollback procedures
- **Maintenance Runbook**: Scheduled maintenance procedures
- **DR Runbook**: Disaster recovery procedures
