# Tests

Tests mirror `src/app` under `testing/app`. Karma's explicit include is
`../testing/**/*.spec.ts` because discovery is relative to the application source
root. `npm run test:ci` must execute actual tests; zero tests is not a pass.
HTTP test doubles cover transport, cancellation, serialized writes and recovery.
RouterTestingHarness covers a reused details route and assessment failure isolation.
Form view model tests use Jasmine's clock and mocked Date together for RxJS timing.
These checks do not establish live backend integration.
