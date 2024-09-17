const fs = require('fs');
const path = require('path');

const filePath="/home/ec2-user/test/start/community-tools/oss-stats/metrics/temp.txt";

const date = new Date();

const currentMonth = date.getMonth() + 1; 
const currentYear = date.getFullYear();

const data=fs.readFileSync(filePath,'utf8');
const lines =data.split("\n");

let csvVal="commits\n\n";

lines.forEach((line)=>{
    if(line.startsWith("Total")){
        let line_proc=line.split(":");
        csvVal+=line_proc[0].trim()+","+line_proc[1].trim()+"\n";
    }
});

const csvPath="/home/ec2-user/test/start/community-tools/oss-stats/metrics/"+currentMonth+"-"+currentYear+".csv";
fs.writeFileSync(csvPath,csvVal,'utf-8');