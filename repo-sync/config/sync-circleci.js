{
  REPOS: 'CORE',
  MATCH_FILES_LIST: [
    '.circleci/config.*'
  ],
  LOCAL_DESTINATION: './cloned',
  TMP_REPO_DESTINATION: '/tmp/repos',
  SKIP_CLEANUP: true,
  SKIP_CLONE: true,
  TEMPLATE_FILE_PATH: './templates/LICENSE.md'
}