// Configuration for header sync
module.exports = {
  // Specify the two specific repositories
  REPOS: [
    {
      owner: 'mojaloop',
      repo: 'simulator-kafka'
    },
    {
      owner: 'mojaloop',
      repo: 'alias-oracle'
    }
  ],

  // Match JavaScript and TypeScript files that contain Gates Foundation copyright
  FILE_PATTERN: '\\.(js|ts)$',

  // The new header template to use
  HEADER_TEMPLATE: `License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License") and you may not use these files except in compliance with the License. You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, the Mojaloop files are distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

 Contributors
 --------------
 This is the official list of the Mojaloop project contributors for this file.
 Names of the original copyright holders (individuals or organizations)
 should be listed with a '*' in the first column. People who have
 contributed from an organization can be listed under the organization
 that actually holds the copyright for their contributions (see the
 Mojaloop Foundation for an example). Those individuals should have
 their names indented and be marked with a '-'. Email address can be added
 optionally within square brackets <email>.

 * Mojaloop Foundation
 - Name Surname <name.surname@mojaloop.io>`,

  // The delimiters that wrap the header
  START_DELIMITER: '/*****',
  END_DELIMITER: '*****/',

  // The base branches to try creating PRs against
  BASE_BRANCHES: ['main', 'master'],

  // The branch name to create for the changes
  BRANCH_NAME: 'chore/update-file-headers',

  // The PR title and description
  PR_TITLE: 'chore(headers): update file headers',
  PR_DESCRIPTION: 'Update file headers to use the latest Mojaloop Foundation copyright notice\n\n_this PR was automatically created with the **repo-sync** tool_'
} 