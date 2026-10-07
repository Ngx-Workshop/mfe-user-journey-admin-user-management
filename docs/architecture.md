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
No dependency version or API schema changes are introduced.

## State lifecycle

Singleton filter/page state survives route changes. Scoped subscriptions tear down
with their views. Successful writes refresh the catalog; failed role/deletion requests
also refresh it to restore server truth. Profile failures retain local edits and offer
retry. Writes are serialized across users to preserve backend order. Pending writes
are reflected in the UI and guard repeated role/delete actions. Debounced edits not
yet accepted by the store are not guaranteed to survive navigation/browser shutdown.
