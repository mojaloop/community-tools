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
  let contributors = []
  let next = '?state=all&per_page=50&page=1'
  let last = ''
  
  let count = 0
  //TODO: this misses the last iteration
  //TODO: this seems to only get 12 * 20 = 240 issues, not the 1000+
  while (next !== last) {
  // while (count < 100) {
    console.log('getting next: ', next)
    const url = `${baseUrl}/project/issues${next}`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${AccessToken}`,
      },
      json: true,
      resolveWithFullResponse: true
    }

    const { headers: { link }, body } = await request(options)
    let iterContributors = []

    //Add creators and assignees
    body.forEach(i => {
      iterContributors.push(i.user.login)
      if (i.assignees.length > 0) {
        iterContributors = iterContributors.concat(i.assignees.map(a => a.login))
      }
    })
    contributors = contributors.concat(iterContributors)

    console.log('link', link)

    // link e.g.: <https://api.github.com/repositories/116650553/issues?per_page=20&page=1>; rel="prev", <https://api.github.com/repositories/116650553/issues?per_page=20&page=3>; rel="next", <https://api.github.com/repositories/116650553/issues?per_page=20&page=12>; rel="last", <https://api.github.com/repositories/116650553/issues?per_page=20&page=1>; rel="first"
    const matches = link.match(/(\?.*?)(?:>)/g).map(s => s.replace('>', ''))
    //ew this is hacky
    if (count === 0) {
      next = matches[0]
      last = matches[1] 
    } else {
      next = matches[1]
      last = matches[2] 
    }

    count+=1
  } 

  return contributors
}



async function main() {
  const prList = await getPRList()
  const forkList = await getContributorsForks()
  const issueContributor = await getIssuesContributors()
  // console.log('issueContributor', unique(issueContributor))

  console.log('unique PR', unique(prList).length)
  console.log('unique forks', unique(forkList).length)
  console.log('unique issues', unique(issueContributor).length)


  console.log('unique contributors from PRs and forks: ', unique(prList.concat(forkList.concat(issueContributor))).length)

  // console.log('Total unique contributors across all projects is:', masterContributorCount)
}

main()