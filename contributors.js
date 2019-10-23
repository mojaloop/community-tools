#!/usr/bin/env node

const AccessToken = process.env.ACCESS_TOKEN
const request = require('request-promise-native')
const { repos } = require ('./data')

const baseUrl = `https://api.github.com/repos/mojaloop`


const sum = (a, b) => a + b
const unique = (array) => {
  const obj = {}
  array.forEach(v => obj[v] = true)
  return Object.keys(obj)
}

async function getPRList() {
  const collabs = await Promise.all(repos.map(async r => {
    const url = `${baseUrl}/${r}/contributors`
    // const url = `${baseUrl}/${r}/collaborators`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${AccessToken}`,
      },
      json: true
    }

    const response = await request(options)
    const collaborators = response.map(r => r.login)
    // const contributions = response.map(r => r.contributions).reduce(sum, 0)
    // console.log(`total contributions for ${r} is`, contributions)
    return collaborators
  }))

  return collabs.reduce((a, c) => a.concat(c), [])
}

async function getContributorsForks() {
  const collabs = await Promise.all(repos.map(async r => {
    const url = `${baseUrl}/${r}/forks`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${AccessToken}`,
      },
      json: true
    }

    const response = await request(options)
    const collaborators = response.map(r => r.owner.login)
    // const contributions = response.map(r => r.contributions).reduce(sum, 0)
    // console.log(`total contributions for ${r} is`, contributions)
    return collaborators
  }))

  return collabs.reduce((a, c) => a.concat(c), [])
}

async function getIssuesContributors() {
  const url = `${baseUrl}/project/issues`
  const options = {
    url,
    headers: {
      accept: 'application/vnd.github.v3+json',
      'User-Agent': 'Awesome-Octocat-App',
      Authorization: `token ${AccessToken}`,
    },
    json: true
  }

  const response = await request(options)
  // const collaborators = response.map(r => r.login)

  console.log(response)
}



async function main() {
  const prList = await getPRList()
  const forkList = await getContributorsForks()
  // const issueContributor = await getIssuesContributors()

  console.log('unique PR', unique(prList).length)
  console.log('unique forks', unique(forkList).length)

  console.log('unique contributors from PRs and forks: ', unique(prList.concat(forkList)).length)

  // console.log('Total unique contributors across all projects is:', masterContributorCount)
}

main()