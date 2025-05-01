repos=$(ls /Users/sprak/Documents/mojaloop/SBOM-04:2025/v17/xml2)

for repo in $repos; do 
    echo "Generating dependencies for $repo"

    IFS="." read -r -a array <<< "$repo"
    OUTPUT_FILE="${array[0]}.csv"

    xsltproc dependencies-yarn.xslt "/Users/sprak/Documents/mojaloop/SBOM-04:2025/v17/xml2/$repo" > "/Users/sprak/Documents/mojaloop/SBOM-04:2025/v17/dependencies/$OUTPUT_FILE"

    echo $OUTPUT_FILE

done