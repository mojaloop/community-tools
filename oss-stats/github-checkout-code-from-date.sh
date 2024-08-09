#Set Date
date='June 30 2024'

# Repos with master branch
ML_REPO_LIST_ONE=(
  "central-services-error-handling" 
  "central-services-health" 
  "central-services-logger" 
  "central-services-metrics"
  "charts" 
  "ci-config" 
  "community-tools" 
  "contrib-cross-network-demo" 
  "contrib-fido2-flutter-lib" 
  "contrib-mojawallet-demo" 
  "contrib-pisp-demo-svc" 
  "contrib-pisp-demo-ui" 
  "contrib-pos-demo" 
  "contrib-rancher-scaler-tool" 
  "documentation" 
  "finance-portal-backend-service" 
  "finance-portal-lib" 
  "finance-portal-ui" 
  "finance-portal-v2-ui" 
  "fx-converter-template"
  "gsp-connector" 
  "hackathon-docs" 
  "iac-aws-backend" 
  "iac-aws-bootstrap" 
  # "iac-runner" 
  "image-watcher-svc" 
  # "iac-tests" 
  "license-scanner-tool" 
  # "mfi-account-oracle"
  "microfrontend-boilerplate" 
  "microfrontend-shell-boilerplate" 
  "mini-loop"
  "ml-iso-hackathon" 
  "ml-number" 
  "ml-operator" 
  "ml-oss-sandbox" 
  "ml-schema-validator" 
  "mojaloop-adapter" 
  "mojaloop-business-docs" 
  "mojaloop-specification" 
  "mojaloop.github.io" 
  "operator-settlement" 
  "oracle-shared-library" 
  "pisp-project" 
  "poc-architecture" 
  "reporting-events-processor-svc" 
  "reporting-hub-bop-api-svc" 
  "reporting-hub-bop-experience-api-svc" 
  "reporting-hub-bop-positions-ui" 
  "reporting-hub-bop-role-ui" 
  "reporting-hub-bop-settlements-ui" 
  "reporting-hub-bop-shell" 
  "reporting-hub-bop-trx-ui" 
  "reporting-k8s-templates" 
  "reporting" 
  "role-assignment-service" 
  "sdk-mock-dfsp-backend" 
  "sdk-scheme-adapter" 
  "sdk-standard-components" 
  "security-kratos-oidc-provider-ui" 
  "security-rbac-tests" 
  "security-role-perm-operator-svc" 
  "settlement-management" 
  "simulator-kafka"
  "testing-toolkit-test-cases" 
  "typescript-svc-template"
  )

#Repos with main branch
ML_REPO_LIST_TWO=(
  "alias-oracle"
  "als-oracle-pathfinder"
  "account-lookup-bc"
  "account-lookup-service"
  "accounts-and-balances-bc"
  "als-consent-oracle"
  "api-snippets"
  "auditing-bc"
  "auth-service"
  "bulk-api-adapter" 
  "business-operations-framework-docs" 
  "central-event-processor" 
  "central-ledger"
  "central-services-shared"
  "central-services-stream"
  "central-settlement" 
  "cert-management-bc"
  "contrib-fido-test-ui"
  # "contrib-firebase-simulator"
  "control-center-util"
  "Currency-conversion"
  "database-lib"
  "email-notifier"
  "event-sdk"
  "event-sidecar" 
  "event-stream-processor" 
  "foreign-exchange-bc"
  "haproxy-helm-charts" 
  "helm" 
  "iac-ansible-collection-roles"
  "iac-aws-platform" 
  "iac-modules"
  "iac-shared-modules" 
  #"iacv2-docs"
  "interop-apis-bc" 
  #"iso-20022-docs"
  "logging-bc"
  "merchant-payment-docs"
  "merchant-registry-svc"
  #"mifos-core-connector"
  #"mifos-core-connector-docs"
  "ml-api-adapter"
  "ml-core-test-harness" 
  "ml-mosip-integration"
  # "ml-perf-characterization"
  "ml-testing-toolkit-client-lib" 
  "ml-testing-toolkit-shared-lib" 
  "ml-testing-toolkit-ui" 
  "ml-testing-toolkit"
  "mojaloop-simulator" 
  "node-version-checker" 
  "object-store-lib" 
  "participants-bc" 
  "payment-token-adapter"
  "pisp-sig-docs"
  "platform-configuration-bc"
  "platform-shared-lib" 
  "platform-shared-tools" 
  "quoting-bc" 
  "quoting-service" 
  "reference-architecture-doc" 
  "reporting-bc" 
  "scheduling-bc" 
  "security-bc"
  "settlements-bc"
  "simulator" 
  "thirdparty-api-svc" 
  "thirdparty-sdk" 
  "transaction-requests-service" 
  "transfers-bc"
  "typescript-bc-template"
  "vault-agent-util"
  "vault-utils"
  #"vn-helm"
)

#1 checkout the codebase before a particular date to get statistics from that particular day
for repo in "${ML_REPO_LIST_ONE[@]}"
do
  cd $repo
  echo "Pulling repo $repo code from $date ..."
  # git checkout `git rev-list -1 --before="May 31 2024" master`
  git checkout master
  git pull
  cd ..
done

#2 checkout the codebase before a particular date to get statistics from that particular day for repos with "main" branch
for repo in "${ML_REPO_LIST_TWO[@]}"
do
  cd $repo
  echo "Pulling repo $repo code from $date ..."
  # git checkout `git rev-list -1 --before="May 31 2024" main`
  git checkout main
  git pull
  cd ..
done

# 3 Check the primary branch for the repo
# for repo in "${ML_REPO_LIST_TWO[@]}"
# do
#   cd $repo
#   git remote show origin | grep 'HEAD branch' | cut -d' ' -f5
#   cd ..
# done