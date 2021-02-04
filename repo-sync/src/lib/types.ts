
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
  CORE_PACKAGE = 'CORE_PACKAGE',


  // A repo that contaions important 
  // specifications that needs high
  // levels of control
  CORE_SPEC = 'CORE_SPEC', 

  // All repos in above 3 categories
  CORE = 'CORE'
}