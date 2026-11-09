# API contracts

Production metadata base: `/api/user-metadata`. Development metadata base:
`http://localhost:3004/user-metadata`. Assessment base: `/api/assessment-test`.
The backend controller prefix is `user-metadata`; port defaults to 3004.

| Operation | Method and relative metadata path | Payload / response |
| --- | --- | --- |
| Create account + profile | POST `/admin/users` | requestId, email, password, role and optional profile fields → UserMetadataDto (201) |
| Browse | GET `/all` | page, limit, optional query/role; data, total, page, limit, totalPages |
| Read profile | GET `/:uuid/find-one` | UserMetadataDto; legacy redundant uuid query retained |
| Edit profile | PATCH `/:uuid/admin-override` | firstName, lastName, email, avatarUrl, description |
| Edit role | PATCH `/:uuid/role` | role: admin, publisher or regular |
| Delete metadata | DELETE `/:uuid` | void / 204 |

DTOs use `@tmdjr/user-metadata-contracts` ^0.0.46. Profile updates explicitly
exclude UUID and role. Optional strings are trimmed; empty strings intentionally
clear existing values. UUID is disabled in the form. The routed Create User wizard uses the additive admin provisioning endpoint.
Auth creates the actual identity; metadata persists its profile under the returned
UUID. The admin session is preserved. Reuse requestId on retry, and report 409/email
conflicts or a recoverable account/profile failure. This request is typed locally
until generated contracts are published; no NPM version was guessed. Deletion concerns metadata, not the identity provider account.

Assessment contracts use `@tmdjr/service-nestjs-assessment-test-contracts` 0.0.15.
GET `/admin-user-asssessments/:uuid` (existing server spelling) and
GET `/admin-user-subjects-eligibility/:uuid?subjects=ANGULAR,RXJS,NESTJS` feed the
pure subject/test view mapping. No answers produces a score percentage of zero.
Both endpoints are read independently of profile loading; forkJoin groups the
assessment requests and a local error state offers retry.

The hosted shell/gateway supplies cookies for same-origin APIs. Direct local API
requests use service-user-metadata’s explicit local CORS/auth mode with synthetic
admin identity and isolated user_metadata_local storage. The frontend submits transient account credentials to the authorized provisioning
endpoint; the backend owns hashing and authorization. Existing endpoint contracts
remain available; the new provisioning endpoint is additive.

## Social website sign-in

Google/GitHub identities are owned by service-auth; Apple rollout is deferred. Social accounts use the
same local UUID/profile/role APIs, so the directory, details and role controls need
no new DTOs. Provider credentials and subjects are not editable metadata. The Create
User wizard still provisions password accounts. Metadata deletion still leaves the
auth identity; account linking/unlinking is not exposed. See the [auth rollout guide](https://github.com/Ngx-Workshop/service-auth/blob/main/docs/social-login.md)
for rollout and real-provider acceptance requirements.
