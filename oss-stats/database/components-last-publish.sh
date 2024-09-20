input_file="components.csv"
output_file="components-publish.csv"

> "$output_file"  # Clear the output file
echo "type,brom_ref,group,name,version,license-id,repo,publish_details" >> "$output_file"

# Read and skip the header line
IFS= read -r header < "$input_file"

# Process each line, skipping the header
while IFS= read -r line; do 
    echo "Processing: $line"
    IFS="," read -r -a array <<< "$line"
    bom_ref="${array[1]}"
    IFS='|' read -r -a array <<< "$bom_ref"
    last_value="${array[-1]}"
    npm_output=$(npm view "$last_value" 2>/dev/null)
    if [ $? -eq 0 ]; then 
        publish=$(echo "$npm_output" | tail -n 1)
        echo "$line,$publish" >> "$output_file"
    else    
        echo "$line," >> "$output_file"
    fi
done < <(tail -n +2 "$input_file")  # Ensure `done` is used correctly
