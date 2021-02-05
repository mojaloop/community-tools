{
  REPOS: 'CORE',
  // REPOS: [
  //   { owner: 'mojaloop', repo: 'account-lookup-service' }
  // ],
  MATCH_FILES_LIST: [
    '.circleci/config.*'
  ],
  LOCAL_DESTINATION: './cloned',
  TMP_REPO_DESTINATION: '/tmp/repos',
  SKIP_CLEANUP: true,
  SKIP_CLONE: false,
  TEMPLATE_FILE_PATH: './templates/LICENSE.md',
  BRANCH_NAME: 'feat/pr-title-check-1',
  PR_DETAILS: {
    title: 'feat(ci/cd): add pr title check',
    description: 'Adds a pr title check to ci/cd pipelines\n\n_this PR was automatically created with the **repo-sync** tool_'
  }
}