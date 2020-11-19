import { Repo } from './types';


export interface Config {
  // The list of repos that will be cloned and monitored
  repos: Array<Repo>,

  // The dirs/files that should be monitored
  // non case sensitive
  // can use .gitignore syntax
  sync: Array<string>,

  // Where should the synced files live?
  localDestination: string
}


// TODO: read from a `repo-syncrc.js file`
const config: Config = {
  // TODO: is there a way to specify all repos for an org?
  repos: [
    { owner: 'mojaloop', repo: 'central-ledger'},
    { owner: 'mojaloop', repo: 'account-lookup-service'},
  ],
  sync: [
    'license.md',
    'readme.md'
  ],
  localDestination: './cloned'
}

export default config;