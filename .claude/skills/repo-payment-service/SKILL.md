---
name: repo-payment-service
description: Payment processing service - handles transactions, refunds, and payment gateway integrations
---

# Payment Service Repository

## Basic Information

- **Repository**: `payment-service`
- **Location**: `git@github.com:company/payment-service.git`
- **Purpose**: Core payment processing service handling credit card transactions, refunds, and payment gateway integrations
- **Language**: Java 17 / Spring Boot 3.1
- **Framework**: Spring Boot, Spring Data JPA, Spring Security
- **Team**: Payments Team
- **On-Call**: payments-oncall PagerDuty rotation
- **Related Repos**:
  - `user-service` (customer data)
  - `order-service` (order management)
  - `notification-service` (payment confirmations)

## Architecture & Structure

### Directory Structure
```
payment-service/
├── src/main/java/com/company/payment/
│   ├── controller/          # REST API controllers
│   │   ├── PaymentController.java
│   │   ├── RefundController.java
│   │   └── WebhookController.java
│   ├── service/             # Business logic
│   │   ├── PaymentProcessor.java
│   │   ├── GatewayService.java
│   │   └── FraudDetectionService.java
│   ├── repository/          # Database access
│   │   ├── PaymentRepository.java
│   │   └── TransactionRepository.java
│   ├── model/               # Domain models
│   │   ├── Payment.java
│   │   ├── Transaction.java
│   │   └── RefundRequest.java
│   ├── integration/         # External API clients
│   │   ├── StripeClient.java
│   │   └── BraintreeClient.java
│   └── config/              # Configuration
│       ├── SecurityConfig.java
│       └── DatabaseConfig.java
├── src/main/resources/
│   ├── application.yml      # Main configuration
│   ├── application-prod.yml # Production overrides
│   └── db/migration/        # Flyway migrations
├── src/test/                # Unit and integration tests
├── k8s/                     # Kubernetes manifests
├── scripts/                 # Utility scripts
└── docs/                    # Additional documentation
```

### Key Components

**PaymentProcessor** (`service/PaymentProcessor.java`)
- Main orchestration for payment flow
- Handles validation, authorization, capture
- Implements retry logic and idempotency
- Integrates with fraud detection

**GatewayService** (`service/GatewayService.java`)
- Abstraction over payment gateways (Stripe, Braintree)
- Provider selection based on payment method and amount
- Failover logic between providers
- Rate limiting and circuit breaker implementation

**FraudDetectionService** (`service/FraudDetectionService.java`)
- Real-time fraud scoring
- Integration with external fraud detection API
- Configurable rules engine
- Automatic blocking of suspicious transactions

### Design Patterns
- **Strategy Pattern**: Multiple payment gateway implementations
- **Circuit Breaker**: For external API calls (Resilience4j)
- **Saga Pattern**: Distributed transaction handling
- **Event Sourcing**: All payment state changes stored as events

### Important Files

**Configuration**:
- `application.yml` - Service configuration, database settings
- `SecurityConfig.java` - API authentication/authorization
- `docker-compose.yml` - Local development environment

**API Documentation**:
- `docs/api/openapi.yml` - OpenAPI 3.0 specification
- `docs/api/postman-collection.json` - Postman collection

**Database**:
- `db/migration/` - Flyway database migrations
- Current schema version: V1.15

## Development Setup

### Prerequisites
```bash
# Required
Java 17 (OpenJDK)
Maven 3.8+
Docker & Docker Compose
PostgreSQL 14+

# Optional (for local development)
IntelliJ IDEA
Postman or Insomnia
```

### Local Setup
```bash
# Clone repository
git clone git@github.com:company/payment-service.git
cd payment-service

# Start dependencies (PostgreSQL, Redis)
docker-compose up -d

# Build
mvn clean install

# Run locally
mvn spring-boot:run -Dspring-boot.run.profiles=local

# Service will be available at http://localhost:8080
```

