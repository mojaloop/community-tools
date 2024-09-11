#List of Mojaloop repositories
ML_REPO_LIST=(
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
  "contrib-cross-network-demo" 
  "contrib-fido-test-ui" 
  "contrib-fido2-flutter-lib"
  "contrib-mojawallet-demo" 
  "contrib-pisp-demo-svc" 
  "contrib-pisp-demo-ui" 
  "contrib-pos-demo" 
  "contrib-rancher-scaler-tool"
  "control-center-util"
  "Currency-conversion" 
  "database-lib" 
  "documentation" 
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
  "gsp-connector" 
  "hackathon-docs" 
  "haproxy-helm-charts" 
  "helm"
  "iac-ansible-collection-roles" 
  "iac-aws-backend" 
  "iac-aws-bootstrap" 
  "iac-aws-platform" 
  "iac-modules"
  "image-watcher-svc" 
  "iac-shared-modules"
  "iacv2-docs"
  "interop-apis-bc"
  "iso-20022-docs" 
  "license-scanner-tool" 
  "logging-bc"
  "merchant-payment-docs"
  "merchant-registry-svc"
  "microfrontend-boilerplate" 
  "microfrontend-shell-boilerplate" 
  "mifos-core-connector"
  "mifos-core-connector-docs"
  "mini-loop"
  "ml-api-adapter" 
  "ml-core-test-harness" 
  "ml-inter-scheme-docs"
  "ml-iso-hackathon" 
  "ml-mosip-integration"
  "ml-number" 
  "ml-operator" 
  "ml-oss-sandbox" 
  "ml-schema-validator" 
  "ml-testing-toolkit-client-lib" 
  "ml-testing-toolkit-shared-lib" 
  "ml-testing-toolkit-ui" 
  "ml-testing-toolkit" 
  "mojaloop-adapter" 
  "mojaloop-business-docs" 
  "mojaloop-simulator" 
  "mojaloop-specification" 
  "mojaloop.github.io" 
  "node-version-checker" 
  "object-store-lib" 
  "on-premises-deployment"
  "operator-settlement" 
  "oracle-shared-library" 
  "payment-token-adapter"
  "participants-bc" 
  "payment-token-adapter"
  "pisp-project" 
  "pisp-sig-docs"
  "pisp-ttk-sandbox"
  "platform-configuration-bc" 
  "platform-shared-lib" 
  "platform-shared-tools" 
  "poc-architecture"
  "product-council" 
  "quoting-bc" 
  "quoting-service" 
  "reference-architecture-doc" 
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
  "testing-toolkit-test-cases" 
  "thirdparty-api-bc"
  "thirdparty-api-svc" 
  "thirdparty-sdk" 
  "transaction-requests-service" 
  "transfers-bc" 
  "typescript-bc-template" 
  "typescript-svc-template"
  "vault-agent-util"
  "vault-utils"
  "vn-helm"
)

# Save the current directory to return to it later
original_dir=$(pwd)

#Loop through each repository in the list 
for repo in "${ML_REPO_LIST[@]}"; do
  echo "Generating SBOM for $repo, please wait ..."
  
  # Navigate to the repository directory
  cd "$repo" || { echo "Failed to navigate to $repo"; }
  
  # Install dependencies and generate SBOM
  npm install
  npm install --global @cyclonedx/cyclonedx-npm
  cyclonedx-npm --output-format "XML" --output-file "/home/ec2-user/test/start/sboms/${repo}-sbom.xml"
  
  # Return to the original directory
  cd "$original_dir" || { echo "Failed to return to $original_dir"; exit 1; }
done
