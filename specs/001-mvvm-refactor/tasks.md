# Tasks: User management MVVM refactor

- [x] T001: Inspect source/contracts and write spec/plan; migrate local workflow (FR-007).
- [x] T002: Implement feature layout, stateless environment-aware API clients and pure models.
- [x] T003: Implement singleton stream store, cancellation, serialized writes and recovery.
- [x] T004: Implement scoped view models and focused inline BEM components.
- [x] T005: Add environment replacement/hosted overlay and preserve federation contracts.
- [x] T006: Add meaningful regression tests; run tests and both builds.
- [x] T007: Update architecture/development/contracts/readiness and final handoff.

## Constitution Check
Follow all seven principles. Verification results must distinguish unit/build and
live host/service integration; record remaining external checks in handoff.md.

## External verification

- [x] X001 — service-user-metadata: supply isolated local MongoDB/auth setup and
  CORS for the hosted shell; then test disposable profile updates/role changes/deletion
  against localhost:3004. User authorized backend setup on 2026-10-07; service unit/build and real isolated
  MongoDB/HTTP checks pass.
- [ ] X002 — host/browser: select the new local remote and verify catalog/deep links,
  filters, pagination, profile autosave/retry and assessment states. Current hosted
  route still renders the old bundle, so read-only observation is baseline evidence.
