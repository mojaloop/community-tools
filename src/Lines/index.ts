import { runShellCommand } from '../lib/GithubCalls'
import { run_cloneRepos, wrapCommand } from '../Common'


export type LinesConfigType = {
  pathToRepos: string,
  reposToClone: Array<string>
}


/**
 * An async function to run before the 'run' command
 */
const preRunSteps = async function (config: LinesConfigType) {
  //TODO: check that cloc exists?
  return run_cloneRepos(config)
}

/**
 * An async function to run after the 'run' command
 */
const postRunSteps = async function (_: LinesConfigType) {
  //TODO: reenable, skipping for now since this is a lot of work to clone
  // return clean_cloneRepos(config)
}

async function run(config: LinesConfigType) {
  // console.log('config is', config)
  //TODO: install the cloc tool?

  runShellCommand('./node_modules/.bin/cloc', [config.pathToRepos])
}

export default {
  run: wrapCommand<LinesConfigType>(run, preRunSteps, postRunSteps)
}