import { Octokit } from '@octokit/rest';
// @ts-ignore - makeRepos is valid in the module
import { makeRepos } from './api';
// @ts-ignore - config is valid in the module
import { config } from './config';
import shell from './shell'

import { graphql } from "@octokit/graphql" //Graphql client - v4

const request = require('request-promise-native')

const baseUrl = `https://api.github.com/repos/mojaloop`

// @ts-ignore - Octokit constructor is valid
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

const graphqlWithAuth = graphql.defaults({
  headers: {
    authorization: `token ${process.env.GITHUB_TOKEN}`,
  },
});
const sum = (a: any, b: any) => a + b

/* Instantiate from factory methods */
const Repos = makeRepos(octokit, graphqlWithAuth, request, {
  baseUrl,
  sum,
})

// TODO: fix gross caps issues
const Shell = new shell()

export {
  Repos,
  Shell,
}
