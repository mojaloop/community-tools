import { spawnSync, spawn, ExecOptions } from 'child_process'
import util from 'util';
// @ts-ignore
import Logger from '@mojaloop/central-services-logger'

const exec = util.promisify(require('child_process').exec);

// Use /bin/bash on macOS, fallback to /bin/sh
const shell = process.platform === 'darwin' ? '/bin/bash' : '/bin/sh';

class Shell {

  /**
   * @function runShellCommand
   * @description Runs a shell command asyncronously
   * @param args
   */
  public async runShellCommand(command: string, options?: ExecOptions): Promise<{stdout: string, stderr: string}> {
    try {
      Logger.info(`exec: ${command}`)
      const { stdout, stderr } = await exec(command, { ...(options || {}), shell });
      Logger.debug(`stdout: ${stdout}`);
      Logger.debug(`stderr: ${stderr}`);

      return {
        stdout: stdout.trim(),
        stderr: stderr.trim(),
      }
    } catch (e) {
      console.error(e);
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
    const cmd = spawnSync(...args, { shell });
    if (cmd.error) {
      console.log(cmd.error)
      throw cmd.error
    }

    if (cmd.stderr && cmd.stderr.toString().length > 0) {
      console.log(`stderr: ${cmd.stderr.toString()}`);
    }

    if (cmd.stdout && cmd.stdout.toString().length > 0) {
      console.log(`stdout: ${cmd.stdout.toString()}`);
    }
  }
}

export default Shell