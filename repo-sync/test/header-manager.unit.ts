import { processFileContent, validateHeaderConfig, updateSourceHeaders, extractContributors, extractFileDocumentation, formatHeader } from '../src/lib/header-manager'
import { GitHubOps } from '../src/lib/github-ops'
import { Repo } from '../src/lib/types'
import { expect } from '@jest/globals'
import { HeaderConfig } from '../src/lib/header-manager'

// @ts-ignore - jest is available in test environment
jest.mock('@mojaloop/central-services-logger')
// @ts-ignore - jest is available in test environment
jest.mock('../src/lib/github-ops')

// @ts-ignore - describe is available in test environment
describe('header-manager', () => {
  // @ts-ignore - describe is available in test environment
  describe('validateHeaderConfig', () => {
    // @ts-ignore - it is available in test environment
    it('should validate correct header config', () => {
      const headerConfig: HeaderConfig = {
        template: 'Test Template'
      }
      validateHeaderConfig(headerConfig)
      expect(headerConfig.startDelimiter).toBe('/*****')
      expect(headerConfig.endDelimiter).toBe('*****/')
    })

    // @ts-ignore - it is available in test environment
    it('should throw error for missing template', () => {
      const headerConfig = {} as HeaderConfig
      expect(() => validateHeaderConfig(headerConfig)).toThrow('template is required')
    })

    // @ts-ignore - it is available in test environment
    it('should set default delimiters if not provided', () => {
      const headerConfig: HeaderConfig = {
        template: 'Test Template'
      }
      validateHeaderConfig(headerConfig)
      expect(headerConfig.startDelimiter).toBe('/*****')
      expect(headerConfig.endDelimiter).toBe('*****/')
    })
  })

  // @ts-ignore - describe is available in test environment
  describe('processFileContent', () => {
    // @ts-ignore - it is available in test environment
    it('should replace existing header', () => {
      const content = `/*****
      Old License
      Old Contributors
      *****/`
      const headerConfig: HeaderConfig = {
        template: 'New Header',
        startDelimiter: '/*****',
        endDelimiter: '*****/'
      }
      const result = processFileContent(content, headerConfig)
      expect(result).toContain('New Header')
      expect(result).not.toContain('Old License')
    })

    // @ts-ignore - it is available in test environment
    it('should handle custom delimiters', () => {
      const content = `<!--
      Old License
      Old Contributors
      -->`
      const headerConfig: HeaderConfig = {
        template: 'New Header',
        startDelimiter: '<!--',
        endDelimiter: '-->'
      }
      const result = processFileContent(content, headerConfig)
      expect(result).toContain('<!--')
      expect(result).toContain('New Header')
      expect(result).toContain('-->')
      expect(result).not.toContain('Old License')
    })

    // @ts-ignore - it is available in test environment
    it('should handle varying numbers of asterisks in delimiters', () => {
      const content = `/*****
      License
      Contributors
      --------------
      * Organization A
      - Contributor 1
      *****/`

      const headerConfig: HeaderConfig = {
        template: 'New Header',
        startDelimiter: '/*****',
        endDelimiter: '*****/'
      }

      const result = processFileContent(content, headerConfig)
      expect(result).toContain('/*****')
      expect(result).toContain('*****/')
      expect(result).toContain('New Header')

      // Test with more asterisks
      const contentWithMoreAsterisks = `/********
      License
      Contributors
      --------------
      * Organization A
      - Contributor 1
      ********/`

      const resultWithMoreAsterisks = processFileContent(contentWithMoreAsterisks, headerConfig)
      expect(resultWithMoreAsterisks).toContain('/*****')
      expect(resultWithMoreAsterisks).toContain('*****/')
      expect(resultWithMoreAsterisks).toContain('New Header')
    })

    // @ts-ignore - it is available in test environment
    it('should skip files without existing headers', () => {
      const content = 'Some content'
      const headerConfig: HeaderConfig = {
        template: 'New Header',
        startDelimiter: '/*****',
        endDelimiter: '*****/'
      }
      const result = processFileContent(content, headerConfig)
      expect(result).toBe(content)
      expect(result).not.toContain('/*****')
      expect(result).not.toContain('New Header')
      expect(result).not.toContain('*****/')
    })
  })

  // @ts-ignore - describe is available in test environment
  describe('updateSourceHeaders', () => {
    let mockGithubOps: jest.Mocked<GitHubOps>
    let repos: Repo[]
    let headerConfig: any

    // @ts-ignore - beforeEach is available in test environment
    beforeEach(() => {
      mockGithubOps = {
        createBranch: jest.fn().mockResolvedValue(undefined),
        processFiles: jest.fn().mockResolvedValue(undefined),
        createPullRequest: jest.fn().mockResolvedValue(undefined)
      } as unknown as jest.Mocked<GitHubOps>

      repos = [{
        owner: 'test-owner',
        repo: 'test-repo'
      }]

      headerConfig = {
        template: 'Test License',
        branchName: 'test-branch'
      }
    })

    // @ts-ignore - it is available in test environment
    it('should throw error for empty repos array', async () => {
      // @ts-ignore - expect is available in test environment
      await expect(updateSourceHeaders(mockGithubOps, [], headerConfig))
        .rejects
        .toThrow('At least one repository must be specified')
    })

    // @ts-ignore - it is available in test environment
    it('should process repositories successfully', async () => {
      await updateSourceHeaders(mockGithubOps, repos, headerConfig)

      // @ts-ignore - expect is available in test environment
      expect(mockGithubOps.createBranch).toHaveBeenCalledWith(
        'test-owner',
        'test-repo',
        expect.stringContaining('test-branch'),
        ['main', 'master']
      )
      // @ts-ignore - expect is available in test environment
      expect(mockGithubOps.processFiles).toHaveBeenCalled()
      // @ts-ignore - expect is available in test environment
      expect(mockGithubOps.createPullRequest).toHaveBeenCalled()
    })

    // @ts-ignore - it is available in test environment
    it('should handle errors during repository processing', async () => {
      mockGithubOps.processFiles.mockRejectedValueOnce(new Error('Process failed'))

      // @ts-ignore - expect is available in test environment
      await expect(updateSourceHeaders(mockGithubOps, repos, headerConfig))
        .rejects
        .toThrow('Failed to update headers in some repositories')
    })
  })

  // @ts-ignore - describe is available in test environment
  describe('extractContributors', () => {
    // @ts-ignore - it is available in test environment
    it('should extract contributors from header', () => {
      const content = `/*
      License
      Contributors
      --------------
      * Organization A
      - Contributor 1
      - Contributor 2
      */
      console.log("test");`

      const result = extractContributors(content)

      // @ts-ignore - expect is available in test environment
      expect(result).toContain('* Organization A')
      // @ts-ignore - expect is available in test environment
      expect(result).toContain('- Contributor 1')
      // @ts-ignore - expect is available in test environment
      expect(result).toContain('- Contributor 2')
    })

    // @ts-ignore - it is available in test environment
    it('should filter out Gates Foundation entries', () => {
      const content = `/*
      License
      Contributors
      --------------
      * Gates Foundation
      - Gates Contributor
      * Organization A
      - Contributor 1
      */
      console.log("test");`

      const result = extractContributors(content)

      // @ts-ignore - expect is available in test environment
      expect(result).not.toContain('Gates Foundation')
      // @ts-ignore - expect is available in test environment
      expect(result).not.toContain('Gates Contributor')
      // @ts-ignore - expect is available in test environment
      expect(result).toContain('* Organization A')
    })

    // @ts-ignore - it is available in test environment
    it('should return null when no contributors section exists', () => {
      const content = `/*
      License
      */
      console.log("test");`

      const result = extractContributors(content)

      // @ts-ignore - expect is available in test environment
      expect(result).toBeNull()
    })
  })

  // @ts-ignore - describe is available in test environment
  describe('extractFileDocumentation', () => {
    // @ts-ignore - it is available in test environment
    it('should extract @file documentation', () => {
      const content = `/*
      @file This is a test file
      License
      */
      console.log("test");`

      const result = extractFileDocumentation(content)

      // @ts-ignore - expect is available in test environment
      expect(result).toBe('@file This is a test file')
    })

    // @ts-ignore - it is available in test environment
    it('should return null when no @file documentation exists', () => {
      const content = `/*
      License
      */
      console.log("test");`

      const result = extractFileDocumentation(content)

      // @ts-ignore - expect is available in test environment
      expect(result).toBeNull()
    })
  })

  // @ts-ignore - describe is available in test environment
  describe('formatHeader', () => {
    // @ts-ignore - it is available in test environment
    it('should format header with file documentation and contributors', () => {
      const headerConfig = {
        template: 'License\n--------\nTest License',
        startDelimiter: '/*',
        endDelimiter: '*/'
      }
      const fileDoc = '@file Test file'
      const contributors = '* Organization A\n- Contributor 1'

      const result = formatHeader(headerConfig, contributors, fileDoc)

      // @ts-ignore - expect is available in test environment
      expect(result).toContain('@file Test file')
      // @ts-ignore - expect is available in test environment
      expect(result).toContain('License')
      // @ts-ignore - expect is available in test environment
      expect(result).toContain('* Organization A')
      // @ts-ignore - expect is available in test environment
      expect(result).toContain('- Contributor 1')
    })

    // @ts-ignore - it is available in test environment
    it('should format header without file documentation or contributors', () => {
      const headerConfig = {
        template: 'License\n--------\nTest License',
        startDelimiter: '/*',
        endDelimiter: '*/'
      }

      const result = formatHeader(headerConfig, null, null)

      // @ts-ignore - expect is available in test environment
      expect(result).toContain('License')
      // @ts-ignore - expect is available in test environment
      expect(result).not.toContain('@file')
      // @ts-ignore - expect is available in test environment
      expect(result).not.toContain('Contributors')
    })
  })
}) 