// Feature switches. Flip a flag to true once the matching backend endpoint exists.
export const FEATURES = {
  // POST /groups/{groupId}/payouts (FR-09)
  payouts: import.meta.env.VITE_FEATURE_PAYOUTS === 'true',
  // POST /groups/{groupId}/loans/{loanId}/repayments (FR-05)
  repayments: import.meta.env.VITE_FEATURE_REPAYMENTS === 'true',
}

export const EXPLORER_TX_URL =
  import.meta.env.VITE_EXPLORER_TX_URL || 'https://sepolia.etherscan.io/tx/'

// Business rules mirrored from the backend so the UI can explain them up front.
export const RULES = {
  minConfirmedContributionsForLoan: 3,
  minRepaymentMonths: 1,
  maxRepaymentMonths: 12,
  minOverrideReasonLength: 20,
}
