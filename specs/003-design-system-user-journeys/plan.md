# Plan

Baseline frontend has a Create User console placeholder and legacy Material layouts.
service-user-metadata has no admin create endpoint; auth public sign-up sets a new
session cookie and is unsuitable for administrator provisioning. Add POST admin/users
to service-auth with admin authorization, existing hashing and request-ID/actor/email
idempotency. Return only uuid/email/role, with no token/cookie/password. Add a metadata
POST admin/users orchestration endpoint that forwards administrator authorization in
normal mode and persists the profile under the returned auth ID. Retry reuses its
identity. Do not regenerate/publish contracts; use a local additive request interface
until generated DTO publication is separately requested.

Explicit local auth mode is loopback-only, fixed auth_users_local DB, development
only, and grants a synthetic admin only to POST /admin/users and PUT /role; ordinary auth
remains enforced elsewhere. Existing metadata local mode calls only this local auth
service, never production. Both use actual account hashing/persistence.

Frontend retains API/store/scoped VM boundaries. Add a create VM and shared fields,
reuse store serialization for creation with scoped completion/result handling.
Shared global root theme supplies overlays. Adopt panelClass ngx-select-panel on
owned selects, NgxButton on ordinary actions and NgxPanel on workspace surfaces.
Details adds role/lifecycle intent without transport in components. Reuse existing
profile retry/autosave, add accurate shared feedback and prevent route exit while
accepted writes are pending. Keep passwords only in transient form/request memory,
clear after completion/destruction and never persist/log them.

Constitution check: MVVM, typed standalone/OnPush, inline BEM, mirrored tests, public
Material APIs and shared tokens; existing default App/named Routes/DTO IDs preserved.
Production API default remains same-origin; development uses localhost3004.
Preserve user's package.json and webpack.config.js edits; preserve their development workflow; restart a failed watcher if needed.

Verify meaningful regression tests/builds and local MongoDB/API account+profile
creation, duplicate handling and sign-in; browser-check the actual shell using CUA.
Production auth/service deployment and gateway reachability remain external acceptance.
