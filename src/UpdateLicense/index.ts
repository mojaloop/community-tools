import { getRepoList, runShellCommand } from '../lib';


export type UpdateLicenseConfigType = {
  //An array of repos that we don't want to automatically update, formatted in `mojaloop/<repo_name>` format
  skipRepos: string[],

  pathToRepos: string,

  //The new license string text
  newLicenseString: string,
}

async function run(config: UpdateLicenseConfigType) {
  // const repos = await getRepoList()

  // console.log('repos are', repos[0].git_url)

  //TODO: filter on some blacklist of repos we want to update manually


  // const urlToClone = repos[0].git_url
  const repoName = 'mojaloop'
  const urlToClone = 'git://github.com/mojaloop/mojaloop.git'
  runShellCommand(`git`, ['clone', urlToClone, `${config.pathToRepos}/${repoName}`])
  runShellCommand(`git`, ['clone', urlToClone, `${config.pathToRepos}/${repoName}`])
  const dateStamp = (new Date()).toISOString().split('T')[0]
  runShellCommand(`git`, ['checkout', '-b', `feature/auto-update-license-${dateStamp}`], { cwd: `${config.pathToRepos}/${repoName}` })
  runShellCommand(`echo`, [`"${config.newLicenseString}" > LICENSE.md`], { cwd: `${config.pathToRepos}/${repoName}` })
  runShellCommand(`git`, ['commit', '-anm', 'Added updated Mojaloop license'], { cwd: `${config.pathToRepos}/${repoName}` })




  //For each repo:
  // - clone somewhere
  // - make a new branch
  // - remove the LICENSE.md file (if exists)
  // - make a new LICENSE.md file based on the newLicenseString
  // - push and create a new PR: POST /repos/:owner/:repo/pulls


  //
}

export default {
  run
}