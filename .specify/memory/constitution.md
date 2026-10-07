# Constitution — User management remote

Version: 1.0.0 · Ratified: 2026-10-07
Adapted from the document editor's local Spec Kit workflow; feature history is not copied.

1. **MVVM and streams:** standalone OnPush components, strict TypeScript/templates,
   typed reactive forms and idiomatic RxJS. Stateless HTTP clients own transport only.
   A root singleton store owns request orchestration and shared domain state;
   scoped view models own route/form concerns. Presentation uses inputs and outputs.
2. **Truthful UX:** show loading, empty, saving, failure and recovery states. Cancel
   superseded reads, serialize writes, preserve edits on failure, prevent duplicate
   destructive actions. Server authorization remains authoritative.
3. **Focused components:** inline HTML/SCSS; aim for about 230 lines, with meaningful
   orchestration/presentation boundaries. Use BEM for application-owned classes.
4. **Accessibility:** labeled keyboard-operable controls, semantic status/error
   messages, responsive layouts, deliberate confirmation and dialog focus.
5. **Contracts:** preserve UUIDs, role/profile DTOs, authenticated routes, default
   App, named Routes, remoteEntry.js and ./Component / ./Routes. Preserve the
   legacy federation name until a coordinated host migration. Configure API URLs
   by environment; service-user-metadata owns persistence and admin authorization.
6. **Verification:** meaningful regression tests for concurrency, request mapping,
   failure recovery and observable UI. Build success is not host integration proof.
7. **Workflow:** specify → plan → tasks → implement → verify → handoff. Keep context
   and feature status current. Record deviations and external owner responsibilities.
