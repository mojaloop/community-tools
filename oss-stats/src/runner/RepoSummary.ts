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
    
    //Print the weeks first:
    const firstKey = Object.keys(result)[0]
    const firstResult = result[firstKey]
    const weekTsRow = firstResult.map(wk => parseInt(`${wk.weekTimestamp}000`))
      .map(ts => new Date(ts))
      .map(date => date.toISOString().split('T')[0])
      .join(',')
    // put an extra , in front for easy copy-paste in excel
    console.log(`   ,${weekTsRow}`)

    //Format for csv:
    Object.keys(result).forEach(key => {
      const commitsRow = result[key].map(wk => wk.total).join(',')
      //Add the repo name
      console.log(`${key},${commitsRow}`)
    })  
  }

  static printSimpleCsv(repoResult: Array<{ total: number; weekTimestamp: number;}>): void {
    const commitsRow = repoResult.map(wk => wk.total).join(',')

    console.log(commitsRow)
  }
}

const makeRepoSummary = (repos: Repos) => {
  const repoSummary = new RepoSummary(repos)

  return repoSummary;
}

export default makeRepoSummary