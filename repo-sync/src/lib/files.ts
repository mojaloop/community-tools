import path from 'path'
import fs from 'fs'
import { Repo } from './types'
import { Repos, Shell } from './'
import Octokit from '@octokit/rest'
// @ts-ignore
import Logger from '@mojaloop/central-services-logger'
import glob from 'glob-promise'


/**
 * @function matchedFilesForDir
 * @description Given a dir, and a match list, return the files in the dir
 *   that match the list
 */
export async function matchedFilesForDir(dirName: string, matchFilesList: Array<string>): Promise<Array<string>> {
  if (matchFilesList.length > 1) {
    throw new Error('matchedFilesForDir not supported for more than 1 file in `matchFilesList`')
  }

  const result = await glob.promise(path.join(dirName, matchFilesList[0]))
  return result;
}

/**
 * @function cloneRepos
 * @description Given a list of repos and a base directory, clone the repos
 * @param cloneRepoDir 
 * @param repos 
 */
export async function cloneRepos(cloneRepoDir: string, repos: Array<Repo>): Promise<void> {

  // note: tried running in paralell, but was getting ssh timeouts
  for (const repo of repos) {
    try {
      const tmpClonedDir = path.join(cloneRepoDir, repo.repo)
      const urlToClone = `git@github.com:${repo.owner}/${repo.repo}.git`
      await Shell.runShellCommand(`git clone ${urlToClone} ${tmpClonedDir}`)

    } catch (err) {
      Logger.error(`'cloneRepos' failed for repo ${repo}`)
      Logger.error(err)
    }
  }
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
      Logger.debug(`stdout is: ${stdout}`)
      if (stdout === 'false') {
        Logger.info(`checkoutNewBranchesIfChanged - ignoring repo: '${repo.repo}' as no file changes were found.`)
        return
      }

      changedRepos.push(repo)
    } catch (err) {
      Logger.info(`'checkoutNewBranchesIfChanged' failed for repo: ${repo}`)
      Logger.info(err)
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
      const paths = [localDestinationDir, repo.repo]
      if (!path.isAbsolute(localDestinationDir)) {
        paths.unshift(process.cwd())
      }
      const copyDestinationDir =  path.join(...paths)

      // Make the place for synced files only
      fs.mkdirSync(copyDestinationDir, { recursive: true })

      // Copy files across, based on Config.sync
      // TODO: will this handle recursive files?
      const filesToCopy = await matchedFilesForDir(tmpClonedDir, matchFilesList)
      filesToCopy.forEach(file => {
        fs.copyFileSync(path.join(tmpClonedDir, file), path.join(copyDestinationDir, file))
      })
    } catch (err) {
      console.log(`'copyFilesFromRepos' failed for repo: ${repo}`)
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
      const paths = [localDestinationDir, repo.repo]
      if (!path.isAbsolute(localDestinationDir)) {
        paths.unshift(process.cwd())
      }
      const copyDestinationDir = path.join(...paths)
      const tmpClonedDir = path.join(cloneRepoDir, repo.repo)

      // TODO: will this handle recursive files?
      const filesToCopy = await matchedFilesForDir(copyDestinationDir, matchFilesList)
      filesToCopy.forEach(file => {
        fs.copyFileSync(path.join(copyDestinationDir, file), path.join(tmpClonedDir, file))
      })
    } catch (err) {
      Logger.error(`'copyFilesToRepos' failed for repo: ${repo}`)
      Logger.error(err)
    }
  }))
}


/**
 * @function copyTemplateFile
 * @description Given a list of files, copy the files to the local copy of each repo
 * @param localDestinationDir 
 * @param repos 
 * @param files 
 */
export async function copyTemplateFile(localDestinationDir: string, repos: Array<Repo>, files: Array<string>): Promise<void> {
  await Promise.all(repos.map(async repo => {
    try {
      const paths = [localDestinationDir, repo.repo]
      if (!path.isAbsolute(localDestinationDir)) {
        paths.unshift(process.cwd())
      }
      const copyDestinationDir = path.join(...paths)
      files.forEach(file => {
        const fileName = file.split('/').pop()
        if (!fileName) {
          throw new Error(`File name not found for file: ${file}`)
        }
        fs.copyFileSync(file, path.join(copyDestinationDir, fileName))
      })
    } 
    catch (err) {
      Logger.error(`'copyTemplateFile' failed for repo: ${repo}`)
      Logger.error(err)
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
      Logger.info(`Found ${openPrList.length} existing PRs. Closing first`)

      await openPrList.reduce(async (acc: Promise<any>, curr: any) => {
        await acc;
        Logger.info(`Closing existing PR: ${repo.repo}, #${curr.number}`)
        return Repos.closePR(repo, curr.number)
          .then(() => true)

      }, Promise.resolve(true))
    }

    const execOptions = { cwd: path.join(cloneRepoDir, repo.repo) }
    // Delete the branch in case it already exists
    await Shell.runShellCommand(`git checkout master`, execOptions)
    try {
      await Shell.runShellCommand(`git push origin --delete ${branchName}`, execOptions)
    } catch (err) {
      Logger.info("non fatal error deleting branch")
    }
    
    try {
      // checkout a new branch, or existing if already exists
      await Shell.runShellCommand(`git checkout -b ${branchName}`, execOptions)
      .catch(err => {
        Logger.info("non fatal error checking out branch")
        return Shell.runShellCommand(`git checkout ${branchName}`, execOptions)
      })
      
      await Shell.runShellCommand(`git add .`, execOptions)
      await Shell.runShellCommand(`git commit -m "${commitMessage}"`, execOptions)
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
      Logger.warn(`Created new PR with URL: ${createPRResult.data.html_url}`)
    } catch (err) {
      Logger.error(`Error checking out and creating PR for repo: ${repo.owner}/${repo.repo}`)
    }
  }))
}