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



    //TODO: call some function on this.repos;
  }
}

const makeRepoSummary = (repos: Repos) => {
  const repoSummary = new RepoSummary(repos)

  return repoSummary;
}

export default makeRepoSummary