{
  // REPOS: [
  //   { owner: 'mojaloop', repo: 'account-lookup-service' }
  // ],
  REPOS: 'CORE',
  MATCH_FILE_LIST: [
    '.circleci/config.*'
  ],
  LOCAL_DESTINATION: './cloned',
  TMP_REPO_DESTINATION: '/tmp/repos',
  SKIP_CLEANUP: true,
  SKIP_CLONE: false,
  TEMPLATE_FILE_PATH: './templates/LICENSE.md'
}