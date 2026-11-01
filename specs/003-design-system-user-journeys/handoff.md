# Design system and complete user journeys — handoff

Implemented and locally verified on 2026-10-31. Production rollout is pending.

## Delivered

Catalog, details, dialogs and the new routed three-step Create User wizard use the
published 21.0.10 design system: action bar, save feedback, inline status, panels,
buttons and shared overlay/select policy. The large legacy hero is removed.
Filtering, pagination, independent assessments and autosave remain. Details now
includes role management and confirmed metadata deletion. Failed role changes
retain dirty profile drafts; deletion locks the editor and returns to the directory.
Assessment actions no longer imply taking a selected user's test as the administrator.

Create User creates an actual sign-in identity plus profile. service-auth owns
hashing and admin authorization; service-user-metadata coordinates persistence.
Stable operation IDs recover a partially created account without changing its
password or signing the administrator into it. Duplicate emails conflict. Pending
writes prevent duplicate submissions and route exit; failures preserve the form.
No invitation email, password reset, sign-in email editing or identity deletion was
added. Profile email edits remain metadata-only. Metadata deletion retains identity.
Credentials are transient and never stored as browser drafts or returned by APIs.

## Verification evidence

- MFE: 28 Karma tests passed, including wizard validation, exact request mapping,
  stable retry, pending guards, host-relative completion, role rollback/draft
  retention and confirmed deletion. Source layout, TypeScript and diff checks pass.
- Metadata: 56 tests across six suites passed. Auth: seven tests passed, covering
  provisioning, validation, duplicate/race handling, admin roles and local isolation.
- Production builds passed in all three repositories; metadata OpenAPI regenerated.
- Component and Routes federation loading passed; production watch initial build
  and both incremental rebuilds passed. The watch check now touches an active file.
- Real isolated MongoDB/HTTP check passed after the final auth restart: account +
  profile creation, same-operation retry, duplicate/invalid rejection, bcrypt hash,
  actual sign-in, profile editing, identity role synchronization and metadata-only
  deletion. The script cleans up only its own synthetic account/profile.
- Authenticated shell rendered the final local remote at the supplied URL. Browser
  checks covered directory/detail/create navigation, shared overlays, search-miss
  and Clear filters, error Retry recovery, and desktop/390px layouts. Both directory
  and create had document width 390 at viewport width 390. No account credentials
  were entered through browser automation; submission is covered above.

Screenshots: /tmp/user-management-catalog-desktop.png,
/tmp/user-management-create-desktop.png and /tmp/user-management-create-mobile.png.

The metadata build temporarily interrupted the existing watcher through its shared
output folder. It was restarted with npm run start:local; Retry recovered the page.
Metadata is running on 127.0.0.1:3004; the added local auth process runs on
127.0.0.1:3005. The existing MFE watch/server remain running. Production frontend
build validation used isolated output rather than overwriting the served bundle.

## Rollout order and external acceptance

Read service-auth/docs/admin-user-provisioning.md and
service-user-metadata/docs/admin-user-provisioning.md in the sibling checkouts.
Deploy auth's additive admin endpoint first and create its sparse unique
provisioningRequestId index (production autoIndex is disabled). Preserve the unique
email index. Configure metadata AUTH_BASE_URL/ingress and normal administrator
cookie/JWT compatibility; deploy metadata, then the MFE. Never enable either local
development flag in production. Verify admin-only creation, session preservation,
duplicate handling and partial-profile retry using a disposable hosted test user.
No production deployment, index change, publication or data mutation was performed.
Generated NPM contracts were not published; the frontend additive request type is
local until contract publication. Existing user manifest/federation edits remain.
