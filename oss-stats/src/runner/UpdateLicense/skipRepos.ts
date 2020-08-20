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
  'mojaloop-business-docs',

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
  'ilp-crypto',
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
  'connection-manager',
  'api-notifier',

  //Forks of other repos, we can't change the license
  'apm-agent-nodejs',
  'apm-agent-nodejs-opentracing',
  'opentracing-javascript',  
]