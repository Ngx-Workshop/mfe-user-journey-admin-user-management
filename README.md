# User management administrator remote

Angular 21.1 standalone, zoneless Module Federation remote for browsing users,
editing profile metadata, changing roles, confirmed deletion and assessment history.

Start with [development](docs/development.md), [architecture](docs/architecture.md),
[API contracts](docs/api-contracts.md) and [agent instructions](AGENTS.md).
The [local Spec Kit workflow](.specify/README.md) and [feature index](specs/README.md)
record requirements, implementation plans and verification.

The shell mounts the named Routes at `/user-management`; the catalog is
https://admin.ngx-workshop.io/user-management/user-metadata.
Default App deliberately remains empty; `npm start` serves the remote, not a
standalone administration application. The shell supplies routing/authentication.
