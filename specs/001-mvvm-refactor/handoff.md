# Handoff: User management MVVM refactor

Status: Implemented; integration pending · Updated: 2026-10-07
[Spec](spec.md) · [Plan](plan.md) · [Tasks](tasks.md)

## Delivered

Adapted repository-local Spec Kit context/templates/agents/prompts/helpers. Feature
code now separates stateless HTTP APIs, singleton shared state/ordered commands,
scoped catalog/details/form view models and focused input/output presentation.
All component HTML/SCSS is inline and application-owned classes use BEM; the largest
component is 211 lines. Default App, named Routes, auth guard and federation exposures
are preserved. Material/CDK shared version requirements match installed 21.1.0.

Reads cancel stale requests; writes serialize and accepted writes survive view
teardown. Failed reads retry, profile edits survive save errors, optional fields can
be cleared, and UUID cannot be edited. Assessment failures no longer block details.
Confirmed deletion refreshes the list and recovers an empty later page. The inactive
create action is removed because no admin creation flow exists. Notifications are
one-time events and do not replay stale saves when returning to the catalog.

Development metadata uses http://localhost:3004/user-metadata; production uses
/api/user-metadata. The hosted-api overlay retains existing same-origin development.
The user's running static server was left running. The served dist bundle was built
with development,hosted-api so it does not depend on the absent local backend.

## Verification

| Check | Result / scope |
| --- | --- |
| `npm run test:ci` | 24 ChromeHeadless tests; HTTP doubles, form clock tests, presentation and real Angular router harness |
| Production build | PASS, isolated /tmp/user-management-production-check |
| Development build | PASS, isolated /tmp/user-management-development-check |
| Hosted API development overlay | PASS, served dist output |
| Environment isolation | local API reference exists in development, absent in production |
| `npm run check:layout` | PASS; feature folders and mirrored tests |
| TypeScript test compilation | PASS |
| `git diff --check` | PASS |
| Documentation links | Local context links resolve |
| Optional bash helpers | syntax passes; mutation scripts were not executed |
| Hosted browser | inherited catalog renders; old Create New User action remains, so new-bundle integration is NOT verified |
| Local backend | NOT RUN: no listener on 3004; local backend setup absent |

Earlier failures were resolved: Karma initially discovered zero tests until its
explicit testing include was added; timing tests needed mocked Date with Jasmine's
clock; the role select needed its Material aria-label input instead of a conflicting
raw host attribute. The stale toolbar assertion was replaced by useful routed UI tests.

## External owner handoff / next action

X001 — service-user-metadata owns local CORS, isolated authentication and database
setup. Unlike service-document it has no start:local mode. Its ordinary start:dev
must not be assumed isolated. Decide backend scope, supply that setup, then verify
with disposable local records. No backend files, schemas or authorization were changed.

X002 — shell/browser owner: activate the local port 4201 remote through the existing
browser-local override and verify read-only catalog/deep-link behavior first. Use
`npm run watch:hosted-api` with the existing backend, or `npm run watch` after local
backend setup. Then verify writes only against disposable local data. No deployment,
registry changes, real user mutations or package publishing were performed.

All local T001–T007 tasks are implemented; X001/X002 remain visible as integration
work. README, AGENTS, constitution, architecture, API contracts, development,
readiness, source organization, migration record and feature index were updated.
