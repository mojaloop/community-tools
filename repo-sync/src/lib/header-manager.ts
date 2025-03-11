import * as path from 'path'
import { matchedFilesForDir } from './files'
import { Repo } from './types'
import Logger from '@mojaloop/central-services-logger'
import { GitHubOps } from './github-ops'

interface HeaderConfig {
  template: string;
  startDelimiter?: string;
  endDelimiter?: string;
  baseBranches?: string[];
  branchName?: string;
}

class HeaderError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message)
    this.name = 'HeaderError'
  }
}

/**
 * @function validateHeaderConfig
 * @description Validate the header configuration
 */
function validateHeaderConfig(headerConfig: HeaderConfig): void {
  if (!headerConfig.template || typeof headerConfig.template !== 'string') {
    throw new HeaderError('Header template is required and must be a string')
  }
  if (headerConfig.template.trim().length === 0) {
    throw new HeaderError('Header template cannot be empty')
  }
  if (headerConfig.startDelimiter && typeof headerConfig.startDelimiter !== 'string') {
    throw new HeaderError('Start delimiter must be a string if provided')
  }
  if (headerConfig.endDelimiter && typeof headerConfig.endDelimiter !== 'string') {
    throw new HeaderError('End delimiter must be a string if provided')
  }
}

/**
 * @function escapeRegExp
 * @description Escape special characters for use in a regular expression
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @function extractContributors
 * @description Extract the contributors section from an existing header
 */
function extractContributors(content: string): string | null {
  try {
    const contributorsMatch = content.match(/Contributors\s*-+\s*([\s\S]*?)(?=\s*-+\s*\*+\/|$)/);
    if (contributorsMatch && contributorsMatch[1]) {
      return contributorsMatch[1].trim();
    }
    return null;
  } catch (err) {
    throw new HeaderError('Failed to extract contributors section', err as Error);
  }
}

/**
 * @function formatHeader
 * @description Format the header content with consistent line breaks
 */
function formatHeader(headerConfig: HeaderConfig, contributors: string | null): string {
  try {
    const lines = [
      headerConfig.template
    ];

    if (contributors) {
      lines.push(
        '',
        'Contributors',
        '--------------',
        contributors
      );
    }

    return lines.join('\n');
  } catch (err) {
    throw new HeaderError('Failed to format header content', err as Error);
  }
}

/**
 * @function processFileContent
 * @description Process a single file's content - either add or replace existing header
 */
function processFileContent(content: string, headerConfig: HeaderConfig): string {
  const startDelimiter = headerConfig.startDelimiter || '/*****';
  const endDelimiter = headerConfig.endDelimiter || '*****/';
  
  // Check if file already has a header between delimiters
  const escapedStart = escapeRegExp(startDelimiter);
  const escapedEnd = escapeRegExp(endDelimiter);
  const headerRegex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}\\s*`);
  
  // Extract existing contributors if present
  const existingContributors = extractContributors(content);
  if (existingContributors) {
    Logger.info('Found existing contributors section');
    Logger.debug(`Contributors: ${existingContributors}`);
  }
  
  // Format the header with contributors if present
  const headerContent = formatHeader(headerConfig, existingContributors);
  
  if (headerRegex.test(content)) {
    Logger.info('Found existing header - replacing');
    // Replace existing header
    return content.replace(headerRegex, `${startDelimiter}\n${headerContent}\n${endDelimiter}\n\n`);
  } else {
    Logger.info('No existing header found - adding new header');
    // Add new header at the beginning of the file
    return `${startDelimiter}\n${headerContent}\n${endDelimiter}\n\n${content.trim()}`;
  }
}

/**
 * @function updateSourceHeaders
 * @description Process files in the given repositories and update their headers using GitHub API
 */
export async function updateSourceHeaders(
  githubOps: GitHubOps,
  repos: Array<Repo>,
  headerConfig: HeaderConfig
): Promise<void> {
  try {
    // Validate inputs
    if (!Array.isArray(repos) || repos.length === 0) {
      throw new HeaderError('At least one repository must be specified');
    }
    validateHeaderConfig(headerConfig);

    // Track any errors that occur during processing
    const errors: Array<{ repo: string; file: string; error: Error }> = [];

    // Generate a unique branch name with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const branchName = `${headerConfig.branchName || 'feat/update-file-headers'}-${timestamp}`;

    for (const repo of repos) {
      try {
        Logger.info(`Processing repository: ${repo.owner}/${repo.repo}`);

        // Create a new branch for the changes
        await githubOps.createBranch(repo.owner, repo.repo, branchName, headerConfig.baseBranches || ['main', 'master']);

        // Process JavaScript files in the repository
        await githubOps.processFiles(
          repo,
          branchName,
          '\\.js$',
          (content: string) => processFileContent(content, headerConfig)
        );

        // Create PR if changes were made
        await githubOps.createPullRequest(
          repo.owner,
          repo.repo,
          'feat(headers): update file headers',
          'Update file headers to use the latest Mojaloop Foundation copyright notice\n\n_this PR was automatically created with the **repo-sync** tool_',
          branchName,
          headerConfig.baseBranches || ['main', 'master']
        );

      } catch (err) {
        errors.push({ repo: repo.repo, file: '', error: err as Error });
        Logger.error(`Failed to process repository ${repo.repo}:`, err);
      }
    }

    // If any errors occurred, throw a summary error
    if (errors.length > 0) {
      const summary = errors.map(e => `${e.repo}${e.file ? '/' + e.file : ''}: ${e.error.message}`).join('\n');
      throw new HeaderError(`Failed to update headers in some repositories:\n${summary}`);
    }
  } catch (err) {
    if (err instanceof HeaderError) {
      throw err;
    }
    throw new HeaderError('Failed to update source headers', err as Error);
  }
} 