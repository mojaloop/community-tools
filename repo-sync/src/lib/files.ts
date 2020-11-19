import path from 'path'
import ignore from 'ignore'
import fs from 'fs'
import { Repo } from './types'
import shell from './shell'

// TODO: fix this uglyness...
const Shell = new shell()


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
