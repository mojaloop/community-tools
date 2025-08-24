import fs from 'fs'
import { Repos } from '../../lib'

export type RepoListConfigType = {
  // Fields to be exported, ignored for json output
  fields: string[],

  // The path + filename of the output .csv file
  output: string, 

  // Should we skip archived repos?
  skipArchived: boolean

  // filter out repos without forks
  minForkCount: number,

  // a list repos to filter out
  ignore: string[]

  // format of output file
  fileFormat: 'json' | 'csv',
}

// For now, this just prints a csv file of all the Mojaloop repos
async function run(config: RepoListConfigType) {
  let repos = await Repos.getRepoList()
  console.log(`Found: ${repos.length} total repos.`)

  repos = repos
    // @ts-ignore
    .filter(r => r.forks_count >= config.minForkCount) // Filter min forks
    // @ts-ignore
    .filter(r => config.ignore.indexOf(r.name) === -1) // Filter by ignore list

  // Filter by archived
  if (config.skipArchived) {
    // @ts-ignore
    repos = repos.filter(r => !r.archived)
  }
  // Order by forks, to make the list more useful
  repos.sort((a: any, b: any) => b.forks_count - a.forks_count)

  console.log(`After filter: ${repos.length} repos.`)

  const fileBuffer = _getFileForFormat(repos, config.fields, config.fileFormat)
  fs.writeFileSync(config.output, fileBuffer)
}

function _getFileForFormat(repos: any[], fields: string[], fileFormat: 'csv' | 'json') {
  switch (fileFormat) {
    case 'csv': {
      const fieldNames = `${fields.reduce((acc, curr, idx) => {
        if (idx === 0) {
          return `${curr}`
        }

        return acc + ',' + curr
      }, '')}\n`

      const fieldBuffer = Buffer.from(fieldNames)

      const rowBuffers = repos.map((r: any) => {
        return Buffer.from(`${r.name},${r.private},"${r.description}",${r.archived},${r.forks_count}\n`)
      })
      rowBuffers.unshift(fieldBuffer)
      return Buffer.concat(rowBuffers)
    }

    case 'json': {
      return Buffer.from(JSON.stringify(repos.map(r => r.name), null, 2))
    }
    default: throw new Error(`unhandled fileFormat: ${fileFormat}`)
  }
}

export default {
  run
}