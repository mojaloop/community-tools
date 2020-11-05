import Octokit from '@octokit/rest';
import { Repos } from '../lib';
import BaseRunner, { AnyConfig } from './BaseRunner';

export enum PersmissionsConfigReport {
  CSV_FILE = 'CSV_FILE',
  CONSOLE = 'CONSOLE',
}

export enum AccessType {
  ADMIN = 'ADMIN',
  WRITE = 'WRITE',
  READ = 'READ',
}

export interface PermissionsConfigType extends AnyConfig {
  // if undefined, or empty array, then will search all repos in the org
  reposOrAll?: Array<string>
  // if undefined, or empty array, then will search all usernames in the org
  usernamesOrAll?: Array<string>
  outputPath?: string
  outputFormat: PersmissionsConfigReport
}


export default class Permissions extends BaseRunner {
  public async run(config: PermissionsConfigType): Promise<void> {
    const repos = await this._getOrLoadRepos(config.reposOrAll)
    // Hmm we may not need this - it could just be a simple filter in or out
    // const users = await this._getOrLoadUsernames(config.usernamesOrAll)

    const rawRepoCollaborators = await Repos.getCollaboratorsForRepoList(repos)

    // Map of repos, containing a map of usernames, containing the access type
    const repoCollaborators: Record<string, Record<string, AccessType>> = {}
    Object.keys(rawRepoCollaborators).forEach(repo => {
      // console.log(`Repo: ${repo}`)
      const value = rawRepoCollaborators[repo]
      const users: Record<string, AccessType> = {}
      value.forEach(collaborator => {
          users[collaborator.login] = this._getAccessTypeForCollaborator(collaborator)
      })
      // console.log(`- collaborators ${value.length}`)
    })

    // TODO: build a master list of the collaborators so we can line up the columns


    

  }

  // TODO: validate this function!
  public _getAccessTypeForCollaborator(collaborator: Octokit.ReposListCollaboratorsResponseItem): AccessType {
    if (collaborator.permissions.admin) {
      return AccessType.ADMIN
    }

    if (collaborator.permissions.push) {
      return AccessType.WRITE
    }

    return AccessType.READ

  }

  /**
   * @function _getOrLoadRepos
   * @description Returns the supplied repos if they exist, or fetches them from the api
   * @param reposOrAll 
   */
  public async _getOrLoadRepos(reposOrAll: Array<string> | undefined): Promise<Array<string>> {
    if (Array.isArray(reposOrAll) && reposOrAll.length > 0) {
      return reposOrAll
    }

    return Repos.getRepoList()
  }

  /**
   * @function _getOrLoadRepos
   * @description Returns the supplied usernames if they exist, or fetches them from the api
   * @param usernamesOrAll
   */
  public async _getOrLoadUsernames(usernamesOrAll: Array<string> | undefined): Promise<Array<string>> {
    if (Array.isArray(usernamesOrAll) && usernamesOrAll.length > 0) {
      return usernamesOrAll
    }

    return []
  }
}