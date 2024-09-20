# SBOM Analysis Repository-Wise 

This aims to develop a user-friendly SBOM visualization platform. This generate interactive HTML webpages that present SBOM data in both concise and detailed formats, enabling easy analysis and understanding.<br>

## **Steps:**

### 1. **Repository Cloning:** 
The target repository is cloned to initiate the analysis.
```bash 
git clone https://github.com/mojaloop/repository.git
```
<br>

### 2. **Generate SBOM:** 
Navigate to the cloned repo, SBOM is generated using CycloneDX generator tool. 
- Install CycloneDX module 
    ```nodejs
    npm install --global @cyclonedx/cyclonedx-npm
    ```
- Options and help 
    ```nodejs
    cyclonedx-npm --help
    cyclonedx-npm -h 
    ```
- Save sbom to a file in json(default) or xml format 
    ```nodejs 
    cyclonedx-npm --output-file file_name.json
    cyclonedx-npm --output-format "XML" --output-file file_name.xml
    ```
<br>

### 3. **Convert XML to CSV:** 
The SBOM is then convert from XML to CSV for easier parsing. This is done by xslt. <br>

XSLT (Extensible Stylesheet Language Transformations) is a language used for transforming XML documents into different formats. Its primary purpose is to convert XML data into other formats like HTML, plain text, or even CSV. The transformation process is based on templates that describe how each part of the XML should be converted.

- Install xslt processor <br>
    Run this command on terminal 
    ```bash 
    sudo yum install xsltproc
    ```
    This command uses yum, the package manager for Amazon Linux 2023. If you are using a different distribution, you might use apt (Ubuntu) or another package manager.

- Create an XSLT stylesheet – This file specifies which values to extract from the XML and defines the format in which they will be written to the output CSV. The file should be saved with a .xslt extension.

- Run the XSLT transformation:
    ```bash 
    xsltproc xml-to-csv.xslt sbom.xml > sbom.csv
    ```

### 4. **Add publish details:** 
The publish details for each component can be retrieved using the `npm view dependency_name` command. This gives the last publish date and name of publisher. This process is repeated for each line of the CSV file. A new file is then created, containing both the original contents of the CSV file and the publish details for all the components. This can be done by the script `publish.sh`.

### 5. **Convert CSV to HTML:** 
The csv is then converted to html using the `csv-parser` package in Node.js. 

The csv-parser package processes CSV files by creating a readable stream from the file, parsing each line into a JavaScript object using a streaming approach. It emits data events for each parsed row and an end event when the entire file has been processed, allowing for efficient handling of large datasets.<br>

This can be done in two levels of detail. A conscise version containing only relevant fields and a detailed version containing all the details contained in the SBOM. <br>

Scripts to faciliate this conversion:<br>

`csv-to-html-concise.js`<br>
`csv-to-html-detailed.js`

### 6. **Overall html page for navigation:** 
If you are working with multiple repositories, consider making a html page for navigation to different repos and different levels of detail. 