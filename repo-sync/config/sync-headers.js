// Configuration for header sync
{
  // You can specify individual repos or use shortcuts
  REPOS: [{
    owner: 'mojaloop',
    repo: 'ml-schema-validator'
  }],

  // Match JavaScript files that contain Gates Foundation copyright
  MATCH_FILES_LIST: ['**/*.js'],

  // The source code header template
  headerTemplate: 'License\n--------------\nCopyright © 2020-2025 Mojaloop Foundation\nThe Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")',

  // Use the exact delimiters from the example
  headerStartDelimiter: '/*****',
  headerEndDelimiter: '*****/',

  // Branch configuration
  BASE_BRANCHES: ['main', 'master'],  // Will try these branches in order
  BRANCH_NAME: 'feat/update-file-headers',  // Timestamp will be added automatically

  // PR details
  PR_DETAILS: {
    title: 'feat(headers): update file headers',
    description: 'Update file headers to use the latest Mojaloop Foundation copyright notice\n\n_this PR was automatically created with the **repo-sync** tool_'
  },

  LOCAL_DESTINATION: './cloned',
  SKIP_CLEANUP: true,  // Set to true so we can inspect the files
  SKIP_CLONE: false
} 