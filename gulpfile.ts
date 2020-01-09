import gulp from 'gulp';

import { UpdateLicense } from './dist/index'
import { RepoList } from './dist/index'
import { UpdateLicenseConfigType } from './dist/UpdateLicense';
import { RepoListConfigType } from './dist/RepoList';

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