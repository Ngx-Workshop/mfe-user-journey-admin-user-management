# Source organization

`src/app` contains only App, application configuration, public routes and features.
User management code belongs under `features/user-management`, divided into `api`,
`models`, `state`, `pages/catalog`, `pages/details`, and `components` responsibilities.
Page view models own route-specific orchestration; focused components use inline
HTML/SCSS. Keep global styles in `src/styles.scss` and environment constants under
`src/environments`. Tests mirror responsibility folders under `testing/app`.

`npm run check:layout` checks allowed feature categories, root application entries,
absence of specs in src and matching source directories for tests. Component size is
reviewed as a design target; it is not a hard failure gate. Current component files
are below 230 lines. Run tests and builds after moving files.
