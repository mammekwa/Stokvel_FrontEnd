# Backend changes the frontend relies on

Found while wiring the frontend to `StokvelApp` (commit `9da53e7`). Ordered by impact.

## 1. Error messages arrive as "An unexpected error occurred" (HTTP 500)

`GlobalExceptionHandler` has no handlers for `ResponseStatusException`, `AccessDeniedException`,
`LoanEligibilityException`, `LoanDecisionException`, `BlockchainOperationException` or
`MethodArgumentTypeMismatchException`, so the catch-all `Exception` handler turns them all into 500s.
Members then see a generic error instead of e.g. "At least 3 confirmed contributions are required".

Add to `GlobalExceptionHandler`:

```java
@ExceptionHandler(ResponseStatusException.class)
public ResponseEntity<ErrorResponse> handleStatus(ResponseStatusException ex, HttpServletRequest request) {
    return build(HttpStatus.valueOf(ex.getStatusCode().value()), ex.getReason(), request);
}

@ExceptionHandler(AccessDeniedException.class)
public ResponseEntity<ErrorResponse> handleForbidden(AccessDeniedException ex, HttpServletRequest request) {
    return build(HttpStatus.FORBIDDEN, ex.getMessage(), request);
}

@ExceptionHandler({LoanEligibilityException.class, LoanDecisionException.class})
public ResponseEntity<ErrorResponse> handleUnprocessable(RuntimeException ex, HttpServletRequest request) {
    return build(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), request);
}

@ExceptionHandler(BlockchainOperationException.class)
public ResponseEntity<ErrorResponse> handleBlockchain(BlockchainOperationException ex, HttpServletRequest request) {
    return build(HttpStatus.BAD_GATEWAY, ex.getMessage(), request);
}

@ExceptionHandler(MethodArgumentTypeMismatchException.class)
public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex, HttpServletRequest request) {
    return build(HttpStatus.BAD_REQUEST, "Invalid value for '" + ex.getName() + "'", request);
}
```

(`AccessDeniedException` is `org.springframework.security.access.AccessDeniedException`.)

## 2. Invite links point at port 4200

`GroupServiceImpl` reads `app.frontend-url` with default `http://localhost:4200`, but this frontend runs on 5173.
Email invitation links (`/invite/{token}`) use it. Add to `application.properties`:

```properties
app.frontend-url=${FRONTEND_URL:http://localhost:5173}
```

(The Members page builds the share link itself, so that one already works.)

## 3. CORS for the deployed frontend

`SecurityConfig.corsConfigurationSource()` only allows `http://localhost:5173`. Add the Vercel/Render URL when deployed.

## 4. Smaller mismatches

- **Repayment period:** `LoanApplicationRequest` allows 1–24 months; FR-03 says 1–12. The UI offers 1–12.
- **Contribution history order:** `findByMember_MemberId` has no ordering; the UI sorts newest-first. For FR-02 at the API level, use `findByMember_MemberIdOrderByCreatedAtDesc`.
- **On-chain amounts drop cents:** `request.getAmount().toBigInteger()` records R500.75 as `500`. Use `movePointRight(2).toBigIntegerExact()` and document amounts as cents.
- **Login response has no `userId`:** the frontend reads it from the JWT `sub` claim, so nothing breaks — but `register` and `login` responses differ.

## 5. Endpoints the UI is ready for (behind feature flags)

| Feature | Endpoint the UI calls | Flag |
|---|---|---|
| Process payout (FR-09) | `POST /api/v1/groups/{groupId}/payouts` body `{ memberId, amount }` → `{ payoutId, memberName, amount, txHash, createdAt }` | `VITE_FEATURE_PAYOUTS` |
| Payout history | `GET /api/v1/groups/{groupId}/payouts` | `VITE_FEATURE_PAYOUTS` |
| Repay loan (FR-05) | `POST /api/v1/groups/{groupId}/loans/{loanId}/repayments` body `{ amount }` | `VITE_FEATURE_REPAYMENTS` |
| Group contribution ledger / arrears (FR-06) | `GET /api/v1/groups/{groupId}/contributions` (admin) | add to `src/reports/registry.js` |
