import BaseRunner, { AnyConfig } from '../lib/BaseRunner';
import {
  getVulnsForRepoList
} from '../lib/GithubCalls'

// TODO: this should extend the BaseConfig...
export type VulnerabilitiesConfigType = {
  // A list of repos to find vulnerabilities for
  repos: Array<string>
}

export default class Vulnerabilities extends BaseRunner {

  public async run(config: VulnerabilitiesConfigType): Promise<void> {
    console.log("running vulns!")

    const result = await getVulnsForRepoList(config.repos)

    console.log('result', result)

    //TODO: graphql calls
  }
}