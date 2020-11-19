import gulp from 'gulp';
import fs  from 'fs';
import path from 'path'

import Config from './src/lib/config'
import { Shell } from './src/lib';
import { cloneRepos, copyFilesFromRepos, matchedFilesForDir, copyFilesToRepos, checkoutNewBranchesIfChanged } from './src/lib/files';
import config from './src/lib/config';
import { Repo } from 'lib/types';


function getOrCreateTmpDir(tmpRepoDestination?: string): string {
  if (tmpRepoDestination) {
    fs.mkdirSync(tmpRepoDestination, { recursive: true })
    return tmpRepoDestination
  }
  
  return  fs.mkdtempSync('/tmp/')
}

/**
 * @task sync-local
 * @description Syncs the local repos defined in repo-syncrc.js locally
 */
gulp.task('sync-local', async () => {
  // Make a tmp dir if not specified
  const tmpDir = getOrCreateTmpDir(config.tmpRepoDestination)

  if (!config.skipClone) {
    await cloneRepos(tmpDir, Config.repos)
  }
  await copyFilesFromRepos(tmpDir, Config.repos, Config.localDestination, Config.matchFilesList)

  if (config.cleanup) {
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

  if (!config.skipClone) {
    await cloneRepos(tmpDir, Config.repos)
  }

  // iterate through the /cloned/ files, copy back to the tmpRepo
  await copyFilesToRepos(tmpDir, Config.repos, Config.localDestination, Config.matchFilesList)

  // checkout a new branch for each repo that has changed
  const changedRepos = await checkoutNewBranchesIfChanged(tmpDir, Config.repos, 'test/1232')


  // push changes, and open a PR
  await pushAndOpenPR(tmpDir, changedRepos, `chore(thingo): updating global config`)


  if (config.cleanup) {
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