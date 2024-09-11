# Mojaloop Github Metrics and Maintenance 

## Abstract 
This project focuses on enhancing the governance and visibility of Mojaloop repositories by automating metrics collection and comprehensive dependency management. The initiative revolves around two main objectives: high-level repository metrics and detailed Software Bill of Materials (SBOM) generation.

## Exploring the existing tooling 
[oss-stats](https://github.com/mojaloop/community-tools/tree/master/oss-stats#oss-stats
)<br>
OSS-Stats is a collection of tools aimed at analyzing Mojaloop repositories, gathering critical metrics and data related to contributors, commits, dependencies, and more. These tools allow for automation and streamlining of repository management, tracking key repository information for reporting and monitoring. The operations of these tools are managed using Gulp commands. Gulp is an open-source JavaScript toolkit used to automate and enhance workflows. 

### Running relevant gulp commands for metrics 
To utilize the relevant OSS-Stats tools for generating repository metrics and managing dependencies, the following steps were executed:<br>
1. First, the community-tools repository was cloned to the local environment. The tools are located within the oss-stats folder of this repository:
    ```bash
    git clone https://github.com/mojaloop/community-tools.git
    cd community-tools/oss-stats
    ```
2. After navigating to the oss-stats directory, the required tools were run via Gulp commands. These gulp commands include: 
- `gulp contributors` - Fetches a list of contributors who have opened PRs, forked repositories, created or assigned to issues. 
- `gulp commits` - Gets a list of commits for each repo and the total number of squashed commits. 
- `gulp dependencies` - Summarizes the dependencies across all repos.
- `gulp lines` - Runs the cloc tool to count lines of code across all repos for different languages. 
- `gulp get-repo-csv` - Gets the list of all Mojaloop Repos as a csv file containing repo name, description, number of forks etc. 

## Publishing monthly metrics 

1. **Publishing metrics** - The collected metrics are aggregated and saved into CSV files. This process ensures that the data is readily available for analysis and reporting. The filenames of these CSV files include the month and year of the report for easy reference and tracking.

2. **Cron Job Automation** - A cron job was set up to automate the execution of these tasks on a monthly basis. This job ensures that the metrics are collected, saved, and published automatically without manual intervention. The cron job script includes:
- Running the Gulp commands to fetch and summarize data.
- Exporting the results into CSV files.
- Publishing the CSV files to a designated location for access.

## Software Bill of Materials 

### What is an SBOM? 
A Software Bill of Materials(SBOM) is a machine and human-readable list of a project's entire software inventory. It is a list of all the open source and third-party components present in a codebase. An SBOM also lists the licenses that govern those components, the versions of the components used in the codebase, which allows security teams to quickly identify any associated security or license risks.

### What all does SBOM contain?
- Open source components
- Third-party components
- License-ids
- Versions of components 
- Open source vulnerabilities 
- Package names
- Cryptographic information 

### Why do organizations need SBOM?
- **Security:** Helps in identifying and managing vulnerabilities in software components.
- **Compliance:** Ensures adherence to regulations and licensing standards.
- **Risk Management:** Assists in assessing and mitigating risks associated with software usage.
- **Supply Chain Transparency:** Provides visibility into the software supply chain.
- **Incident Response:** Quick identification of affected components during security incidents.
- **Software Maintenance:** Aids in managing updates, patches, and compatibility issues.
- **Quality Assurance:** Ensures software quality and performance standards.
- **Licensing Compliance:** Helps in tracking licenses and complying with requirements.
- **Efficiency:** Automating SBOM processes streamlines development and maintenance.

### SBOM Specifications 
- **Format** - SBOM formats refer to the structured standards and specifications used to document and represent information about the components and dependencies within a software system. CycloneDX format is used in this project.<br>
 CycloneDX (CDX), generates SBOM documentation which makes it an efficient vulnerability management tool as it details all the standard components of a software product. The lightweight nature of CycloneDX also makes it an efficient tool for generating machine-readable Software Bills of Materials that you can share and process quickly.

- **Tooling** - SBOM generators are software tools or systems designed to automatically create SBOMs for software projects.<br>
The CycloneDX Generator (cdxgen) is the official OWASP SBOM tool. It supports a huge variety of programming languages, including popular ones like C/C++, JavaScript, Java, Python, and more obscure languages like Haskell. It comes with a CLI that can scan locally or as part of a CI/CD pipeline. As its name implies, the output format is CycloneDX. 

### CycloneDX Specification overview 

