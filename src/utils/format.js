const currency = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })

export const formatCurrency = (value) => {
  const number = Number(value)
  return Number.isFinite(number) ? currency.format(number) : '—'
}

export const formatDate = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatDateTime = (value) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? '—'
    : date.toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export const formatPercent = (fraction, digits = 0) => {
  const number = Number(fraction)
  return Number.isFinite(number) ? `${(number * 100).toFixed(digits)}%` : '—'
}

// ENUM_VALUE -> "Enum value"
export const humanize = (value) => {
  if (!value) return ''
  const text = String(value).replace(/_/g, ' ').toLowerCase()
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const shortHash = (hash) => (hash && hash.length > 14 ? `${hash.slice(0, 8)}…${hash.slice(-6)}` : hash || '')

// snake_case feature names from the credit model -> readable labels
const FEATURE_LABELS = {
  contribution_frequency_score: 'Contribution regularity',
  payout_compliance_rate: 'Payout compliance',
  loan_repayment_ratio: 'Loan repayment history',
  credit_amount_normalised: 'Loan size vs. contributions',
  group_tenure_months: 'Time in the group',
  age: 'Age',
}

export const featureLabel = (feature) => FEATURE_LABELS[feature] || humanize(feature)
