import path from 'path'
import { updateSourceHeaders } from '../lib/header-manager'
import { Repo } from '../lib/types'
import Logger from '@mojaloop/central-services-logger'

async function main() {
  try {
    // Define the repository to process
    const repo: Repo = {
      owner: 'mojaloop',
      repo: 'ml-schema-validator'
    }

    // Define the header configuration
    const headerConfig = {
      template: `License
--------------
Copyright © 2020-2025 Mojaloop Foundation
The Mojaloop files are made available by the Mojaloop Foundation under the Apache License, Version 2.0 (the "License")`,
      startDelimiter: '/*****',
      endDelimiter: '*****/'
    }

    // Use the current directory as base
    const baseDir = process.cwd()
    
    Logger.info(`Updating headers for repo: ${repo.repo}`)
    await updateSourceHeaders(baseDir, [repo], headerConfig)
    Logger.info('Headers updated successfully')
  } catch (err) {
    Logger.error('Error updating headers:', err)
    process.exit(1)
  }
}

main() 