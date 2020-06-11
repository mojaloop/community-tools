import gulp from 'gulp';
import fs  from 'fs';

import { UpdateLicense, AnchoreSummary } from './src/index'
import { RepoList } from './src/index'
import { UpdateLicenseConfigType } from './src/UpdateLicense';
import { RepoListConfigType } from './src/RepoList';
import { AnchoreSummaryConfigType } from './src/AnchoreSummary';
import Dependencies, { DependenciesConfigType } from './src/Dependencies';
import Data from './src/data';
import Contributors, { ContributorsConfigType } from './src/Contributors';
import Commits, { CommitConfigType } from './src/Commits';
import Lines, { LinesConfigType } from './src/Lines';
import skipRepos from './src/UpdateLicense/skipRepos'
import Vulnerabilities, { VulnerabilitiesConfigType } from './src/Vulnerabilities';

/**
 * This gulpfile serves as an entrypoint for
 * each of these tools
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

gulp.task('lines', async () => {
  const config: LinesConfigType = {
    pathToRepos: '/tmp/repos',
    reposToClone: Data.repos,
  }
  await Lines.run(config)
})

gulp.task('vulns', async () => {
  const config: VulnerabilitiesConfigType = {
    repos: Data.repos
    // repos: ['forensic-logging-client']
  }
  // TODO: should init with config...
  const vulns = new Vulnerabilities()

  await vulns.run(config)
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
    output: `/tmp/mojaloop_repos_${(new Date()).toISOString().slice(0, 10)}.csv`
  }
  await RepoList.run(options)
})