import { getRepoList, runShellCommand, createPR, closePR, getOpenPrList } from '../lib/GithubCalls';
import fs from 'fs'
import Octokit from '@octokit/rest';


export type UpdateLicenseConfigType = {
  //An array of repos that we don't want to automatically update, formatted in `mojaloop/<repo_name>` format
  skipRepos: string[],

  pathToRepos: string,

  //The new license string text
  newLicenseString: string,

  //If there are no changes to the license string, should we still apply them and open a PR? Useful for testing
  shouldSkipNoChanges: boolean
}

type SimpleRepo = {
  defaultBranch: string,
  repoName: string,
  urlToClone: string,
}

async function runForRepo(config: UpdateLicenseConfigType, repo: SimpleRepo) {
  const { defaultBranch, repoName, urlToClone } = repo;

  const licenseFullPath = `${config.pathToRepos}/${repoName}/LICENSE.md`
  const dateStamp = (new Date()).toISOString().split('T')[0]
  const branchName = `feature/auto-update-license-${dateStamp}`
  const prTitle = `[moja-tools-bot] Update LICENSE.md`

  // Check to see if a PR of this name is already open, and close it first
  const openPrList = await (await getOpenPrList(repoName))
    .data
    .filter(pr => pr.title === prTitle)
  if (openPrList.length > 0) {
    console.log(`Found ${openPrList.length} existing PRs. Closing first`)

    await openPrList.reduce(async (acc: Promise<any>, curr) => {
      await acc;
      console.log(`Closing existing PR: ${repoName}, #${curr.number}`)
      return closePR(repoName, curr.number)

    }, Promise.resolve(true))
  }

  runShellCommand(`git`, ['clone', urlToClone, `${config.pathToRepos}/${repoName}`])
  // Delete the branch in case it already exists
  runShellCommand(`git`, ['push', 'origin', '--delete', branchName], { cwd: `${config.pathToRepos}/${repoName}` })
  runShellCommand(`git`, ['checkout', '-b', branchName], { cwd: `${config.pathToRepos}/${repoName}` })

  // Check to see if the New License is different, and optionally skip if so.
  if (fs.existsSync(licenseFullPath)) {
    const currentLicense = fs.readFileSync(licenseFullPath).toString()
    if (config.shouldSkipNoChanges &&  currentLicense === config.newLicenseString) {
      console.log(`No changes to license. Skipping: ${repoName}`)
      return;
    }
  }

  fs.writeFileSync(licenseFullPath, Buffer.from(config.newLicenseString))
  runShellCommand(`git`, ['add', '.'], { cwd: `${config.pathToRepos}/${repoName}` })
  runShellCommand(`git`, ['commit', '-anm', 'Added updated Mojaloop license'], { cwd: `${config.pathToRepos}/${repoName}` })
  runShellCommand(`git`, ['push', '--set-upstream', 'origin', branchName], { cwd: `${config.pathToRepos}/${repoName}` })

  // Create a new PR
  const options: Octokit.PullsCreateParams = {
    base: defaultBranch,
    head: branchName,
    owner: 'mojaloop',
    repo: repoName,
    title: prTitle,
    body: '- Updated the LICENSE.md file to the latest version. \n\n _this PR was automatically made by the __moja-tools-bot___',
    maintainer_can_modify: true,
  } 
  const createPRResult = await createPR(options)
  console.log('Created new PR with URL:', createPRResult.data.html_url)
}

async function run(config: UpdateLicenseConfigType) {
  const allRepos: Array<SimpleRepo> = (await getRepoList())
  .filter(repo => repo.archived === false)
  .filter(repo => repo.private === false)
  .map(repo => ({
    defaultBranch: repo.default_branch,
    repoName: repo.name,
    urlToClone: repo.ssh_url,
  }))
  
  //Filter
  const repoBlackListMap: {[index: string]: true} = {}
  config.skipRepos.forEach(repoName => repoBlackListMap[repoName] = true)
  const repos = allRepos.filter(repo => repoBlackListMap[repo.repoName] !== true)

  console.log(`Found ${allRepos.length} repos. Filtered out ${allRepos.length - repos.length}. Applying changes to ${repos.length}`)
  await repos.reduce(async (acc: Promise<any>, curr) => {
    await acc;

    return runForRepo(config, curr)
  }, Promise.resolve(true))
}

export default {
  run
}