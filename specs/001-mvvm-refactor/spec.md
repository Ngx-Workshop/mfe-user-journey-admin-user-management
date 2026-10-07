# Feature: User management MVVM refactor

Created: 2026-10-07 · Status: Implemented; integration pending

## Problem and baseline
The catalog component owns overlapping HTTP subscriptions and uses lastValueFrom
with EMPTY, risking rejected promises. The profile form owns HTTP/autosave state;
its plain loading boolean is unreliable under zoneless change detection. Assessment
loading blocks navigation in a resolver. Query search has no debounce. The create
button has no action. The existing test expects a toolbar absent from the empty App.

## Requirements and acceptance
- FR-001 / AC-001: list search, role filters and pagination retain behavior; newest
  query wins, filters reset page, failed reads recover through retry.
- FR-002 / AC-002: profile autosaves valid edits after 500ms; UUID is immutable,
  blank optional fields can be cleared; writes serialize and failed edits can retry.
- FR-003 / AC-003: role updates and confirmed deletion refresh the current list;
  deleting its last row moves back a page; canceled deletion makes no request.
- FR-004 / AC-004: details follow route UUID changes; assessment failures do not
  prevent profile editing and have independent retry. Zero-answer scores are finite.
- FR-005 / AC-005: data access, singleton state, scoped view models and presentation
  have explicit boundaries; components inline HTML/SCSS, BEM, approximately 230 lines.
- FR-006 / AC-006: development configuration reaches local service-user-metadata
  (port 3004); production keeps /api/user-metadata; host exports and auth preserved.
- FR-007 / AC-007: migrate Spec Kit workflow, templates/adapters and repo context,
  with relevant specs and verification evidence, without copying document features.

## Scope and assumptions
No new account creation endpoint is available: remove the inactive create action.
Assessment API paths remain compatible, including the server's asssessments spelling.
Development uses http://localhost:3004/user-metadata, matching the document editor’s
direct local service pattern. service-user-metadata requires local CORS/auth setup;
the hosted-api build overlay preserves current authenticated-host access.
The corrected host URL is https://admin.ngx-workshop.io/user-management/user-metadata. Live verification is read-only; do not
change real user roles or delete real users as a test.

## Constitution Check
All seven principles apply. Acceptance uses isolated tests/builds plus an attempted
host check; unverified service integration must be recorded separately.
