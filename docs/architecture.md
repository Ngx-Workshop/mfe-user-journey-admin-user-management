# User management architecture

Angular 21.1.0, TypeScript ~5.9.3, Material/CDK 21.1.0 and RxJS 7.8.2.
Components are standalone, OnPush and zoneless, with inline HTML and BEM SCSS.

## Ownership and MVVM

- `features/user-management/api`: stateless UserMetadataApi and AssessmentTestsApiService.
  Only these clients use HttpClient; environment configuration owns base URLs.
- `models`: profile/query/load/write contracts and pure assessment view mapping.
- `state`: root UserManagementStore owns catalog query/results and command processing.
  switchMap cancels superseded reads; request-local catchError keeps triggers alive.
  concatMap serializes commands; the root subscription lets accepted writes finish
  when views unmount. The catalog stream is root-subscribed to recover invalid pages.
- `pages/catalog`: CatalogViewModel adapts store streams to signals, debounces search,
  owns navigation, notifications and confirmation. The route component renders state.
- `pages/details`: DetailsViewModel follows route UUID streams and independently loads
  profile/assessments. ProfileFormViewModel owns typed form state, validation,
  500ms autosave and explicit payload mapping, without data access.
- `components`: filter, table and assessment presentation; a profile form orchestrator
  uses its scoped form VM and emits save intent to details; a confirmation dialog
  returns intent without making requests.

Presentation reads inputs and emits events. View models bridge Angular UI concerns
and the singleton store; they never inject data access. APIs never hold selection,
filters, forms or caches. Filter and page changes update one query object atomically.
The catalog view keeps a draft search string while its request is debounced.

## Routes and federation

`src/app/app.routes.ts` remains the named Routes export. Paths are `user-metadata`
and `user-metadata/:userId`, behind userAuthenticatedGuard. The blocking assessment
resolver is removed; failures render inside details and do not block profile editing.
The service remains responsible for admin authorization.

`app.ts` retains default App. `webpack.config.js` retains legacy `ngx-seed-mfe`,
remoteEntry.js and ./Component / ./Routes; Material/CDK requirements now match the
installed 21.1.0. Shell and remote must share compatible Angular/Material versions.
Feature 003 adds the design-system dependency and admin provisioning API described below.

## State lifecycle

Singleton filter/page state survives route changes. Scoped subscriptions tear down
with their views. Successful writes refresh the catalog; failed role/deletion requests
also refresh it to restore server truth. Profile failures retain local edits and offer
retry. Writes are serialized across users to preserve backend order. Pending writes
are reflected in the UI and guard repeated role/delete actions. Debounced edits not
yet accepted by the store are not guaranteed to survive navigation/browser shutdown.

## Design system and complete journeys — 2026-10-31

The App host scopes ngx-design-system and retains only its router outlet. The old
particle header is retired. Catalog/detail/create use shared NgxActionBar,
NgxSaveFeedback, NgxInlineStatus, NgxPanel and NgxButton; standalone theme() supplies
root/overlay policy while hosted views inherit shell globals. Owned selects and
paginator panels opt into ngx-select-panel. Semantic surfaces and bounded scrolling
keep the table usable without horizontal page overflow; action columns remain sticky.

Catalog supports search/role/reset/pagination, explicit empty versus search-miss
recovery, profile navigation, role changes and confirmed metadata deletion. Details
adds role and lifecycle controls; failed role changes restore their value and retain
invalid/dirty profile drafts. Metadata deletion disables the editor and returns to
the current mount's directory after confirmed completion. It leaves the identity.
Assessments remain independent and read-only for the selected user; a misleading
Start Test link that would act as the current administrator is removed.

The static user-metadata/new route precedes :userId. Its scoped CreateUserViewModel
owns a three-step form and stable request ID; fields/review are presentational.
The root store serializes the create command with existing writes and exposes a
scoped creation result. Success navigation waits for queue finalization and opens
the persisted UUID relative to the shell mount. Accepted writes block route exit;
pending creation disables fields/submission. Password confirmation is never sent,
credentials are transient and clear on completion/destruction. Same-account retries
reuse the operation ID; changing email/role starts a new operation. No draft survives
reload. Backend authorization and safe account/profile retry belong to the services.

Details role choices have local optimistic presentation and roll back after failure;
profile transport/payloads remain separate. Profile edits still debounce for 500ms,
exclude UUID/role and preserve blank clearing. Dirty same-ID refreshes retain drafts;
a new UUID resets the editor. Shared feedback reflects actual root write state.
