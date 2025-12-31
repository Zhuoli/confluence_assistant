---
name: template-requirements
description: Template for Product Requirements Documents (PRD) and Feature Specifications
---

# Product Requirements Document (PRD) Template

Use this template when documenting product features, requirements, and specifications.

## PRD Structure

### 1. **Overview**
- **Feature Name**: Clear, descriptive name
- **Status**: Draft | In Review | Approved | In Development | Launched
- **Owner**: Product Manager name
- **Stakeholders**: PM, Engineering Lead, Design, etc.
- **Target Release**: Version or date
- **Related Docs**: Links to designs, technical specs, research

**Example:**
```
Feature: Multi-Factor Authentication (MFA)
Status: Approved
Owner: Jane Smith (PM)
Stakeholders: Security Team, Engineering, Support
Target Release: Q2 2024
```

### 2. **Problem Statement**
- **What problem are we solving?**
- **Who has this problem?** (user personas)
- **How do we know this is a problem?** (data, research, feedback)
- **What happens if we don't solve it?** (risks, opportunity cost)

**Format:**
```
Our enterprise customers need multi-factor authentication to meet their
security compliance requirements. Currently, we only support password-based
authentication, which has caused us to lose 3 enterprise deals in Q1
(estimated $500K ARR). 67% of enterprise prospects in our pipeline have
explicitly requested MFA as a requirement.
```

### 3. **Goals & Success Metrics**

#### Business Goals
- Revenue impact
- User growth
- Market positioning
- Competitive advantage

#### User Goals
- What users will be able to do
- Problems they'll solve
- Value they'll get

#### Success Metrics (SMART)
Specific, Measurable, Achievable, Relevant, Time-bound

**Format as table:**
| Metric | Current | Target | Measurement Method |
|--------|---------|--------|-------------------|
| Enterprise deal close rate | 15% | 30% | Salesforce data |
| Setup completion rate | - | 80% | Analytics event tracking |
| Support tickets for auth issues | 50/month | <20/month | Zendesk |

### 4. **User Personas & Use Cases**

#### Personas
Who will use this feature?
- **Primary**: Main target users
- **Secondary**: Other users who might use it
- **Edge cases**: Unusual usage patterns

**Example:**
```
**Primary Persona: Enterprise Security Admin**
- Role: Configures security policies for organization
- Pain Point: Needs to enforce MFA for all employees
- Technical Skill: High
- Frequency of Use: One-time setup, occasional updates

**Secondary Persona: End User**
- Role: Employee logging into platform
- Pain Point: Wants secure but convenient access
- Technical Skill: Medium
- Frequency of Use: Daily login
```

#### Use Cases
Specific scenarios:
```
**Use Case 1: First-time MFA Setup**
Actor: End User
Trigger: User logs in after admin enables MFA
Steps:
1. User enters username/password
2. System prompts to set up MFA
3. User chooses method (authenticator app/SMS)
4. User completes setup wizard
5. User enters MFA code to verify
6. System confirms setup complete
Result: User can now log in with MFA
```

### 5. **Requirements**

#### Functional Requirements
What the system must do:

**Format:**
```
FR-1: System MUST support TOTP-based authenticator apps
  - MUST support Google Authenticator, Authy, Microsoft Authenticator
  - MUST generate QR code for easy setup
  - MUST provide manual entry code as fallback

FR-2: System MUST support SMS-based codes
  - MUST send 6-digit code via SMS
  - Code MUST expire after 5 minutes
  - MUST allow code resend with 30-second cooldown
```

#### Non-Functional Requirements
How the system must perform:

**Categories:**
- **Performance**: Response time, throughput
- **Security**: Encryption, compliance standards
- **Reliability**: Uptime, error rates
- **Usability**: User experience standards
- **Scalability**: Expected load, growth

**Example:**
```
NFR-1: Performance
  - MFA verification MUST complete within 500ms (p95)
  - Setup flow MUST load within 2 seconds

NFR-2: Security
  - MUST comply with NIST 800-63B guidelines
  - MUST encrypt backup codes at rest
  - MUST rate-limit verification attempts (5 attempts per 15 min)

NFR-3: Reliability
  - MUST maintain 99.9% uptime for MFA verification
  - MUST have fallback for SMS provider outage
```

#### Must Have vs. Should Have vs. Nice to Have

Use MoSCoW prioritization:
- **Must Have**: Critical for launch
- **Should Have**: Important but not blocking
- **Could Have**: Nice to have if time permits
- **Won't Have**: Out of scope for this release

### 6. **User Experience**

#### User Flows
Step-by-step flows with:
- Entry points
- Decision points
- Error states
- Success states

#### Wireframes/Mockups
- Link to design files (Figma, Sketch)
- Key screens with annotations
- Mobile and desktop views

