import path from 'path'
import { updateSourceHeaders } from '../lib/header-manager'
import { Repo } from '../lib/types'
import Logger from '@mojaloop/central-services-logger'
import { Octokit } from '@octokit/rest'
import { GitHubOps } from '../lib/github-ops'

async function main() {
  try {
    // Initialize Octokit with GitHub token
    const githubToken = process.env.GITHUB_TOKEN
    if (!githubToken) {
      throw new Error('GITHUB_TOKEN environment variable is required')
    }

    const octokit = new Octokit({
      auth: githubToken
    })

    // Initialize GitHubOps
    const githubOps = new GitHubOps(octokit)

    // Load configuration
    const config = require('../../config/sync-headers.js')

    // Define the header configuration
    const headerConfig = {
      template: config.HEADER_TEMPLATE,
      startDelimiter: config.START_DELIMITER,
      endDelimiter: config.END_DELIMITER,
      baseBranches: config.BASE_BRANCHES,
      branchName: config.BRANCH_NAME,
      prTitle: config.PR_TITLE,
      prDescription: config.PR_DESCRIPTION
    }

    let repos: Repo[]
    if (config.REPOS === 'ALL') {
      // Get all repositories from the Mojaloop organization
      Logger.info('Fetching all repositories from Mojaloop organization...')
      const allRepos = await octokit.paginate('GET /orgs/{org}/repos', {
        org: 'mojaloop',
        type: 'all'
      })
      repos = allRepos.map(repo => ({
        owner: 'mojaloop',
        repo: repo.name
      }))
      Logger.info(`Found ${repos.length} repositories`)
    } else {
      repos = config.REPOS
    }
    
    Logger.info(`Starting header updates for ${repos.length} repositories`)
    await updateSourceHeaders(githubOps, repos, headerConfig)
    Logger.info('Headers updated successfully')
  } catch (err) {
    Logger.error('Error updating headers:', err)
    process.exit(1)
  }
}

main() 