import gulp from 'gulp';
import fs  from 'fs';

import Config from './src/lib/config'
import { cloneRepos, copyFilesFromRepos, copyFilesToRepos, checkoutPushAndOpenPRs, getChangedRepos } from './src/lib/files';
import config from './src/lib/config';
import { Repo, RepoShortcut } from './src/lib/types';
import { Repos } from './src/lib';


function getOrCreateTmpDir(tmpRepoDestination?: string): string {
  if (tmpRepoDestination) {
    fs.mkdirSync(tmpRepoDestination, { recursive: true })
    return tmpRepoDestination
  }
  
  return  fs.mkdtempSync('/tmp/')
}

/**
 * @function getReposFromShortcutOrList
 * @description Loads a list of repos from a predefined shortcut - this is a convenience function
 *   so you don't need to manually list the repos.
 * @param repos 
 */
async function getReposFromShortcutOrList(repos: RepoShortcut | Array<Repo>): Promise<Array<Repo>> {
  if (!Array.isArray(repos)) {
    return await Repos.getReposForShortcut(repos)
  }
  return repos
}

/**
 * @task sync-local
 * @description Syncs the local repos defined in repo-syncrc.js locally
 */
gulp.task('sync-local', async () => {
  // Make a tmp dir if not specified
  const tmpDir = getOrCreateTmpDir(config.tmpRepoDestination)
  const repos = await getReposFromShortcutOrList(Config.repos)

  if (!config.skipClone) {
    await cloneRepos(tmpDir, repos)
  }
  await copyFilesFromRepos(tmpDir, repos, Config.localDestination, Config.matchFilesList)

  if (!config.skipCleanup) {
    console.log(`cleaning up cloned repos in ${tmpDir}`)
    fs.rmdirSync(tmpDir, { recursive: true})
  }
})

/**
 * @task pr-remote
 * @description Pushes changes and creates PRs for each repo that has changed files
 */
gulp.task('pr-remote', async () => {
  const tmpDir = getOrCreateTmpDir(config.tmpRepoDestination)
  const repos = await getReposFromShortcutOrList(Config.repos)

  if (!config.skipClone) {
    await cloneRepos(tmpDir, repos)
  }

  // iterate through the /cloned/ files, copy back to the tmpRepo
  await copyFilesToRepos(tmpDir, repos, Config.localDestination, Config.matchFilesList)

  // checkout a new branch for each repo that has changed
  const changedRepos = await getChangedRepos(tmpDir, repos)

  // push changes, and open a PR
  await checkoutPushAndOpenPRs(tmpDir, changedRepos, `test/123`, `chore: updating global config`, `chore: mass update common files`)

  if (!config.skipCleanup) {
    console.log(`cleaning up cloned repos in ${tmpDir}`)
    fs.rmdirSync(tmpDir, { recursive: true })
  }
})

/**
 * @task apply-template
 * @description TODO: Applies a template file across all synced repos
 *   This is useful for updating things such as licenses, ci/cd etc..
 */
// gulp.task('apply-template')


/**
 * @task cleanup
 * @description Will try to clean up tmp repos
 */
gulp.task('cleanup', async () => {
  const tmpDir = getOrCreateTmpDir(config.tmpRepoDestination)

  if (!config.skipCleanup) {
    console.log(`cleaning up cloned repos in ${tmpDir}`)
    fs.rmdirSync(tmpDir, { recursive: true })
  }
})