const fs=require('fs');
const path =require('path');

const directoryPath="/home/ec2-user/start/sbom-components-csv";

let csvContent ='type,brom_ref,group,name,version,license-id,repo\n';

fs.readdirSync(directoryPath).forEach((file) => {
    const repo=file.slice(0,-9);
    const filePath=path.join(directoryPath, file);
    try{
        const data = fs.readFileSync(filePath,'utf8');
        const lines = data.split('\n');
        lines.forEach((line) => {
            csvContent += line + `,${repo}\n`;
        })
    }
    catch(err){
        console.log("unable to read:",err);
    }
});


const csvFilePath="/home/ec2-user/start/community-tools/oss-stats/database/components.csv";
fs.writeFileSync(csvFilePath,csvContent,'utf-8');


console.log(csvContent);