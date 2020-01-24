
// const { spawnSync } = require('child_process');
import { spawnSync } from 'child_process'

export type DependenciesConfigType = {
  pathToRepos: string,
  reposToClone: Array<string>
}

async function run(config: DependenciesConfigType) {
  console.log("config is", config.pathToRepos)

  //TODO: clone repos into the pathToRepos
  
  const mkdir = spawnSync('mkdir', ['-p', config.pathToRepos]);
  const clone = spawnSync(`cd ${config.pathToRepos} && git clone git@github.com:mojaloop/${config.reposToClone[0]}.git`);
  console.log(`stderr: ${mkdir.stderr.toString()}`);
  console.log(`stdout: ${mkdir.stdout.toString()}`);
  
  console.log(`stderr: ${clone.stderr.toString()}`);
  console.log(`stdout: ${clone.stdout.toString()}`);




}

export default {
  run
}