// TODO: we technically shouldn't have dependencies here
// common github calls should be factored out and we should own the types
// so as to not have an implicit dependency on this library
// @ts-ignore - ReposListCollaboratorsResponse is valid in Octokit v16
import Octokit, { ReposListCollaboratorsResponse, ReposListCollaboratorsResponseItem } from '@octokit/rest';
import { graphql } from '@octokit/graphql/dist-types/types';
import { Repo, RepoShortcut } from './types';
import { eventNames } from 'gulp';

export type ReposConfig = {
  baseUrl: string
  sum: (a: any, b: any) => any,
}

export class Repos {
  // @ts-ignore - Octokit is valid as a type in v16
  protected githubApi: Octokit; //v3api
  protected graphqlWithAuth: graphql;
  protected request: any;
  // Inside config
  protected baseUrl: string;
  protected sum: (a: any, b: any) => any;
  protected config: ReposConfig;

  // @ts-ignore - Octokit is valid as a type in v16
  constructor(githubApi: Octokit, graphqlWithAuth: graphql, request: any, config: ReposConfig) {
    this.githubApi = githubApi;
    this.graphqlWithAuth = graphqlWithAuth;
    this.request = request;
    this.config = config;

    this.baseUrl = config.baseUrl;
    this.sum = config.sum;
  }

  /**
   * @function closePR
   * @description Close a PR for a repo
   */
  async closePR(repo: Repo, pullNumber: number) {
    // const reqOptions: Octokit.PullsUpdateParams = {
    const reqOptions: any = {
      owner: repo.owner,
      repo: repo.repo,
      pull_number: pullNumber,
      state: 'closed'
    }

    return this.githubApi.pulls.update(reqOptions)
  }

  /**
   * @function createPR
   * @description Creates a new Pull request
   */
  // async createPR(options: Octokit.PullsCreateParams) {
  async createPR(options: any) {
    return this.githubApi.pulls.create(options)
  }

  /**
   * @function getContributorsForks
   * @description Gets a list of all mojaloop forks
   * TODO: update this to use octokit instead
   */
  public async getContributorsForks(repos: Array<string>): Promise<Array<string>> {
    //@ts-ignore
    return await repos.reduce(async (accPromise: Promise<Array<string>>, curr: string) => {
      const acc = await accPromise;

      return this.getForksForRepo(curr)
        .then(forksForRepo => {
          return acc.concat(forksForRepo)
        })

    }, Promise.resolve([]))
  }

  /**
   * @function getIssuesContributors
   * @description Gets a list of all contributors who have made issues
   * TODO: update this to use octokit instead
   */
  public async getIssuesContributors() {
    let contributors: Array<any> = []
    let next = '?state=all&per_page=50&page=1'
    let last = ''

    let count = 0
    while (next !== last) {
      const url = `${this.baseUrl}/project/issues${next}`
      const options = {
        url,
        headers: {
          accept: 'application/vnd.github.v3+json',
          'User-Agent': 'Awesome-Octocat-App',
          Authorization: `token ${process.env.GITHUB_TOKEN}`,
        },
        json: true,
        resolveWithFullResponse: true
      }

      const { headers: { link }, body } = await this.request(options)
      let iterContributors: Array<any> = []

      //Add creators and assignees
      body.forEach((i: any) => {
        iterContributors.push(i.user.login)
        if (i.assignees.length > 0) {
          iterContributors = iterContributors.concat(i.assignees.map((a: any) => a.login))
        }
      })
      contributors = contributors.concat(iterContributors)

      // link e.g.: <https://api.github.com/repositories/116650553/issues?per_page=20&page=1>; rel="prev", <https://api.github.com/repositories/116650553/issues?per_page=20&page=3>; rel="next", <https://api.github.com/repositories/116650553/issues?per_page=20&page=12>; rel="last", <https://api.github.com/repositories/116650553/issues?per_page=20&page=1>; rel="first"
      const matches = link.match(/(\?.*?)(?:>)/g).map((s: string) => s.replace('>', ''))
      //ew this is hacky
      if (count === 0) {
        next = matches[0]
        last = matches[1]
      } else {
        next = matches[1]
        last = matches[2]
      }

      count += 1
    }

    return contributors
  }

