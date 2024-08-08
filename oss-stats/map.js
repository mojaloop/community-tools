const fs = require('fs');
const path = require('path');

// directory where the dependencies csv for each repo is located 
const directoryPath = "/Users/sprak/Documents/mojaloop/sbom-dependencies-csv";
//Create a new Map datastructure to link dependencies to Mojaloop servies 
const map = new Map();

//Read files in specified repository 
fs.readdirSync(directoryPath).forEach((file) => {
    const filePath = path.join(directoryPath, file);
    try {
        // Read files synchronously 
        const data = fs.readFileSync(filePath, 'utf8'); 
        const lines = data.split('\n');
        lines.forEach((line) => {
            console.log(line); 

            //Fetch repo name from file name 
            const s=file.split('.')[0];
            const service=s.substring(s,s.length-5)
            
            //Add the dependencies and corresponding services to the map 
            if (map.has(line)) {
                map.get(line).push(service);
            } else {
                map.set(line, [service]);
            }
        });
    } catch (err) {
        console.log("Unable to read:", err);
    }
});

//Delete the dependency field to avoid the header to become a field 
map.delete('dependency')

//Create an array from the map to sort the map 
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

// Create a new map, finalMap to link dependencies-versions-services
const finalMap=new Map();



sortedMap.forEach((value,key)=>{

    //identify version and dependency 
    let parts=key.split("@");
    let version=parts.pop();
    let depend =parts.join("@");
    
    //Populate finalMap
    if (finalMap.has(depend)) {
        finalMap.get(depend).set(version,value);
    } else {
        finalMap.set(depend, new Map());
        finalMap.get(depend).set(version,value)
    }
});

console.log(finalMap);

// Create csv
let csvContent = '';
csvContent+="dependency,version,services\n";
finalMap.forEach((values, dep) => {
    // Add the line as the first value
    csvContent += `${dep}`;
    // Add each file name as subsequent lines
    values.forEach((services,version) => {
        csvContent += `,${version}`;
        let count=0;
        services.forEach((service) => {
            if(count==0){
                csvContent += `,${service}\n`;
            }
            else{
                csvContent +=`,,${service}\n`;
            }
            count++;
        })
    });
});

//Define path to save csv 
const csvFilePath = "/Users/sprak/Documents/mojaloop/communtiy-tools/oss-stats/dependency-services.csv";
fs.writeFileSync(csvFilePath, csvContent, 'utf8');
