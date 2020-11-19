import { Repo } from './types';


export interface Config {
  // The list of repos that will be cloned and monitored
  repos: Array<Repo>,

  // The dirs/files that should be monitored
  // non case sensitive
  // can use .gitignore syntax
  matchFilesList: Array<string>,

  // Where should the synced files live?
  localDestination: string,


  // Where should the repos be cloned to temporarily?
  // If not set, defaults to a temp dir
  tmpRepoDestination?: string,

  // If true, deletes /tmp dir where repos are cloned
  cleanup: boolean,

  // If true, skips the clone step
  skipClone: boolean,
}


// TODO: read from a `repo-syncrc.js file`
const config: Config = {
  // TODO: is there a way to specify all repos for an org?
  repos: [
    { owner: 'mojaloop', repo: 'central-ledger'},
    { owner: 'mojaloop', repo: 'account-lookup-service'},
  ],
  matchFilesList: [
    'license.md',
    'readme.md'
  ],
  localDestination: './cloned',
  tmpRepoDestination: '/tmp/repos',
  cleanup: false,
  skipClone: false,
}

export default config;