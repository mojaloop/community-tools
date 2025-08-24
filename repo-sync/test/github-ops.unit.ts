import { GitHubOps } from '../src/lib/github-ops'
import { Octokit } from '@octokit/rest'

// @ts-ignore - jest is available in test environment
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
// @ts-ignore - jest.Mock is available in test environment
type MockGetContentFn = jest.Mock<Promise<MockGetContentResponse>, [any]>
// @ts-ignore - jest.Mock is available in test environment
type MockUpdateFileFn = jest.Mock<Promise<MockUpdateResponse>, [any]>

// @ts-ignore - describe is available in test environment
describe('GitHubOps', () => {
  let githubOps: GitHubOps
  let mockGetContent: MockGetContentFn
  let mockUpdateFile: MockUpdateFileFn

  // @ts-ignore - beforeEach is available in test environment
  beforeEach(() => {
    // Create mock functions
    // @ts-ignore - jest.fn is available in test environment
    mockGetContent = jest.fn()
    // @ts-ignore - jest.fn is available in test environment
    mockUpdateFile = jest.fn()

    // Create a properly typed mock
    // @ts-ignore - Mocking Octokit instance
    const mockOctokit = {
      repos: {
        getContent: mockGetContent,
        createOrUpdateFileContents: mockUpdateFile
      }
    } as unknown as Octokit
    
    githubOps = new GitHubOps(mockOctokit)
  })

  // @ts-ignore - describe is available in test environment
  describe('getFileContent', () => {
    // @ts-ignore - it is available in test environment
    it('should fetch file content using Octokit', async () => {
      const mockContent = 'test content'
      // @ts-ignore - Mock implementation
      mockGetContent.mockReturnValue(Promise.resolve({
        data: {
          content: Buffer.from(mockContent).toString('base64'),
          sha: 'sha123'
        }
      }))

      const result = await githubOps.getFileContent('owner', 'repo', 'path/to/file')

      // @ts-ignore - expect is available in test environment
      expect(mockGetContent).toHaveBeenCalledWith({
        owner: 'owner',
        repo: 'repo',
        path: 'path/to/file'
      })
      // @ts-ignore - expect is available in test environment
      expect(result.content).toBe(mockContent)
      // @ts-ignore - expect is available in test environment
      expect(result.sha).toBe('sha123')
    })
  })

  // @ts-ignore - describe is available in test environment
  describe('updateFile', () => {
    // @ts-ignore - it is available in test environment
    it('should update file content using Octokit', async () => {
      const content = 'new content'
      // @ts-ignore - Mock implementation
      mockUpdateFile.mockReturnValue(Promise.resolve({ data: {} }))

      await githubOps.updateFile('owner', 'repo', 'path/to/file', content, 'Update file', 'main', 'sha123')

      // @ts-ignore - expect is available in test environment
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