**Metadata**<br>
BOM metadata includes the supplier, manufacturer, and target component for which the BOM describes. It also includes the tools used to create the BOM, and license information for the BOM document itself. 
![image](https://github.com/user-attachments/assets/362fae35-2f1e-4762-afa9-48a776ae734f)


**Components** <br>
Components describe the complete inventory of first-party and third-party components. The specification 
can represent software, hardware devices, machine learning models, source code, and configurations, 
along with the manufacturer information, license and copyright details, and complete pedigree and 
provenance for every component.
![image](https://github.com/user-attachments/assets/198a83ed-b6c3-4a19-8621-31a3cf2136c9)


**Dependencies**<br>
CycloneDX provides the ability to describe components and their dependency on other components. The 
dependency graph is capable of representing both direct and transitive relationships. Components that 
depend on services can be represented in the dependency graph, and services that depend on other 
services can be represented as well.
![image](https://github.com/user-attachments/assets/43e65000-a010-44f5-b488-6d87de717c44)


## SBOM Process
![image](https://github.com/user-attachments/assets/3bb486bf-5617-419f-8ac0-186575b6d625)


## SBOM Analysis Repository-Wise 
This aims to develop a user-friendly SBOM visualization platform. This generate interactive HTML webpages that present SBOM data in both concise and detailed formats, enabling easy analysis and understanding.<br>

**Steps:**

1. **Repository Cloning:** The target repository is cloned to initiate the analysis.
    ```bash 
    git clone https://github.com/mojaloop/repository.git
    ```
<br>

2. **Generate SBOM:** Navigate to the cloned repo, SBOM is generated using CycloneDX generator tool. 
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

3. **Convert XML to CSV:** The SBOM is then convert from XML to CSV for easier parsing. This is done by xslt. <br>

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
    xsltproc sbom-to-csv.xslt sbom.xml > sbom.csv
    ```

4. **Add publish details:** The publish details for each component can be retrieved using the `npm view dependency_name` command. This gives the last publish date and name of publisher. This process is repeated for each line of the CSV file. A new file is then created, containing both the original contents of the CSV file and the publish details for all the components.

5. **Convert CSV to HTML:** The csv is then converted to html using the `csv-parser` package in Node.js. 

    The csv-parser package processes CSV files by creating a readable stream from the file, parsing each line into a JavaScript object using a streaming approach. It emits data events for each parsed row and an end event when the entire file has been processed, allowing for efficient handling of large datasets.<br>

    This can be done in two levels of detail. A conscise version containing only relevant fields and a detailed version containing all the details contained in the SBOM. 

6. **Overall html page for navigation:** If you are working with multiple repositories, consider making a html page for navigation to different repos and different levels of detail. 

## Collecting and Mapping Dependencies 
This aims to enhance transparency and manageability within the Mojaloop ecosystem by generating and analyzing Software Bill of Materials (SBOMs) for all Mojaloop repositories. A comprehensive CSV file was created that captures dependency data across the entire platform.<br>

The final CSV includes details on each dependency, listing the Mojaloop services that rely on it, along with other details such as license id, versions, types, group names, and last publish details. This consolidated view not only improves visibility and compliance but also streamlines maintenance and dependency management.<br>

**Steps:**

1. **Cloning Repositories:** All the Mojaloop repositories are cloned iteratively and stored at a particular folder cloned-repos. 

2. **Generate SBOMs:** SBOMs for all cloned repositories is generated using CycloneDX generator in xml format and stored in a particular location sboms. 

3. **Fetch all dependencies accross all repositories:** All dependencies are stored repo-wise as CSVs in a particular folder sbom-dependencies-csv. This is done using xslt processors, an xslt file is written to fetch dependenceis from each repo's SBOM and saved as a CSVs. 

4. **Map unique dependencies to Mojaloop repositories:** A javascript program is written that identifies unique dependencies along with their versions and maps them to all the Mojaloop repositories that depend on them. Map datastructure in javascript is used to do this. 
![image](https://github.com/user-attachments/assets/d9ebc3ff-f9ce-4fe1-abac-56e55b3fdab7)


5. **Add publish details:** Publish details for each dependency and version is added to the CSV, to know the publish time and author of the dependency. this is done using the npm view command. 
![image](https://github.com/user-attachments/assets/7556021e-e32c-453b-a980-bd038dcbfab2)


6. **Fetch all components accross all repositories:** All components are stored repo-wise as CSVs in a particular folder sbom-components-csv. Components include data like type, name, group, license-id, description etc. This is done using xslt processors, an xslt file is written to fetch components and their related data from each repo's SBOM and saved as a CSVs. 

7. **Find unique components across all repositories and merge them to the dependencies:** This generates a final CSV that contains all the software components used at Mojaloop, their details like type of component, license-id, name, group, version, publish details, along with all the Mojaloop services/repos that depend on each software component. Dependency name and component name are compared to add components data to the dependency map. 
![image](https://github.com/user-attachments/assets/b47ff0a5-3d9d-430d-98f5-45147d36c673)



To ensure continuous and efficient updates, this process is automated through a cron job that runs on a monthly basis. This setup allows for the automatic generation and updating of SBOMs and dependency mapping, eliminating the need for manual intervention and ensuring that the data remains current.

## Databases and Queries 

A comprehensive CSV file was generated, containing detailed information about all software components. This file includes data such as component name, type, group, license ID, version, publish details, and the associated repository.

To facilitate easy access and querying, this CSV file was imported into a database(MySQL). This setup allows for efficient querying and analysis of component data, making it straightforward to retrieve specific information and perform various data operations as needed.


![image](https://github.com/user-attachments/assets/f54ef523-b458-4df1-a1fc-224eadbc9e1d)


**Example Query:** 
Select type, name from sbom_table where license-id='MIT' and repo='central-ledger';
<br> 
This query gives the type(application or library) and name of the components of central-ledger reposiotry having MIT license. 


## References 
- https://www.synopsys.com/blogs/software-security/software-bill-of-materials-bom.html
- https://www.wiz.io/academy/top-open-source-sbom-tools
- https://mergebase.com/blog/best-tools-for-generating-sbom/
- https://cyclonedx.org/specification/overview/ 
- https://www.npmjs.com/package/simple-git 
- https://www.npmjs.com/package/%40cyclonedx/cyclonedx-npm
- https://gulpjs.com
- http://xmlsoft.org/xslt/xsltproc.html
- https://phoenixnap.com/kb/set-up-cron-job-linux
