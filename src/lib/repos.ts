
export type ReposConfig = {
  baseUrl: string
  sum: (a: any, b: any) => any,

}

class Repos {
  githubApi: any; //v3api
  graphqlWithAuth: any;
  request: any;
  // Inside config
  baseUrl: string;
  sum: (a: any, b: any) => any;

  constructor(githubApi: any, graphqlWithAuth: any, request: any, config: ReposConfig) {
    this.githubApi = githubApi;
    this.graphqlWithAuth = graphqlWithAuth;
    this.request = request;

    this.baseUrl = config.baseUrl;
    this.sum = config.sum;
  }

  /**
   * @function closePR
   * @description Close a PR for a repo
   */
  async closePR(repo: string, pullNumber: number) {
    // const reqOptions: Octokit.PullsUpdateParams = {
    const reqOptions: any = {
      owner: 'mojaloop',
      repo,
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
  public async getContributorsForks(repos: Array<string>) {
    return await repos.reduce(async (accPromise: Promise<Array<String>>, curr: string) => {
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
  async getOpenPrList(repo: string) {
    // const reqOptions: Octokit.PullsListParams = {
    // TODO: how do we deal with an Octokit dependency here?
    //I guess this formatting should be handled in file that is allowed to 'know' about Octokit
    const reqOptions: any = {
      owner: 'mojaloop',
      repo,
      state: 'open',
    }

    return this.githubApi.pulls.list(reqOptions)
  }

  /**
   * @function getPRList
   * @description Gets a list of all mojaloop prs
   * TODO: update this to use octokit instead
   */
  public async getPRList(repos: Array<string>) {
    return await repos.reduce(async (accPromise: Promise<Array<String>>, curr: string) => {
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

  public async getVulnsForRepoList(repos: Array<string>): Promise<Array<any>> {
    const repoMap: any = {}

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

    const { repository: { vulnerabilityAlerts } } = await this.graphqlWithAuth(query)

    return vulnerabilityAlerts.edges.map((e: any) => e.node)
  }

}


/* Inject dependencies*/ 
const makeRepos = (githubApi: any, graphqlWithAuth: any, request: any, reposConfig: ReposConfig) => {
  const repos = new Repos(githubApi, graphqlWithAuth, request, reposConfig)

  return Object.freeze({
    closePR: repos.closePR,
    createPR: repos.createPR,
    getContributorsForks: repos.getContributorsForks,
    getIssuesContributors: repos.getIssuesContributors,
    getMasterCommitCount: repos.getMasterCommitCount,
    getOpenPrList: repos.getOpenPrList,
    getPRList: repos.getPRList,
    getRepoList: repos.getRepoList,
    getVulnsForRepoList: repos.getVulnsForRepoList,
  })
}

export default makeRepos