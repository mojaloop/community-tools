#!/usr/bin/env bash

set -u

## Clones a repo, moves it to the archive repo, opens a PR
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PATH_TO_ARCHIVED_REPO=${DIR}/../../archived
PATH_TO_TEMP_REPO_DIR=/tmp/repos

mkdir -p ${PATH_TO_TEMP_REPO_DIR}
git clone git@github.com:mojaloop/${REPO_NAME}.git  ${PATH_TO_TEMP_REPO_DIR}/${REPO_NAME}

# now we move that repo's default branch to archived
cd ${PATH_TO_ARCHIVED_REPO}
# remove the repo in the archive if it's already been added
rm -rf ${REPO_NAME}
mv ${PATH_TO_TEMP_REPO_DIR}/${REPO_NAME} .
# Remove the git folder
rm -rf ${PATH_TO_ARCHIVED_REPO}/${REPO_NAME}/.git
git add ${REPO_NAME}
git commit -anm "chore: archived repo ${REPO_NAME}"


rm -rf ${PATH_TO_TEMP_REPO_DIR}