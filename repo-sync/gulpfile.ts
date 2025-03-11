import gulp from 'gulp';
import fs  from 'fs';
import Octokit = require('@octokit/rest');

import Config, { ConvictConfig } from './src/lib/config'
import { cloneRepos, copyFilesFromRepos, copyFilesToRepos, checkoutPushAndOpenPRs, getChangedRepos, copyTemplateFile, resetRepos } from './src/lib/files';
import config from './src/lib/config';
import { Repo, RepoShortcut } from './src/lib/types';
import { Repos } from './src/lib';
import { updateSourceHeaders } from './src/lib/header-manager'
import Logger from '@mojaloop/central-services-logger'
import { GitHubOps } from './src/lib/github-ops'


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

gulp.task('clone-repos', async () => {
  // Make a tmp dir if not specified
  const tmpDir = getOrCreateTmpDir(config.TMP_REPO_DESTINATION)
  const repos = await getReposFromShortcutOrList(Config.REPOS)

  if (config.SKIP_CLONE) {
    throw new Error('task `clone-repos` was started, but SKIP_CLONE is set to true. Set SKIP_CLONE to false and try again')
  }
  await cloneRepos(tmpDir, repos)
})

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

  // change cloned repos back to default state, in case something broke last time
  await resetRepos(tmpDir, repos, config.BRANCH_NAME)

  // iterate through the /cloned/ files, copy back to the tmpRepo
  await copyFilesToRepos(tmpDir, repos, Config.LOCAL_DESTINATION, Config.MATCH_FILES_LIST)

  // checkout a new branch for each repo that has changed
  const changedRepos = await getChangedRepos(tmpDir, repos)
  console.log('changed repos are', changedRepos)

  // push changes, and open a PR
  await checkoutPushAndOpenPRs(
    tmpDir, 
    changedRepos, 
    config.BRANCH_NAME, 
    config.PR_DETAILS.title, 
    config.PR_DETAILS.title,
    config.PR_DETAILS.description
  )

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
 * @task update-headers
 * @description Updates source code headers in the synced files
 */
gulp.task('update-headers', async () => {
  try {
    // Validate config
    if (!config.headerTemplate) {
      throw new Error('headerTemplate is required in config')
    }
    if (!config.REPOS || (Array.isArray(config.REPOS) && config.REPOS.length === 0)) {
      throw new Error('At least one repository must be specified in REPOS')
    }
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required')
    }

    const headerConfig = {
      template: config.headerTemplate,
      startDelimiter: config.headerStartDelimiter,
      endDelimiter: config.headerEndDelimiter
    }

    Logger.info('Starting header updates...')
    Logger.info(`Processing ${Array.isArray(config.REPOS) ? config.REPOS.length : 'unknown number of'} repositories`)
    
    // Initialize Octokit with the token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    // Initialize GitHubOps with Octokit instance
    const githubOps = new GitHubOps(octokit)
    
    // Update headers using GitHub API
    await updateSourceHeaders(githubOps, config.REPOS as Repo[], headerConfig)
    
    Logger.info('Successfully updated headers in all files')
  } catch (err) {
    Logger.error('Failed to update headers:', err)
    if (err instanceof Error && err.stack) {
      Logger.error('Stack trace:', err.stack)
    }
    throw err
  }
})

/**
 * @task sync-remote
 * @description Updates headers in repositories directly using GitHub API
 */
gulp.task('sync-remote', async () => {
  try {
    // Validate config
    if (!config.headerTemplate) {
      throw new Error('headerTemplate is required in config')
    }
    if (!config.REPOS || (Array.isArray(config.REPOS) && config.REPOS.length === 0)) {
      throw new Error('At least one repository must be specified in REPOS')
    }
    if (!process.env.GITHUB_TOKEN) {
      throw new Error('GITHUB_TOKEN environment variable is required')
    }

    const headerConfig = {
      template: config.headerTemplate,
      startDelimiter: config.headerStartDelimiter,
      endDelimiter: config.headerEndDelimiter
    }

    Logger.info('Starting remote header updates...')
    Logger.info(`Processing ${Array.isArray(config.REPOS) ? config.REPOS.length : 'unknown number of'} repositories`)
    
    // Initialize Octokit with the token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });
    
    // Initialize GitHubOps with Octokit instance
    const githubOps = new GitHubOps(octokit)
    
    // Update headers using GitHub API
    await updateSourceHeaders(githubOps, config.REPOS as Repo[], headerConfig)
    
    Logger.info('Successfully updated headers in all repositories')
  } catch (err) {
    Logger.error('Failed to update headers:', err)
    if (err instanceof Error && err.stack) {
      Logger.error('Stack trace:', err.stack)
    }
    throw err
  }
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