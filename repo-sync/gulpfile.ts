import gulp from 'gulp';
import fs  from 'fs';

import Config from './src/lib/config'
import { Shell } from 'lib';

/**
 * @task sync-local
 * @description Syncs the local repos defined in repo-syncrc.js locally
 */
gulp.task('sync-local', async () => {
  fs.mkdirSync(Config.localDestination, { recursive: true })

  // clone the repos somewhere
  const tmpDir = fs.mkdtempSync('/tmp/')
  console.log('tmpDir is', tmpDir)
  Config.repos
    .forEach(repo => {
      const urlToClone = `git@github.com:${repo.owner}/${repo.repo}.git`
      Shell.runShellCommand(`git`, ['clone', urlToClone, `${tmpDir}/${repo.repo}`])
    })


})


/**
 * @task pr-remote
 * @description Pushes changes and creates PRs for each repo that has changed files
 */
gulp.task('pr-remote')

/**
 * @task apply-template
 * @description TODO: Applies a template file across all synced repos
 *   This is useful for updating things such as licenses, ci/cd etc..
 */
// gulp.task('apply-template')