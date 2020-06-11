# AWS Tags


```bash
aws resourcegroupstaggingapi get-tag-values --key mojaloop/cost_center

aws resourcegroupstaggingapi get-resources \
    --tag-filters Key=mojaloop/cost_center \
    --tags-per-page 100
```