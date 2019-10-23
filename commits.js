/**
 * Gets the squashed commits for all repos by counting contributions from Github Api
 */

const AccessToken = process.env.ACCESS_TOKEN
const request = require('request-promise-native')
const { repos } = require ('./data')

const baseUrl = `https://api.github.com/repos/mojaloop`


const sum = (a, b) => a + b

async function getMasterCommitCount() {
  const counts = await Promise.all(repos.map(async r => {
    const url = `${baseUrl}/${r}/contributors`
    const options = {
      url,
      headers: {
        accept: 'application/vnd.github.v3+json',
        'User-Agent': 'Awesome-Octocat-App',
        Authorization: `token ${AccessToken}`,
      },
      json: true
    }

    const response = await request(options)
    const contributions = response.map(r => r.contributions).reduce(sum, 0)
    console.log(`total contributions for ${r} is`, contributions)
    return contributions
  }))

  console.log(counts)

  return counts.reduce(sum, 0)
}

async function main() {
  const masterCommitCount = await getMasterCommitCount()
  console.log('total commits on main branches for all projects are: ', masterCommitCount)
}

main()