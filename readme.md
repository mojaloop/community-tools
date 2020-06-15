# Moja-Tools

A collection of tools for collecting stats, updating repos en masse and general project maintainence for Mojaloop. If you have written something random that helps automate something in mojaloop that doesn't need to be run all that often, it may belong here.

## Prerequisites:

- Github API Token set in `GITHUB_TOKEN` environment variable
- `gulp`, `typescript`
- `make`
- AWS s3 access (for `anchore-summary`)


## Available Tools:

<!-- ### Update Licenses

```bash
make update-licenses
```

## Summarizing Anchore-cli latest reports

>_Note:_ This requires AWS S3 access first

```bash
aws s3 sync s3://mojaloop-ci-reports/anchore-cli/latest ./tmp
gulp anchore-summary
open ./tmp/summary.xlsx
``` -->

## Notes:

- currently I am restructurig this to be be better structured using the "clean architecture" patterns:
  - https://www.youtube.com/watch?v=CnailTcJV_U
  - https://github.com/dev-mastery/comments-api