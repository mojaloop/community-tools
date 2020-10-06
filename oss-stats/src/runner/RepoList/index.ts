import fs from 'fs'

import { Repos } from '../../lib'


export type RepoListConfigType = {
  // Fields to be exported, ignored for now for simplicity
  fields: string[],

  // The path + filename of the output .csv file
  output: string, 

  // Should we skip archived repos?
  skipArchived: boolean

  minForkCount: number,

  // a list repos to filter out
  ignore: string[]
}

// For now, this just prints a csv file of all the Mojaloop repos
async function run(config: RepoListConfigType) {
  let repos = await Repos.getRepoList()
  console.log(`Found: ${repos.length} total repos.`)

  /*
    Rows we want:
    - name
    - private
    - description
    - archived
    - forks_count (a good indication of how active the repo is)
  */
  const fieldNames = `${config.fields.reduce((acc, curr, idx) => {
    if (idx === 0) {
      return `${curr}`
    }
   
    return acc + ',' + curr
  }, '')}\n`

  const fieldBuffer = Buffer.from(fieldNames)
  
  repos = repos
    .filter(r => r.forks_count >= config.minForkCount) // Filter min forks
    .filter(r => config.ignore.indexOf(r.name) === -1) // Filter by ignore list

  // Filter by archived
  if (config.skipArchived) {
    repos = repos.filter(r => !r.archived)
  }

  // Order by forks, to make the list more useful
  repos.sort((a: any, b: any) => b.forks_count - a.forks_count)

  console.log(`After filter: ${repos.length} repos.`)

  const rowBuffers = repos.map((r: any) => {
    return Buffer.from(`${r.name},${r.private},"${r.description}",${r.archived},${r.forks_count}\n`)
  })
  rowBuffers.unshift(fieldBuffer)
  const buffer = Buffer.concat(rowBuffers)

  fs.writeFileSync(config.output, buffer)
}

export default {
  run
}