# Plan and findings

Inspect the deployed chunks at the reported stack offsets, compare the current remote entry, and exercise actual emitted factories with the sibling navigation remote's minimal script-loading DOM harness. Use isolated production output and a real watcher for incremental checks. Add commands and pre-deployment verification. No deployment or backend writes.

The reported deployed 6695.b8064a671ffb888c.js module 8834 defines MatButton extending module 3848 export iM (MatButtonBase). Module 3848 in that chunk contains only side-effect imports and no exports. The current hosted remoteEntry references newer hashes and its exposures load successfully in an isolated runtime.

The current checkout passes initial and incremental production compilation. Therefore do not apply the sibling remote's cache workaround without a current reproduction. The recent d4c7f98 dependency refresh changed Webpack 5.104.1 to 5.105.2 and Angular build tooling 21.1.0 to 21.2.26; this is an observed difference, not proof of which dependency fixed the old artifact.
