import Octokit from '@octokit/rest'
import { spawnSync } from 'child_process'
const request = require('request-promise-native')

// TODO: deprecated, use octokit instead
const baseUrl = `https://api.github.com/repos/mojaloop`

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

/**
 * @function getContributorsForks
 * @description Gets a list of all mojaloop forks
 * TODO: update this to use octokit instead
 */
async function getContributorsForks(repos: Array<string>) {
  const collabs = await Promise.all(repos.map(async r => {
    const url = `${baseUrl}/${r}/forks`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      json: true
    }

    const response = await request(options)
    const collaborators = response.map((r: any) => r.owner.login)
    return collaborators
  }))

  return collabs.reduce((a, c) => a.concat(c), [])
}

/**
 * @function getIssuesContributors
 * @description Gets a list of all contributors who have made issues
 * TODO: update this to use octokit instead
 */
async function getIssuesContributors() {
  let contributors: Array<any> = []
  let next = '?state=all&per_page=50&page=1'
  let last = ''

  let count = 0
  while (next !== last) {
    // while (count < 100) {
    console.log('getting next: ', next)
    const url = `${baseUrl}/project/issues${next}`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      json: true,
      resolveWithFullResponse: true
    }

    const { headers: { link }, body } = await request(options)
    let iterContributors: Array<any> = []

    //Add creators and assignees
    body.forEach((i: any) => {
      iterContributors.push(i.user.login)
      if (i.assignees.length > 0) {
        iterContributors = iterContributors.concat(i.assignees.map((a: any) => a.login))
      }
    })
    contributors = contributors.concat(iterContributors)

    // link e.g.: <https://api.github.com/repositories/116650553/issues?per_page=20&page=1>; rel="prev", <https://api.github.com/repositories/116650553/issues?per_page=20&page=3>; rel="next", <https://api.github.com/repositories/116650553/issues?per_page=20&page=12>; rel="last", <https://api.github.com/repositories/116650553/issues?per_page=20&page=1>; rel="first"
    const matches = link.match(/(\?.*?)(?:>)/g).map((s: string) => s.replace('>', ''))
    //ew this is hacky
    if (count === 0) {
      next = matches[0]
      last = matches[1]
    } else {
      next = matches[1]
      last = matches[2]
    }

    count += 1
  }

  return contributors
}

/**
 * @function getMasterCommitCount
 * @description Gets a list of all commits across repos on mojaloop
 * TODO: update this to use octokit instead
 */
async function getMasterCommitCount(repos: Array<string>) {
  const counts = await Promise.all(repos.map(async r => {
    const url = `${baseUrl}/${r}/contributors`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      json: true
    }

    const response = await request(options)
    const contributions = response.map((r: any) => r.contributions).reduce(sum, 0)
    console.log(`total contributions for ${r} is`, contributions)
    return contributions
  }))

  console.log(counts)

  return counts.reduce(sum, 0)
}

/**
 * @function getPRList
 * @description Gets a list of all mojaloop prs
 * TODO: update this to use octokit instead
 */
async function getPRList(repos: Array<string>) {
  const collabs = await Promise.all(repos.map(async r => {
    const url = `${baseUrl}/${r}/contributors`
    // const url = `${baseUrl}/${r}/collaborators`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      json: true
    }

    const response = await request(options)
    const collaborators = response.map((r: any) => r.login)
    // const contributions = response.map(r => r.contributions).reduce(sum, 0)
    // console.log(`total contributions for ${r} is`, contributions)
    return collaborators
  }))

  return collabs.reduce((a, c) => a.concat(c), [])
}

/**
 * @function getRepoList
 * @description Gets a list of all repos
 */
async function getRepoList() {
  return octokit.paginate("GET /orgs/:org/repos", {
    org: 'mojaloop',
    type: 'all'
  })
}

function runShellCommand(...args: any) {
  console.log('Running command:', args)

  // @ts-ignore
  const cmd = spawnSync(...args);
  if (cmd.error) {
    console.log(cmd.error)
    throw cmd.error
  }

  if (cmd.stderr && cmd.stderr.toString().length > 0) {
    console.log(`stderr: ${cmd.stderr.toString()}`);
  }
}

const sum = (a: any, b: any) => a + b

const unique = (array: Array<any>) => {
  const obj: {[index: string]: any} = {}
  array.forEach(v => obj[v] = true)
  return Object.keys(obj)
}

export {
  getContributorsForks,
  getIssuesContributors,
  getMasterCommitCount,
  getPRList,
  getRepoList,
  runShellCommand,
  sum,
  unique
}