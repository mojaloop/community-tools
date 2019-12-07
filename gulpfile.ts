import gulp from 'gulp';

import { UpdateLicense } from './dist/index'

/**
 * This gulpfile serves as an entrypoint for 
 * each of these tools
 */

gulp.task('test1', async () => {
  // const botConfig = unsafeUnwrap(await getContent())
  UpdateLicense.run()
});