# Software Bill of Materials - Steps to generate 

## Step 1 - Generate sbom on a cloned repository 

1. To install CycloneDX generator
   ```npm install --global @cyclonedx/cyclonedx-npm```
   
2. To view options and help
   ```cyclonedx-npm -h```
   
3. To generate and save the sbom to a file
   * Generate sbom in json (default)
     ```cyclonedx-npm --output-file filename.json```
   * Generate sbom in xml
     ```cyclonedx-npm --output-format "XML" --output-file filename.xml```
     
## Step 2 - Convert sbom from xml to csv 

1. Install http-server
   ```npm install -g http-server```
   
2. Run xmlToCsv.html <br>
   In the defaullt browser enter the url [http://localhost:8000/xmlToCsv.html](http://localhost:8000/xmlToCsv.html)

3. Click the download button, and download the three files `metadata.csv`, `components.csv` and `dependencies.csv` to the directory of the cloned repository

## Step 3 - Add publish details 
Last publish date and author can be accessed using ```npm view packagename``` command <br>
Execute three scripts metadata-last-publish.sh, components-last-publish.sh and dependencies-last-publish.sh <br>
* bash metadata-last-publish.sh
* bash components-last-publish.sh
* bash dependencies-last-publish.sh <br>
<br>This will generate three csv files <br>
* metadata-last-publish.csv
* components-last-publish.csv
* dependencies-last-publish.csv

## Step 4 - Convert csv to html 

1. Detailed view <br>
   csvToHtmlDetailed.js file contains code to generate detail view of the sbom <br>
   run it using the command ```node csvToHtmlDetailed.js``` <br>
   This generates 3 html files, taking inputs and producing outputs as <br>
   * metadata-last-publish.sh -> metadata-detailed.html
   * components-last-publish.sh -> components-detailed.html
   * dependencies-last-publish.sh -> dependencies.html
<br>
2. Normal view <br>
   csvToFtmlNormal.js file contains code to generate a more concise view of the sbom <br>
   run it using the command `node csvToHtmlNormal.js`

   <br>This generates 2 html files, taking inputs and producing output as <br>
   * metadata-last-publish.sh -> metadata-normal.html
   * components-last-publish.sh -> components-normal.html
  
## Step 5 - Final html page for navigation 
Open "overallSbom.html" in web browser to navigate to these options 
* metadata
  * normal
  * detailed
* components
  * normal
  * detailed
* dependencies 
    
