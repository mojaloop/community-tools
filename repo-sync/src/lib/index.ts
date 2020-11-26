import makeRepos from './api'
import shell from './shell'


import Octokit from '@octokit/rest' //Rest client - v3
import { graphql } from "@octokit/graphql" //Graphql client - v4

const request = require('request-promise-native')

const baseUrl = `https://api.github.com/repos/mojaloop`
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
