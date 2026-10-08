# User management development

Use Node compatible with Angular 21 (the deployment workflow uses Node 22),
`npm ci`, the checked-in lockfile and a local Chrome installation for Karma.

| Command | Purpose |
| --- | --- |
| `npm run build` | Production bundle with same-origin metadata API |
| `npm run watch` | Development watch with localhost:3004 metadata API |
| `npm run serve:bundle` | Serve the built remote on port 4201 with CORS |
| `npm run dev:bundle` | Development watch and bundle server |
| `npm run watch:hosted-api` | Development watch using current same-origin host APIs |
| `npm run test:ci` | Discover and run real specs under testing in ChromeHeadless |
| `npm run check:layout` | Check feature organization and mirrored test folders |

The shell owns routing and authentication; root App is intentionally empty.
Use the shell's existing browser-local remote override for port 4201 when already
configured. A static bundle server cannot proxy requests sent to the hosted shell.

## Environment selection

`environment.ts` keeps `/api/user-metadata`. Angular's development replacement uses
`http://localhost:3004/user-metadata`, analogous to the document editor's local API.
Assessment history continues to use the authenticated hosted service in both modes.
`--configuration development,hosted-api` clears the replacement for development
against the existing host backend; it does not enable production optimizations.

The local backend setup is now implemented in service-user-metadata. With MongoDB
on 127.0.0.1:27017, run `npm run seed:local` then `npm run start:local` in that service.
It binds to 127.0.0.1:3004, uses only user_metadata_local, permits the shell origin,
and supplies a synthetic local admin. Local role changes never sync to hosted auth.
No production records are copied. Three synthetic users are provided for development.
The served dist bundle now uses the normal development environment (local API).

The shell still needs its browser-local remote override set to port 4201. Once
selected, use `npm run dev:bundle` for local API development. The `hosted-api` overlay
remains available for deliberately working with the existing host API. See the
service's docs/local-development.md for isolation rules and verification commands.

Build checks should use isolated output paths while a watch/server is active:
`npm run build -- --output-path /tmp/user-management-production-check`.
Tests use isolated HTTP responses, not production mutations. No lint command is
configured. Angular 21 with federation/build tooling 20 is an inherited constraint.
