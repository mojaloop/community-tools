repos=(
  "account-lookup-bc"
  "account-lookup-service"
  "accounts-and-balances-bc" 
  "alias-oracle" 
  "als-consent-oracle" 
  "als-oracle-pathfinder"
  "api-snippets" 
  "auditing-bc" 
  "auth-service"
  "beneficiary-management-system-svc"
  "beneficiary-registration-portal-backend"
  "beneficiary-registration-portal-frontend"
  "bulk-api-adapter" 
  "business-operations-framework-docs" 
  "callback-handler-simulator-svc"
  "central-event-processor" 
  "central-ledger" 
  "central-services-error-handling" 
  "central-services-health" 
  "central-services-logger" 
  "central-services-metrics" 
  "central-services-shared" 
  "central-services-stream" 
  "central-settlement" 
  "cert-management-bc"
  "charts" 
  "ci-config"
  "ci-config-orb-build"
  "community-tools" 
  "control-center-util"
  "database-lib" 
  "email-notifier" 
  "event-sdk" 
  "event-sidecar" 
  "event-stream-processor" 
  "finance-portal-backend-service" 
  "finance-portal-lib" 
  "finance-portal-ui" 
  "finance-portal-v2-ui" 
  "foreign-exchange-bc"
  "fx-converter-template"
  "haproxy-helm-charts" 
  "helm"
  "iac-ansible-collection-roles" 
  "iac-aws-backend" 
  "iac-aws-bootstrap" 
  "iac-aws-platform" 
  "iac-modules"
  "iac-runner" 
  "image-watcher-svc" 
  "iac-shared-modules" 
  "interop-apis-bc"
  "logging-bc"
  "merchant-registry-svc" 
  "mfi-account-oracle"
  "microfrontend-boilerplate" 
  "microfrontend-shell-boilerplate" 
  "mifos-core-connector"
  "mini-loop"
  "ml-api-adapter" 
  "ml-core-test-harness" 
  "ml-mosip-integration"
  "ml-number" 
  "ml-operator" 
  "ml-schema-validator" 
  "ml-testing-toolkit-client-lib" 
  "ml-testing-toolkit-shared-lib" 
  "ml-testing-toolkit-ui" 
  "ml-testing-toolkit" 
  "mojaloop-adapter" 
  "mojaloop-simulator" 
  "mojaloop-specification" 
  "node-version-checker" 
  "object-store-lib" 
  "on-premises-deployment"
  "operator-settlement" 
  "oracle-shared-library" 
  "payment-token-adapter"
  "participants-bc" 
  "payment-token-adapter"
  "pisp-ttk-sandbox"
  "platform-configuration-bc" 
  "platform-shared-lib" 
  "platform-shared-tools" 
  "quoting-bc" 
  "quoting-service" 
  "reporting-bc" 
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
  "scheduling-bc" 
  "sdk-core-connector-openpayments-api-svc"
  "sdk-core-connector-rafiki-api-svc"
  "sdk-mock-dfsp-backend" 
  "sdk-scheme-adapter" 
  "sdk-standard-components" 
  "security-bc" 
  "security-kratos-oidc-provider-ui" 
  "security-rbac-tests" 
  "security-role-perm-operator-svc" 
  "settlement-management" 
  "settlements-bc" 
  "simulator-kafka" 
  "simulator" 
  "thirdparty-api-bc"
  "thirdparty-api-svc" 
  "thirdparty-sdk" 
  "transaction-requests-service" 
  "transfers-bc" 
  "typescript-bc-template" 
  "typescript-svc-template"
  "vault-agent-util"
  "vault-utils"
  "vn-helm")

for repo in "${repos[@]}"; do
    echo "Generating dependencies for $repo"

    INPUT_FILE="/Users/sprak/Documents/mojaloop/sboms/$repo-sbom.xml"
    OUTPUT_FILE="/Users/sprak/Documents/mojaloop/sbom-components-csv/$repo-sbom.csv"

    if [ -f "$INPUT_FILE" ]; then  # Check if the input file exists
        xsltproc xml-to-csv.xslt "$INPUT_FILE" > "$OUTPUT_FILE"
        echo "Created $OUTPUT_FILE"
    else
        echo "$repo" >> /Users/sprak/Documents/mojaloop/overall/log.txt
    fi

done
