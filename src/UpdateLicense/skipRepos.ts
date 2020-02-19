/**
 * A list of all repos which should be skipped by the UpdateLicense tool
 */

export default [

  //The following need a different license
  'mojaloop.github.io',
  'docs', //Docs has a different license
  'mojaloop-specification',
  'documentation',
  'archived',
  'documentation-artifacts',

  // The following are deprecated repos
  'dfsp-ledger',
  'dfsp-mock',
  'dfsp-account',
  'dfsp-api',
  'dfsp-admin',
  'dfsp-identity',
  'dfsp-transfer',
  'dfsp-subscription',
  'dfsp-rule',
  'dfsp-ussd',
  'dfsp-directory',
  'interop-elk',
  'ilp-service',
  'mock-pathfinder',
  'pathfinder-provisioning-client',
  'pathfinder-query-client',
  'interop-devops',
  'dfsp-scheme-adapter',
  'interop-switch',
  'interop-ilp-conditions',
  'ntpd',
  'ilp-crypto',
  'cross-network', //not sure
  'interop-switch-js',
  'ml-qa-regression-testing',
  'terminal-integration',
  'hackathon',
  'aws-iac',
  'wso2apim',
  'wso2iskm',
  'wso2-helm-charts',
  'wso2-extensions',
  'libpathfinder',

  //N/A Repos (e.g. no code)
  'project',
  'design-authority',
  'LPS-Adapter',
  
  //Unknown, need updating
  'apm-agent-nodejs',
  'opentracing-javascript',
  'apm-agent-nodejs-opentracing',
  'wso2-mysql',
  'wso2-comp',
  'api-notifier',
  'connection-manager',
  'postman-dev',
  'iac-lab',
  'workbench-media',
  'workbenches-woccu',
  'finance-portal-ui',
  'settlement-management',
  'operator-settlement',
  'pi8-perf-testing',
  'finance-portal-lib',
  'mojaloop-business-docs',
  'finance-portal-backend-service',
  'oracle-shared-library',
  'ml-self-testing-toolkit',
  'ml-self-testing-toolkit-ui',
]