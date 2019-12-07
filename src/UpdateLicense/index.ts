import Octokit from '@octokit/rest'
const octokit = new Octokit();


export type UpdateLicenseConfigType = {
  //An array of repos that we don't want to automatically update, formatted in `mojaloop/<repo_name>` format
  skipRepos: string[],

  //The new license string text
  newLicenseString: string,
}


async function getRepoList() {
  return octokit.paginate("GET /orgs/:org/repos", {
    org: 'mojaloop'
  })
  .then((result: any) => result.map((i: any) => i.full_name))
}

async function run(config: UpdateLicenseConfigType) {
  const repos = await getRepoList()

  console.log('repos are', repos)

  //TODO: filter on some blacklist of repos we want to update manually

  //For each repo:
  // - clone somewhere
  // - make a new branch
  // - remove the LICENSE.md file (if exists)
  // - make a new LICENSE.md file based on the newLicenseString
  // - push and create a new PR


  //
}

export default {
  run
}