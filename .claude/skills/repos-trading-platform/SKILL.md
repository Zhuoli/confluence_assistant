---
name: repos-trading-platform
description: Multi-repository overview of Trading Platform service - architecture, repositories, and how they work together
---

# Trading Platform - Multi-Repository Overview

## Service Overview

The **Trading Platform** is the company's core trading system that enables users to place orders, match trades, process settlements, and access real-time market data. It is built as a distributed microservices architecture spanning multiple repositories.

**Purpose**: Enable real-time trading of financial instruments with low latency, high availability, and regulatory compliance.

**Team**: Trading Platform Team (15 engineers)
**On-Call**: trading-platform-oncall PagerDuty rotation
**Status Page**: https://status.company.com/trading

## Architecture Diagram

```
                            ┌─────────────────┐
                            │   API Gateway   │
                            │   (Kong)        │
                            └────────┬────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
            ┌───────▼───────┐ ┌─────▼──────┐ ┌──────▼──────┐
            │ Order Service │ │ User       │ │ Market Data │
            │               │ │ Service    │ │ Service     │
            └───────┬───────┘ └────────────┘ └──────┬──────┘
                    │                                 │
            ┌───────▼────────┐                ┌──────▼──────┐
            │ Matching Engine│◄───────────────┤ Risk Engine │
            │                │                └─────────────┘
            └───────┬────────┘
                    │
            ┌───────▼────────┐
            │ Settlement     │
            │ Service        │
            └───────┬────────┘
                    │
            ┌───────▼────────┐
            │ Payment Service│
            └────────────────┘
```

## Repositories

### 1. order-service
**Location**: `git@github.com:company/order-service.git`
**Language**: Go 1.21
**Purpose**: Order management - create, modify, cancel orders

**Responsibilities**:
- Accept and validate orders from users
- Store orders in database
- Send orders to matching engine
- Track order lifecycle (NEW → PENDING → FILLED → SETTLED)
- Provide order history and status APIs

**Key endpoints**:
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders/{id}` - Get order status
- `DELETE /api/v1/orders/{id}` - Cancel order
- `GET /api/v1/orders/user/{userId}` - Get user's orders

**Depends on**:
- `user-service` - Validate user account
- `matching-engine` - Send orders for matching
- `market-data-service` - Validate prices
- `risk-engine` - Check risk limits

**Database**: PostgreSQL (orders, order_history tables)
**Message Queue**: Kafka (order-events topic)
**Deployment**: Kubernetes, 15 replicas in production

### 2. matching-engine
**Location**: `git@github.com:company/matching-engine.git`
**Language**: C++ 17
**Purpose**: High-performance order matching

**Responsibilities**:
- Maintain order books for each instrument
- Match buy and sell orders (price-time priority)
- Generate trade executions
- Ultra-low latency (<100 microseconds)
- Publish trades to downstream services

**Key Features**:
- In-memory order book
- Lock-free data structures
- NUMA-aware architecture
- Deterministic execution (for audit)

**Depends on**:
- `market-data-service` - Subscribe to order flow
- `settlement-service` - Send trade executions

**Database**: None (stateless, orders in memory)
**Message Queue**: Kafka (trade-executions topic)
**Deployment**: Bare metal servers (latency-critical), 5 instances

### 3. market-data-service
**Location**: `git@github.com:company/market-data-service.git`
**Language**: Java 17 / Spring Boot
**Purpose**: Real-time market data distribution

**Responsibilities**:
- Stream real-time prices, trades, order book updates
- Aggregate market statistics (volume, VWAP, etc.)
- Provide historical market data APIs
- Serve market data to users via WebSocket

**Key endpoints**:
- WebSocket `/ws/market-data` - Real-time data stream
- `GET /api/v1/instruments/{symbol}/ticker` - Latest price
- `GET /api/v1/instruments/{symbol}/history` - Historical data

**Depends on**:
- `matching-engine` - Subscribe to trade executions
- External market data feeds (e.g., Bloomberg, Reuters)

**Database**: TimescaleDB (time-series data)
**Message Queue**: Kafka (market-data topic)
**Deployment**: Kubernetes, 20 replicas in production

### 4. settlement-service
**Location**: `git@github.com:company/settlement-service.git`
**Language**: Python 3.11 / FastAPI
**Purpose**: Trade settlement and clearing

**Responsibilities**:
- Process trade executions from matching engine
- Calculate net positions for each user
- Trigger payment transactions
- Generate settlement reports
- Handle failed settlements and retries

**Key Features**:
- Batch processing (T+2 settlement cycle)
- Idempotency (handle duplicate trades)
- Reconciliation with payment service
- Regulatory reporting (MiFID II)

**Depends on**:
- `matching-engine` - Receive trade executions
- `payment-service` - Process payments
- `user-service` - Get account information

**Database**: PostgreSQL (settlements, positions tables)
**Message Queue**: Kafka (settlement-events topic)
**Deployment**: Kubernetes, 8 replicas in production
**Scheduled Jobs**: Daily settlement batch (runs at 6 PM)

### 5. risk-engine
**Location**: `git@github.com:company/risk-engine.git`
**Language**: Rust 1.75
**Purpose**: Real-time risk management

**Responsibilities**:
- Pre-trade risk checks (margin, position limits)
- Real-time position tracking
- Portfolio value-at-risk (VaR) calculation
- Margin call generation
- Regulatory compliance (leverage limits)

**Key Features**:
- Sub-millisecond risk calculations
- Real-time position aggregation
- Circuit breaker for risk limit breaches
- Historical position snapshots

**Depends on**:
- `order-service` - Validate orders before execution
- `market-data-service` - Get real-time prices for VaR
- `user-service` - Get account balances

**Database**: PostgreSQL (positions, risk_limits tables)
**Cache**: Redis (hot position data)
**Deployment**: Kubernetes, 10 replicas in production

### 6. user-service
**Location**: `git@github.com:company/user-service.git`
**Language**: Java 17 / Spring Boot
**Purpose**: User account and authentication

**Responsibilities**:
- User registration and KYC
- Authentication (OAuth 2.0 + JWT)
- Account management (profile, settings)
- Balance and wallet management
- User permissions and roles

**Details**: See `repo-user-service` skill for full details

**Depends on**:
- `payment-service` - Deposits and withdrawals
- External KYC provider (Onfido)

**Database**: PostgreSQL (users, accounts tables)
**Deployment**: Kubernetes, 12 replicas in production

### 7. payment-service
**Location**: `git@github.com:company/payment-service.git`
**Language**: Java 17 / Spring Boot
**Purpose**: Payment processing

**Details**: See `repo-payment-service` skill for full details

**Depends on**:
- External payment gateways (Stripe, Braintree)

### 8. api-gateway
**Location**: Configuration in `kong-config` repo
**Technology**: Kong API Gateway
**Purpose**: API routing, authentication, rate limiting

**Responsibilities**:
- Route requests to backend services
- JWT token validation
- Rate limiting per user/API
- Request/response logging
- API versioning

**Configuration**: `git@github.com:company/kong-config.git`

## How Repositories Work Together

### Trading Flow

1. **User places order**:
   - User → `api-gateway` → `order-service`
   - `order-service` validates with `user-service`
   - `order-service` checks risk with `risk-engine`
   - `order-service` sends to `matching-engine`

2. **Order matching**:
   - `matching-engine` matches orders
   - Generates trade execution
   - Publishes to Kafka (trade-executions topic)

3. **Settlement**:
   - `settlement-service` consumes trade executions
   - Calculates net positions
   - Triggers `payment-service` for fund transfers
   - Updates user balances in `user-service`

4. **Market data distribution**:
   - `matching-engine` publishes trades
   - `market-data-service` aggregates and streams
   - Users receive real-time updates via WebSocket

### Data Flow

```
Order Flow:
User → API Gateway → Order Service → Risk Engine → Matching Engine
                           ↓
                     (validated)
                           ↓
                    Kafka (orders topic)