### Environment Variables
```bash
# Database
DATABASE_URL=jdbc:postgresql://localhost:5432/payment_db
DATABASE_USERNAME=payment_user
DATABASE_PASSWORD=<secret>

# Payment Gateways
STRIPE_API_KEY=<secret>
STRIPE_WEBHOOK_SECRET=<secret>
BRAINTREE_MERCHANT_ID=<id>
BRAINTREE_PUBLIC_KEY=<key>
BRAINTREE_PRIVATE_KEY=<secret>

# External Services
FRAUD_DETECTION_API_URL=https://api.fraud-detection.internal
USER_SERVICE_URL=http://user-service:8080
```

### Common Development Tasks

**Run tests**:
```bash
# Unit tests
mvn test

# Integration tests
mvn verify -P integration-tests

# Specific test
mvn test -Dtest=PaymentProcessorTest
```

**Database migrations**:
```bash
# Create new migration
mvn flyway:create -Dflyway.name=add_payment_status_column

# Run migrations locally
mvn flyway:migrate

# Check migration status
mvn flyway:info
```

**API testing**:
```bash
# Health check
curl http://localhost:8080/actuator/health

# Create payment
curl -X POST http://localhost:8080/api/v1/payments \
  -H "Content-Type: application/json" \
  -d '{"amount": 1000, "currency": "USD", "payment_method": "card"}'
```

## Deployment & Operations

### Deployment

**Environments**:
- **Dev**: Auto-deployed from `develop` branch
- **Staging**: Auto-deployed from `staging` branch
- **Production**: Manual deployment from `main` branch via Shepherd

**Kubernetes**:
- Namespace: `payments`
- Deployment: `payment-service`
- Replicas:
  - Dev: 2
  - Staging: 3
  - Production: 10 (auto-scales to 50)

**Deployment Commands**:
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production (requires approval)
./scripts/deploy.sh production --version v2.5.0

# Rollback
./scripts/rollback.sh production --to-version v2.4.3
```

### Monitoring & Observability

**Dashboards**:
- [Payment Service - Overview](https://grafana.company.com/d/payments-overview)
- [Payment Service - Errors](https://grafana.company.com/d/payments-errors)
- [Payment Gateway Health](https://grafana.company.com/d/gateway-health)

**Key Metrics**:
- Payment success rate (target: >99.5%)
- Average payment processing time (target: <500ms)
- Gateway API latency
- Fraud detection rate
- Failed payment reasons

**Alerts**:
- Payment success rate < 95% (P1)
- API response time > 2s (P2)
- Payment gateway down (P1)
- High fraud detection rate (P3)

**Logs**:
```bash
# Kubernetes logs
kubectl logs -f deployment/payment-service -n payments

# Splunk query
index=production source=payment-service

