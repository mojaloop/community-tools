import gulp from 'gulp';
import fs  from 'fs';

import Config, { ConvictConfig } from './src/lib/config'
import { cloneRepos, copyFilesFromRepos, copyFilesToRepos, checkoutPushAndOpenPRs, getChangedRepos, copyTemplateFile } from './src/lib/files';
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
  const tmpDir = getOrCreateTmpDir(config.TMP_REPO_DESTINATION)
  const repos = await getReposFromShortcutOrList(Config.REPOS)

  if (!config.SKIP_CLONE) {
    await cloneRepos(tmpDir, repos)
  }
  await copyFilesFromRepos(tmpDir, repos, Config.LOCAL_DESTINATION, Config.MATCH_FILES_LIST)

  if (!config.SKIP_CLEANUP) {
    console.log(`cleaning up cloned repos in ${tmpDir}`)
    fs.rmdirSync(tmpDir, { recursive: true})
  }
})

/**
 * @task pr-remote
 * @description Pushes changes and creates PRs for each repo that has changed files
 */
gulp.task('pr-remote', async () => {
  const tmpDir = getOrCreateTmpDir(config.TMP_REPO_DESTINATION)
  const repos = await getReposFromShortcutOrList(Config.REPOS)

  if (!config.SKIP_CLEANUP) {
    await cloneRepos(tmpDir, repos)
  }

  // iterate through the /cloned/ files, copy back to the tmpRepo
  await copyFilesToRepos(tmpDir, repos, Config.LOCAL_DESTINATION, Config.MATCH_FILES_LIST)

  // checkout a new branch for each repo that has changed
  const changedRepos = await getChangedRepos(tmpDir, repos)

  // push changes, and open a PR
  // TODO: smarter pr titles?
  await checkoutPushAndOpenPRs(tmpDir, changedRepos, `admin/update-license`, `chore: update license file`, `chore: update license file`)

  if (!config.SKIP_CLEANUP) {
    console.log(`cleaning up cloned repos in ${tmpDir}`)
    fs.rmdirSync(tmpDir, { recursive: true })
  }
})

/**
 * @task apply-template-file
 * @description Applies a template file across all synced repos
 */
gulp.task('apply-template-file', async () => {
  const sourceTemplatePath = Config.TEMPLATE_FILE_PATH
  if (!sourceTemplatePath) {
    throw new Error('`TEMPLATE_FILE_PATH` is not set. This field is required to apply templates across the cloned repos.')
  }

  // TODO: dynamically fill out the file using magic

  // Copy the template file into all repos
  const repos = await getReposFromShortcutOrList(Config.REPOS)
  await copyTemplateFile(Config.LOCAL_DESTINATION, repos, [sourceTemplatePath])

})


/**
 * @task cleanup
 * @description Will try to clean up tmp repos
 */
gulp.task('cleanup', async () => {
  const tmpDir = getOrCreateTmpDir(config.TMP_REPO_DESTINATION)

  if (!config.SKIP_CLEANUP) {
    console.log(`cleaning up cloned repos in ${tmpDir}`)
    fs.rmdirSync(tmpDir, { recursive: true })
  }
})