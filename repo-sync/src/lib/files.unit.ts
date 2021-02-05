import fs from 'fs'
import { matchedFilesForDir } from "./files"

describe('files', () => {
  describe('matchedFilesForDir', () => {
    const dirName = '/tmp/matchedFilesTest'
    const subDirName = `${dirName}/.circleci`
    const filesToMake = [
      `${dirName}/test1.md`,
      `${dirName}/test2.js`,
      `${dirName}/TEST3.md`,
      `${subDirName}/config.yml`,
      `${subDirName}/config.yaml`,
      `${subDirName}/anotherfile.yaml`,
    ]

    beforeAll(() => {
      fs.mkdirSync(dirName)
      fs.mkdirSync(subDirName)
      filesToMake.forEach(f => fs.writeFileSync(f, 'test1'))
    })

    afterAll(() => {
      fs.rmdirSync(dirName, { recursive: true })
    })

    it('matches files for a single entry in matchFilesList', async () => {
      // Arrange
      const matchFilesList = [ '*.md']
      const expected = [
        `${dirName}/test1.md`,
        `${dirName}/TEST3.md`,
      ]
      
      // Act
      const results = await matchedFilesForDir(dirName, matchFilesList)
      
      // Assert
      expect(results).toStrictEqual(expected)
    })

    it('matches nested files', async () => {
      // Arrange
      const matchFilesList = ['/.circleci/config.*']
      const expected = [
        `${subDirName}/config.yaml`,
        `${subDirName}/config.yml`,
      ]

      // Act
      const results = await matchedFilesForDir(dirName, matchFilesList)

      // Assert
      expect(results).toStrictEqual(expected)
    })
  })
})