#### Interaction Details
- Button labels
- Error messages
- Success messages
- Loading states
- Empty states

### 7. **Technical Considerations**

High-level technical notes (link to detailed TDD):
- **APIs**: New endpoints needed
- **Database**: Schema changes
- **Third-party services**: External integrations (Twilio, etc.)
- **Mobile apps**: iOS/Android considerations
- **Browser support**: Required browser versions
- **Migrations**: Data migration needs

### 8. **Edge Cases & Error Handling**

Unusual scenarios to consider:
```
**Edge Case: User loses phone with authenticator**
Solution: Provide backup codes during setup, allow admin reset

**Edge Case: SMS delivery failure**
Solution: Show error with retry option, offer alternative method

**Edge Case: User in country where SMS is unreliable**
Solution: Recommend authenticator app as primary method
```

### 9. **Security & Privacy**

- **Data collected**: What user data is stored
- **Data retention**: How long data is kept
- **Compliance**: GDPR, SOC2, HIPAA considerations
- **Security review**: Required security sign-off
- **Privacy policy**: Updates needed

### 10. **Rollout Plan**

#### Phases
```
**Phase 1: Beta (Week 1-2)**
- Enable for internal employees only
- Gather feedback
- Fix critical issues

**Phase 2: Opt-in (Week 3-4)**
- Enable for existing customers (opt-in)
- Monitor adoption and support load

**Phase 3: Enterprise (Week 5-6)**
- Enable for all enterprise accounts
- Admin controls available

**Phase 4: General Availability (Week 7)**
- Enable for all users
- Make optional/mandatory based on account type
```

#### Feature Flags
- Which flags to use
- Rollout percentages
- Rollback plan

### 11. **Dependencies & Risks**

#### Dependencies
- **Internal**: Other teams, features, infrastructure
- **External**: Third-party services, vendors

**Format:**
| Dependency | Owner | Status | Risk Level | Mitigation |
|------------|-------|--------|------------|------------|
| SMS provider integration | DevOps | In Progress | Medium | Have backup provider |

#### Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low adoption rate | High | Medium | Clear communication, good UX |
| SMS delivery issues | Medium | Low | Offer authenticator app |

### 12. **Open Questions**

Track unresolved items:
- [ ] Should MFA be mandatory for all users or just enterprise?
- [ ] What backup methods do we support if user loses device?
- [ ] Do we support hardware security keys (YubiKey)?
- [ ] How do we handle account recovery?

### 13. **Out of Scope**

Explicitly list what's NOT included:
- Hardware security key support (planned for future)
- Biometric authentication (fingerprint, face ID)
- Risk-based authentication
- Integration with enterprise SSO (separate project)

### 14. **References**

- User research documents
- Competitive analysis
- Industry standards (NIST, OWASP)
- Related features
- Technical specifications

## HTML Formatting for Confluence

```html
<h1>PRD: [Feature Name]</h1>

<ac:structured-macro ac:name="status">
  <ac:parameter ac:name="colour">Yellow</ac:parameter>
  <ac:parameter ac:name="title">IN REVIEW</ac:parameter>
</ac:structured-macro>

<table>
  <tr><th>Owner</th><td>Jane Smith</td></tr>
  <tr><th>Target Release</th><td>Q2 2024</td></tr>
  <tr><th>Stakeholders</th><td>Engineering, Design, Security</td></tr>
</table>

<h2>Problem Statement</h2>
<p>[Description of problem...]</p>

<h2>Success Metrics</h2>
<table>
  <tr><th>Metric</th><th>Current</th><th>Target</th></tr>
  <tr><td>Conversion rate</td><td>15%</td><td>30%</td></tr>
</table>

<h2>Requirements</h2>
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="title">Must Have</ac:parameter>
  <ac:rich-text-body>
    <ul>
      <li>TOTP authenticator support</li>
      <li>SMS backup codes</li>
    </ul>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Open Questions</h2>
<ac:task-list>
  <ac:task>
    <ac:task-status>incomplete</ac:task-status>
    <ac:task-body>Should MFA be mandatory?</ac:task-body>
  </ac:task>
</ac:task-list>
```

## Best Practices

1. **Start with Why**: Always explain the problem before the solution
2. **Be Data-Driven**: Back up claims with research and metrics
3. **Visual Aids**: Include mockups, flows, diagrams
4. **Clear Scope**: Explicitly state what's in and out of scope
5. **Stakeholder Review**: Get sign-off from all stakeholders
6. **Living Document**: Update as decisions are made
7. **Link to TDD**: PRD is "what/why", TDD is "how"
8. **Track Changes**: Use version history or change log

## PRD vs. Technical Design Document

- **PRD**: Product perspective (what to build, why, for whom)
- **TDD**: Engineering perspective (how to build it technically)
- PRD comes first, TDD references PRD