  /**
   * @function getMasterCommitCount
   * @description Gets a list of all commits across repos on mojaloop
   * TODO: update this to use octokit instead
   */
  public async getMasterCommitCount(repos: Array<string>) {
    // @ts-ignore
    const totalCount = await repos.reduce(async (accPromise: Promise<number>, curr: string) => {
      const acc = await accPromise;

      return this.getRepoCommitCount(curr)
        .then(commitCountForRepo => {
          console.log(`Commits for ${curr}: ${commitCountForRepo}`)
          return commitCountForRepo + acc
        })
    }, Promise.resolve(0))

    return totalCount;
  }

  /**
   * @function getOpenPrList
   * @description Lists open PRs for a repo
   */
  async getOpenPrList(repo: Repo) {
    // const reqOptions: Octokit.PullsListParams = {
    // TODO: how do we deal with an Octokit dependency here?
    //I guess this formatting should be handled in file that is allowed to 'know' about Octokit
    const reqOptions: any = {
      owner: repo.owner,
      repo: repo.repo,
      state: 'open',
    }

    return this.githubApi.pulls.list(reqOptions)
  }

  /**
   * @function getPRList
   * @description Gets a list of all mojaloop prs
   * TODO: update this to use octokit instead
   */
  public async getPRList(repos: Array<string>): Promise<Array<string>> {
    // @ts-ignore
    return await repos.reduce(async (accPromise: Promise<Array<string>>, curr: string) => {
      const acc = await accPromise;

      return this.getPRForRepo(curr)
        .then(contributorsForRepo => {
          return acc.concat(contributorsForRepo)
        })

    }, Promise.resolve([]))
  }

  /**
   * @function getRepoList
   * @description Gets a list of all repos
   */
  public async getRepoList() {
    return this.githubApi.paginate("GET /orgs/:org/repos", {
      org: 'mojaloop',
      type: 'all'
    })
  }

  /**
   * @function getReposTopics
   * @description Gets a list of the topics for the given list of repos
   */
  public async getReposTopics(repos: Array<string>): Promise<Record<string, Array<string>>> {
    const topicsMap: Record<string, Array<string>> = {}

    await repos.reduce(async (acc, curr) => {
      return acc
        .then(() => this.githubApi.repos.listTopics({owner: 'mojaloop', repo: curr}))
        .then(result => {
          if (!result || !result.data) {
            throw new Error(`getReposTopics error for repo: ${curr}`)
          }
          topicsMap[curr] = result.data.names
          return true
        })
    }, Promise.resolve(true))

    return topicsMap
  }

  /**
   * @function getStatsForRepos()
   * @param repos 
   */
  public async getStatsForRepos(repos: Array<string>): Promise<{ [index: string]: Array<{ total: number, weekTimestamp: number }> }> {
    const statsMap: { [index: string]: Array<{ total: number, weekTimestamp: number }>} = {}
    await repos.reduce(async (acc, curr) => {
      return acc
      .then(() => this.getWeeklyCommitCount(curr))
      .then(result => {
        statsMap[curr] = result;
      })
      .catch(err => console.log("Error in getStatsForRepos", err))
      .then(() => true)
    }, Promise.resolve(true))

    return statsMap;
  }

  public async getVulnsForRepoList(repos: Array<string>): Promise<Array<any>> {
    const repoMap: any = {}

    // @ts-ignore
    await repos.reduce(async (accPromise: Promise<Array<String>>, curr: string) => {
      const acc = await accPromise;

      return this.getVulnsForRepo(curr)
        .then(vulnsForRepo => {
          if (vulnsForRepo.length > 0) {
            repoMap[curr] = vulnsForRepo
          }

          return acc.concat(vulnsForRepo)
        })

    }, Promise.resolve([]))

    return repoMap;
  }

