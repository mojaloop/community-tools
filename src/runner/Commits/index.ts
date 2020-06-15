import { Repos } from '../../lib'

export type CommitConfigType = {
  repos: Array<string>
}

async function run(config: CommitConfigType) {
  const masterCommitCount = await Repos.getMasterCommitCount(config.repos)

  console.log('Total Squashed Commit Count:', masterCommitCount)
}

export default {
  run
}