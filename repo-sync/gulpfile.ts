import gulp from 'gulp';
import fs  from 'fs';
import path from 'path'

import Config from './src/lib/config'
import { Shell } from './src/lib';
import { cloneRepos, copyFilesFromRepos, matchedFilesForDir } from './src/lib/files';
import config from './src/lib/config';
import { Repo } from 'lib/types';

/**
 * @task sync-local
 * @description Syncs the local repos defined in repo-syncrc.js locally
 */
gulp.task('sync-local', async () => {
  // clone the repos somewhere
  let tmpDir: string
  if (config.tmpRepoDestination) {
    tmpDir = config.tmpRepoDestination
    fs.mkdirSync(tmpDir, {recursive: true})
  } else {
    tmpDir = fs.mkdtempSync('/tmp/')
  }

  await cloneRepos(tmpDir, Config.repos)
  await copyFilesFromRepos(tmpDir, Config.repos, Config.localDestination, Config.matchFilesList)

  if (config.cleanup) {
    console.log(`cleaning up cloned repos in ${tmpDir}`)
    fs.rmdirSync(tmpDir, { recursive: true})
  }
})


/**
 * @task pr-remote
 * @description TODO: Pushes changes and creates PRs for each repo that has changed files
 */
// gulp.task('pr-remote')

/**
 * @task apply-template
 * @description TODO: Applies a template file across all synced repos
 *   This is useful for updating things such as licenses, ci/cd etc..
 */
// gulp.task('apply-template')