Trade Flow:
Matching Engine → Kafka (trade-executions) → Settlement Service → Payment Service
        ↓
Market Data Service → WebSocket → Users
```

### Shared Infrastructure

**Kafka Topics**:
- `order-events` - Order lifecycle events
- `trade-executions` - Matched trades
- `settlement-events` - Settlement status
- `market-data` - Real-time market data stream
- `risk-events` - Risk alerts and margin calls

**Databases**:
- **PostgreSQL Cluster 1**: `user-service`, `order-service`
- **PostgreSQL Cluster 2**: `settlement-service`, `risk-engine`
- **TimescaleDB**: `market-data-service` (time-series data)
- **Redis Cluster**: Shared cache for hot data

**Monitoring**:
- **Prometheus**: Metrics collection from all services
- **Grafana**: [Trading Platform Dashboard](https://grafana.company.com/d/trading-platform)
- **Jaeger**: Distributed tracing
- **ELK Stack**: Centralized logging

## Deployment Flow

All services are deployed together using **Shepherd** (see `repo-shepherd-releases` skill):

### Standard Release Process

1. **Individual service development**:
   - Engineers work in service-specific repos
   - PRs merged to `main` after review
   - CI builds and tests each service

2. **Release definition**:
   - Create Shepherd release YAML (see `shepherd-releases` repo)
   - Define service versions and dependencies
   - Set deployment order (respects dependencies)

3. **Deployment sequence** (defined in Shepherd):
   ```
   Phase 1: Infrastructure (databases, Kafka)
   Phase 2: Core services (user-service, payment-service)
   Phase 3: Trading services (order-service, risk-engine, market-data-service)
   Phase 4: Matching engine (zero-downtime upgrade)
   Phase 5: Settlement service (during maintenance window)
   ```

4. **Progressive rollout**:
   - Deploy to dev (automatic)
   - Deploy to staging (automatic after dev success)
   - Deploy to production (manual approval required)
     - Start with 10% traffic
     - Monitor for 1 hour
     - Increase to 50%, then 100%

### Service Dependencies in Deployment

**Critical path** (must deploy in order):
```
user-service → order-service → matching-engine → settlement-service
```

**Parallel deployment** (independent):
```
market-data-service, risk-engine, payment-service (can deploy concurrently)
```

## Operational Procedures

### Runbooks

See `repo-runbooks-ops` skill for detailed operational procedures:
- **Deployment**: `ops-runbooks/services/trading-platform/deployment.md`
- **Incident Response**: `ops-runbooks/services/trading-platform/incident-response.md`
- **Troubleshooting**: Individual service runbooks

### Monitoring & Alerts

**Key SLAs**:
- Order placement latency: <200ms (p95)
- Matching engine latency: <100μs (p99)
- Market data latency: <50ms (p95)
- System availability: 99.95%
- Order success rate: >99.9%

**Critical alerts**:
- Matching engine down (P0) → Page on-call immediately
- Order service error rate >1% (P1) → Page on-call
- Settlement job failure (P1) → Page on-call during business hours
- Database replication lag >10s (P2) → Notify in Slack

### Incident Response

**Incident commander rotation**: Trading Platform team + SRE
**War room**: #incident-trading-platform Slack channel
**Escalation**: VP Engineering (for P0 incidents)

**Common incidents**:
- Matching engine degradation → See `matching-engine-troubleshooting.md`
- Database connection pool exhaustion → Restart affected pods
- Kafka lag → Scale up consumers
- Settlement job stuck → Manual intervention required

## Development Workflow

### Local Development

Each service can run independently with Docker Compose:

```bash
# Start all services locally
git clone git@github.com:company/trading-platform-dev-env.git
cd trading-platform-dev-env
docker-compose up

