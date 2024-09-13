const fs = require('fs');
const path = require('path');

const date = new Date();

const currentMonth = date.getMonth() + 1; 
const currentYear = date.getFullYear();

const inputFilePath = "/home/ec2-user/test/community-tools/oss-stats/metrics/temp.txt"; // Replace with the actual file path
const outputFilePath = "/home/ec2-user/test/community-tools/oss-stats/metrics/"+currentMonth+"-"+currentYear+".csv"; // Replace with the desired output CSV file path

// Read the file content
const fileContent = fs.readFileSync(inputFilePath, 'utf-8');

// Split the content by lines
const lines = fileContent.split('\n');

// Find the start and end indices of the desired section
const startIdx = lines.findIndex(line => line.startsWith('Language'));
const endIdx = lines.findIndex(line => line.startsWith('SUM'));

// Extract the relevant lines
const relevantLines = lines.slice(startIdx, endIdx+1); // +1 to skip the header line

// Convert the extracted lines to CSV format
const csvLines = ["\n\nLines\n"]; // CSV header
relevantLines.forEach(line => {
    // Split by whitespace and filter out empty elements
    if(line.startsWith("--")){
        return;
    }
    const columns = line.trim().split(/\s+/);
    columns[columns.length-1]=","+columns[columns.length-1];
    columns[columns.length-2]=","+columns[columns.length-2];
    columns[columns.length-3]=","+columns[columns.length-3];
    columns[columns.length-4]=","+columns[columns.length-4];
    csvLines.push(columns.join(' '));
});

// Write the CSV lines to a new file
fs.appendFileSync(outputFilePath, csvLines.join('\n'), 'utf-8');


