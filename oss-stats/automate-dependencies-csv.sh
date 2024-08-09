#!/bin/bash

# Store the original directory
original_dir=$(pwd)

# Set the server directory and other variables
SERVER_DIR="/Users/sprak/Documents/mojaloop/community-tools/oss-stats"
DOWNLOAD_DIR="/Users/sprak/Documents/mojaloop/sbom-dependencies-csv"
HTML_FILE="parse-sboms-dependencies.html"
SERVER_PORT=8000

# Navigate to the sboms directory and capture the output of ls
cd /Users/sprak/Documents/mojaloop/sboms
output=$(ls)

# Return to the original directory
cd $original_dir

# Start a simple HTTP server in the background
cd "$SERVER_DIR"
http-server -p $SERVER_PORT &
SERVER_PID=$!

# Give the server a moment to start
sleep 2

# Iterate over each file in the sboms directory
for repo in $output; do
    echo "Generating dependencies for $repo"

    IFS="." read -r -a array <<< "$repo"
    OUTPUT_FILE="${array[0]}.csv"

    # Open the HTML file in the default browser
    open "http://localhost:$SERVER_PORT/$HTML_FILE?repo=$repo"

    # Allow some time for the download to complete
    sleep 30

    # Check if the file exists and move it to the download directory
    if [ -f "/Users/sprak/Downloads/$OUTPUT_FILE" ]; then
        mv "/Users/sprak/Downloads/$OUTPUT_FILE" "$DOWNLOAD_DIR/"
        echo "File $OUTPUT_FILE downloaded successfully"
    else
        echo "Download failed or file $OUTPUT_FILE not found."
    fi

    echo "Process for $repo completed."

done

# Stop the server
kill $SERVER_PID
