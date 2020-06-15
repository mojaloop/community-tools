# Moja-Tools

A collection of tools for collecting stats, updating repos en masse and general project maintainence for Mojaloop. If you have written something random that helps automate something in mojaloop that doesn't need to be run all that often, it may belong here.

## Prerequisites:

- Github API Token set in `GITHUB_TOKEN` environment variable
- `gulp`, `typescript`
- `make`
- AWS s3 access (for `anchore-summary`)


## Available Tools:

The tools which run across repos require you to manually specify the list of repos in `./src/data.ts`

> Refer to `./gulpfile.ts` for more detail

### `anchore-summary`

Runs the anchore summary from files living in s3. Requires AWS S3 access

```bash
aws s3 sync s3://mojaloop-ci-reports/anchore-cli/latest ./tmp
gulp anchore-summary
open ./tmp/summary.xlsx
```

### `contributors`
> Note: this task is prone to getting rate limited by github, so use it spasely
```bash
gulp contributors
```

### `commits`

Gets a list of commits for each repo.

```bash
gulp commits
```

### `dependencies`

Summarizes the dependencies across all repos.

```bash
gulp dependencies
```

### `lines`

Runs the cloc tool to count lines of code across all repos.

```bash
gulp lines
```

### `update-license`

Updates licences of Mojaloop Projects _en masse_

Refer to `./src/UpdateLicense/NewLicense.md` for the new license, and `./src/UpdateLicense/skipRepos.ts` for the repos to skip updating.

```bash
gulp update-license
```


### `get-repo-csv`

Gets the list of all Mojaloop Repos as a csv file
```bash
gulp get-repo-csv
```

## Beta Tools
> These tools are not quite ready for public consumption, so try using them at your own risk!

### `vulns`

Get a list of vulnerabilities from github.

```bash
gulp vulns
```

## Notes:

- currently I am restructurig this to be be better structured using the "clean architecture" patterns:
  - https://www.youtube.com/watch?v=CnailTcJV_U
  - https://github.com/dev-mastery/comments-api