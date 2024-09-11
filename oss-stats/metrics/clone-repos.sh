# Set repos
cd /home/ec2-user/test/start/metrics-cloned-repos

repos=(
  "account-lookup-service"
  "api-snippets"
  "apm-agent-nodejs"
  "apm-agent-nodejs-opentracing"
  "bulk-api-adapter"
  "central-event-processor"
  "central-ledger"
  "central-object-store"
  "central-services-auth"
  "central-services-database"
  "central-services-error-handling"
  "central-services-health"
  "central-services-logger"
  "central-services-metrics"
  "central-services-shared"
  "central-services-stream"
  "central-settlement"
  "documentation"
  "event-sdk"
  "event-sidecar"
  "event-stream-processor"
  "finance-portal-backend-service"
  "finance-portal-lib"
  "finance-portal-ui"
  "helm"
  "ml-api-adapter"
  "ml-number"
  "ml-schema-validator"
  "ml-testing-toolkit"
  "ml-testing-toolkit-shared-lib"
  "ml-testing-toolkit-ui"
  "mock-pathfinder"
  "mojaloop"
  "mojaloop.github.io"
  "mojaloop-simulator"
  "mojaloop-specification"
  "operator-settlement"
  "postman"
  "quoting-service"
  "sdk-scheme-adapter"
  "sdk-standard-components"
  "settlement-management"
  "simulator"
  "test-scripts"
  "transaction-requests-service"
)

 
for repo in "${repos[@]}"

do
  echo "Creating repo $repo  please wait ..."
  git clone https://github.com/mojaloop/"$repo".git

done

cd /home/ec2-user/test/start/community-tools/oss-stats
