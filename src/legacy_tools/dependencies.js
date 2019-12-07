#!/usr/bin/env node

const { repos } = require ('./data')
const repoDir = '/Users/lewisdaly/developer/vessels/mojaloop/license-scanner/checked_out'

const sum = (a, b) => a + b

const unique = (array) => {
  const obj = {}
  array.forEach(v => obj[v] = true)
  return Object.keys(obj)
}

async function getModulesForPackage(package) {
  const masterList = repos.map(r => {
    let packageJson = []
    try {
      packageJson = require(`${repoDir}/${r}/${package}`)
    } catch (err) {
      console.log(`couldn't find ${package} in ${repoDir}/${r}/${package}`)
    }

    if (!packageJson) {
      try {
        packageJson = require(`${repoDir}/${r}/src/${package}`)
        console.log(`found it in: ${repoDir}/${r}/src/${package}`)
      } catch (err) {
        console.log(`couldn't find ${package} in ${repoDir}/${r}/src/${package}. skipping`)
      }
    }

    if (!packageJson || !packageJson.dependencies) {
      return []
    }
    
    return Object.keys(packageJson.dependencies)
  }).reduce((a, c) => a.concat(c), [])

  return masterList
}

async function main() {
  const modules = await getModulesForPackage('package.json')
  const totalCount = modules.length
  const uniqueCount = unique(modules).length

  console.log(`Total first-level module dependencies:  ${totalCount}`)
  console.log(`Unique first-level module dependencies: ${uniqueCount}`)

  const allModules = await getModulesForPackage('package-lock.json')
  const totalAllModules = allModules.length
  const uniqueCountAllModules = unique(allModules).length

  console.log(`Total module dependencies:  ${totalAllModules}`)
  console.log(`Unique module dependencies: ${uniqueCountAllModules}`)
}

main()