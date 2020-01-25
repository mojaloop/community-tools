
import {
  getMasterCommitCount
} from '../lib'

export type CommitConfigType = {
  repos: Array<string>
}

async function run(config: CommitConfigType) {
  const masterCommitCount = await getMasterCommitCount(config.repos)

  console.log('Total Squashed Commit Count:', masterCommitCount)
}

export default {
  run
}