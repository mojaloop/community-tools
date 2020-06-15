/* RepoSummary is a summary what's going on with a repo?.. */
/* inpired by: https://developer.github.com/v3/repos/statistics/ */

import BaseRunner from "./BaseRunner";
import { Repos } from '../lib/repos';

export type RepoSummaryConfigType = {
  // A list of repos to get the summary of
  reposToSummarize: Array<string>
}

export class RepoSummary extends BaseRunner {
  repos: Repos;

  constructor (repos: Repos) {
    super();
    this.repos = repos
  }

  public async run(config: RepoSummaryConfigType): Promise<void> {
    console.log("running RepoSummary!", config)

    const result = await this.repos.getStatsForRepos(config.reposToSummarize)

    //Format for csv:
    Object.keys(result).forEach(key => {
      console.log(`\n${key}\n`)

      const repoResult = result[key]
      RepoSummary.printSimpleCsv(repoResult)
    })  
  }

  static printSimpleCsv(repoResult: Array<{ total: number; weekTimestamp: number;}>): void {
    const weekTsRow = repoResult.map(wk => parseInt(`${wk.weekTimestamp}000`))
      .map(ts => new Date(ts))
      .map(date => date.toISOString().split('T')[0])
      .join(',')
    const commitsRow = repoResult.map(wk => wk.total).join(',')

    console.log(weekTsRow)
    console.log(commitsRow)
  }
}

const makeRepoSummary = (repos: Repos) => {
  const repoSummary = new RepoSummary(repos)

  return repoSummary;
}

export default makeRepoSummary