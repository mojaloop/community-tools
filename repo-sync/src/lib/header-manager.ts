import * as path from 'path'
import { matchedFilesForDir } from './files'
import { Repo } from './types'
import Logger from '@mojaloop/central-services-logger'
import { GitHubOps } from './github-ops'

export interface HeaderConfig {
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
export function validateHeaderConfig(headerConfig: HeaderConfig): void {
  if (!headerConfig.template) {
    throw new HeaderError('template is required')
  }
  if (!headerConfig.startDelimiter) {
    headerConfig.startDelimiter = '/*****'
  }
  if (!headerConfig.endDelimiter) {
    headerConfig.endDelimiter = '*****/'
  }
}

/**
 * @function escapeRegExp
 * @description Escape special characters for use in a regular expression
 */
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * @function extractContributors
 * @description Extract the contributors section from an existing header, removing Gates Foundation entries
 */
export function extractContributors(content: string): string | null {
  try {
    // Match all contributors sections
    const contributorsMatch = content.match(/Contributors\s*-+\s*([\s\S]*?)(?=\s*-+\s*\*+\/|\s*Contributors\s*-+|$)/g);
    if (!contributorsMatch) {
      return null;
    }

    // Process all contributor sections
    let allContributors = '';
    for (const section of contributorsMatch) {
      // Extract the content between the Contributors header and the next section
      const sectionContent = section.replace(/Contributors\s*-+\s*/, '').trim();
      
      // Split into lines and filter out Gates Foundation entries
      const lines = sectionContent.split('\n')
        .filter(line => !line.includes('Gates Foundation'))
        .filter(line => !line.includes('@gatesfoundation.com'))
        .filter(line => !line.includes('Gates Contributor'))
        .map(line => line.trim())
        .filter(line => line.length > 0);

      if (lines.length > 0) {
        // Group contributors by organization
        let currentGroup = '';
        for (const line of lines) {
          if (line.startsWith('*')) {
            // Add newline between organizations
            if (currentGroup) {
              currentGroup += '\n';
            }
            currentGroup += line + '\n';
          } else {
            currentGroup += line + '\n';
          }
        }
        allContributors += currentGroup;
      }
    }

    return allContributors.trim() || null;
  } catch (err) {
    throw new HeaderError('Failed to extract contributors section', err as Error);
  }
}

/**
 * @function extractFileDocumentation
 * @description Extract any @file documentation from an existing header
 */
export function extractFileDocumentation(content: string): string | null {
  try {
    const fileDocMatch = content.match(/@file\s+[^\n]+/);
    if (fileDocMatch) {
      return fileDocMatch[0].trim();
    }
    return null;
  } catch (err) {
    throw new HeaderError('Failed to extract @file documentation', err as Error);
  }
}

/**
 * @function formatHeader
 * @description Format the header content with consistent line breaks and a single contributors section
 */
export function formatHeader(headerConfig: HeaderConfig, contributors: string | null, fileDoc: string | null): string {
  try {
    const lines = [];
    
    if (fileDoc) {
      lines.push(fileDoc);
      lines.push('');
    }
    
    // Remove any existing Contributors section from the template
    const templateWithoutContributors = headerConfig.template
      .replace(/\s*Contributors\s*-+[\s\S]*?(?=\s*$)/, '')
      .trim();
    
    lines.push(templateWithoutContributors);

    // Add a single Contributors section with all contributors
    if (contributors) {
      lines.push(
        '',
        'Contributors',
        '--------------',
        'This is the official list of the Mojaloop project contributors for this file.',
        'Names of the original copyright holders (individuals or organizations)',
        'should be listed with a \'*\' in the first column. People who have',
        'contributed from an organization can be listed under the organization',
        'that actually holds the copyright for their contributions (see the',
        'Mojaloop Foundation for an example). Those individuals should have',
        'their names indented and be marked with a \'-\'. Email address can be added',
        'optionally within square brackets <email>.',
        '',
        '* Mojaloop Foundation',
        '- Name Surname <name.surname@mojaloop.io>',
        '',
        // Add existing contributors without any headers or descriptions
        contributors.replace(/This is the official list[\s\S]*?optionally within square brackets <email>\.\s*/g, '')
          .replace(/Contributors\s*-+\s*/g, '')
          .trim()
      );
    }

    return lines.join('\n');
  } catch (err) {
    throw new HeaderError('Failed to format header content', err as Error);
  }
}

/**
 * @function processFileContent
 * @description Process a single file's content - only replace existing header, never add new ones
 */
export function processFileContent(content: string, headerConfig: HeaderConfig): string {
  const startDelimiter = headerConfig.startDelimiter || '/*****';
  const endDelimiter = headerConfig.endDelimiter || '*****/';
  
  // Check if file already has a header between delimiters
  const escapedStart = escapeRegExp(startDelimiter);
  const escapedEnd = escapeRegExp(endDelimiter);
  const headerRegex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}\\s*`);
  
  // Only process files that have an existing header
  if (!headerRegex.test(content)) {
    Logger.info('No existing header found - skipping file');
    return content;
  }

  // Check if the existing header contains Mojaloop Foundation
  const existingHeader = content.match(headerRegex)?.[0] || '';
  if (existingHeader.includes('Mojaloop Foundation')) {
    Logger.info('File already has a Mojaloop Foundation header - skipping file');
    return content;
  }

  // Extract existing contributors if present
  const existingContributors = extractContributors(content);
  if (existingContributors) {
    Logger.info('Found existing contributors section');
    Logger.debug(`Contributors: ${existingContributors}`);
  }
  
  // Extract @file documentation if present
  const fileDoc = extractFileDocumentation(content);
  if (fileDoc) {
    Logger.info('Found @file documentation');
    Logger.debug(`File documentation: ${fileDoc}`);
  }
  
  // Format the header with contributors and file documentation if present
  const headerContent = formatHeader(headerConfig, existingContributors, fileDoc);
  
  Logger.info('Found existing header - replacing');
  // Replace existing header
  return content.replace(headerRegex, `${startDelimiter}\n${headerContent}\n${endDelimiter}\n\n`);
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
    const branchName = `${headerConfig.branchName || 'chore/update-file-headers'}-${timestamp}`;

    for (const repo of repos) {
      try {
        Logger.info(`Processing repository: ${repo.owner}/${repo.repo}`);

        // Create a new branch for the changes
        await githubOps.createBranch(repo.owner, repo.repo, branchName, headerConfig.baseBranches || ['main', 'master']);

        // Process JavaScript and TypeScript files in the repository
        await githubOps.processFiles(
          repo,
          branchName,
          '\\.(js|ts)$',
          (content: string) => processFileContent(content, headerConfig)
        );

        // Create PR if changes were made
        await githubOps.createPullRequest(
          repo.owner,
          repo.repo,
          'chore(headers): update file headers',
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