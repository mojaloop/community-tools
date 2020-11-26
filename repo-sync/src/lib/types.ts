
/**
 * Defines a Github Repo
 */
export type Repo = {
  owner: string,
  repo: string,
}

export enum RepoShortcut {
  // All Mojaloop Repos
  ALL = 'ALL',

  // All repos which build dockerfiles
  // and are considered 'core' components
  CORE_DOCKER = 'CORE_DOCKER',


  // All repos which publish npm modules
  // and are considered 'core' components
  CORE_NPM = 'CORE_NPM',
}