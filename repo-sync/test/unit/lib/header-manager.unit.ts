import fs from 'fs'
import path from 'path'
import { updateSourceHeaders } from '../../../src/lib/header-manager'
import { Repo } from '../../../src/lib/types'

// Mock fs
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn()
  }
}))

// Mock files module
jest.mock('../../../src/lib/files', () => ({
  matchedFilesForDir: jest.fn()
}))

// Mock Logger
jest.mock('@mojaloop/central-services-logger', () => ({
  error: jest.fn(),
  info: jest.fn()
}))

// @ts-ignore
import { matchedFilesForDir } from '../../../src/lib/files'

describe('header-manager', () => {
  const mockRepo: Repo = {
    owner: 'mojaloop',
    repo: 'ml-schema-validator'
  }

  const headerConfig = {
    template: `License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")`,
    startDelimiter: '/*****',
    endDelimiter: '******/'
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('updateSourceHeaders', () => {
    it('should process files in the repository', async () => {
      const testDir = process.cwd();
      const testFile1 = path.join(testDir, 'src/lib/header-manager.js');
      const testFile2 = path.join(testDir, 'src/lib/files.js');
      const mockFiles = [testFile1, testFile2];
      
      ;(matchedFilesForDir as jest.Mock).mockResolvedValue(mockFiles)

      // Mock file content without existing header
      const mockContent = 'function test() { console.log("test") }'
      ;(fs.promises.readFile as jest.Mock).mockResolvedValue(mockContent)
      ;(fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined)

      await updateSourceHeaders(testDir, [mockRepo], headerConfig)

      // Should have searched for JS files
      expect(matchedFilesForDir).toHaveBeenCalledWith(
        path.join(testDir, mockRepo.repo),
        ['**/*.js']
      )

      // Should have read both files
      expect(fs.promises.readFile).toHaveBeenCalledTimes(2)
      expect(fs.promises.readFile).toHaveBeenCalledWith(testFile1, 'utf8')
      expect(fs.promises.readFile).toHaveBeenCalledWith(testFile2, 'utf8')

      // Should have written both files with new header
      expect(fs.promises.writeFile).toHaveBeenCalledTimes(2)
      const expectedContent = [
        '/*****',
        'License',
        '--------------',
        'Copyright © 2020-2025 Mojaloop Foundation',
        'The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")',
        '******/',
        '',
        'function test() { console.log("test") }'
      ].join('\n')
      expect(fs.promises.writeFile).toHaveBeenCalledWith(testFile1, expectedContent, 'utf8')
      expect(fs.promises.writeFile).toHaveBeenCalledWith(testFile2, expectedContent, 'utf8')
    })

    it('should replace existing header while preserving content', async () => {
      const testDir = process.cwd();
      const testFile = path.join(testDir, 'src/lib/header-manager.ts');
      const mockFiles = [testFile];
      
      ;(matchedFilesForDir as jest.Mock).mockResolvedValue(mockFiles)

      // Mock file content with existing header
      const existingContent = `/*****
Old header content
******/

function test() { console.log("test") }`
      ;(fs.promises.readFile as jest.Mock).mockResolvedValue(existingContent)
      ;(fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined)

      await updateSourceHeaders(testDir, [mockRepo], headerConfig)

      // Should have written file with replaced header
      expect(fs.promises.writeFile).toHaveBeenCalledTimes(1)
      const expectedContent = [
        '/*****',
        'License',
        '--------------',
        'Copyright © 2020-2025 Mojaloop Foundation',
        'The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")',
        '******/',
        '',
        'function test() { console.log("test") }'
      ].join('\n')
      expect(fs.promises.writeFile).toHaveBeenCalledWith(testFile, expectedContent, 'utf8')
    })

    it('should handle errors gracefully', async () => {
      const testDir = process.cwd();
      const testFile = path.join(testDir, 'src/lib/header-manager.ts');
      const mockFiles = [testFile];
      
      ;(matchedFilesForDir as jest.Mock).mockResolvedValue(mockFiles)

      // Mock a file read error
      const mockError = new Error('Failed to read file')
      ;(fs.promises.readFile as jest.Mock).mockRejectedValue(mockError)

      // The error should be propagated
      await expect(updateSourceHeaders(testDir, [mockRepo], headerConfig))
        .rejects
        .toThrow('Failed to read file')
    })

    it('should preserve existing contributors section', async () => {
      const testDir = process.cwd();
      const testFile = path.join(testDir, 'src/lib/header-manager.ts');
      const mockFiles = [testFile];
      
      ;(matchedFilesForDir as jest.Mock).mockResolvedValue(mockFiles)

      // Mock file content with existing header including contributors
      const existingContent = `/*****
License
--------------
Copyright © 2017 Bill & Melinda Gates Foundation

Contributors
--------------
* Gates Foundation
- John Doe <john.doe@gatesfoundation.com>

* ModusBox
- Jane Smith <jane.smith@modusbox.com>
******/

function test() { console.log("test") }`
      ;(fs.promises.readFile as jest.Mock).mockResolvedValue(existingContent)
      ;(fs.promises.writeFile as jest.Mock).mockResolvedValue(undefined)

      await updateSourceHeaders(testDir, [mockRepo], headerConfig)

      // Should preserve the contributors section while updating the license part
      const expectedContent = [
        '/*****',
        'License',
        '--------------',
        'Copyright © 2020-2025 Mojaloop Foundation',
        'The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")',
        '',
        'Contributors',
        '--------------',
        '* Gates Foundation',
        '- John Doe <john.doe@gatesfoundation.com>',
        '',
        '* ModusBox',
        '- Jane Smith <jane.smith@modusbox.com>',
        '******/',
        '',
        'function test() { console.log("test") }'
      ].join('\n')

      expect(fs.promises.writeFile).toHaveBeenCalledWith(testFile, expectedContent, 'utf8')
    })
  })
}) 