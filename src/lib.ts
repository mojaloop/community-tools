import Octokit from '@octokit/rest'

const octokit = new Octokit();


/**
 * @function getRepoList
 * @description Gets a list of all repos
 */
async function getRepoList() {
  return octokit.paginate("GET /orgs/:org/repos", {
    org: 'mojaloop'
  })
    // .then((result: any) => result.map((i: any) => i.full_name))
}

export {
  getRepoList,
}