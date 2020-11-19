# Branch Protection API


https://developer.github.com/v3/repos/branches/#get-branch-protection
GET /repos/:owner/:repo/branches/:branch/protection


## Getting current rules
```bash

curl -X GET https://api.github.com/repos/mojaloop/pisp/branches/master/protection \
  -H "Accept=application/vnd.github.luke-cage-preview+json"


curl \
  --user lewisdaly:$GITHUB_TOKEN \
  -H "Accept: application/vnd.github.luke-cage-preview+json" \
  https://api.github.com/repos/mojaloop/pisp/branches/master/protection
```

```json
{
  "url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection",
  "required_status_checks": {
    "url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/required_status_checks",
    "strict": true,
    "contexts": [
      "ci/circleci: setup",
      "ci/circleci: test-contract",
      "ci/circleci: test-e2e",
      "license/cla"
    ],
    "contexts_url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/required_status_checks/contexts"
  },
  "restrictions": {
    "url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/restrictions",
    "users_url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/restrictions/users",
    "teams_url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/restrictions/teams",
    "apps_url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/restrictions/apps",
    "users": [],
    "teams": [],
    "apps": []
  },
  "required_pull_request_reviews": {
    "url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/required_pull_request_reviews",
    "dismiss_stale_reviews": true,
    "require_code_owner_reviews": false,
    "required_approving_review_count": 1,
    "dismissal_restrictions": {
      "url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/dismissal_restrictions",
      "users_url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/dismissal_restrictions/users",
      "teams_url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/dismissal_restrictions/teams",
      "users": [],
      "teams": []
    }
  },
  "enforce_admins": {
    "url": "https://api.github.com/repos/mojaloop/pisp/branches/master/protection/enforce_admins",
    "enabled": false
  },
  "required_linear_history": {
    "enabled": false
  },
  "allow_force_pushes": {
    "enabled": false
  },
  "allow_deletions": {
    "enabled": false
  }
}
```


## Updating rules for 1 repo, 1 branch

```bash

curl -X PUT \
  --user lewisdaly:$GITHUB_TOKEN \
  -H "Accept: application/vnd.github.luke-cage-preview+json" \
  https://api.github.com/repos/mojaloop/pisp/branches/master/protection \
  -d '{
      "required_status_checks": {
        "strict": true,
        "contexts": [
          "ci/circleci: setup",
          "ci/circleci: test-contract",
          "ci/circleci: test-e2e",
          "license/cla"
        ]
      },
      "enforce_admins": true,
      "required_pull_request_reviews": {
        "dismissal_restrictions": {},
        "dismiss_stale_reviews": true,
        "require_code_owner_reviews": true,
        "required_approving_review_count": 1
      },
      "restrictions": null
    }'
```
