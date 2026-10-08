# Implementation plan: User management MVVM refactor

Created: 2026-10-07 · Status: Implemented; integration pending

## Technical Context
**Language/Version**: Angular 21.1.0 / TypeScript ~5.9.3
**Primary Dependencies**: Material/CDK, RxJS 7.8.2, user-metadata and assessment contracts, Module Federation
**Storage**: root in-memory store; persistence owned by service-user-metadata
**Project Type**: host-mounted Angular administrative remote

## Sequence and design
1. Adapt .specify, .github Spec Kit agents/prompts, AGENTS and docs (FR-007).
2. Move feature files into features/user-management/{api,models,state,pages,components}.
   Stateless clients use environment URLs. Pure assessment mapping belongs in models.
3. Root UserManagementStore exposes shared read streams and serialized commands;
   switchMap cancels stale list/detail reads, catchError stays inside requests.
   Filter/pagination query is one atomic state. Writes use concatMap, independent
   from the view subscription lifetime. Refresh list on successful writes (FR-001–004).
4. Scoped catalog/details/form view models bridge store, router, dialogs and typed
   forms. Presentation emits events; autosave keeps local edits and provides retry.
   Remove blocking resolver; load assessment state independently (FR-002–005).
5. Keep inline BEM styles, OnPush, accessible status/retry controls and table overflow.
6. Add development environment replacement pointing directly to localhost:3004/user-metadata
   and a hosted-api build overlay for existing authenticated-host development. Production URLs and federation names/exposures stay stable;
   align existing Material/CDK shared requirements with installed 21.1.0 (FR-006).
7. Test cancellation, recovery, serialized writes, DTO mapping, environment URLs,
   profile clearing/validation, presentation outputs and route changes; build both modes.

## Contracts and external dependencies
No backend DTO/schema changes. Profile PATCH excludes UUID/role. Blank strings are
valid optional backend strings and intentionally clear fields. The host owns auth
cookies and remote loading; assessment-test owns eligibility/history. The local backend must permit the hosted shell origin and provide an appropriate
isolated local authentication/data setup. This is an external backend prerequisite;
frontend code does not bypass authentication. The hosted-api overlay uses current
same-origin host endpoints without this prerequisite.

## Constitution Check and risks
All principles mapped above. Reads are cancelable; writes must not be switchMapped.
Autosave cannot guarantee delivery after closing the browser. No data migration.
Keep live backend checks separate from mocked unit checks. Approximate component
size is a maintainability target, not grounds to split cohesive code mechanically.

## Implementation decisions

The initial dev-server proxy proposal was replaced with a direct localhost API URL
because this remote runs inside the HTTPS shell, not on the Angular dev server's
origin. The hosted-api overlay supports current authenticated-host development.
The backend scope question was presented while independent frontend work continued;
no backend files or authentication behavior were changed. Local integration remains
an explicit external prerequisite rather than a claimed verification result.

2026-10-07 follow-up: the user authorized backend setup. service-user-metadata now
provides the isolated local mode, seed fixtures and verified HTTP/Mongo journey;
X001 is resolved. See that repository's specs/001-local-development/handoff.md.
