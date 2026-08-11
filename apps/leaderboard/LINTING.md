# Dashboard asset linting

The dashboard client under `src/assets/dashboard/` is linted with the
dashboard source. The remaining legacy and public assets stay excluded because
they currently have 26 unfixed ESLint violations: 10 `no-empty`, 8
`no-unused-vars`, 6 `no-cond-assign`, 1 `no-undef`, and 1
`no-extra-boolean-cast`. They are parseable; this is an explicit scope
boundary until those violations receive their own cleanup.
