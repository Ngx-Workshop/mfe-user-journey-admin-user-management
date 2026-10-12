# Production loading investigation — 2026-10-11

## Confirmed failure

Production registry maps User Management to https://beta.ngx-workshop.io/remotes/mfe-user-journey-admin-user-management/remoteEntry.js.
In the reported 6695.b8064a671ffb888c.js, at offset 31431, MatButton extends e.iM. Module 8834 imports e from module 3848. That module has only side-effect imports, with neither MatButtonBase nor an export declaration. This is a broken compiled artifact.

The entry fetched during investigation instead references 6695.8e216478c0c611c5.js, 5416.ccdd1d6a9e9f7665.js and 3101.f7fadb8a5bb2b436.js. Its fallback Component and Routes exposures both pass the generated-factory loading check. The old failing file remains hosted. An already-open page, cached entry or response from a different serving instance could explain the old hashes; the user's browser/network state was not inspected. remoteEntry responses supplied ETag/Last-Modified but no explicit Cache-Control header.

## Changes and verification

Added test:bundle, test:bundle-watch, minimal emitted-factory loader and isolated watcher runner. Deployment workflow runs test:bundle immediately after the production build and before copying assets. A build that compiles but fails to evaluate its exposed modules now stops before copying.

Current clean optimized build with source maps passes both exposures. Two independent optimized watch runs each pass the initial and two incremental compilations; the second touches actual catalog/header components. Current hosted entry also passes both exposures. Source timestamps were touched without content edits; existing dist and active services were untouched. No runtime configuration, package versions, deployment or backend writes changed.

The latest existing commit d4c7f98 refreshed Angular build tooling and Webpack. No current failure was reproduced, and no unverified cache workaround was applied.

## Next check and limits

Reload the entire admin page with browser cache disabled, then verify Network requests use the current hashes. Repeating navigation alone does not reinitialize the federation container in an already-open page. If the old hashes recur, inspect the fetched remoteEntry response and any browser-local remote override or proxy cache. Serve unversioned remoteEntry.js with revalidation (Cache-Control: no-cache) while retaining long caching for hashed chunks if hosting configuration is adjusted.

The harness checks import-time code with an empty federation share scope and a minimal DOM, not authenticated shell rendering, shell-supplied dependencies or service writes. Host browser confirmation remains pending.
