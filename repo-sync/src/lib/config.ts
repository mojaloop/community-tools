import { Repo, RepoShortcut } from './types';



export interface Config {
  // The list of repos that will be cloned and monitored
  // If a shortcut is specified, the list will be loaded 
  // from github
  repos: RepoShortcut | Array<Repo>,

  // The dirs/files that should be monitored
  // non case sensitive
  // can use .gitignore syntax
  matchFilesList: Array<string>,

  // Where should the synced files live?
  localDestination: string,


  // Where should the repos be cloned to temporarily?
  // If not set, defaults to a temp dir
  tmpRepoDestination?: string,

  // If true, doesn't delete /tmp dir where repos are cloned
  skipCleanup: boolean,

  // If true, skips the clone step
  skipClone: boolean,
}


// TODO: read from a `repo-syncrc.js file`
const config: Config = {
  // TODO: is there a way to specify all repos for an org?
  repos: RepoShortcut.ALL,
  // repos: [
  //   { owner: 'mojaloop', repo: 'pisp'},
  //   // { owner: 'mojaloop', repo: 'central-ledger'},
  //   // { owner: 'mojaloop', repo: 'account-lookup-service'},
  // ],
  matchFilesList: [
    'license.md',
    'readme.md'
  ],
  // localDestination: './cloned',
  localDestination: '/Users/ldaly/developer/vessels/mojaloop/community-tools/repo-sync/cloned',
  tmpRepoDestination: '/tmp/repos',
  skipCleanup: true,
  skipClone: false,
}

export default config;