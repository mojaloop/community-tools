import Octokit = require('@octokit/rest');
import { Repo } from './types';
import Logger from '@mojaloop/central-services-logger';

export class GitHubOps {
  private githubApi: Octokit;

  constructor(githubApi: Octokit) {
    this.githubApi = githubApi;
  }

  /**
   * Get the content of a file from a repository
   */
  async getFileContent(owner: string, repo: string, path: string): Promise<{ content: string; sha: string }> {
    try {
      const response = await this.githubApi.repos.getContents({
        owner,
        repo,
        path
      });

      if ('content' in response.data && response.data.content && response.data.sha) {
        return {
          content: Buffer.from(response.data.content, 'base64').toString(),
          sha: response.data.sha
        };
      }
      throw new Error('No content found in response');
    } catch (error) {
      Logger.error(`Failed to get file content: ${error}`);
      throw error;
    }
  }

  /**
   * Create or update a file in a repository
   */
  async updateFile(owner: string, repo: string, path: string, content: string, message: string, branch: string, sha?: string): Promise<void> {
    try {
      await this.githubApi.repos.createOrUpdateFile({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(content).toString('base64'),
        branch,
        sha
      });
    } catch (error) {
      Logger.error(`Failed to update file: ${error}`);
      throw error;
    }
  }

  /**
   * Create a new branch in a repository
   */
  async createBranch(owner: string, repo: string, branch: string, baseBranches: string[] = ['main', 'master']): Promise<void> {
    let lastError: Error | null = null;
    
    for (const baseBranch of baseBranches) {
      try {
        // Get the SHA of the base branch
        const sourceRef = await this.githubApi.git.getRef({
          owner,
          repo,
          ref: `heads/${baseBranch}`
        });

        // Create the new branch
        await this.githubApi.git.createRef({
          owner,
          repo,
          ref: `refs/heads/${branch}`,
          sha: sourceRef.data.object.sha
        });

        Logger.info(`Successfully created branch from ${baseBranch}`);
        return; // Exit if successful
      } catch (error) {
        lastError = error as Error;
        Logger.info(`Failed to create branch from ${baseBranch}, trying next base branch if available`);
      }
    }

    // If we get here, none of the base branches worked
    Logger.error(`Failed to create branch from any of the base branches: ${baseBranches.join(', ')}`);
    throw lastError;
  }

  /**
   * Create a pull request
   */
  async createPullRequest(owner: string, repo: string, title: string, body: string, head: string, baseBranches: string[] = ['main', 'master']): Promise<void> {
    let lastError: Error | null = null;
    
    for (const baseBranch of baseBranches) {
      try {
        const response = await this.githubApi.pulls.create({
          owner,
          repo,
          title,
          body,
          head,
          base: baseBranch,
          maintainer_can_modify: true
        });

        Logger.info(`Created PR against ${baseBranch}: ${response.data.html_url}`);
        return; // Exit if successful
      } catch (error) {
        lastError = error as Error;
        Logger.info(`Failed to create PR against ${baseBranch}, trying next base branch if available`);
      }
    }

    // If we get here, none of the base branches worked
    Logger.error(`Failed to create PR against any of the base branches: ${baseBranches.join(', ')}`);
    throw lastError;
  }

  /**
   * Process files in a repository that match certain criteria
   */
  async processFiles(repo: Repo, branch: string, filePattern: string, processor: (content: string) => string): Promise<void> {
    let filesProcessed = 0;
    let filesUpdated = 0;

    const processDirectory = async (path: string): Promise<void> => {
      try {
        Logger.info(`Scanning directory: ${path || 'root'}`);
        const files = await this.githubApi.repos.getContents({
          owner: repo.owner,
          repo: repo.repo,
          path: path
        });

        // Process each file/directory
        for (const item of Array.isArray(files.data) ? files.data : [files.data]) {
          if (item.type === 'dir') {
            // Recursively process subdirectory
            await processDirectory(item.path);
          } else if (item.type === 'file' && item.name.match(filePattern)) {
            Logger.info(`Checking file: ${item.path}`);
            filesProcessed++;
            
            const { content, sha } = await this.getFileContent(repo.owner, repo.repo, item.path);
            
            // Only process if it contains Gates Foundation header
            if (content.includes('Gates Foundation') || content.includes('Bill & Melinda Gates Foundation')) {
              Logger.info(`Found Gates Foundation header in: ${item.path}`);
              const newContent = processor(content);
              
              // Update the file if content changed
              if (newContent !== content) {
                Logger.info(`Updating file: ${item.path}`);
                await this.updateFile(
                  repo.owner,
                  repo.repo,
                  item.path,
                  newContent,
                  'feat(headers): update file headers to Mojaloop Foundation format',
                  branch,
                  sha
                );
                filesUpdated++;
              } else {
                Logger.info(`No changes needed for: ${item.path}`);
              }
            } else {
              Logger.info(`No Gates Foundation header found in: ${item.path}`);
            }
          }
        }
      } catch (error) {
        Logger.error(`Failed to process directory ${path}: ${error}`);
        throw error;
      }
    };

    try {
      Logger.info(`Processing repository: ${repo.owner}/${repo.repo}`);
      await processDirectory('');

      Logger.info(`Repository ${repo.owner}/${repo.repo} summary:`);
      Logger.info(`- Files processed: ${filesProcessed}`);
      Logger.info(`- Files updated: ${filesUpdated}`);

      if (filesUpdated === 0) {
        throw new Error('No files were updated - no Gates Foundation headers found or no changes needed');
      }
    } catch (error) {
      Logger.error(`Failed to process files: ${error}`);
      throw error;
    }
  }
} 