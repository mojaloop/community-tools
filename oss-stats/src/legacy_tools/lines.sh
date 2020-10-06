#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PATH=${PATH}:${DIR}/node_modules/.bin
# REPO_DIR=/Users/lewisdaly/developer/vessels/mojaloop/license-scanner/checked_out
REPO_DIR=/tmp/repos

cd ${REPO_DIR}

cloc .