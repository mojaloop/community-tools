import Octokit from '@octokit/rest'

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});


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

const sum = (a: any, b: any) => a + b

const unique = (array: Array<any>) => {
  const obj: {[index: string]: any} = {}
  array.forEach(v => obj[v] = true)
  return Object.keys(obj)
}

export {
  getRepoList,
  sum,
  unique
}