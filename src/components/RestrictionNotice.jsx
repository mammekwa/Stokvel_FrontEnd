import { RULES } from '../config/features'
import { Notice } from './ui'

// FR-07: show the member whether they can borrow and why not.
export default function RestrictionNotice({ standing }) {
  if (standing.loanRestricted) {
    return (
      <Notice title="Loan applications are restricted" tone="warning">
        You've been flagged for missed contributions. Loan applications are restricted until your outstanding contributions are settled.
      </Notice>
    )
  }

  if (standing.contributionsNeeded > 0) {
    return (
      <Notice title="Not yet eligible for a loan" tone="info">
        You need {RULES.minConfirmedContributionsForLoan} confirmed contributions before you can apply — {standing.contributionsNeeded} more to go.
      </Notice>
    )
  }

  return null
}
