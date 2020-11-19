import path from 'path'
import ignore from 'ignore'
import fs from 'fs'
import { Repo } from './types'
import { Repos, Shell } from './'
import Octokit from '@octokit/rest'


/**
 * @function matchedFilesForDir
 * @description Given a dir, and a match list, return the files in the dir
 *   that match the list
 */
export async function matchedFilesForDir(dirName: string, matchFilesList: Array<string>): Promise<Array<string>> {

  // TODO: implement
  return [
    'LICENSE.md'
  ]
}

/**
 * @function cloneRepos
 * @description Given a list of repos and a base directory, clone the repos
 * @param cloneRepoDir 
 * @param repos 
 */
export async function cloneRepos(cloneRepoDir: string, repos: Array<Repo>): Promise<void> {
  await Promise.all(repos.map(async repo => {
    try {
      const tmpClonedDir = path.join(cloneRepoDir, repo.repo)
      const urlToClone = `git@github.com:${repo.owner}/${repo.repo}.git`
      await Shell.runShellCommand(`git clone ${urlToClone} ${tmpClonedDir}`)

    } catch (err) {
      console.log('`cloneRepos` failed for repo: ', repo)
      console.log(err)
    }
  }))
}

/**
 * @function getChangedRepos
 * @description Returns a list of cloned repos with changed files
 * 
 * @param cloneRepoDir 
 * @param repos 
 * @returns changedRepos {Promise<Array<Repo>>} - A list of changed repos
 */
export async function getChangedRepos(cloneRepoDir: string, repos: Array<Repo>): Promise<Array<Repo>> {
  const changedRepos: Array<Repo> = []
  await Promise.all(repos.map(async repo => {
    try {
      const tmpClonedDir = path.join(cloneRepoDir, repo.repo)
      const { stdout } = await Shell.runShellCommand(`
      if [ $(git diff | wc -l) -eq "0" ]; then
        echo 'false' 
      else
        echo 'true'
      fi
      `, { cwd: tmpClonedDir })
    
      // No changes were made
      console.log('stdout is', stdout)
      if (stdout === 'false') {
        console.log(`checkoutNewBranchesIfChanged - ignoring repo: '${repo.repo}' as no file changes were found.`)
        return
      }

      changedRepos.push(repo)
    } catch (err) {
      console.log('`checkoutNewBranchesIfChanged` failed for repo: ', repo)
      console.log(err)
    }
  }))

  return changedRepos
}

/**
 * @function copyFilesFromRepos
 * @description Given a list of repos, their cloned location and a set of files, a
 *  copy list, copy the matching files to localDestinationDir
 * @param cloneRepoDir 
 * @param localDestinationDir 
 * @param repos 
 * @param matchFilesList
 */
export async function copyFilesFromRepos(cloneRepoDir: string, repos: Array<Repo>, localDestinationDir: string, matchFilesList: Array<string>): Promise<void> {
  await Promise.all(repos.map(async repo => {
    try {
      const tmpClonedDir = path.join(cloneRepoDir, repo.repo)
      const copyDestinationDir = path.join(__dirname, localDestinationDir, repo.repo)
      // Make the place for synced files only
      fs.mkdirSync(copyDestinationDir, { recursive: true })

      // Copy files across, based on Config.sync
      // TODO: will this handle recursive files?
      const filesToCopy = await matchedFilesForDir(tmpClonedDir, matchFilesList)
      filesToCopy.forEach(file => {
        fs.copyFileSync(path.join(tmpClonedDir, file), path.join(copyDestinationDir, file))
      })
    } catch (err) {
      console.log('`copyFilesFromRepos` failed for repo: ', repo)
      console.log(err)
    }
  }))
}

/**
 * @function copyFilesToRepos
 * @description Given a list of repos, their cloned location and a set of files, a
 *  copy list, copy the matching files from the localDestinationDir back to the cloned repos
 * @param cloneRepoDir 
 * @param localDestinationDir 
 * @param repos 
 * @param matchFilesList
 */
export async function copyFilesToRepos(cloneRepoDir: string, repos: Array<Repo>, localDestinationDir: string, matchFilesList: Array<string>): Promise<void> {
  await Promise.all(repos.map(async repo => {
    try {
      const copyDestinationDir = path.join(__dirname, localDestinationDir, repo.repo)
      const tmpClonedDir = path.join(cloneRepoDir, repo.repo)

      // TODO: will this handle recursive files?
      const filesToCopy = await matchedFilesForDir(copyDestinationDir, matchFilesList)
      filesToCopy.forEach(file => {
        fs.copyFileSync(path.join(copyDestinationDir, file), path.join(tmpClonedDir, file))
      })
    } catch (err) {
      console.log('`copyFilesToRepos` failed for repo: ', repo)
      console.log(err)
    }
  }))
}

/**
 * @function checkoutPushAndOpenPRs
 * @description Checks out a branch, pshes the local changes 
 *  and opens a pull request
 * 
 * @param cloneRepoDir 
 * @param repos 
 * @param branchName 
 * @param commitMessage 
 * @param prTitle 
 */
export async function checkoutPushAndOpenPRs(cloneRepoDir: string, repos: Array<Repo>, branchName: string, commitMessage: string, prTitle: string): Promise<void> {
  await Promise.all(repos.map(async repo => {

    // Get existing PRs with the same name,
    const openPrList = (await Repos.getOpenPrList(repo))
      .data
      .filter((pr: any) => pr.title === prTitle)

    if (openPrList.length > 0) {
      console.log(`Found ${openPrList.length} existing PRs. Closing first`)

      await openPrList.reduce(async (acc: Promise<any>, curr: any) => {
        await acc;
        console.log(`Closing existing PR: ${repo.repo}, #${curr.number}`)
        return Repos.closePR(repo, curr.number)
          .then(() => true)

      }, Promise.resolve(true))
    }

    const execOptions = { cwd: path.join(cloneRepoDir, repo.repo) }
    // Delete the branch in case it already exists
    Shell.runShellCommand(`git push origin --delete ${branchName}`, execOptions)

    // checkout a new branch
    await Shell.runShellCommand(`git checkout -b ${branchName}`, execOptions)
    await Shell.runShellCommand(`git add .`, execOptions)
    await Shell.runShellCommand(`git commit -anm ${commitMessage}`, execOptions)
    await Shell.runShellCommand(`git push --set-upstream origin ${branchName}`, execOptions)

    // Create a new PR
    const options: Octokit.PullsCreateParams = {
      base: 'master',
      head: branchName,
      owner: repo.owner,
      repo: repo.repo,
      title: prTitle,
      body: '- Mass updated files to the latest version. \n\n _this PR was automatically made by the __repo-sync-bot___',
      maintainer_can_modify: true,
    }
    const createPRResult = await Repos.createPR(options)
    console.log('Created new PR with URL:', createPRResult.data.html_url)
  }))
}