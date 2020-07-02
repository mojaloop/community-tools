import makeRepos from './repos';

class Shell {
  spawnSync: any;

  constructor(spawnSync: any) {
    this.spawnSync = spawnSync
  }

  /**
   * @function runShellCommand
   * @description Runs a shell command. Note: this call is synchronous!
   * @param args 
   */
  public runShellCommand(...args: any) {
    const cmd = this.spawnSync(...args);
    if (cmd.error) {
      console.log(cmd.error)
      throw cmd.error
    }

    if (cmd.stderr && cmd.stderr.toString().length > 0) {
      console.log(`stderr: ${cmd.stderr.toString()}`);
    }

    if (cmd.stdout && cmd.stdout.toString().length > 0) {
      console.log(`stderr: ${cmd.stdout.toString()}`);
    }
  }
}

/* Inject Dependencies */
const makeShell = (spawnSync: any) => {
  const shell = new Shell(spawnSync)

  return shell;
}

export default makeShell