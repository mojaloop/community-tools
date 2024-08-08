const fs = require('fs');
const path = require('path');

//Path to directory containing unique components of each repository 
const directoryPath = "/Users/sprak/Documents/mojaloop/sbom-components-csv";

//Create a map to store unique components across all repositories 
const map = new Map();

//Read all  files in the directory 
fs.readdirSync(directoryPath).forEach((file) => {
    const filePath = path.join(directoryPath, file);
    try {
        const data = fs.readFileSync(filePath, 'utf8'); // Read file synchronously
        const lines = data.split('\n');

        // Populate map
        lines.forEach((line) => {
            const dep=line.split(",")[1];
            console.log(line); // Log each line
            if (!map.has(dep)) {
                map.set(dep,line);
            }
        });
    } catch (err) {
        console.log("Unable to read:", err);
    }
});

//Create an array form map to sort the keys/components 
let mapArray = Array.from(map);

// Sort the array by keys lexically
mapArray.sort((a, b) => {
    if (a[0] < b[0]) {
        return -1;
    }
    if (a[0] > b[0]) {
        return 1;
    }
    return 0;
});

// Create a new sorted map from the sorted array
let sortedMap = new Map(mapArray);

console.log(sortedMap);

//Create csv content from sortedMap and save it to a file "unique-components"
//this step can be eliminated 
let csvContent ='type,brom_ref,group,name,version,license-id\n';
sortedMap.forEach((value,key) => {
    csvContent+=`${value}\n`;
})
const csvFilePath="/Users/sprak/Documents/mojaloop/community-tools/oss-stats/unique-components.csv";
fs.writeFileSync(csvFilePath,csvContent,'utf-8');


//Create a new csv file to merge the components and dependencies 
let dep_com_merge="dependency,type,group,name,license_id,version,publish_details,services\n";
//file to read the dependencies 
const filePath2="/Users/sprak/Documents/mojaloop/community-tools/oss-stats/dependencies-services-last-publish.csv";
try {
    let data = fs.readFileSync(filePath2, 'utf8'); 
    let lines = data.split('\n');
    count=0;
    lines.forEach((line) => {
        if(count>0){
            if(line.charAt(0)!=","){
                let dep_array=line.split(",");
                console.log(dep_array[0]+"@"+dep_array[1]);
                let comp=sortedMap.get(dep_array[0]+"@"+dep_array[1]);
                if(comp){
                    let comp_array=comp.split(",");
                    let new_line=dep_array[0]+","+comp_array[0]+","+comp_array[2]+","+comp_array[3]+","+comp_array[5]+","+dep_array[1]+","+dep_array[2]+","+dep_array[3]+"\n";
                    dep_com_merge += new_line;
                }
                else{
                    let new_line= dep_array[0]+",,,,,"+dep_array[1]+","+dep_array[2]+","+dep_array[3]+"\n";
                    dep_com_merge +=new_line;
                }
                
            }
            else{
                let new_line= ",,,,"+line+"\n";
                dep_com_merge += new_line;
            }
        }
        count=count+1;
    });
} catch (err) {
    console.log("Unable to read:", err);
}
//Save final csv content to file 
const csvFilePath2="/Users/sprak/Documents/mojaloop/community-tools/oss-stats/components-dependencies.csv";
fs.writeFileSync(csvFilePath2,dep_com_merge,'utf-8');