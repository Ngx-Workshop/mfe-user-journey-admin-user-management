# API contracts

Production metadata base: `/api/user-metadata`. Development metadata base:
`http://localhost:3004/user-metadata`. Assessment base: `/api/assessment-test`.
The backend controller prefix is `user-metadata`; port defaults to 3004.

| Operation | Method and relative metadata path | Payload / response |
| --- | --- | --- |
| Browse | GET `/all` | page, limit, optional query/role; data, total, page, limit, totalPages |
| Read profile | GET `/:uuid/find-one` | UserMetadataDto; legacy redundant uuid query retained |
| Edit profile | PATCH `/:uuid/admin-override` | firstName, lastName, email, avatarUrl, description |
| Edit role | PATCH `/:uuid/role` | role: admin, publisher or regular |
| Delete metadata | DELETE `/:uuid` | void / 204 |

DTOs use `@tmdjr/user-metadata-contracts` ^0.0.46. Profile updates explicitly
exclude UUID and role. Optional strings are trimmed; empty strings intentionally
clear existing values. UUID is disabled in the form. There is no admin create-user
flow in this remote or matching admin create endpoint; the inherited inactive action
was removed. Deletion concerns metadata, not the identity provider account.

Assessment contracts use `@tmdjr/service-nestjs-assessment-test-contracts` 0.0.15.
GET `/admin-user-asssessments/:uuid` (existing server spelling) and
GET `/admin-user-subjects-eligibility/:uuid?subjects=ANGULAR,RXJS,NESTJS` feed the
pure subject/test view mapping. No answers produces a score percentage of zero.
Both endpoints are read independently of profile loading; forkJoin groups the
assessment requests and a local error state offers retry.

The hosted shell/gateway supplies cookies for same-origin APIs. Direct local API
requests use service-user-metadata’s explicit local CORS/auth mode with synthetic
admin identity and isolated user_metadata_local storage. The frontend does not
create credentials or bypass authorization. Backend paths/schemas are unchanged.
