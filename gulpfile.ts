import gulp from 'gulp';

import { UpdateLicense, AnchoreSummary } from './dist/index'
import { RepoList } from './dist/index'
import { UpdateLicenseConfigType } from './dist/UpdateLicense';
import { RepoListConfigType } from './dist/RepoList';
import { AnchoreSummaryConfigType } from './dist/AnchoreSummary';

gulp.task('anchore-summary', async () => {
  const config: AnchoreSummaryConfigType = {
    pathToAnchoreReports: '/Users/lewisdaly/developer/vessels/mojaloop/stats/tmp',
    outputPath: '/Users/lewisdaly/developer/vessels/mojaloop/stats/tmp/summary.xlsx'
  }

  await AnchoreSummary.run(config)
})

/**
 * This gulpfile serves as an entrypoint for 
 * each of these tools
 */

gulp.task('update-license', async () => {
  const config: UpdateLicenseConfigType = {
    skipRepos: [],
    newLicenseString: '',
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