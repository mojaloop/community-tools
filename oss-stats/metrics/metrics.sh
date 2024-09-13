#!/bin/bash

# Load nvm and use the correct Node version
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
nvm use v20.16.0

# Set the PATH to include the directory where gulp and node are located
export PATH="$HOME/.nvm/versions/node/v20.16.0/bin:$PATH"

# Set the GitHub token

# Change directory to where the script is located
cd /home/ec2-user/test/community-tools/oss-stats

rm -rf /home/ec2-user/test/metrics-cloned-repos/*
bash metrics/clone-repos.sh

# Run gulp and node commands
gulp commits > metrics/temp.txt
node metrics/commits-convert.js

gulp dependencies > metrics/temp.txt
node metrics/dependencies-convert.js

gulp contributors > metrics/temp.txt
node metrics/contributors-convert.js

gulp lines > metrics/temp.txt
node metrics/lines-convert.js

gulp get-repo-csv

rm /home/ec2-user/test/community-tools/oss-stats/metrics/temp.txt
