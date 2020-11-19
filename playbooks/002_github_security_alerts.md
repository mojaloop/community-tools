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


## 2nd attempt:

```
query { 
  organization(login: "mojaloop") {
    id,
    login,
    name,
    repositories(first: 20, after: "Y3Vyc29yOnYyOpHOBnfYwA==", isLocked: false) {
      pageInfo {
        endCursor
      }
      edges:
          nodes {
            id,
            name
            description,
            vulnerabilityAlerts(last: 100) {
              edges:
              	nodes {
                  id
                  vulnerableManifestFilename
                  securityAdvisory {
                    id
                    severity
                  }
                }
            }
          }
        }
   }
}
```