# Or run individual service
cd order-service
mvn spring-boot:run
```

### Integration Testing

**End-to-end tests** in separate repo:
- `git@github.com:company/trading-platform-e2e-tests.git`
- Tests full trading flow across all services
- Runs in CI before every deployment

### Feature Development

**Typical workflow for new feature**:
1. Create feature branch in affected service repos
2. Develop and test locally
3. Submit PRs to each repo
4. PRs merged after review and CI passes
5. Create Shepherd release with all service versions
6. Deploy to dev for integration testing
7. Deploy to staging for QA
8. Deploy to production after approval

## Team Ownership

**Trading Platform Team owns**:
- `order-service` ✓
- `matching-engine` ✓
- `market-data-service` ✓
- `settlement-service` ✓
- `risk-engine` ✓

**Shared ownership**:
- `user-service` - User Management Team (Trading Platform depends on it)
- `payment-service` - Payments Team (Trading Platform depends on it)

**Platform team owns**:
- `api-gateway` configuration
- `shepherd-releases` deployment configs
- Kafka and database infrastructure

## Documentation

### Confluence Space

[Trading Platform - Technical Documentation](https://confluence.company.com/trading-platform)

**Key pages**:
- Architecture Overview
- API Reference
- Deployment Guide
- Runbook
- RCA Archive

### Repository Documentation

Each repo has its own detailed docs:
- `README.md` - Quick start
- `docs/` directory - Architecture, API docs
- `CONTRIBUTING.md` - Development guidelines

### API Documentation

- OpenAPI specs in each service repo
- Aggregated docs: https://api.company.com/docs/trading
- Postman collection: https://postman.company.com/trading-platform

## Recent Changes & Roadmap

### Recent Releases

**v1.8.0 (Current - Jan 2024)**:
- Improved matching engine performance (30% faster)
- Added real-time position tracking in risk-engine
- Enhanced market data streaming (WebSocket v2)
- Database sharding for order-service

**v1.7.0 (Dec 2023)**:
- Settlement service rewrite in Python (was Java)
- Added support for options trading
- Improved error handling and retries

### Roadmap (Q1-Q2 2024)

**Q1 2024**:
- Implement margin trading
- Add support for futures contracts
- Upgrade matching engine to C++20
- Database migration to PostgreSQL 16

**Q2 2024**:
- Algorithmic trading API
- Advanced order types (iceberg, TWAP)
- Compliance reporting automation
- Multi-region deployment (EU)

## Common Questions

**Q: How do I deploy all services together?**
A: Use Shepherd. See `repo-shepherd-releases` skill and `docs/release-process.md`

**Q: Which service owns user balances?**
A: `user-service` owns account balances, but `settlement-service` updates them after trades.

**Q: How is data consistency maintained across services?**
A: Event-driven architecture with Kafka. Each service consumes events and updates its own database. Eventual consistency model.

**Q: What happens if matching-engine crashes?**
A: Orders in memory are lost. Order-service will resend pending orders after matching-engine restarts. No trades are lost (written to Kafka immediately).

**Q: How do I test a change across multiple services?**
A: Deploy feature branches to dev environment using Shepherd with branch overrides.

## Support & Contact

- **Team Slack**: #trading-platform
- **On-call**: @trading-platform-oncall in Slack or page via PagerDuty
- **Tech Lead**: John Doe (john.doe@company.com)
- **Product Manager**: Jane Smith (jane.smith@company.com)
