# Account export artifact

Account exports use a request → queue → R2 artifact → authenticated download
flow. The Account page shows “Preparing export…” while the job runs, then
provides the authenticated Worker download link. Failed or expired jobs are
visible and can be retried.

The download is one NDJSON file:

1. The first line is a `manifest` containing the export identity, version,
   collection list, and point-in-time row-count estimates.
2. Each data line is `{"table":"…","row":{…}}`.
3. The final line is a `trailer` containing `complete: true` and the actual
   emitted row count for every collection. Consumers must require this trailer
   as the completion marker; a missing trailer indicates a truncated or
   incomplete artifact.

The manifest remains first so the artifact can be streamed immediately. The
trailer is authoritative for what the file actually contains and can be
compared with the manifest to identify changes during export.
