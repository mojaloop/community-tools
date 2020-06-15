import { Repos } from '../../lib'

export type ContributorsConfigType = {
  repos: Array<string>
}

const unique = (array: Array<any>) => {
  const obj: {[index: string]: any} = {}
  array.forEach(v => obj[v] = true)
  return Object.keys(obj)
}

async function run(config: ContributorsConfigType) {
  const prList = await Repos.getPRList(config.repos)
  const forkList = await Repos.getContributorsForks(config.repos)
  const issueContributor = await Repos.getIssuesContributors()

  // TODO: we shouldn't have business logic here...
  console.log('Unique contributors who have opened PRs:', unique(prList).length)
  console.log('Unique contributors who have forked Mojaloop repos: (this includes organizations)', unique(forkList).length)
  console.log('Unique contributors from Issues(created or assigned to issues)', unique(issueContributor).length)

  console.log('Unique contributors from PRs, Forks and Issues: ', unique(prList.concat(forkList.concat(issueContributor))).length)
}

export default {
  run,
}