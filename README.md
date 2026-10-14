# StokvelChain — Frontend

React + Vite + Tailwind frontend for StokvelChain: a stokvel management platform with blockchain-backed records (Ethereum Sepolia) and AI credit scoring.

## Run locally

```bash
npm install
cp .env.example .env     # Windows: copy .env.example .env
npm run dev              # http://localhost:5173
```

The backend must be running (default `http://localhost:8080/api/v1`) and must allow the `http://localhost:5173` origin in its CORS config.

## Environment

| Variable | Default | Purpose |
|---|---|---|
| `VITE_API_BASE_URL` | `http://localhost:8080/api/v1` | Backend base URL |
| `VITE_EXPLORER_TX_URL` | `https://sepolia.etherscan.io/tx/` | Transaction links |
| `VITE_FEATURE_PAYOUTS` | `false` | Turn on once `POST/GET /groups/{id}/payouts` exist |
| `VITE_FEATURE_REPAYMENTS` | `false` | Turn on once `POST /groups/{id}/loans/{loanId}/repayments` exists |

## How it fits together

- **Who is logged in** comes from the JWT (`sub` = userId, `email`, `role`) — `src/context/AuthContext.jsx`.
- **Which group you're acting in** comes from `GET /groups/mine` + `GET /members/me` — `src/context/GroupContext.jsx`. Users can belong to several groups; the sidebar switches between them.
- **Admin rights are per group** (`isAdmin` on each group), not a user role. Admin pages live under `/admin/*`.
- All API calls are in `src/api/` and return data directly; errors always have the shape `{ status, message, details[] }`.

## Screens and requirements

| Route | Who | Requirement |
|---|---|---|
| `/` Dashboard | Member | FR-01 log contribution, FR-02 recent history, FR-07 eligibility |
| `/contributions` | Member | FR-02 full history, FR-08 Sepolia links, CSV statement |
| `/loans` | Member | FR-03 apply (1–12 months), FR-05 repay (feature flag) |
| `/notifications` | Everyone | Loan decisions, credit-model alerts |
| `/profile` | Member | FR-07 loan-restriction status, memberships |
| `/groups/new` | Everyone | Create a group, join with a code |
| `/join/:code` | Public | Invite-link preview and join request |
| `/invite/:token` | Logged in | Accept an email invitation |
| `/admin/members` | Admin | Approve/decline joins, invite link & email invites, member register |
| `/admin/loans` | Admin | FR-04 score, FR-10 ranked factors, decide with override reason, retry disbursement |
| `/admin/payouts` | Admin | Payout rotation; FR-09 processing (feature flag) |
| `/admin/reports` | Admin | CSV exports + printable group summary |

## Adding an admin report

Reports are defined in `src/reports/registry.js`. Add an entry with a `load()` function and `columns`, and it appears on the Reports page with CSV export. Entries marked `available: false` show as "coming soon" with the backend endpoint they need.
