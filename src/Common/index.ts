import { Shell } from '../lib'


export function run_cloneRepos({ pathToRepos, reposToClone }: { pathToRepos: string, reposToClone: Array<string>}) { 
  Shell.runShellCommand('mkdir', ['-p', pathToRepos])
  reposToClone.forEach(repoName => Shell.runShellCommand(`git`, ['clone', `git@github.com:mojaloop/${repoName}.git`], { cwd: pathToRepos }))

  //TODO: make a command to check if this has already been done?
}

export function clean_cloneRepos({ pathToRepos }: { pathToRepos: string }) {
  Shell.runShellCommand('rm', ['-rf', pathToRepos])
}

/**
 * A command wrapper for adding pre and post steps to a run command
 */
export function wrapCommand<T>(command: Function, pre: Function, post: Function): Function {
  return async (config: T) => {
    console.log("Running Presteps")
    await pre.call(null, config)

    console.log("Running Main")
    command(config)

    console.log("Running Poststeps")
    await post.call(null, config)
  }
}