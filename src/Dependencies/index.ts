import { unique, runShellCommand } from '../lib';

export type DependenciesConfigType = {
  pathToRepos: string,
  reposToClone: Array<string>
}


async function getModulesForPackage(config: DependenciesConfigType, packageName: string) {
  const masterList = config.reposToClone.map(r => {
    let packageJson = []
    try {
      packageJson = require(`${config.pathToRepos}/${r}/${packageName}`)
    } catch (err) {
      console.log(`couldn't find ${packageName} in ${config.pathToRepos}/${r}/${packageName}`)
    }

    if (!packageJson) {
      try {
        packageJson = require(`${config.pathToRepos}/${r}/src/${packageName}`)
        console.log(`found it in: ${config.pathToRepos}/${r}/src/${packageName}`)
      } catch (err) {
        console.log(`couldn't find ${packageName} in ${config.pathToRepos}/${r}/src/${packageName}. skipping`)
      }
    }

    if (!packageJson || !packageJson.dependencies) {
      return []
    }

    return Object.keys(packageJson.dependencies)
  }).reduce((a, c) => a.concat(c), [])

  return masterList
}

async function run(config: DependenciesConfigType) {
  // Clone the repos
  runShellCommand('mkdir', ['-p', config.pathToRepos])
  config.reposToClone.forEach(repoName => runShellCommand(`git`, ['clone', `git@github.com:mojaloop/${repoName}.git`], { cwd: config.pathToRepos }))

  // Count the dependencies
  const modules = await getModulesForPackage(config, 'package.json')
  const totalCount = modules.length
  const uniqueCount = unique(modules).length

  console.log(`Total first-level module dependencies:  ${totalCount}`)
  console.log(`Unique first-level module dependencies: ${uniqueCount}`)

  const allModules = await getModulesForPackage(config, 'package-lock.json')
  const totalAllModules = allModules.length
  const uniqueCountAllModules = unique(allModules).length

  console.log(`Total module dependencies:  ${totalAllModules}`)
  console.log(`Unique module dependencies: ${uniqueCountAllModules}`)
}

async function clean(config: DependenciesConfigType) {
  runShellCommand('rm', ['-rf', config.pathToRepos])
}

export default {
  clean,
  run
}