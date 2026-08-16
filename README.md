# Rubikcon Protocol v1.0

---

## Summary

Rubikcon is a comprehensive hybrid Web2/Web3 platform integrating a Learning Management System (Academy), a decentralized talent marketplace (BlockGigs), and a session-based gaming hub. The system utilizes centralized database infrastructure combined with decentralized payment verification to enable seamless fiat and cryptocurrency course enrollments.

### Key Features

- Multi-tenant architecture
- Web3 native cryptocurrency checkout (DePay, Polygon USDT)
- Fiat payment integration (Paystack NGN/USD)
- Secure, stateless authentication via JWT
- Robust server-side payment verification (HMAC-SHA512 and on-chain RPC)

---

## System Architecture

### Core Components

- Academy Frontend (React/Vite)
  - Responsibility: Provides the LMS UI, video rendering, progress tracking, and checkout initiation.
  - Key Functions: `handleCheckout`, `DePayWidgets.Payment`

- Core API Backend (Express/Node.js)
  - Responsibility: Manages core state, validates external webhooks, and verifies on-chain transactions.
  - Key Functions: `verifyWeb3Payment`, `verifyPaystackWebhook`

- Database (PostgreSQL + Prisma)
  - Responsibility: Persists users, courses, module structures, and transaction states.
  - Key Functions: `paymentsRepository`, `courseEnrollment`

---

## Component Interaction Flow

1. User -> Academy Frontend
   - Calls `handleCheckout` with currency intent (Fiat or Crypto)

2. Academy Frontend -> Backend API
   - Calls `/initialize` to generate internal tracking reference

3. Backend API -> Frontend Checkout UI
   - Returns `internalReference`. Frontend mounts DePay widget or Paystack redirect.

4. External Payment Processor -> Backend API
   - For Fiat: Paystack fires HMAC-signed POST to `/webhook/paystack`
   - For Crypto: Frontend captures `txHash` and POSTs to `/verify-web3`

5. Final State
   - Backend updates `Payment` record to SUCCESS and inserts `CourseEnrollment`. User gains course access.

---

## Example Execution

### Crypto Course Enrollment

1. User calls:

   ```ts
   handleCheckout("USDT");
   ```

2. Frontend processes request:
   - Fetches internal reference from backend
   - Instantiates `DePayWidgets.Payment`
   - User signs transaction via Web3 provider

3. Internal operations (Backend):
   - Receives `txHash`
   - Queries Polygon RPC via `viem`
   - Validates receipt success status

4. Result:
   - Payment marked SUCCESS
   - CourseEnrollment created

---

## State & Data Model

- User Model
  - Description: Global account identifier
  - Fields: id, email, password, name, role

- Course Model
  - Description: Educational product definition
  - Fields: id, title, isPaid, priceUsd, priceNgn

- Payment Model
  - Description: Transaction tracking layer
  - Fields: id, internalReference, providerReference, amount, status

---

## Invariants & Security Model

- Enrollments require strict verification
- Webhook endpoints enforce signature matching
- Price variables originate strictly from the backend database

### Failure Conditions

- Reverts when:
  - Paystack HMAC-SHA512 signature is invalid or missing
  - Web3 transaction receipt status is not 'success'
  - Course is marked as free but payment route is invoked

---

## External Dependencies

- Paystack API
  - Purpose: Fiat payment processing and webhook notifications

- Polygon RPC Node (via Viem)
  - Usage: Validates on-chain transaction receipts

---

## Configuration

- PAYSTACK_SECRET_KEY
  - Description: API key for Paystack verification
  - Default: sk*test*...

- VITE_CRYPTO_WALLET_ADDRESS
  - Description: Merchant wallet address receiving crypto payments
  - Default: 0x0...

---

## Getting Started

### Monorepo Structure & Domains

```text
rubikcon/
├── landing/          -> rubikcon.com                   (port 3000)
├── academy/          -> www.rubikconacademy.xyz        (port 3001)
├── games/            -> games.rubikcon.com             (port 3002)
├── blockgigs/        -> blockgigs.rubikcon.com         (port 3003)
└── backend/          -> api.rubikcon.com               (port 4000)
```

### Requirements

- Node.js 18+
- PostgreSQL 14+

### Installation & Local Development

Clone the repository and install dependencies for each module:

```bash
git clone https://github.com/Rubikcon/rubikcon.git
cd rubikcon
```

Start the Backend API (Port 4000):

```bash
cd backend
npm install
npm run dev
```

Start the Landing Page (Port 3000):

```bash
cd landing
npm install
npm run dev
```

Start the Academy (Port 3001):

```bash
cd academy
npm install
npm run dev
```

Start Games (Port 3002):

```bash
cd games
npm install
npm run dev
```

Start BlockGigs (Port 3003):

```bash
cd blockgigs
npm install
npm run dev
```

### Environment Setup

Create a `.env` file in the `backend/` directory:

```text
DATABASE_URL=<postgres_url>
JWT_SECRET=<secret>
PAYSTACK_SECRET_KEY=<key>
```

Create a `.env` file in the `academy/` directory:

```text
VITE_CRYPTO_WALLET_ADDRESS=<address>
VITE_API_URL=http://localhost:4000
```

## Build

```bash
npm run build
```

---

## Test

```bash
npm test
```

---

## Coverage

```bash
npm run coverage
```

---

## Deployment (Optional)

```bash
vercel deploy
```

---

## Notes & Variants

- For NGN/USD checkout, use Paystack integration.
- For Crypto checkout, use DePay widget integration.

---

## Roadmap (Optional)

- [ ] Set Paystack keys to Live Mode
- [ ] Register production webhook URL in Paystack dashboard
- [ ] Configure VITE_CRYPTO_WALLET_ADDRESS in Vercel
- [ ] Implement automated refund mechanism for edge-case failures
- [ ] Implement email receipt dispatcher
- [ ] Harden Authentication: Migrate to a 3rd-party provider (e.g., Clerk, Supabase Auth) or implement native email verification and password reset flows.
- [ ] Complete Facilitator Dashboard: Implement full CRUD interfaces for managing modules, lessons, and assignments.
- [ ] Build SuperAdmin User Management: Create UI to manage users, manual enrollments, and platform analytics.
- [ ] Complete Facilitator Application Flow: Build the backend approval/rejection pipeline for pending facilitators.
- [ ] Integrate Games & BlockGigs: Connect the remaining placeholder frontend apps to their respective backend API modules.

---

## License

MIT
