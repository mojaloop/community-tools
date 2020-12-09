import { Repos } from '../lib';
import BaseRunner, { AnyConfig } from './BaseRunner';

export interface RepoAccessConfig extends AnyConfig {
  // if undefined, or empty array, then will search all repos in the org
  reposOrAll?: Array<string>
}

export default class RepoAccess extends BaseRunner {

  public async run(config: RepoAccessConfig): Promise<void> {
    const repos = await Repos._getOrLoadRepos(config.reposOrAll)

    const reposAndTeams = await Repos.getTeamsForRepoList(repos)
    console.log('reposAndTeams', JSON.stringify(reposAndTeams, null, 2))


    //Team slug:
    const teamSlug = `ml-maintainers`
    

    // Direct isn't quite what we want here...
    // maybe we can just ignore this - worry about teams only
    // const reposAndDirectCollaborators = await Repos.getCollaboratorsForRepoList(repos, 'direct')
    // console.log('reposAndDirectCollaborators', reposAndDirectCollaborators)




  }

}