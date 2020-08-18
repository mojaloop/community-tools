


```bash
mkdir -p grafana/strava
docker-compose up -d

# go to localhost:3000
# admin/admin > skip

# Add strava datasource


# Strava Application Details


```


## Links:
- [strava-datasource-config](https://github.com/grafana/strava-datasource/blob/master/docs/configuration.md)


grafana-cli plugins install grafana-strava-datasource


## Questions:

- how to completely automate? 
  - maybe we need to build our own docker image? but that would be a pain because of privacy...
- do we need to pay for nice strava plugins?
  - it appears not
- can we expose a simple public webpage?