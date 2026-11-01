# Design system and complete user journeys

Status: Complete for local acceptance; production rollout pending
Date: 2026-10-31

Migrate catalog/details to published design-system 21.0.10 panels, buttons, action
bars, feedback/status and shared overlay policy. Preserve host-relative existing
user-metadata routes, UUID contracts, filtering/pagination, role/delete commands,
profile autosave, independent assessment loading and federation exposures.

FR-001 / AC-001: Compact shared action bars, responsive catalog/filters and details
panels replace the hero. Clear loading/empty/search-miss/error/retry states remain.
FR-002 / AC-002: Create User opens a routed three-step account/profile/review form.
User explicitly chose creation of a sign-in account plus metadata, not metadata-only.
Validate credentials, confirm password, show role/profile summary, prevent duplicate
submits, retain nonsensitive draft after failure and protect navigation during writes.
Success opens the created profile within the current shell mount. Never sign the
administrator into the new account. No email/invitation is sent.
FR-003 / AC-003: Account creation is authorized by backend admin roles; auth owns
credential hashing/identity. Metadata coordinates profile persistence. Stable request
IDs make retry recover an account after a profile failure without resetting credentials
or attaching an unrelated existing email. Report duplicate/unavailable errors clearly.
FR-004 / AC-004: Details exposes profile editing, role management, confirmed metadata
deletion and back navigation with shared save feedback. Metadata deletion does not
claim to delete the sign-in identity. Assessment errors never block profile editing.
FR-005 / AC-005: Verify frontend/store/HTTP/UI and backend validation/idempotency,
normal builds and federation watch. Use isolated local databases for real writes;
verify hosted rendering separately from actual account/persistence checks.

No publication/deployment, password reset/email delivery or identity deletion is in
scope. Production auth/gateway deployment is recorded as an external handoff.
