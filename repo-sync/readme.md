# Repo Sync

A tool for managing similar files across a large number of repos.


To start off with, this tool will just take single files and directories and 
create pull requests based on changes made here, but in the future we may wish
to use it as a source of truth across all repos.

## Updating files across all repos:

```bash
export REPO_SYNC_CONFIG="./config/sync-license.js"
# clone repos and sync the relevant files for easy editing
npx run sync-local

# Apply the license template
npx gulp apply-template-file

# open a bagillion PRs
npx pr-remote
```