import Octokit from '@octokit/rest';
import { Repos } from '../lib';
import BaseRunner, { AnyConfig } from './BaseRunner';
import RepoList from './RepoList';


export type OutputConfigConsole = {
  type: PersmissionsConfigReport.CONSOLE
}

export type OutputConfigCSVFile = {
  type: PersmissionsConfigReport.CSV_FILE,
  outputPath: string,
}

export enum PersmissionsConfigReport {
  CSV_FILE = 'CSV_FILE',
  CONSOLE = 'CONSOLE',
}

export enum AccessType {
  ADMIN = 'ADMIN',
  WRITE = 'WRITE',
  READ = 'READ',
  NONE = 'NONE',
}

export interface PermissionsConfigType extends AnyConfig {
  // if undefined, or empty array, then will search all repos in the org
  reposOrAll?: Array<string>
  // if undefined, or empty array, then will search all usernames in the org
  usernamesOrAll?: Array<string>
  outputConfig: OutputConfigConsole | OutputConfigCSVFile
}

export default class Permissions extends BaseRunner {
  public async run(config: PermissionsConfigType): Promise<void> {
    const repos = await this._getOrLoadRepos(config.reposOrAll)
    // Hmm we may not need this - it could just be a simple filter in or out
    // const users = await this._getOrLoadUsernames(config.usernamesOrAll)

    const rawRepoCollaborators = await Repos.getCollaboratorsForRepoList(repos)

    // Map of repos, containing a map of usernames, containing the access type
    const repoCollaborators: Record<string, Record<string, AccessType>> = {}
    const allUsernames: Record<string, true> = {}
    Object.keys(rawRepoCollaborators).forEach(repo => {
      // console.log(`Repo: ${repo}`)
      const value = rawRepoCollaborators[repo]
      const users: Record<string, AccessType> = {}
      // @ts-ignore
      value.forEach(collaborator => {
          users[collaborator.login] = this._getAccessTypeForCollaborator(collaborator)
          allUsernames[collaborator.login] = true
      })
      // console.log(`- collaborators ${value.length}`)
      repoCollaborators[repo] = users
    })

    // TODO: build a master list of the collaborators so we can line up the columns
    let usernameList = Object.keys(allUsernames)
    if (config.usernamesOrAll && config.usernamesOrAll.length > 0) {
      usernameList = config.usernamesOrAll
    }

    // basic sort lexicographically
    usernameList.sort()

    switch(config.outputConfig.type) {
      case PersmissionsConfigReport.CONSOLE: return this._exportReportConsole(repoCollaborators, usernameList)
      case PersmissionsConfigReport.CSV_FILE: return this._exportReportCSV(repoCollaborators, usernameList, config.outputConfig.outputPath)
    }
  }

  // TODO: validate this function!
  // @ts-ignore
  public _getAccessTypeForCollaborator(collaborator: Octokit.ReposListCollaboratorsResponseItem): AccessType {
    if (collaborator.permissions.admin) {
      return AccessType.ADMIN
    }

    if (collaborator.permissions.push) {
      return AccessType.WRITE
    }

    if (collaborator.permissions.pull) {
      return AccessType.READ
    }

    // This might be in the case of private repos
    return AccessType.NONE
  }

  public _exportReportConsole(repoCollaborators: Record<string, Record<string, AccessType>>, usernames: Array<string>): void {
    const headerBuffer = Buffer.from(',' + usernames.join(',') + '\n')
    const rowBuffers = Object.keys(repoCollaborators).map(repo => {
      const users = repoCollaborators[repo]
      // If the username isn't in the repo, mark it as NONE
      const values: Array<string> = usernames.map(username => users[username] || AccessType.NONE)
      return Buffer.from(`${repo},` + values.join(',') + '\n')
    })

    rowBuffers.unshift(headerBuffer)
    console.log(Buffer.concat(rowBuffers).toString())
  }

  public _exportReportCSV(repoCollaborators: Record<string, Record<string, AccessType>>, usernames: Array<string>, outputPath: string): void {
    console.log('TODO!')
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

    // @ts-ignore
    return (await Repos.getRepoList()).map(repo => repo.name)
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