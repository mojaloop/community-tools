import Octokit from '@octokit/rest'
import { spawnSync } from 'child_process'
const request = require('request-promise-native')

// TODO: deprecated, use octokit instead
const baseUrl = `https://api.github.com/repos/mojaloop`

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

async function getForksForRepo(repo: string): Promise<Array<string>> {
  const url = `${baseUrl}/${repo}/forks`
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
}

/**
 * @function getContributorsForks
 * @description Gets a list of all mojaloop forks
 * TODO: update this to use octokit instead
 */
async function getContributorsForks(repos: Array<string>) {
  // const collabs = await Promise.all(repos.map(async r => {
  //   const url = `${baseUrl}/${r}/forks`
  //   const options = {
  //     url,
  //     headers: {
  //       accept: 'application/vnd.github.v3+json',
  //       'User-Agent': 'Awesome-Octocat-App',
  //       Authorization: `token ${process.env.GITHUB_TOKEN}`,
  //     },
  //     json: true
  //   }

  //   const response = await request(options)
  //   const collaborators = response.map((r: any) => r.owner.login)
  //   return collaborators
  // }))

  // return collabs.reduce((a, c) => a.concat(c), [])

  return await repos.reduce(async (accPromise: Promise<Array<String>>, curr: string) => {
    const acc = await accPromise;

    return getForksForRepo(curr)
      .then(forksForRepo => {
        return acc.concat(forksForRepo)
      })

  }, Promise.resolve([]))
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
    // console.log('getting next: ', next)
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
 * @function getRepoCommitCount
 * @description Gets the number of commits for a given repo
 * TODO: update this to use octokit instead
 */
async function getRepoCommitCount(repo: string): Promise<number> {
  const url = `${baseUrl}/${repo}/contributors`
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

  return contributions
}

/**
 * @function getMasterCommitCount
 * @description Gets a list of all commits across repos on mojaloop
 * TODO: update this to use octokit instead
 */
async function getMasterCommitCount(repos: Array<string>) {
  const totalCount = await repos.reduce(async (accPromise: Promise<number>, curr: string) => {
    const acc = await accPromise;

    return getRepoCommitCount(curr)
      .then(commitCountForRepo => {
        console.log(`Commits for ${curr}: ${commitCountForRepo}`)
        return commitCountForRepo + acc
      })
  }, Promise.resolve(0))

  return totalCount;
}

/**
 * 
 * @param repo 
 * @returns {Promise<Array<string>>} - A list of the contributors for the repo
 */
async function getPRForRepo(repo: string): Promise<Array<string>> {
  const url = `${baseUrl}/${repo}/contributors`
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
  return collaborators
}

/**
 * @function getPRList
 * @description Gets a list of all mojaloop prs
 * TODO: update this to use octokit instead
 */
async function getPRList(repos: Array<string>) {
  return await repos.reduce(async (accPromise: Promise<Array<String>>, curr: string) => {
    const acc = await accPromise;

    return getPRForRepo(curr)
      .then(contributorsForRepo => {
        return acc.concat(contributorsForRepo)
      })

  }, Promise.resolve([]))
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

/**
 * @function runShellCommand
 * @description Runs a shell command. Note: this call is synchronous!
 * @param args 
 */
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

  if (cmd.stdout && cmd.stdout.toString().length > 0) {
    console.log(`stderr: ${cmd.stdout.toString()}`);
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
  getRepoCommitCount,
  getRepoList,
  runShellCommand,
  sum,
  unique
}