# Common search
index=production source=payment-service "payment_id=*" error
```

### Configuration Management

**Feature Flags** (LaunchDarkly):
- `enable-stripe-gateway` - Enable Stripe as payment option
- `enable-fraud-detection` - Enable fraud detection service
- `enable-async-processing` - Process payments asynchronously

**Secrets** (AWS Secrets Manager):
- `payment-service/stripe-api-key`
- `payment-service/braintree-credentials`
- `payment-service/database-password`

### Runbook Location
Detailed operational procedures in:
- Confluence: [Payment Service Runbook](https://confluence.company.com/payment-service-runbook)
- Code: `ops-runbooks` repo → `/services/payment-service/`

## Key Concepts

### Domain Models

**Payment**:
- Represents a single payment attempt
- States: PENDING → AUTHORIZED → CAPTURED → SETTLED
- Can have multiple transactions (retries, captures)
- Immutable once SETTLED

**Transaction**:
- Individual interaction with payment gateway
- Tracks request/response to gateway
- Used for reconciliation and debugging
- Stored in separate `transactions` table

**RefundRequest**:
- Initiated refund for a payment
- Types: Full refund, Partial refund
- States: REQUESTED → PROCESSING → COMPLETED/FAILED
- Must reference original payment

### Important Algorithms

**Idempotency**:
- Uses `idempotency_key` to prevent duplicate payments
- Key stored with payment record
- Returns existing payment if key matches (within 24h)
- Implementation in `PaymentProcessor.processPayment()`

**Gateway Selection**:
- Selects gateway based on:
  - Payment method (card type)
  - Transaction amount
  - Currency
  - Historical success rate
- Fallback to secondary gateway on failure
- Implementation in `GatewayService.selectGateway()`

**Fraud Detection**:
- Real-time scoring (0-100)
- Thresholds:
  - 0-30: Auto-approve
  - 31-70: Manual review
  - 71-100: Auto-block
- Machine learning model updated weekly
- Implementation in `FraudDetectionService.scoreTransaction()`

### Integration Points

**Upstream Dependencies**:
- `user-service`: Customer profile and payment methods
- `order-service`: Order details and status updates

**Downstream Dependencies**:
- Stripe API: Credit card processing
- Braintree API: PayPal processing
- Fraud Detection API: Transaction scoring
- `notification-service`: Send payment confirmations

**Webhooks**:
- Receives webhooks from payment gateways
- Endpoint: `/api/v1/webhooks/{provider}`
- Verifies signature before processing
- Updates payment status asynchronously

## API Endpoints

### Core Endpoints

**Create Payment**:
```
POST /api/v1/payments
Body: {
  "amount": 1000,
  "currency": "USD",
  "payment_method": "card",
  "card_token": "tok_visa",
  "idempotency_key": "unique-key-123"
}
```

**Get Payment Status**:
```
GET /api/v1/payments/{payment_id}
```

**Create Refund**:
```
POST /api/v1/payments/{payment_id}/refunds
Body: {
  "amount": 500,
  "reason": "customer_request"
}
```

**List Payments** (admin):
```
GET /api/v1/payments?user_id={id}&status={status}&from={date}&to={date}
```

### Health & Monitoring
```
GET /actuator/health        # Health check
GET /actuator/metrics       # Prometheus metrics
GET /actuator/info          # Build info
```

## Testing

### Test Categories

**Unit Tests** (`src/test/java/com/company/payment/`):
- All business logic
- Mock external dependencies
- Coverage target: >85%

**Integration Tests** (`src/test/java/com/company/payment/integration/`):
- Database interactions
- API endpoints
- Gateway client mocks

**Contract Tests** (`src/test/java/com/company/payment/contract/`):
- API contract validation
- Uses Spring Cloud Contract

**E2E Tests** (separate repo: `e2e-tests`):
- Full payment flow
- Real gateway sandbox
- Runs pre-deployment

### Test Data
```bash
# Test credit cards (Stripe test mode)
Visa Success: 4242424242424242
Visa Decline: 4000000000000002
Visa Fraud: 4100000000000019

# Test PayPal sandbox
sandbox-buyer@company.com / password123
```

## Documentation References

### Confluence Pages
- [Payment Service Architecture](https://confluence.company.com/payment-architecture)
- [Payment API Guide](https://confluence.company.com/payment-api)
- [Payment Gateway Integration](https://confluence.company.com/payment-gateways)
- [Runbook: Payment Service Operations](https://confluence.company.com/payment-runbook)

### API Documentation
- OpenAPI spec: `docs/api/openapi.yml`
- Live API docs: http://localhost:8080/swagger-ui.html (local)
- Production API docs: https://api.company.com/docs/payments

### External References
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Braintree API Documentation](https://developer.paypal.com/braintree/docs)
- [PCI DSS Compliance Guide](https://www.pcisecuritystandards.org/)

## Common Issues & Solutions

**Issue: Gateway timeout errors**
- Check gateway status page
- Verify API keys are valid
- Check circuit breaker state
- Review recent deployments

**Issue: Duplicate payments**
- Check idempotency key usage
- Verify client retry logic
- Check for race conditions
- Review database transaction isolation

**Issue: Webhook processing failures**
- Verify webhook signature
- Check webhook endpoint reachability
- Review webhook retry logic
- Check for schema changes

## Recent Changes

**v2.5.0 (Current)**:
- Added Braintree PayPal support
- Improved fraud detection algorithm
- Database schema optimization (v1.15)

**v2.4.3**:
- Fixed race condition in payment capture
- Updated Stripe API to v2023-10-16
- Performance improvements for high volume

**v2.4.0**:
- Added async payment processing
- Implemented circuit breaker for gateways
- Enhanced monitoring and alerting
