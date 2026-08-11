# Dashboard asset linting

The dashboard client under `src/assets/dashboard/` is linted with the
dashboard source. Other legacy and public assets remain excluded because they
contain standalone browser scripts and generated game bundles with separate
runtime/parser assumptions.
