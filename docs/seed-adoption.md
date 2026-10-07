# Spec Kit migration record

2026-10-07: adapted the document editor's .specify workflow, generic templates,
optional bash helpers and .github Spec Kit agent/prompt adapters. Maintained AGENTS,
constitution and context docs now describe user management and service-user-metadata.
Document authoring feature history and editor-specific constraints were not copied.
This is a repository-local Markdown workflow; no Spec Kit CLI is required.

Ordinary edits are the default. Legacy scripts can switch/create branches or overwrite
plans and agent files: inspect them before use, and do not run setup-plan on existing
work. No helper mutation scripts were executed for this migration. Copied scripts
are optional adapters; this repo does not depend on the document editor checkout.
