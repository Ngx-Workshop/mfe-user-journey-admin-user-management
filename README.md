# User Management<br><sup>MFE User Journey - Admin</sup>

<img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/angular-gradient-wordmark.gif?raw=true" height="132" alt="Angular Logo" /> <img src="https://github.com/Ngx-Workshop/.github/blob/main/readme-assets/module-federation-logo.svg?raw=true" height="132" style="max-width: 100%;height: 132px;" alt="Module Federation" />

Angular micro-frontend (remote) for the **Admin User Management** user journey in the NGX Workshop ecosystem.

Angular 21 standalone micro frontend for administering user metadata within the NGX Workshop ecosystem. It runs as a Module Federation remote (`ngx-seed-mfe`) and exposes both a root component and route config for host shells.

## Summary

- Manage user metadata with filtering, pagination, role changes, and delete confirmations.
- Edit individual users and view their assessment test progress pulled from the assessment service.
- Built with Angular standalone components, signals-driven state, Angular Material UI, and zoneless change detection.
- Exposed as a federated remote at `http://localhost:4201/remoteEntry.js` with exposes `./Component` and `./Routes`.

## Getting Started

1. Prerequisites: Node 18+ and npm.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run locally (serves on port 4201):
   ```bash
   npm start
   ```
   Remote entry: http://localhost:4201/remoteEntry.js
4. Run tests:
   ```bash
   npm test
   ```
5. Production build:
   ```bash
   npm run build
   ```
6. Serve the production bundle locally (uses `dist/mfe-user-journey-admin-user-management`):
   ```bash
   npm run serve:bundle
   ```
   For iterative bundle development, use:
   ```bash
   npm run dev:bundle
   ```

## Architectural Overview

- Framework and bootstrap: Standalone Angular app bootstrapped via `bootstrapApplication` with providers in [src/app/app.config.ts](src/app/app.config.ts) enabling zoneless change detection, HttpClient, Reactive Forms, and async animations.
- Module Federation: Configured in [webpack.config.js](webpack.config.js) with remote name `ngx-seed-mfe`, exposes `./Component` (root shell) and `./Routes` (routing definition), and shares Angular, Material, and TMDJR shared header/user metadata packages.
- Routing: Defined in [src/app/app.routes.ts](src/app/app.routes.ts) with `userAuthenticatedGuard` protecting all routes, redirecting to `user-metadata`, and a details route resolving assessment test view models before activation.
- Data and services: User metadata CRUD and role updates live in [src/app/services/user-metadata-api.ts](src/app/services/user-metadata-api.ts); assessment data and view-model marshalling live in [src/app/services/assessment-tests-api.service.ts](src/app/services/assessment-tests-api.service.ts) with a resolver in [src/app/resolver/assessment-test.resolver.ts](src/app/resolver/assessment-test.resolver.ts).
- State management: Signals store filters in [src/app/services/user-metadata-filters.store.ts](src/app/services/user-metadata-filters.store.ts); view components use signals/effects for loading, pagination, and toast feedback.
- UI composition: The list page [src/app/components/user-metadata.ts](src/app/components/user-metadata.ts) composes filters, table, dialogs, and paging; detail view [src/app/components/user-metadata-details/user-metadata-details.ts](src/app/components/user-metadata-details/user-metadata-details.ts) hosts the edit form and assessment list; supporting components include filters, list table, assessment list, and delete-confirm dialog under `src/app/components`.
- Styling and layout: Angular Material components with SCSS; layout targets responsive card-based shells sized with clamp-based widths.

## Notes for Hosts

- Remote URL: `http://localhost:4201/remoteEntry.js`
- Remote name: `ngx-seed-mfe`
- Exposes:
  - `./Component` -> root component
  - `./Routes` -> route configuration (use for lazy routing in hosts)
- API expectations: The app calls relative paths `/api/user-metadata` and `/api/assessment-test`; host shells or proxies should forward these to the appropriate backend.
