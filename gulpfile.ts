import gulp from 'gulp';

import { UpdateLicense } from './dist/index'

gulp.task('test1', async () => {
  // const botConfig = unsafeUnwrap(await getContent())
  UpdateLicense.run()

  // await botConfig.reduce(async (acc: Promise<SomeResult<any>>, curr: BotConfig) => {
  //   const result: SomeResult<any> = await acc;
  //   if (result.type === ResultType.ERROR) {
  //     console.log('Error creating config:', result.message)
  //   }
  //   return VBAdminClient.createContent(curr)
  // }, Promise.resolve(makeSuccess<any>(undefined)))

  // console.log(`Deployed config for ${botConfig.length} bots.`);
});