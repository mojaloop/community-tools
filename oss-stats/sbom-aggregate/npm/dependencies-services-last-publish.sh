#!/bin/bash

input_file="dependency-services.csv"
output_file="dependencies-services-last-publish.csv"

# Clear the output file and add the header
> "$output_file"
echo "dependency,version,publish_details,services" >> "$output_file"

# Read the header from the input file 
IFS= read -r header < "$input_file"

# Create a variable to store the present dependency name 
dependency=""

# Process the input file starting from the second line and append publish details to a new output file 
while IFS= read -r line; do 
    echo "Processing: $line"

    original_line="$line"

    # if the line contains only service name 
    if [[ "$line" == ,,* ]]; then 
        echo ",$line" >> "$output_file"

    # if the line contains the versiona and service 
    elif [[ "$line" == ,* ]]; then 
        IFS="," read -r -a array <<< "$line"
        version="${array[1]}"
        pkg="${dependency}@${version}"
        echo "$pkg"
        npm_output=$(npm view "$pkg" 2>/dev/null)

        if [ $? -eq 0 ]; then 
            last_line=$(echo "$npm_output" | tail -n 1)
            echo ",${array[1]},$last_line,${array[2]}" >> "$output_file"
        else    
            echo ",${array[1]},,${array[2]}" >> "$output_file"
        fi 
    
    # if the line contains dependency, version and service 
    else 
        IFS="," read -r -a array <<< "$line"
        dependency="${array[0]}"
        version="${array[1]}"
        pkg="${dependency}@${version}"
        npm_output=$(npm view "$pkg" 2>/dev/null)
        if [ $? -eq 0 ]; then 
            last_line=$(echo "$npm_output" | tail -n 1)
            echo "${array[0]},${array[1]},$last_line,${array[2]}" >> "$output_file"
        else    
            echo "${array[0]},${array[1]},,${array[2]}" >> "$output_file"
        fi
    fi 
done < <(tail -n +2 "$input_file")

echo "Processing complete. Check the output in $output_file"
