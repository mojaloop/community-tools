# Community Tools

A collection of tools for collecting stats, updating repos en masse and general project maintainence for Mojaloop. If you have written something random that helps automate something in mojaloop that doesn't need to be run all that often, it may belong here.

## oss-dash

> Note: does it make sense to put dashboards and stuff in this repo? Can this repo be expanded to be more than just scripts to run across the mojaloop org, but a suite of tools that suport the community? e.g. Tools, Scripts, Dashboards, Automation config...


## oss-stats

A collection of gulp tools which export data from the mojaloop github and git repos

See [./oss-stats/README.md](./oss-stats/README.md) for more information.

### Regular Stats Runs

We use CircleCI to run these tools regularly and then (manually) compile the results into a Mojaloop stats update on a monthly basis.

For more info, see
- [`.circleci/config.yml`](CircleCI Config)
- [CircleCI build page](https://app.circleci.com/pipelines/github/mojaloop/community-tools)