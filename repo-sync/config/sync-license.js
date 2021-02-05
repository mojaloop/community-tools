{
  // REPOS: [
  //   { owner: 'mojaloop', repo: 'account-lookup-service' }
  // ],
  REPOS: 'ALL',
  MATCH_FILES_LIST: [
    'license.md'
  ],
  LOCAL_DESTINATION: './cloned',
  TMP_REPO_DESTINATION: '/tmp/repos',
  SKIP_CLEANUP: true,
  SKIP_CLONE: false,
  TEMPLATE_FILE_PATH: './templates/LICENSE.md',
  BRANCH_NAME: 'chore/update-license-1',
  PR_DETAILS: {
    title: 'chore(license): update license file',
    description: 'Updates the license file to latest version\n\n_this PR was automatically created with the **repo-sync** tool_'
  }
}