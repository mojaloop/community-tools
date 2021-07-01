

When we want to remove repos from the organization, we first copy them into the private `archived` repo.

This tool helps us simply clone the master of the repo to archive, and add it to git.

```bash
dfsp-admin
REPO_NAME=dfsp-api ./scripts/_archive_repo.sh             
REPO_NAME=dfsp-directory ./scripts/_archive_repo.sh             
REPO_NAME=dfsp-identity ./scripts/_archive_repo.sh             
REPO_NAME=dfsp-ledger ./scripts/_archive_repo.sh             
REPO_NAME=dfsp-mock ./scripts/_archive_repo.sh             
REPO_NAME=dfsp-rule ./scripts/_archive_repo.sh             
REPO_NAME=dfsp-scheme-adapter ./scripts/_archive_repo.sh             
REPO_NAME=dfsp-subscription ./scripts/_archive_repo.sh             
REPO_NAME=dfsp-transfer ./scripts/_archive_repo.sh             
REPO_NAME=dfsp-ussd ./scripts/_archive_repo.sh             
REPO_NAME=docs ./scripts/_archive_repo.sh             
REPO_NAME=central-directory ./scripts/_archive_repo.sh
REPO_NAME=hackathon ./scripts/_archive_repo.sh
REPO_NAME=ml-qa-regression-testing ./scripts/_archive_repo.sh
REPO_NAME=pathfinder-provisioning-client ./scripts/_archive_repo.sh
REPO_NAME=pathfinder-query-client ./scripts/_archive_repo.sh
REPO_NAME=workbench-media ./scripts/_archive_repo.sh
REPO_NAME=workbenches-woccu ./scripts/_archive_repo.sh
REPO_NAME=wso2-comp ./scripts/_archive_repo.sh
REPO_NAME=wso2-extensions ./scripts/_archive_repo.sh
REPO_NAME=wso2-helm-charts ./scripts/_archive_repo.sh
REPO_NAME=wso2-helm-charts-simple ./scripts/_archive_repo.sh
REPO_NAME=wso2-mysql ./scripts/_archive_repo.sh
REPO_NAME=wso2apim ./scripts/_archive_repo.sh
REPO_NAME=wso2iskm ./scripts/_archive_repo.sh

cd ../archived 
git push
```


Now open them on github:

https://github.com/mojaloop/central-directory
https://github.com/mojaloop/hackathon
...