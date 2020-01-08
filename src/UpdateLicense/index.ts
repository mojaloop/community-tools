import { getRepoList } from '../lib';


export type UpdateLicenseConfigType = {
  //An array of repos that we don't want to automatically update, formatted in `mojaloop/<repo_name>` format
  skipRepos: string[],

  //The new license string text
  newLicenseString: string,
}

async function run(_: UpdateLicenseConfigType) {
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