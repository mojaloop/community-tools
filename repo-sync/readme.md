# Repo Sync

A tool for managing similar files across a large number of repos.

To start off with, this tool will just take single files and directories and 
create pull requests based on changes made here, but in the future we may wish
to use it as a source of truth across all repos.

## Updating files across repos:

### 1. `License.md`:

This clones _all_ repos, and updates the license file accordingly.

```bash
export REPO_SYNC_CONFIG="./config/sync-license.js"
# clone repos and sync the relevant files for easy editing
npx run sync-local

# Apply the license template
npx gulp apply-template-file

# open a bagillion PRs
npx pr-remote
```

### 2. `.circleci/config.yml` 

This clones only the _core_ repos, and requires you to manually edit the circleci config files.

```bash
export REPO_SYNC_CONFIG="./config/sync-circleci.js"
# clone repos and sync the relevant files for easy editing
npx run sync-local

# Manually edit the `config.yml` files

# open a bagillion PRs
npx pr-remote
```