  /**
   * @function getCollaboratorsForRepoList
   * @description Gets the list of collaborators for a list of repos
   * @param repos - a list of repos to search within the org
   */
  public async getCollaboratorsForRepoList(repos: Array<string>): Promise<Record<string, ReposListCollaboratorsResponse>> {

    // const reposWithCollaborators: {[index: string]: unknown} = {}
    const reposWithCollaborators: Record<string, ReposListCollaboratorsResponse> = {}
    await Promise.all(repos.map(async repo => {
      const collaborators = await this.getCollaborators(repo)
      reposWithCollaborators[repo] = collaborators;
    }))

    return reposWithCollaborators
  }

  public async getReposForShortcut(shortcut: RepoShortcut): Promise<Array<Repo>> {
    const allReposWithTopics = await this.getReposWithTopics()

    if (shortcut === RepoShortcut.ALL) {
      console.log(`getReposForShortcut - found ${allReposWithTopics.length} repos for ${shortcut}`)
      return Object.keys(allReposWithTopics).map(k => ({ owner: 'mojaloop', repo: k }))
    }

    let keyword = ''
    switch(shortcut) {
      case RepoShortcut.CORE_DOCKER: 
        keyword = 'core-docker'
        break;
      case RepoShortcut.CORE_PACKAGE:
        keyword = 'core-package'
        break;
      case RepoShortcut.CORE_SPEC:
        keyword = 'core-spec'
        break;
      case RepoShortcut.CORE:
        keyword = 'core-'
        break;
    }

    const filtered = Object.keys(allReposWithTopics).map(key => {
      const topicsStr = allReposWithTopics[key].join(',').toLowerCase()
      if (topicsStr.indexOf(keyword) > -1) {
        return key
      }

      return ''
    }).filter(repo => repo !== '')

    console.log(`getReposForShortcut - found ${filtered.length} repos for ${shortcut}`)
    return filtered.map(repo => ({ owner: 'mojaloop', repo: repo }))
  }


  /* ==== Private ==== */

  private async getForksForRepo(repo: string): Promise<Array<string>> {
    const url = `${this.baseUrl}/${repo}/forks`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      json: true
    }

