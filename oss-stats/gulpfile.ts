import gulp from 'gulp';
import fs  from 'fs';

import { UpdateLicense, AnchoreSummary } from './src/index'
import { RepoList } from './src/index'
import { UpdateLicenseConfigType } from './src/runner/UpdateLicense';
import { RepoListConfigType } from './src/runner/RepoList';
import { AnchoreSummaryConfigType } from './src/runner/AnchoreSummary';
import { RepoSummaryConfigType } from './src/runner/RepoSummary'
import Dependencies, { DependenciesConfigType } from './src/runner/Dependencies';
import Data from './src/data';
import Contributors, { ContributorsConfigType } from './src/runner/Contributors';
import Commits, { CommitConfigType } from './src/runner/Commits';
import Lines, { LinesConfigType } from './src/runner/Lines';
import skipRepos from './src/runner/UpdateLicense/skipRepos'
import Vulnerabilities, { VulnerabilitiesConfigType } from './src/runner/Vulnerabilities';
import { RepoSummary } from './src'

/**
 * This gulpfile serves as an entrypoint for each of these tools
 */

gulp.task('anchore-summary', async () => {
  const config: AnchoreSummaryConfigType = {
    pathToAnchoreReports: '/Users/lewisdaly/developer/vessels/mojaloop/stats/tmp/latest',
    outputPath: '/Users/lewisdaly/developer/vessels/mojaloop/stats/tmp/summary.xlsx'
  }

  await AnchoreSummary.run(config)
})

gulp.task('contributors', async () => {
  //Note: this task is prone to getting rate limited by github, so use it spasely
  const config: ContributorsConfigType = {
    repos: Data.repos,
  }
  await Contributors.run(config)
})

gulp.task('commits', async () => {
  const config: CommitConfigType = {
    repos: Data.repos,
  }
  await Commits.run(config)
})

gulp.task('dependencies', async () => {
  const config: DependenciesConfigType = {
    pathToRepos: '/tmp/repos',
    reposToClone: Data.repos,
  }
  await Dependencies.run(config)
})

/**
 * @function get-repo-csv
 * @description Gets the list of all Mojaloop Repos as a csv file
 */
gulp.task('get-repo-csv', async () => {
  const options: RepoListConfigType = {
    fields: [
      'name',
      'private',
      'description',
      'archived',
      'forks_count'
    ],
    output: `/tmp/mojaloop_repos_${(new Date()).toISOString().slice(0, 10)}.csv`,
    minForkCount: 0,
    skipArchived: true,
    ignore: [
      'archived',
      'als-oracle-account',
      'als-oracle-pathfinder',
      'als-oracle-template',
      'aws-iac',
      'apm-agent-nodejs',
      'apm-agent-nodejs-opentracing',
      'connection-manager',
      'cross-network',
      'design-authority',
      'deploy-config',
      'docs',
      'fraud_risk_management',
      'iac-lab',
      'iac_post_deploy',
      'mojaloop',
      'mojaloop-platform-iac',
      'ntpd',
      'opentracing-javascript',
      'pi8-perf-testing',
      'postman-dev',
      'test-scripts',
      'TIPS',
      'workbench-media',
      'wso2-helm-charts',
      'wso2-mysql',
      'wso2apim',
      'wso2iskm',
      'workbenches-woccu',
      'wso2-comp',
      'wso2-extensions',
      'wso2-helm-charts-simple',
    ]
  }
  await RepoList.run(options)
})

gulp.task('lines', async () => {
  const config: LinesConfigType = {
    pathToRepos: '/tmp/repos',
    reposToClone: Data.repos,
  }
  await Lines.run(config)
})

gulp.task('repo-summary', async () => {
  const config: RepoSummaryConfigType = {
    reposToSummarize: Data.repos
  }

  await RepoSummary.run(config)
})

/**
 * @function update-license
 * @description Creates a PR to update the License file across all repos
 */
gulp.task('update-license', async () => {
  const newLicenseString = fs.readFileSync('./src/UpdateLicense/NewLicense.md').toString()

  const config: UpdateLicenseConfigType = {
    pathToRepos: '/tmp/repos',
    skipRepos,
    newLicenseString,
    shouldSkipNoChanges: true,
  }

  await UpdateLicense.run(config)
});

gulp.task('vulns', async () => {
  const config: VulnerabilitiesConfigType = {
    repos: Data.repos
    // repos: ['forensic-logging-client']
  }
  // TODO: should init with config...
  const vulns = new Vulnerabilities()

  await vulns.run(config)
})