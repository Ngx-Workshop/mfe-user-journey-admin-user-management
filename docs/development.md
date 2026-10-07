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

For a hosted shell calling the local backend, service-user-metadata needs CORS for
https://admin.ngx-workshop.io and an appropriate isolated local authentication/data
setup. Unlike service-document, it currently has no start:local script or local mode.
No instance was listening on 3004 during this refactor. This checkout configures the
consumer; those backend prerequisites are recorded in the handoff. Do not assume
normal start:dev uses an isolated database or grants local admin access.

To keep the running bundle working while backend setup remains pending, build with
`npm run build -- --configuration development,hosted-api`, then keep the existing
bundle server. Use `npm run watch:hosted-api` for subsequent source changes.

Build checks should use isolated output paths while a watch/server is active:
`npm run build -- --output-path /tmp/user-management-production-check`.
Tests use isolated HTTP responses, not production mutations. No lint command is
configured. Angular 21 with federation/build tooling 20 is an inherited constraint.
