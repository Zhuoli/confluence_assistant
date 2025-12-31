---
name: template-technical-design
description: Template for Technical Design Documents following ECAR format
---

# Technical Design Document Template (ECAR Format)

Use this template when creating Technical Design Documents (TDD) in Confluence.

## ECAR Structure

### 1. **Executive Summary / Introduction**
- Brief overview of what is being designed (1-2 paragraphs)
- Problem statement
- Proposed solution at high level
- Key stakeholders and decision makers

**Example:**
```
This document describes the technical design for implementing OAuth 2.0 authentication
in our API gateway. The current basic authentication system lacks modern security features
and doesn't support single sign-on. This design proposes migrating to OAuth 2.0 with
JWT tokens to improve security and enable SSO integration.
```

### 2. **Context**
- Background information
- Current state / existing system
- Why this design is needed
- Business drivers
- Related systems and dependencies
- Assumptions and constraints

**What to include:**
- Current architecture diagram (if applicable)
- Pain points with current approach
- Business requirements that drove this need
- Timeline or urgency considerations
- Budget/resource constraints
- Regulatory or compliance requirements

### 3. **Approach / Architecture**
- Detailed technical design
- Architecture diagrams
- Component descriptions
- Data flow diagrams
- API specifications
- Database schema changes
- Technology choices and justification

**Key sections:**
- **High-Level Architecture**: Overall system design with component diagram
- **Detailed Design**: Specific implementation details for each component
- **Data Models**: Schema changes, data structures
- **APIs/Interfaces**: Endpoint specifications, request/response formats
- **Technology Stack**: Languages, frameworks, libraries, tools
- **Security Considerations**: Authentication, authorization, data protection
- **Scalability & Performance**: Expected load, scaling strategy
- **Monitoring & Observability**: Metrics, logging, alerting

### 4. **Resolution / Recommendations**
- Implementation plan
- Rollout strategy
- Testing approach
- Risks and mitigations
- Success metrics
- Alternative approaches considered (and why rejected)
- Open questions requiring decisions
- Next steps

**What to include:**
- **Implementation Phases**: Break down into milestones
- **Testing Strategy**: Unit, integration, E2E, performance testing
- **Deployment Plan**: Blue-green, canary, feature flags
- **Rollback Strategy**: How to revert if issues arise
- **Risks & Mitigations**: Identify risks with mitigation plans
- **Alternatives Considered**: Document other approaches and trade-offs
- **Success Criteria**: Metrics to measure success
- **Timeline**: Estimated timeline for each phase

## HTML Formatting Guidelines

When generating Confluence HTML:

```html
<h1>Technical Design: [Title]</h1>

<h2>Executive Summary</h2>
<p>[Brief overview...]</p>

<h2>Context</h2>
<h3>Current State</h3>
<p>[Description...]</p>

<h3>Problem Statement</h3>
<p>[Problems being solved...]</p>

<h2>Approach</h2>
<h3>High-Level Architecture</h3>
<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p>Architecture diagram would go here</p>
  </ac:rich-text-body>
</ac:structured-macro>

<h3>Component Details</h3>
<table>
  <tr><th>Component</th><th>Responsibility</th><th>Technology</th></tr>
  <tr><td>API Gateway</td><td>Request routing</td><td>Kong</td></tr>
</table>

<h2>Resolution</h2>
<h3>Implementation Plan</h3>
<ol>
  <li>Phase 1: Infrastructure setup</li>
  <li>Phase 2: Core implementation</li>
  <li>Phase 3: Testing and rollout</li>
</ol>

<h3>Risks and Mitigations</h3>
<table>
  <tr><th>Risk</th><th>Impact</th><th>Mitigation</th></tr>
  <tr><td>[Risk]</td><td>High</td><td>[Mitigation strategy]</td></tr>
</table>
```

## Best Practices

1. **Be Specific**: Include concrete examples, not just abstract descriptions
2. **Use Diagrams**: Architecture and flow diagrams are crucial
3. **Consider Alternatives**: Show you evaluated multiple approaches
4. **Quantify**: Include metrics, SLAs, performance targets
5. **Link References**: Link to related docs, tickets, repos
6. **Keep Updated**: Mark document status (Draft, Under Review, Approved, Implemented)
7. **Version History**: Track major changes at the bottom

## Document Metadata

Always include at the top:
- **Status**: Draft | Under Review | Approved | Implemented | Obsolete
- **Author**: [Name]
- **Reviewers**: [Names]
- **Last Updated**: [Date]
- **Related Tickets**: [Jira links]
- **Related Documents**: [Links to related designs]

## Common Sections to Add (Optional)

Depending on complexity, may also include:
- **Glossary**: Define technical terms
- **FAQs**: Address common questions
- **Migration Plan**: If replacing existing system
- **Training Plan**: If team needs new skills
- **Cost Analysis**: Infrastructure and development costs
- **Compliance & Security**: Regulatory requirements
- **Disaster Recovery**: Backup and recovery procedures
