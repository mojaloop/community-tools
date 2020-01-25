#!/usr/bin/env bash

##
# Gets individual commits by counting number of `*` characters in
# git log
##

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PATH=${PATH}:${DIR}/node_modules/.bin
# REPO_DIR=/Users/lewisdaly/developer/vessels/mojaloop/license-scanner/checked_out
REPO_DIR=/tmp/repos

cd ${REPO_DIR}

total=0
for dir in * ; do
  cd ${dir}
  
  count=$(git log | grep '*' | wc -l)
  if [ ${count} -eq "0" ]; then
    echo "[WARN] Count failed for ${dir}. Defaulting to normal commit count"
    count=$(git log | grep "^commit\s\w*" | wc -l)
  fi

  total=$((total+${count}))

  cd ${REPO_DIR}
done

echo "Total un-squashed* estimate: ${total}"