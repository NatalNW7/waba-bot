# Phase 04: Reliability & Edge Cases

The final phase ensures the system is resilient to network failures, duplicate notifications, and expired credentials.

## Scope
- Idempotency in webhook processing.
- Error handling in Bull Queue.
- Credential management.

## Proposed Tests

### 1. Idempotency (Duplicate Webhooks)
- [ ] **Repeated Notification**: Send the same `payment_id` notification twice.
- [ ] **Verification**: Ensure only one `Payment` record is created and no duplicate state updates occur.

### 2. Error Handling & Retries
- [ ] **API Downtime**: Simulate a failure when fetching details from MP during queue processing.
- [ ] **Verification**: Ensure Bull queue retries the job (backoff strategy) and eventually moves to Dead Letter Queue if failure persists.
- [ ] **Alerting**: Verify that a log or error notification is triggered on final failure.

### 3. Edge Cases
- [ ] **Expired Access Token**: Simulate a tenant with an expired token.
- [ ] **Verification**: System should gracefully handle the 401 response from MP and potentially attempt to use the `refresh_token` (Phase 3 logic).
- [ ] **Subscription Cancellation**: Receive a `cancelled` notification from MP.
- [ ] **Verification**: Local `Subscription` status must be updated to `CANCELED`.

### 4. Integration Quality
- [ ] **MCP Tool `quality_checklist`**: Run the quality checklist for the application ID to identify missing best practices.
- [ ] **MCP Tool `quality_evaluation`**: Evaluate specific payments to ensure all mandatory fields (like `external_reference`) are being sent correctly.

## Verification
- Monitor Bull queue logs for retry patterns.
- Check database constraints for unique index violations on `externalId`.
