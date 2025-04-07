import { GitHubOps } from './github-ops'
import { Octokit } from '@octokit/rest'

jest.mock('@octokit/rest')

// Define the mock response types
interface MockGetContentResponse {
  data: {
    content: string;
    sha: string;
  };
}

interface MockUpdateResponse {
  data: Record<string, unknown>;
}

// Define mock function types
type MockGetContentFn = jest.Mock<Promise<MockGetContentResponse>, [any]>
type MockUpdateFileFn = jest.Mock<Promise<MockUpdateResponse>, [any]>

describe('GitHubOps', () => {
  let githubOps: GitHubOps
  let mockGetContent: MockGetContentFn
  let mockUpdateFile: MockUpdateFileFn

  beforeEach(() => {
    // Create mock functions
    mockGetContent = jest.fn()
    mockUpdateFile = jest.fn()

    // Create a properly typed mock
    const mockOctokit = {
      repos: {
        getContent: mockGetContent,
        createOrUpdateFileContents: mockUpdateFile
      }
    } as unknown as Octokit
    
    githubOps = new GitHubOps(mockOctokit)
  })

  describe('getFileContent', () => {
    it('should fetch file content using Octokit', async () => {
      const mockContent = 'test content'
      mockGetContent.mockReturnValue(Promise.resolve({
        data: {
          content: Buffer.from(mockContent).toString('base64'),
          sha: 'sha123'
        }
      }))

      const result = await githubOps.getFileContent('owner', 'repo', 'path/to/file')

      expect(mockGetContent).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        path: 'path/to/file'
      })
      expect(result.content).toBe(mockContent)
      expect(result.sha).toBe('sha123')
    })
  })

  describe('updateFile', () => {
    it('should update file content using Octokit', async () => {
      const content = 'new content'
      mockUpdateFile.mockReturnValue(Promise.resolve({ data: {} }))

      await githubOps.updateFile('owner', 'repo', 'path/to/file', content, 'main', 'Update file', 'sha123')

      expect(mockUpdateFile).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        path: 'path/to/file',
        message: 'Update file',
        content: Buffer.from(content).toString('base64'),
        branch: 'main',
        sha: 'sha123'
      })
    })
  })
}) 