    const response = await this.request(options)
    const collaborators = response.map((r: any) => r.owner.login)
    return collaborators
  }

  /**
   * 
   * @param repo 
   * @returns {Promise<Array<string>>} - A list of the contributors for the repo
   */
  private async getPRForRepo(repo: string): Promise<Array<string>> {
    const url = `${this.baseUrl}/${repo}/contributors`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      json: true
    }

    const response = await this.request(options)

    if (!response) {
      return []
    }

    const collaborators = response.map((r: any) => r.login)
    return collaborators
  }

  /**
   * @function getRepoCommitCount
   * @description Gets the number of commits for a given repo
   * TODO: update this to use octokit instead
   */
  private async getRepoCommitCount(repo: string): Promise<number> {
    const url = `${this.baseUrl}/${repo}/contributors`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${process.env.GITHUB_TOKEN}`,
      },
      json: true
    }
    const response = await this.request(options)
    const contributions = response.map((r: any) => r.contributions).reduce(this.sum, 0)

    return contributions
  }

  private async getReposWithTopics(results: Record<string, Array<string>> = {}, cursor?: string): Promise<Record<string, Array<string>>> {
    // console.log(`getReposWithTopics, results.length: ${Object.keys(results).length}, cursor: ${cursor}`)
    const query = `query($cursor: String) { 
      organization(login: "mojaloop") {
        id
        repositories (first: 100, after: $cursor) {
          pageInfo {
            hasNextPage,
            endCursor
          }
          nodes {
            name,
            repositoryTopics(first: 20) {
              edges {
                node {
                  topic {
                    name
                  }
                }
              }
            }
          }
        }
      }
    }`

    // @ts-ignore - organization is valid in the response
    const { organization: { repositories: { pageInfo: { hasNextPage, endCursor }, nodes } } } = await this.graphqlWithAuth(query, { cursor })
    nodes.forEach((node: {name: string, repositoryTopics: { edges: Array<{node: { topic: { name: string}}}>}}) => {
      results[node.name] = node.repositoryTopics.edges.map(e => e.node.topic.name)
    })

    if (hasNextPage) {
      return this.getReposWithTopics(results, endCursor)
    }

    return results
  }

  private async getVulnsForRepo(repo: string): Promise<Array<any>> {
    const query = `{
      repository(owner: "mojaloop", name: "${repo}") {
        id
        name
        vulnerabilityAlerts(first: 10) {
          edges {
            node {
              id
              securityVulnerability {
                severity
                updatedAt
                advisory {
                  id
                  summary
                }
              }
            }
          }
        }
      }
    }`

    // @ts-ignore - repository is valid in the response
    const { repository: { vulnerabilityAlerts } } = await this.graphqlWithAuth(query)

    return vulnerabilityAlerts.edges.map((e: any) => e.node)
  }

  private async getWeeklyCommitCount(repo: string): Promise<Array<{total: number, weekTimestamp: number}>> {
    // GET /repos/:owner/:repo/stats/participation
    // @ts-ignore - RequestOptions and ReposGetCodeFrequencyStatsParams are valid in Octokit v16
    const params: Octokit.RequestOptions & Octokit.ReposGetCodeFrequencyStatsParams = {
      owner: 'mojaloop',
      repo,
      per_page: 100
    }
    let result: any = await this.githubApi.repos.getCommitActivityStats(params)

    if (!result || !result.data) {
      console.log('getWeeklyCommitCount error for repo', repo)
      result = {
        data: []
      }
    }

    console.log('result.', result)

    return result.data.map((row: any) => ({ total: row.total, weekTimestamp: row.week}))
  }
  
  /**
   * @function getCollaborators
   * @description Get a list of collaborators for a given repo
   * @link https://docs.github.com/en/free-pro-team@latest/rest/reference/repos#list-repository-collaborators
   * @param repo 
   */
  // @ts-ignore - ReposListCollaboratorsResponse is valid in Octokit v16
  private async getCollaborators(repo: string): Promise<Octokit.ReposListCollaboratorsResponse> {
    // @ts-ignore - ReposListCollaboratorsResponse is valid in Octokit v16
    const result: Octokit.ReposListCollaboratorsResponse = await this.githubApi.paginate("GET /repos/:owner/:repo/collaborators", {
      owner: 'mojaloop',
      repo
    })
        
    return result
  }

  private async getOrganizationRepos(cursor?: string): Promise<any> {
    const query = `
      query($cursor: String) {
        organization(login: "mojaloop") {
          repositories(first: 100, after: $cursor) {
            pageInfo {
              hasNextPage
              endCursor
            }
            nodes {
              name
              url
            }
          }
        }
      }
    `;

    const result = await this.graphqlWithAuth(query, { cursor });
    // @ts-ignore - organization is valid in the response
    const { organization: { repositories: { pageInfo: { hasNextPage, endCursor }, nodes } } } = result;
    return { hasNextPage, endCursor, nodes };
  }

  private async getVulnerabilityAlerts(repo: string): Promise<any> {
    const query = `
      query($repo: String!) {
        repository(owner: "mojaloop", name: $repo) {
          vulnerabilityAlerts(first: 100) {
            nodes {
              securityVulnerability {
                package {
                  name
                }
                advisory {
                  summary
                  severity
                }
              }
            }
          }
        }
      }
    `;

    const result = await this.graphqlWithAuth(query, { repo });
    // @ts-ignore - repository is valid in the response
    const { repository: { vulnerabilityAlerts } } = result;
    return vulnerabilityAlerts;
  }

  private async getCodeFrequencyStats(repo: string): Promise<any> {
    // @ts-ignore - RequestOptions and ReposGetCodeFrequencyStatsParams are valid in Octokit v16
    const params: Octokit.RequestOptions & Octokit.ReposGetCodeFrequencyStatsParams = {
      owner: 'mojaloop',
      repo
    };

    return this.githubApi.repos.getCodeFrequencyStats(params);
  }
}

/* Inject dependencies*/ 
// @ts-ignore - Octokit is valid as a type in v16
const makeRepos = (githubApi: Octokit, graphqlWithAuth: graphql, request: any, reposConfig: ReposConfig) => {
  const repos = new Repos(githubApi, graphqlWithAuth, request, reposConfig)

  return repos;
}

export default makeRepos