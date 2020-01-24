# Moja-Tools

A collection of tools for collecting stats, updating repos en masse and general project maintainence for Mojaloop. If you have written something random that helps automate something in mojaloop that doesn't need to be run all that often, it probably belongs here.

## Prerequisites:

- Github API Token
- `gulp`, `typescript`
- `make`
- AWS s3 access (for `anchore-summary`)


## Available Tools:

### Update Licenses

```bash
make update-licenses
```

## Summarizing Anchore-cli latest reports

>_Note:_ This requires AWS S3 access first

```bash
aws s3 sync s3://mojaloop-ci-reports/anchore-cli/latest ./tmp
gulp anchore-summary
open ./tmp/summary.xlsx
```

## Notes:

```
---------------------------------------------------------------------------------------
Language                             files          blank        comment           code
---------------------------------------------------------------------------------------
JSON                                   244              5              0         350614
JavaScript                            1420          21332          33632         132945
YAML                                   366           3200          11685          38856
Markdown                               108           4185              0          11622
Bourne Shell                           135           1124            156           7474
TypeScript                              42            538           1780           3236
Scala                                  115            962              2           2887
XML                                      5             16              2           2340
Java                                     1            205             20           1040
XSD                                      2             85             24            887
SQL                                     15            206            133            759
HTML                                     3             41              1            613
Windows Module Definition                5             88              0            442
Dockerfile                              20            107              6            256
TOML                                     3             32            141            119
make                                     3             49             48            115
Protocol Buffers                         1             17             23             80
Bourne Again Shell                       2             11              1             43
Mustache                                 6             17              0             26
SVG                                      7             48            485              8
Windows Resource File                    1              0              0              1
---------------------------------------------------------------------------------------
SUM:                                  2504          32268          48139         554363
---------------------------------------------------------------------------------------
```