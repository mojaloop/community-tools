const fs= require('fs');
const path = require('path');

const date = new Date();

const currentMonth = date.getMonth() + 1; 
const currentYear = date.getFullYear();

const filePath="/home/ec2-user/test/community-tools/oss-stats/metrics/temp.txt";

const data=fs.readFileSync(filePath,'utf8');
const lines=data.split("\n");

let csvContent="\n\n\nModules\n\n";

lines.forEach((line)=>{
    if(line.startsWith("Total") || line.startsWith("Unique")){
        let process_line=line.split(":");
        csvContent+=process_line[0].trim()+","+process_line[1]+"\n";
    }
})

const csvPath="/home/ec2-user/test/community-tools/oss-stats/metrics/"+currentMonth+"-"+currentYear+".csv";
fs.appendFileSync(csvPath,csvContent,'utf-8');