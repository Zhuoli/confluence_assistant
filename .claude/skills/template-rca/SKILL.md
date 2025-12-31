---
name: template-rca
description: Template for Root Cause Analysis (RCA) documents for incident postmortems
---

# Root Cause Analysis (RCA) Template

Use this template when documenting incidents and their root causes.

## RCA Document Structure

### 1. **Incident Summary**
- **Incident ID**: Link to incident tracking ticket
- **Date/Time**: When incident occurred (with timezone)
- **Duration**: How long the incident lasted
- **Severity**: Critical | High | Medium | Low
- **Impact**: Number of users affected, services down, revenue impact
- **Status**: Resolved | Monitoring | Mitigated

**Example:**
```
Incident #12345 - API Gateway Outage
Date: 2024-01-15 14:23 UTC
Duration: 47 minutes
Severity: Critical
Impact: 100% of API traffic failed, ~50,000 users affected
Status: Resolved
```

### 2. **Timeline**
Chronological sequence of events:
- **Detection**: When/how the issue was first detected
- **Response**: Initial response actions
- **Investigation**: Key findings during troubleshooting
- **Mitigation**: Actions taken to restore service
- **Resolution**: Final fix applied
- **Verification**: Confirmation that issue is resolved

**Format:**
```
14:23 UTC - Monitoring alerts triggered for API Gateway 5xx errors
14:25 UTC - On-call engineer paged
14:27 UTC - Engineer confirmed widespread API failures
14:30 UTC - Emergency war room initiated
14:35 UTC - Identified memory leak in gateway service
14:42 UTC - Restarted affected gateway instances
14:50 UTC - Traffic restored to normal levels
15:10 UTC - Full verification complete, incident closed
```

### 3. **Root Cause**
- **What happened**: Technical description of the failure
- **Why it happened**: Underlying cause
- **Why it wasn't caught earlier**: Gaps in monitoring/testing
- **Contributing factors**: Secondary issues that made it worse

**Structure:**
- **Immediate Cause**: The direct trigger
- **Root Cause**: The fundamental issue
- **Contributing Factors**: Things that amplified the problem

### 4. **Impact Analysis**
- **User Impact**: Which users/features were affected
- **Business Impact**: Revenue loss, SLA violations, customer complaints
- **Technical Impact**: Data loss, data corruption, cascading failures
- **Reputation Impact**: External visibility, customer trust

### 5. **What Went Well**
Positive aspects of the response:
- Quick detection
- Effective communication
- Good coordination
- Fast mitigation

### 6. **What Went Wrong**
Areas that need improvement:
- Delayed detection
- Unclear runbooks
- Missing monitoring
- Poor communication

### 7. **Action Items**
Concrete, actionable follow-ups with owners and deadlines:

**Format as table:**
| Action Item | Owner | Priority | Due Date | Status | Jira Ticket |
|-------------|-------|----------|----------|--------|-------------|
| Add memory monitoring alerts | DevOps | High | 2024-01-20 | In Progress | INFRA-123 |
| Update runbook with mitigation steps | SRE | High | 2024-01-22 | Not Started | INFRA-124 |

**Categories:**
- **Prevention**: Stop it from happening again
- **Detection**: Catch it faster next time
- **Mitigation**: Reduce impact when it happens
- **Documentation**: Improve knowledge sharing

### 8. **Lessons Learned**
High-level takeaways:
- Process improvements needed
- Technology gaps identified
- Skills/training required
- Organizational changes

## HTML Formatting for Confluence

```html
<h1>RCA: [Incident Title]</h1>

<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Incident ID:</strong> INC-12345</p>
    <p><strong>Severity:</strong> Critical</p>
    <p><strong>Impact:</strong> 50,000 users affected</p>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Incident Summary</h2>
<p>[Summary paragraph...]</p>

<h2>Timeline</h2>
<ul>
  <li><strong>14:23 UTC</strong> - Alert triggered</li>
  <li><strong>14:25 UTC</strong> - Engineer paged</li>
</ul>

<h2>Root Cause</h2>
<p>[Detailed explanation...]</p>

<h2>Impact Analysis</h2>
<table>
  <tr><th>Category</th><th>Impact</th></tr>
  <tr><td>Users Affected</td><td>50,000</td></tr>
  <tr><td>Duration</td><td>47 minutes</td></tr>
  <tr><td>Revenue Impact</td><td>$X,XXX</td></tr>
</table>

<h2>Action Items</h2>
<table>
  <tr><th>Action</th><th>Owner</th><th>Priority</th><th>Due Date</th><th>Status</th></tr>
  <tr><td>[Action]</td><td>[Name]</td><td>High</td><td>2024-XX-XX</td><td>Not Started</td></tr>
</table>
```

## Best Practices

1. **Be Blameless**: Focus on systems and processes, not individuals
2. **Be Specific**: Include exact times, metrics, error messages
3. **Be Actionable**: Every action item needs owner and deadline
4. **Be Thorough**: Don't skip details that might seem minor
5. **Be Honest**: Document what went wrong, not what should have happened
6. **Follow Up**: Track action items to completion
7. **Share Widely**: Make RCAs discoverable for learning

## Severity Guidelines

- **Critical**: Complete service outage, data loss, security breach
- **High**: Major functionality impaired, significant user impact
- **Medium**: Degraded performance, workaround available
- **Low**: Minor issue, minimal user impact

## Common Mistakes to Avoid

- Vague root cause ("it broke")
- No timeline
- No action items with owners
- Blaming individuals
- Not following up on action items
- Writing RCA too long after incident (memories fade)
