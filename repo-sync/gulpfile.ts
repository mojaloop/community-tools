import gulp from 'gulp';
import fs  from 'fs';
import path from 'path'

import Config from './src/lib/config'
import { Shell } from './src/lib';
import { matchedFilesForDir } from './src/lib/files';
import config from './src/lib/config';

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

  await Promise.all(Config.repos.map(async repo => {
    try {
      const tmpClonedDir = path.join(tmpDir, repo.repo)
      const copyDestinationDir = path.join(__dirname, Config.localDestination, repo.repo)
      // Make the place for synced files only
      fs.mkdirSync(copyDestinationDir, { recursive: true })

      const urlToClone = `git@github.com:${repo.owner}/${repo.repo}.git`
      await Shell.runShellCommand(`git clone ${urlToClone} ${tmpClonedDir}`)

      // Copy files across, based on Config.sync
      const filesToCopy = await matchedFilesForDir(tmpClonedDir, Config.matchFilesList)
      filesToCopy.forEach(file => {
        fs.copyFileSync(path.join(tmpClonedDir, file), path.join(copyDestinationDir, file))
      })
    } catch (err) {
      console.log('sync-local failed for repo: ', repo)
      console.log(err)
    }
  }))

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