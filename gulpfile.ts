import gulp from 'gulp';

import { UpdateLicense } from './dist/index'
import { UpdateLicenseConfigType } from './dist/UpdateLicense';

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