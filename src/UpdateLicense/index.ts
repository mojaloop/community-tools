import { getRepoList, runShellCommand } from '../lib';
import fs from 'fs'


export type UpdateLicenseConfigType = {
  //An array of repos that we don't want to automatically update, formatted in `mojaloop/<repo_name>` format
  skipRepos: string[],

  pathToRepos: string,

  //The new license string text
  newLicenseString: string,

  //If there are no changes to the license string, should we still apply them and open a PR? Useful for testing
  shouldSkipNoChanges: boolean
}

async function run(config: UpdateLicenseConfigType) {
  // const repos = await getRepoList()

  // console.log('repos are', repos[0].git_url)

  //TODO: filter on some blacklist of repos we want to update manually


  // const urlToClone = repos[0].git_url
  const repoName = 'email-notifier'
  const urlToClone = 'git://github.com/mojaloop/email-notifier.git'

  const licenseFullPath = `${config.pathToRepos}/${repoName}/LICENSE.md`
  const dateStamp = (new Date()).toISOString().split('T')[0]
  const branchName = `feature/auto-update-license-${dateStamp}`

  runShellCommand(`git`, ['clone', urlToClone, `${config.pathToRepos}/${repoName}`])

  //Check to see if the New License is different
  const currentLicense = fs.readFileSync(licenseFullPath).toString()
  if (config.shouldSkipNoChanges &&  currentLicense === config.newLicenseString) {
    console.log(`No changes to license. Skipping: ${repoName}`)
    return;
  }
  
  runShellCommand(`git`, ['checkout', '-b', branchName], { cwd: `${config.pathToRepos}/${repoName}` })
  fs.writeFileSync(licenseFullPath, Buffer.from(config.newLicenseString))
  // runShellCommand(`git`, ['diff'], { cwd: `${config.pathToRepos}/${repoName}` })
  runShellCommand(`git`, ['commit', '-anm', 'Added updated Mojaloop license'], { cwd: `${config.pathToRepos}/${repoName}` })
  runShellCommand(`git`, ['push', '--set-upstream', 'origin', branchName], { cwd: `${config.pathToRepos}/${repoName}` })




  //For each repo:
  // - push and create a new PR: POST /repos/:owner/:repo/pulls
  //
}

export default {
  run
}