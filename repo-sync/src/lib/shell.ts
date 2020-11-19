import { spawnSync, spawn } from 'child_process'
import util from 'util';

const exec = util.promisify(require('child_process').exec);


class Shell {

  /**
   * @function runShellCommandSync
   * @description Runs a shell command asyncronously
   * @param args
   */
  public async runShellCommand(command: string, options?: unknown) {
    try {
      console.log('exec:', command)
      const { stdout, stderr } = await exec(command, options);
      // TODO: change intent and colour to make easier to debug
      console.log('stdout:', stdout);
      console.log('stderr:', stderr);
    } catch (e) {
      console.error(e); // should contain code (exit code) and signal (that caused the termination).
      throw e
    }
  }

  /**
   * @function runShellCommandSync
   * @description Runs a shell command syncronously
   * @param args 
   */
  public runShellCommandSync(...args: any) {

    // @ts-ignore
    const cmd = spawnSync(...args);
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

export default Shell