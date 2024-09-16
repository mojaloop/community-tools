repos=$(ls /home/ec2-user/test/sboms)

for repo in $repos; do 
    #echo "Generating dependencies for $repo"

    IFS="." read -r -a array <<< "$repo"
    OUTPUT_FILE="${array[0]}.csv"

    xsltproc components.xslt "/home/ec2-user/test/sboms/$repo" > "/home/ec2-user/test/sbom-components-csv/$OUTPUT_FILE"

    echo $OUTPUT_FILE

done