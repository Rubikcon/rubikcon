# Rubikcon Academy Frontend v1.0

---

## Summary

The Learning Management System frontend interface. Responsible for rendering course curriculum, tracking user progression through markdown-based lessons, and initiating secure checkout workflows.

### Key Features

- Multi-currency checkout modal
- Web3 client integration via DePay Widgets
- Responsive video and markdown renderers
- Protected route handling

---

## System Architecture

### Core Components

- CheckoutModal
  - Responsibility: Routes user to correct payment provider based on currency selection.
  - Key Functions: `handleCheckout`

- CourseViewer
  - Responsibility: Enforces enrollment state before rendering lesson content.
  - Key Functions: `checkEnrollment`

---

## Component Interaction Flow

1. User -> CheckoutModal
   - Calls `handleCheckout` with intent

2. CheckoutModal -> Backend
   - Fetches tracking reference

3. CheckoutModal -> DePay Widgets
   - Injects `usdPrice` and `VITE_CRYPTO_WALLET_ADDRESS`

4. DePay Widgets -> Backend
   - Resolves `txHash` and POSTs to verification endpoint

5. Final State
   - User redirected to dashboard

---

## Example Execution

### Fiat Initialization

1. User calls:

   ```ts
   handleCheckout("NGN");
   ```

2. CheckoutModal processes request:
   - Fetches `checkoutUrl` from backend

3. Internal operations:
   - Validates response

4. Result:
   - `window.location.href = checkoutUrl`

---

## State & Data Model

- Course State
  - Description: Client-side representation of curriculum
  - Fields: modules, lessons, isPaid

---

## Invariants & Security Model

- UI gracefully degrades if prices are unavailable
- Protected content is strictly gated by backend API checks

### Failure Conditions

- Reverts when:
  - Checkout API returns 500
  - Price parameter resolves to null

---

## External Dependencies

- @depay/widgets
  - Purpose: Client-side Web3 transaction management

---

## Configuration

- VITE_CRYPTO_WALLET_ADDRESS
  - Description: Receiver address for crypto payments
  - Default: 0x000...

---

## Getting Started

### Requirements

- Node.js 18+

### Installation

```bash
cd academy
npm install
```

### Environment Setup

Create `.env` file:

```bash
VITE_CRYPTO_WALLET_ADDRESS=<address>
VITE_API_URL=http://localhost:4000
```

---

## Build

```bash
npm run build
```

---

## Roadmap (Optional)

- [ ] Configure VITE_CRYPTO_WALLET_ADDRESS in Vercel
- [ ] Complete Facilitator Dashboard UI for course and lesson editing
- [ ] Build SuperAdmin UI for user management and analytics
- [ ] Implement frontend flows for email verification and password reset
- [ ] Finalize Facilitator application state UI (Pending/Approved/Rejected)

---

## License

MIT
