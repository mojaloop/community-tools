When we want to run a comprehensive OSS Scan with whitesource, we need to clone all of the repos locally into a directory, and run the whitesource .jar.


```bash
# export GET_REPO_PATH=/tmp/results/repos_filtered.json

mkdir -p /tmp/results
# Get the latest list of all repos
cd ./oss-stats && npx gulp get-repo-json
export REPO_LIST_OVERRIDE_PATH=/tmp/results/repos.json

# Clone all the repos (this is a side product of running dependencies)
npx gulp dependencies

# repos are now cloned in `/tmp/repos`
mv ~/Downloads/wss-unified-agent.config /tmp/repos/
cd /tmp/repos
java -jar ~/developer/tools/wss-unified-agent.jar -d ./ 
```