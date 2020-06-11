# Github Security Alerts

Ref: https://developer.github.com/v3/code-scanning/



This only seems to exist on the graphql api:

```
query thing2 {
  repository(owner: "mojaloop", name: "forensic-logging-client") {
    id
    name
    vulnerabilityAlerts(first: 10) {
      edges {
        node {
          id
          securityVulnerability {
            severity
            updatedAt
            advisory {
              id
              summary
            }
          }
        }
      }
    }
  }
}
```
