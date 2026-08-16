# Rubikcon Backend API v1.0

---

## Summary

The central authoritative state machine and API for the Rubikcon ecosystem. Built with Express and Prisma, it handles cross-application authentication, database mutations, and strict payment verifications.

### Key Features

- Stateless JWT Authentication
- Paystack Webhook Validator
- Web3 On-Chain Receipt Validator (Viem)
- Relational schema management via Prisma

---

## System Architecture

### Core Components

- PaymentsController
  - Responsibility: Exposes webhook and verification endpoints.
  - Key Functions: `verifyWeb3`, `paystackWebhook`

- PaymentsService
  - Responsibility: Contains business logic for signature verification and database transaction handling.
  - Key Functions: `verifyWeb3Payment`, `verifyPaystackWebhook`

- PaymentsRepository
  - Responsibility: Abstracts Prisma operations.
  - Key Functions: `updatePaymentStatus`

---

## Component Interaction Flow

1. User -> /api/academy/payments/verify-web3
   - Calls endpoint with `txHash`

2. PaymentsController -> PaymentsService
   - Internal routing

3. PaymentsService -> Polygon RPC
   - Executes `getTransactionReceipt` via Viem

4. PaymentsService -> Prisma
   - Executes `$transaction` to update payment and insert enrollment

5. Final State
   - Return 200 OK

---

## Example Execution

### Webhook Validation

1. Paystack calls:

   ```http
   POST /api/academy/payments/webhook/paystack
   ```

2. Backend processes request:
   - Extracts `x-paystack-signature`

3. Internal operations:
   - Computes HMAC-SHA512 of raw body using `PAYSTACK_SECRET_KEY`
   - Compares computed hash to signature
   - Validates subunit amount and currency match

4. Result:
   - `CourseEnrollment` created safely

---

## State & Data Model

- Payment
  - Description: Immutable ledger of initialization and finalization states
  - Fields: internalReference, status, amount

- CourseEnrollment
  - Description: Access control mapping
  - Fields: userId, courseId

---

## Invariants & Security Model

- Webhooks lacking valid HMAC signatures must fail immediately
- Double-processing of webhooks is prevented by checking existing SUCCESS states

### Failure Conditions

- Reverts when:
  - Signature hash mismatch
  - Amount or currency payload mismatch
  - On-chain txHash resolves to failed or reverted

---

## External Dependencies

- Prisma ORM
  - Purpose: Database operations

- Viem
  - Usage: Web3 RPC interactions

---

## Configuration

- PAYSTACK_SECRET_KEY
  - Description: Signing key for webhooks
  - Default: sk*test*...

---

## Getting Started

### Requirements

- Node.js 18+
- PostgreSQL 14+

### Installation

```bash
cd backend
npm install
```

### Environment Setup

Create `.env` file:

```bash
DATABASE_URL=postgresql://...
PAYSTACK_SECRET_KEY=sk_test_...
```

---

## Build

```bash
npx prisma generate
npm run build
```

---

## Roadmap (Optional)

- [ ] Set Paystack keys to Live Mode
- [ ] Register production webhook URL in Paystack dashboard
- [ ] Implement automated refund mechanism for edge-case failures
- [ ] Implement email receipt dispatcher
- [ ] Harden Authentication: Add email verification, password reset endpoints, or migrate to JWKS validation for 3rd-party auth.
- [ ] Complete Facilitator API: Add full endpoints for course/module/lesson creation and assignment grading.
- [ ] Complete SuperAdmin API: Add endpoints for analytics and role management.

---

## License

MIT
