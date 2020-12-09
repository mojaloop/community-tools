// https://github.com/mozilla/node-convict
import Convict from 'convict'
import json5 from 'json5'
import fs, { PathLike } from 'fs'
import path from 'path'
import { Repo, RepoShortcut } from './types';

Convict.addParser({ extension: 'js', parse: json5.parse });

export function getFileContent(path: PathLike): Buffer {
  if (!fs.existsSync(path)) {
    throw new Error('File doesn\'t exist')
  }
  return fs.readFileSync(path)
}

function getFileListContent(pathList: string): Array<Buffer> {
  return pathList.split(',').map((path) => getFileContent(path))
}
export interface Config {
  REPO_SYNC_CONFIG: string,
  REPOS: RepoShortcut | Array<Repo>,
  MATCH_FILES_LIST: Array<string>,
  LOCAL_DESTINATION: string,
  TMP_REPO_DESTINATION?: string,
  SKIP_CLEANUP: boolean,
  SKIP_CLONE: boolean,
  TEMPLATE_FILE_PATH?: string,
}

export const ConvictConfig = Convict<Config>({
  REPO_SYNC_CONFIG: {
    doc: 'Path to the config file',
    default: './config/sync-license.js',
    env: 'REPO_SYNC_CONFIG'
  },
  // TODO: figure out how to parse...
  REPOS: {
    doc: 'The list of repos that will be cloned and monitored. If a shortcut is specified, the list will be loaded from github',
    format: '*',
    default: RepoShortcut.ALL,
    env: 'REPOS',
  },
  // TODO: figure out how to parse...
  MATCH_FILES_LIST: {
    doc: 'The dirs/files that should be monitored, non case sensitive, can use .gitignore syntax',
    format: '*',
    default: [
      'license.md',
      'readme.md'
    ],
    env: 'MATCH_FILES_LIST',
  },
  LOCAL_DESTINATION: {
    doc: 'Where should the synced files live?',
    format: '*',
    default: './cloned',
    env: 'LOCAL_DESTINATION',
  },
  TMP_REPO_DESTINATION: {
    doc: 'Where should the repos be cloned to temporarily? Defaults to a temp dir',
    format: '*',
    default: undefined,
    env: 'TMP_REPO_DESTINATION',
  },
  SKIP_CLEANUP: {
    doc: 'If true, doesn\'t delete /tmp dir where repos are cloned',
    format: 'Boolean',
    default: false,
    env: 'SKIP_CLEANUP'
  },
  SKIP_CLONE: {
    doc: 'If true, skips the clone step',
    format: 'Boolean',
    default: false,
    env: 'SKIP_CLONE'
  },
  TEMPLATE_FILE_PATH: {
    doc: 'A template file to apply across the cloned repos',
    format: '*',
    default: undefined,
    env: 'TEMPLATE_FILE_PATH',
  }
})


const env = ConvictConfig.get('REPO_SYNC_CONFIG')
ConvictConfig.loadFile(path.join(__dirname, '../../', env))

const config: Config = {
  REPO_SYNC_CONFIG: ConvictConfig.get('REPO_SYNC_CONFIG'),
  REPOS: ConvictConfig.get('REPOS'),
  MATCH_FILES_LIST: ConvictConfig.get('MATCH_FILES_LIST'),
  LOCAL_DESTINATION: ConvictConfig.get('LOCAL_DESTINATION'),
  TMP_REPO_DESTINATION: ConvictConfig.get('TMP_REPO_DESTINATION'),
  SKIP_CLEANUP: ConvictConfig.get('SKIP_CLEANUP'),
  SKIP_CLONE: ConvictConfig.get('SKIP_CLONE'),
  TEMPLATE_FILE_PATH: ConvictConfig.get('TEMPLATE_FILE_PATH'),
}

export default config;